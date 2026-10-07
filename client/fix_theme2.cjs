const fs = require('fs');
const path = require('path');

const replacements = {
  // Fix hover:text-white edge cases
  'hover:text-white': 'hover:text-purple-900 dark:hover:text-white',
  // Revert button text that shouldn't be dark in light mode
  // The script might have converted text-white inside buttons (wait, the regex didn't convert text-white directly).
  
  // Also, the risk Comparison box text is `text-slate-500` now.
  // The button 'Start' had `text-blue-700` and `hover:text-white`
};

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let newContent = content;

  // Let's specifically target the 'hover:text-white' when it's not preceded by dark:
  const regexHoverWhite = /(?<!dark:)hover:text-white/g;
  newContent = newContent.replace(regexHoverWhite, 'hover:text-slate-900 dark:hover:text-white');

  // Let's also ensure the Sidebar active link is kept as text-white in both modes if it has bg-purple-600.
  // Sidebar items are probably fine because they didn't have `text-white` explicitly on hover unless they were light mode broken.
  // Actually, wait, let's just make sure hover:text-slate-900 is applied.

  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent);
    console.log(`Updated hover states in ${filePath}`);
  }
}

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (file !== 'node_modules' && file !== 'dist') walk(filePath);
    } else if (filePath.endsWith('.jsx') || filePath.endsWith('.js') || filePath.endsWith('.css')) {
      processFile(filePath);
    }
  }
}

walk(path.join(__dirname, 'src'));
