const fs = require('fs');
const path = require('path');

console.log('🔍 Scanning for potential naming issues...\n');

let issues = [];

function scanFile(file) {
    try {
        const content = fs.readFileSync(file, 'utf8');
        const lines = content.split('\n');

        lines.forEach((line, i) => {
            // Check for common issues
            if (line.includes('categoriesId')) {
                issues.push({
                    file,
                    line: i + 1,
                    type: 'ERROR',
                    msg: 'Uses categoriesId (should be category_id)'
                });
            }

            if (line.match(/userId\s*:/) && !line.includes('payload')) {
                issues.push({
                    file,
                    line: i + 1,
                    type: 'WARNING',
                    msg: 'Uses userId (check if should be user_id)'
                });
            }
        });
    } catch (e) {
        // Skip unreadable files
    }
}

function scanDir(dir) {
    if (!fs.existsSync(dir)) return;
    try {
        fs.readdirSync(dir).forEach(f => {
            const p = path.join(dir, f);
            try {
                if (fs.statSync(p).isDirectory() && !f.startsWith('.') && f !== 'node_modules') {
                    scanDir(p);
                } else if ((f.endsWith('.js') || f.endsWith('.jsx')) && !f.includes('.min.')) {
                    scanFile(p);
                }
            } catch (e) { }
        });
    } catch (e) { }
}

scanDir('app/api');
scanDir('lib');
scanDir('components');

if (issues.length === 0) {
    console.log('✅ No obvious naming issues found!');
} else {
    issues.forEach(i => {
        const icon = i.type === 'ERROR' ? '❌' : '⚠️';
        console.log(`${icon} ${i.file}:${i.line} - ${i.msg}`);
    });
    console.log(`\n📊 Total issues found: ${issues.length}`);
}
