#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔨 Building AI Graphic Designer VSCode Extension...\n');

const extensionDir = path.join(__dirname, 'vscode-extension');

// Check if extension directory exists
if (!fs.existsSync(extensionDir)) {
    console.error('❌ Extension directory not found');
    process.exit(1);
}

process.chdir(extensionDir);

try {
    // Install dependencies
    console.log('📦 Installing dependencies...');
    execSync('npm install', { stdio: 'inherit' });

    // Compile TypeScript
    console.log('🔧 Compiling TypeScript...');
    execSync('npm run compile', { stdio: 'inherit' });

    // Install VSCE if not present
    try {
        execSync('vsce --version', { stdio: 'ignore' });
    } catch {
        console.log('📥 Installing VSCE...');
        execSync('npm install -g vsce', { stdio: 'inherit' });
    }

    // Package extension
    console.log('📦 Packaging extension...');
    execSync('vsce package', { stdio: 'inherit' });

    console.log('\n✅ Extension built successfully!');
    console.log('📁 Extension package created: ai-graphic-designer-1.0.0.vsix');
    console.log('\n🚀 To install:');
    console.log('1. Open VSCode');
    console.log('2. Go to Extensions view (Ctrl+Shift+X)');
    console.log('3. Click "..." menu → "Install from VSIX..."');
    console.log('4. Select the .vsix file');
    console.log('\n📝 Don\'t forget to configure AWS credentials in VSCode settings!');

} catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
}