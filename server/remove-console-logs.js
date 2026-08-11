/**
 * Script to remove console.log statements from JavaScript files
 * Run: node remove-console-logs.js [--dry-run]
 * 
 * Options:
 *   --dry-run  Preview changes without modifying files
 */

const fs = require('fs');
const path = require('path');

// Directories to process
const targetDirs = ['controllers', 'routes', 'middleware', 'utils', 'config'];

// Files to exclude
const excludeFiles = ['remove-console-logs.js'];

// Pattern to match console.log, console.error, console.warn, console.info, console.debug
const consolePattern = /^\s*console\.(log|error|warn|info|debug)\s*\([^)]*\);?\s*$/gm;

// More comprehensive pattern for multi-line console statements
const multiLineConsolePattern = /console\.(log|error|warn|info|debug)\s*\([^;]*\);?\n?/g;

const isDryRun = process.argv.includes('--dry-run');
const keepErrors = process.argv.includes('--keep-errors');

let totalFilesProcessed = 0;
let totalConsolesRemoved = 0;
let modifiedFiles = [];

function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Count existing console statements
  const matches = content.match(multiLineConsolePattern) || [];
  
  if (matches.length === 0) return;
  
  let newContent = content;
  
  if (keepErrors) {
    // Only remove console.log, console.warn, console.info, console.debug (keep console.error)
    newContent = content.replace(/console\.(log|warn|info|debug)\s*\([^;]*\);?\n?/g, '');
  } else {
    // Remove all console statements
    newContent = content.replace(multiLineConsolePattern, '');
  }
  
  // Clean up empty lines left behind
  newContent = newContent.replace(/\n\s*\n\s*\n/g, '\n\n');
   
  if (content !== newContent) {
    totalConsolesRemoved += matches.length;
    modifiedFiles.push({
      file: filePath,
      removed: matches.length
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
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (stat.isFile() && item.endsWith('.js') && !excludeFiles.includes(item)) {
      totalFilesProcessed++;
      processFile(fullPath);
    }
  }
}

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║          Console.log Remover for Production                ║');
console.log('╚════════════════════════════════════════════════════════════╝');
console.log('');

if (isDryRun) {
  console.log('🔍 DRY RUN MODE - No files will be modified\n');
}

if (keepErrors) {
  console.log('⚠️  Keeping console.error statements\n');
}

// Process server.js in root
const serverJsPath = path.join(__dirname, 'server.js');
if (fs.existsSync(serverJsPath)) {
  totalFilesProcessed++;
  processFile(serverJsPath);
}

// Process all target directories
for (const dir of targetDirs) {
  const dirPath = path.join(__dirname, dir);
  processDirectory(dirPath);
}

// Summary
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`📁 Files processed: ${totalFilesProcessed}`);
console.log(`🗑️  Console statements removed: ${totalConsolesRemoved}`);
console.log(`📝 Files modified: ${modifiedFiles.length}`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

if (modifiedFiles.length > 0) {
  console.log('\nModified files:');
  modifiedFiles.forEach(({ file, removed }) => {
    const relativePath = path.relative(__dirname, file);
    console.log(`  ✓ ${relativePath} (${removed} removed)`);
  });
}

if (isDryRun && totalConsolesRemoved > 0) {
  console.log('\n💡 Run without --dry-run to apply changes');
}

console.log('\n✅ Done!');
