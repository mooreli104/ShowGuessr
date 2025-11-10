#!/usr/bin/env node

/**
 * Setup Verification Script
 * Run this to check if your ShowGuessr environment is properly configured
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFile(filePath, description) {
  const exists = fs.existsSync(filePath);
  if (exists) {
    log(`✓ ${description}`, 'green');
    return true;
  } else {
    log(`✗ ${description} - NOT FOUND`, 'red');
    return false;
  }
}

function checkEnvFile(filePath, requiredVars, description) {
  if (!fs.existsSync(filePath)) {
    log(`✗ ${description} - NOT FOUND`, 'red');
    log(`  Create it by copying the .env.example file`, 'yellow');
    return false;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const missing = [];

  requiredVars.forEach(varName => {
    if (!content.includes(`${varName}=`) || content.includes(`${varName}=your_`)) {
      missing.push(varName);
    }
  });

  if (missing.length > 0) {
    log(`⚠ ${description} - INCOMPLETE`, 'yellow');
    log(`  Missing or incomplete: ${missing.join(', ')}`, 'yellow');
    return false;
  }

  log(`✓ ${description}`, 'green');
  return true;
}

function checkNodeModules(packagePath, description) {
  const nodeModulesPath = path.join(packagePath, 'node_modules');
  if (fs.existsSync(nodeModulesPath)) {
    log(`✓ ${description}`, 'green');
    return true;
  } else {
    log(`✗ ${description} - NOT INSTALLED`, 'red');
    return false;
  }
}

console.log('\n' + '='.repeat(60));
log('ShowGuessr Setup Verification', 'blue');
console.log('='.repeat(60) + '\n');

let allGood = true;

// Check root structure
log('Checking Project Structure...', 'blue');
allGood &= checkFile('package.json', 'Root package.json');
allGood &= checkFile('README.md', 'README.md');
allGood &= checkFile('SETUP.md', 'Setup guide');
allGood &= checkFile('.gitignore', '.gitignore');
console.log();

// Check packages
log('Checking Packages...', 'blue');
allGood &= checkFile('packages/server/package.json', 'Server package');
allGood &= checkFile('packages/web/package.json', 'Web package');
allGood &= checkFile('packages/mobile/package.json', 'Mobile package');
allGood &= checkFile('packages/shared/package.json', 'Shared package');
console.log();

// Check server files
log('Checking Server Files...', 'blue');
allGood &= checkFile('packages/server/src/index.ts', 'Server entry point');
allGood &= checkFile('packages/server/src/config/index.ts', 'Server config');
allGood &= checkFile('packages/server/src/controllers/SocketController.ts', 'Socket controller');
allGood &= checkFile('packages/server/src/services/ContentService.ts', 'Content service');
allGood &= checkFile('packages/server/src/services/LobbyManager.ts', 'Lobby manager');
console.log();

// Check web files
log('Checking Web Files...', 'blue');
allGood &= checkFile('packages/web/src/App.tsx', 'Web App component');
allGood &= checkFile('packages/web/src/main.tsx', 'Web entry point');
allGood &= checkFile('packages/web/src/pages/Home.tsx', 'Home page');
allGood &= checkFile('packages/web/src/pages/Lobby.tsx', 'Lobby page');
allGood &= checkFile('packages/web/src/pages/Game.tsx', 'Game page');
allGood &= checkFile('packages/web/index.html', 'HTML template');
allGood &= checkFile('packages/web/vite.config.ts', 'Vite config');
console.log();

// Check mobile files
log('Checking Mobile Files...', 'blue');
allGood &= checkFile('packages/mobile/App.tsx', 'Mobile App component');
allGood &= checkFile('packages/mobile/app.json', 'Expo config');
allGood &= checkFile('packages/mobile/src/screens/HomeScreen.tsx', 'Home screen');
allGood &= checkFile('packages/mobile/src/screens/LobbyScreen.tsx', 'Lobby screen');
allGood &= checkFile('packages/mobile/src/screens/GameScreen.tsx', 'Game screen');
console.log();

// Check shared files
log('Checking Shared Files...', 'blue');
allGood &= checkFile('packages/shared/src/types.ts', 'Shared types');
allGood &= checkFile('packages/shared/src/index.ts', 'Shared index');
console.log();

// Check environment files
log('Checking Environment Configuration...', 'blue');
allGood &= checkEnvFile(
  'packages/server/.env',
  ['PORT', 'TMDB_API_KEY'],
  'Server .env file'
);
const webEnvExists = fs.existsSync('packages/web/.env');
if (webEnvExists) {
  log('✓ Web .env file (optional)', 'green');
} else {
  log('⚠ Web .env file - OPTIONAL (defaults will be used)', 'yellow');
}
console.log();

// Check dependencies
log('Checking Dependencies...', 'blue');
allGood &= checkNodeModules('.', 'Root dependencies');
allGood &= checkNodeModules('packages/server', 'Server dependencies');
allGood &= checkNodeModules('packages/web', 'Web dependencies');
allGood &= checkNodeModules('packages/mobile', 'Mobile dependencies');
allGood &= checkNodeModules('packages/shared', 'Shared dependencies');
console.log();

// Check shared build
log('Checking Shared Package Build...', 'blue');
const sharedDistExists = fs.existsSync('packages/shared/dist');
if (sharedDistExists) {
  log('✓ Shared package built', 'green');
} else {
  log('✗ Shared package NOT built', 'red');
  log('  Run: cd packages/shared && npm run build', 'yellow');
  allGood = false;
}
console.log();

// Final summary
console.log('='.repeat(60));
if (allGood) {
  log('✓ All checks passed! You\'re ready to start development.', 'green');
  console.log('\nNext steps:');
  console.log('1. Terminal 1: npm run dev:server');
  console.log('2. Terminal 2: npm run dev:web');
  console.log('3. Terminal 3 (optional): npm run dev:mobile');
} else {
  log('✗ Some checks failed. Please fix the issues above.', 'red');
  console.log('\nCommon fixes:');
  console.log('- Run: npm install');
  console.log('- Copy .env.example files to .env and configure');
  console.log('- Run: cd packages/shared && npm run build');
}
console.log('='.repeat(60) + '\n');

process.exit(allGood ? 0 : 1);
