export function analyzeCommits(commits) {
    // Define 6 major categories problems that projects face
    const categories = {
        FEATURE: {
            name: 'Feature Enhancement',
            keywords: ['feat', 'add', 'new', 'implement', 'feature'],
            emoji: '🚀'
        },
        BUG: {
            name: 'Bug Fix',
            keywords: ['fix', 'bug', 'patch', 'resolve', 'issue'],
            emoji: '🐛'
        },
        SECURITY: {
            name: 'Security Patch',
            keywords: ['security', 'vuln', 'cve', 'auth'],
            emoji: '🔒'
        },
        REFACTOR: {
            name: 'Refactoring / Tech Debt',
            keywords: ['refactor', 'clean', 'optimize', 'performance'],
            emoji: '♻️'
        },
        DEPENDENCY: {
            name: 'Dependency Updates',
            keywords: ['deps', 'chore', 'bump', 'update', 'upgrade'],
            emoji: '📦'
        },
        DOCS: {
            name: 'Documentation',
            keywords: ['docs', 'readme', 'comment'],
            emoji: '📝'
        }
    };

    const results = {
        FEATURE: [],
        BUG: [],
        SECURITY: [],
        REFACTOR: [],
        DEPENDENCY: [],
        DOCS: [],
        OTHER: []
    };

    commits.forEach(commit => {
        const msg = commit.message.toLowerCase();
        let categorized = false;

        // Categorize commit based on keywords
        for (const [key, category] of Object.entries(categories)) {
            if (category.keywords.some(word => msg.includes(word))) {
                results[key].push(commit.message);
                categorized = true;
                break; // Stop at first matched category
            }
        }

        if (!categorized) {
            results.OTHER.push(commit.message);
        }
    });

    // Calculate if it's a major feature deployment
    const isFeatureEnhancement = results.FEATURE.length > 0;

    // Generate a formatted report
    let reportString = "📊 **Commit Analysis Report** 📊\\n\\n";

    for (const [key, category] of Object.entries(categories)) {
        if (results[key].length > 0) {
            reportString += `${category.emoji} **${category.name}**:\\n`;
            results[key].forEach(c => reportString += `  - ${c}\\n`);
            reportString += "\\n";
        }
    }

    if (results.OTHER.length > 0) {
        reportString += `🔄 **Other Changes**:\\n`;
        results.OTHER.forEach(c => reportString += `  - ${c}\\n`);
        reportString += "\\n";
    }

    return {
        isFeatureEnhancement,
        reportString,
        categoriesDetected: {
            features: results.FEATURE.length,
            bugs: results.BUG.length,
            security: results.SECURITY.length,
            refactors: results.REFACTOR.length,
            deps: results.DEPENDENCY.length,
            docs: results.DOCS.length
        }
    };
}
