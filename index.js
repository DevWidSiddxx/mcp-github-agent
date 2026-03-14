import express from 'express';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { analyzeCommits } from './analyzerService.js';
import { getFileContent, createPullRequest } from './githubService.js';
import { sendNotification } from './notificationService.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Use express.json with verify to capture raw body for webhook verification
app.use(express.json({
    verify: (req, res, buf) => {
        req.rawBody = buf;
    }
}));

const WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET;

// Helper to verify github webhook signature
function verifySignature(req) {
    if (!WEBHOOK_SECRET) return true; // Skip if no secret set

    const signature = crypto
        .createHmac('sha256', WEBHOOK_SECRET)
        .update(req.rawBody)
        .digest('hex');
    const expectedSignature = `sha256=${signature}`;
    const actualSignature = req.headers['x-hub-signature-256'];

    return actualSignature === expectedSignature;
}

app.post('/api/webhook', async (req, res) => {
    if (!verifySignature(req)) {
        console.error('Webhook signature verification failed');
        return res.status(401).send('Unauthorized');
    }

    const event = req.headers['x-github-event'];

    // We only care about pushes to the default branch (usually in main or master)
    if (event === 'push') {
        const payload = req.body;

        // Ignore deleted branches
        if (payload.deleted) return res.status(200).send('Ignored');

        const repoFullName = payload.repository.full_name;
        const branch = payload.ref.replace('refs/heads/', '');
        const defaultBranch = payload.repository.default_branch;

        // Only analyze pushes to the default branch to prevent spam
        if (branch !== defaultBranch) {
            return res.status(200).send(`Ignored push to non-default branch: ${branch}`);
        }

        const commits = payload.commits || [];
        if (commits.length === 0) return res.status(200).send('No commits');

        // Check if README.md was modified in these commits
        const readmeModified = commits.some(commit =>
            [...(commit.added || []), ...(commit.modified || [])].some(file => file.toLowerCase().includes('readme.md'))
        );

        console.log(`Received push on ${repoFullName}. README modified: ${readmeModified}`);

        try {
            // Respond to Github early to avoid webhook timeout
            res.status(202).send('Processing');

            // Analyze commits using rule-based categories
            const analysis = analyzeCommits(commits);

            console.log(`Categorized commits -> Features: ${analysis.categoriesDetected.features}, Bugs: ${analysis.categoriesDetected.bugs}, Security: ${analysis.categoriesDetected.security}, Refactors: ${analysis.categoriesDetected.refactors}, Docs: ${analysis.categoriesDetected.docs}`);

            if (analysis.isFeatureEnhancement) {
                if (!readmeModified) {
                    console.log('Feature enhancement without README update! Sending notification...');

                    const alertTitle = `🚨 Documentation Alert: New Features in ${repoFullName}`;
                    const alertBody = `A team member pushed to ${branch} without updating the README.\n\nHere's what was merged (Auto-Categorized):\n\n${analysis.reportString}\n\nPlease remind the team to update the documentation or review these code changes.`;

                    await sendNotification(alertTitle, alertBody);
                } else {
                    console.log('Feature was updated properly. No alert needed.');
                }
            } else if (analysis.categoriesDetected.bugs > 0 || analysis.categoriesDetected.security > 0) {
                console.log('Just sending a regular summary for bug fixes or security patches.');
                const alertTitle = `✅ Major Fixes Merged into ${repoFullName}`;
                const alertBody = `New fixes merged into ${branch}:\n\n${analysis.reportString}`;
                await sendNotification(alertTitle, alertBody);
            } else {
                console.log('Not a major feature or bug fix. Ignoring notifications.');
            }

        } catch (error) {
            console.error('Error processing webhook:', error.message);
        }
    } else {
        // Acknowledge other events
        res.status(200).send('Event not handled');
    }
});

app.listen(port, () => {
    console.log(`GitHub MCP Agent running on port ${port}`);
    console.log(`\nTo expose this with Cloudflare Try:\n npx localtunnel --port ${port}\n OR \n cloudflared tunnel --url http://localhost:${port}`);
});
