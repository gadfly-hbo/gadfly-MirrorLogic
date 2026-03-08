const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

walkDir('packages/client/src', function (filePath) {
    if (filePath.endsWith('.jsx')) {
        let content = fs.readFileSync(filePath, 'utf8');

        // Convert all those 8px, 12px, 16px to 4px (square structural UI)
        content = content.replace(/borderRadius:\s*'12px'/g, "borderRadius: '4px'");
        content = content.replace(/borderRadius:\s*'8px'/g, "borderRadius: '4px'");
        content = content.replace(/borderRadius:\s*'16px'/g, "borderRadius: '4px'");
        content = content.replace(/borderRadius:\s*'6px'/g, "borderRadius: '4px'");

        // Strip background gradients and neon vibes
        content = content.replace(/background:\s*'linear-gradient\(90deg,\s*var\(--color-p\),\s*var\(--color-l\)\)'/g, "background: 'var(--color-p)'");
        content = content.replace(/background:\s*'linear-gradient\(90deg,\s*var\(--color-l\),\s*var\(--color-p\)\)'/g, "background: 'var(--color-l)'");

        // Make text colors from 'P / L' use standard professional colors instead of gradients or overly bright tones 
        // Example: h2 tag inline styles - simplify them or remove them
        // Let's rely on standard CSS more. But since they are inline, we can keep the logic but change the colors earlier in CSS.

        // Add serif fonts to h1/h2/h3 inline styles if they exist
        // content = content.replace(/<h2(.*?)>(.*?)<\/h2>/g, "<h2$1 style={{ fontFamily: 'var(--font-serif)', letterSpacing: '1px', fontWeight: 600, margin: 0 }}>$2</h2>");
        // Actually, CSS handles h1-h6 serif styling well now.

        fs.writeFileSync(filePath, content, 'utf8');
    }
});
console.log('UI Refinement Script Executed!');
