import { Octokit } from '@octokit/rest';
import dotenv from 'dotenv';
dotenv.config();

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN || ''
});

export async function getFileContent(repoFullName, path, ref) {
    try {
        const [owner, repo] = repoFullName.split('/');
        const { data } = await octokit.rest.repos.getContent({
            owner,
            repo,
            path,
            ref
        });

        if (data.type === 'file' && data.content) {
            return Buffer.from(data.content, 'base64').toString('utf8');
        }
        return '';
    } catch (err) {
        if (err.status === 404) return ''; // no readme exists
        throw err;
    }
}

export async function createPullRequest(repoFullName, branchName, baseBranch, title, path, content, bodyStr) {
    const [owner, repo] = repoFullName.split('/');

    // 1. Get base branch SHA
    const { data: refData } = await octokit.rest.git.getRef({
        owner,
        repo,
        ref: `heads/${baseBranch}`,
    });
    const baseSha = refData.object.sha;

    // 2. Create new branch
    try {
        await octokit.rest.git.createRef({
            owner,
            repo,
            ref: `refs/heads/${branchName}`,
            sha: baseSha,
        });
    } catch (err) {
        console.warn("Branch may already exist, proceeding... ", err.message);
    }

    // 3. Get existing file sha if it exists
    let existingSha;
    try {
        const { data: fileData } = await octokit.rest.repos.getContent({
            owner,
            repo,
            path,
            ref: `refs/heads/${branchName}`
        });
        existingSha = fileData.sha;
    } catch (err) { }

    // 4. Update file
    await octokit.rest.repos.createOrUpdateFileContents({
        owner,
        repo,
        path,
        message: title,
        content: Buffer.from(content).toString('base64'),
        branch: branchName,
        sha: existingSha,
    });

    // 5. Create PR
    const { data: prData } = await octokit.rest.pulls.create({
        owner,
        repo,
        title,
        head: branchName,
        base: baseBranch,
        body: bodyStr
    });

    console.log(`Created PR: ${prData.html_url}`);
    return prData;
}
