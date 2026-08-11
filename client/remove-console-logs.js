/**
 * Script to remove console.log statements from React/JavaScript files
 * Run: node remove-console-logs.js [--dry-run] [--keep-errors]
 * 
 * Options:
 *   --dry-run      Preview changes without modifying files
 *   --keep-errors  Keep console.error statements
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directory to process
const srcDir = path.join(__dirname, 'src');

// Files to exclude
const excludeFiles = ['remove-console-logs.js'];
const excludeDirs = ['node_modules', 'dist', 'build'];

// Pattern to match console statements (handles multi-line)
const consolePattern = /^\s*console\.(log|warn|info|debug)\s*\([^;]*\);?\s*\n?/gm;
const consoleErrorPattern = /^\s*console\.error\s*\([^;]*\);?\s*\n?/gm;

const isDryRun = process.argv.includes('--dry-run');
const keepErrors = process.argv.includes('--keep-errors');

let totalFilesProcessed = 0;
let totalConsolesRemoved = 0;
let modifiedFiles = [];

function countMatches(content, pattern) {
  const matches = content.match(pattern);
  return matches ? matches.length : 0;
}

function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Count console statements
  let logCount = countMatches(content, consolePattern);
  let errorCount = keepErrors ? 0 : countMatches(content, consoleErrorPattern);
  const totalCount = logCount + errorCount;
  
  if (totalCount === 0) return;
  
  let newContent = content;
  
  // Remove console.log, console.warn, console.info, console.debug
  newContent = newContent.replace(consolePattern, '');
  
  // Optionally remove console.error
  if (!keepErrors) {
    newContent = newContent.replace(consoleErrorPattern, '');
  }
  
  // Clean up multiple empty lines
  newContent = newContent.replace(/\n\s*\n\s*\n/g, '\n\n');
  
  if (content !== newContent) {
    totalConsolesRemoved += totalCount;
    modifiedFiles.push({
      file: path.relative(__dirname, filePath),
      removed: totalCount
    });
    
    if (!isDryRun) {
      fs.writeFileSync(filePath, newContent, 'utf8');
    }
  }
}

function processDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    console.log(`Directory not found: ${dirPath}`);
    return;
  }
  
  const items = fs.readdirSync(dirPath);
  
  for (const item of items) {
    if (excludeDirs.includes(item)) continue;
    
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (stat.isFile()) {
      const ext = path.extname(item);
      if (['.js', '.jsx', '.ts', '.tsx'].includes(ext) && !excludeFiles.includes(item)) {
        totalFilesProcessed++;
        processFile(fullPath);
      }
    }
  }
}

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║       Console.log Remover for React Client                 ║');
console.log('╚════════════════════════════════════════════════════════════╝');
console.log('');

if (isDryRun) {
  console.log('🔍 DRY RUN MODE - No files will be modified\n');
}

if (keepErrors) {
  console.log('⚠️  Keeping console.error statements\n');
}

// Process src directory
processDirectory(srcDir);

// Summary
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`📁 Files processed: ${totalFilesProcessed}`);
console.log(`🗑️  Console statements removed: ${totalConsolesRemoved}`);
console.log(`📝 Files modified: ${modifiedFiles.length}`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

if (modifiedFiles.length > 0) {
  console.log('\nModified files:');
  modifiedFiles.forEach(({ file, removed }) => {
    console.log(`  ✓ ${file} (${removed} removed)`);
  });
}

if (isDryRun && totalConsolesRemoved > 0) {
  console.log('\n💡 Run without --dry-run to apply changes');
}

console.log('\n✅ Done!');
