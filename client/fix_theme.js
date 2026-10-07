const fs = require('fs');
const path = require('path');

const replacements = {
  // Text Colors
  'text-slate-400': 'text-slate-500 dark:text-slate-400',
  'text-slate-300': 'text-slate-600 dark:text-slate-300',
  'text-slate-200': 'text-slate-700 dark:text-slate-200',
  'text-purple-300': 'text-purple-700 dark:text-purple-300',
  'text-purple-200': 'text-purple-800 dark:text-purple-200',
  'text-pink-400': 'text-pink-600 dark:text-pink-400',
  'text-pink-300': 'text-pink-700 dark:text-pink-300',
  'text-amber-400': 'text-amber-600 dark:text-amber-400',
  'text-amber-300': 'text-amber-700 dark:text-amber-300',
  'text-emerald-400': 'text-emerald-600 dark:text-emerald-400',
  'text-emerald-300': 'text-emerald-700 dark:text-emerald-300',
  'text-blue-300': 'text-blue-700 dark:text-blue-300',

  // Backgrounds - Core Surfaces
  'bg-\\[#0D0822\\]': 'bg-[#F8F7FD] dark:bg-[#0D0822]',
  'bg-\\[#120B30\\]': 'bg-white dark:bg-[#120B30]',
  'bg-\\[#110A2E\\]': 'bg-white dark:bg-[#110A2E]',
  'bg-\\[#180E3E\\]': 'bg-white dark:bg-[#180E3E]',
  'bg-\\[#1A1040\\]': 'bg-slate-50 dark:bg-[#1A1040]',
  'bg-\\[#251758\\]': 'bg-slate-100 dark:bg-[#251758]',

  // Backgrounds - Badges and Muted Surfaces
  'bg-purple-500/10': 'bg-purple-50 dark:bg-purple-500/10',
  'bg-purple-500/15': 'bg-purple-50 dark:bg-purple-500/15',
  'bg-purple-500/20': 'bg-purple-100 dark:bg-purple-500/20',
  'bg-purple-500/25': 'bg-purple-100 dark:bg-purple-500/25',
  'bg-purple-500/40': 'bg-purple-200 dark:bg-purple-500/40',
  'bg-purple-950/20': 'bg-white dark:bg-purple-950/20',
  'bg-purple-950/30': 'bg-slate-50 dark:bg-purple-950/30',
  'bg-purple-950/40': 'bg-slate-100 dark:bg-purple-950/40',
  'bg-purple-950/60': 'bg-slate-100 dark:bg-purple-950/60',
  'bg-purple-900/20': 'bg-slate-50 dark:bg-purple-900/20',

  'bg-pink-500/10': 'bg-pink-50 dark:bg-pink-500/10',
  'bg-pink-500/15': 'bg-pink-50 dark:bg-pink-500/15',
  'bg-pink-500/20': 'bg-pink-100 dark:bg-pink-500/20',

  'bg-amber-500/10': 'bg-amber-50 dark:bg-amber-500/10',
  'bg-amber-500/20': 'bg-amber-100 dark:bg-amber-500/20',

  'bg-emerald-500/10': 'bg-emerald-50 dark:bg-emerald-500/10',
  'bg-emerald-500/15': 'bg-emerald-50 dark:bg-emerald-500/15',
  'bg-emerald-500/20': 'bg-emerald-100 dark:bg-emerald-500/20',
  'bg-emerald-500/40': 'bg-emerald-200 dark:bg-emerald-500/40',

  'bg-blue-500/20': 'bg-blue-100 dark:bg-blue-500/20',
  'bg-blue-500/40': 'bg-blue-200 dark:bg-blue-500/40',

  'bg-slate-500/15': 'bg-slate-100 dark:bg-slate-500/15',
  'bg-slate-500/20': 'bg-slate-100 dark:bg-slate-500/20',

  'bg-black/20': 'bg-slate-50 dark:bg-black/20',
  'bg-black/25': 'bg-slate-100 dark:bg-black/25',
  'bg-black/70': 'bg-slate-900/40 dark:bg-black/70',

  // Borders
  'border-purple-500/10': 'border-purple-200 dark:border-purple-500/10',
  'border-purple-500/15': 'border-purple-200 dark:border-purple-500/15',
  'border-purple-500/20': 'border-purple-200 dark:border-purple-500/20',
  'border-purple-500/25': 'border-purple-200 dark:border-purple-500/25',
  'border-purple-500/30': 'border-purple-300 dark:border-purple-500/30',
  'border-purple-500/40': 'border-purple-300 dark:border-purple-500/40',
  'border-purple-500/45': 'border-purple-300 dark:border-purple-500/45',

  'border-pink-500/30': 'border-pink-300 dark:border-pink-500/30',
  
  'border-amber-500/20': 'border-amber-300 dark:border-amber-500/20',
  'border-amber-500/30': 'border-amber-300 dark:border-amber-500/30',

  'border-emerald-500/20': 'border-emerald-300 dark:border-emerald-500/20',
  'border-emerald-500/35': 'border-emerald-300 dark:border-emerald-500/35',

  'border-blue-500/30': 'border-blue-300 dark:border-blue-500/30',
};

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let newContent = content;

  for (const [target, replacement] of Object.entries(replacements)) {
    // Regex matches the target string ONLY if it's NOT preceded by "dark:" or "hover:" 
    // to avoid duplicating modifiers or messing up existing overrides
    const regex = new RegExp(`(?<!dark:|hover:)${target}`, 'g');
    newContent = newContent.replace(regex, replacement);
  }

  // Handle specific text-white edge cases like in tooltips or lists that weren't converted.
  // We don't want to blindly replace text-white everywhere (e.g. solid primary buttons).
  // But we replaced standard text colors earlier.

  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent);
    console.log(`Updated theme tokens in ${filePath}`);
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
