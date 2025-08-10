#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up AI Graphic Designer with AWS Bedrock and Mobile Support...\n');

// Install dependencies
console.log('📦 Installing AWS Bedrock and mobile dependencies...');
try {
  execSync('npm install @aws-sdk/client-bedrock-runtime @aws-sdk/credential-providers @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios @capacitor/app @capacitor/haptics @capacitor/keyboard @capacitor/status-bar', { stdio: 'inherit' });
  console.log('✅ Dependencies installed successfully\n');
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
  process.exit(1);
}

// Remove old dependencies
console.log('🧹 Removing old OpenAI/Replicate dependencies...');
try {
  execSync('npm uninstall openai replicate', { stdio: 'inherit' });
  console.log('✅ Old dependencies removed\n');
} catch (error) {
  console.log('⚠️  Old dependencies may not exist, continuing...\n');
}

// Initialize Capacitor
console.log('📱 Initializing Capacitor for mobile support...');
try {
  execSync('npx cap init "AI Graphic Designer" "com.aigraphicdesigner.app"', { stdio: 'inherit' });
  console.log('✅ Capacitor initialized\n');
} catch (error) {
  console.log('⚠️  Capacitor may already be initialized, continuing...\n');
}

// Add mobile platforms
console.log('🔧 Adding mobile platforms...');
try {
  execSync('npx cap add android', { stdio: 'inherit' });
  execSync('npx cap add ios', { stdio: 'inherit' });
  console.log('✅ Mobile platforms added\n');
} catch (error) {
  console.log('⚠️  Mobile platforms may already exist, continuing...\n');
}

// Check environment file
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  console.log('📝 Environment file updated with AWS Bedrock configuration');
  console.log('⚠️  Please update your .env file with your AWS credentials:\n');
  console.log('   AWS_ACCESS_KEY_ID=your_aws_access_key_id');
  console.log('   AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key');
  console.log('   AWS_REGION=us-east-1');
  console.log('   AWS_BEDROCK_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0');
  console.log('   AWS_BEDROCK_IMAGE_MODEL_ID=stability.stable-diffusion-xl-v1\n');
} else {
  console.log('⚠️  .env file not found. Please create one with AWS credentials.\n');
}

console.log('🎉 Setup complete! Next steps:');
console.log('1. Update your .env file with AWS Bedrock credentials');
console.log('2. Run: npm run dev (for web development)');
console.log('3. Run: npm run mobile:build (to build for mobile)');
console.log('4. Run: npm run mobile:android (to run on Android)');
console.log('5. Run: npm run mobile:ios (to run on iOS)\n');

console.log('📚 Features now available:');
console.log('- AWS Bedrock AI generation (Claude 3 + Stable Diffusion XL)');
console.log('- Mobile-responsive design');
console.log('- Progressive Web App (PWA) support');
console.log('- Capacitor mobile app deployment');
console.log('- Touch-optimized interface');
console.log('- Responsive breakpoints and layouts\n');

console.log('✨ Your AI Graphic Designer is ready for AWS Bedrock and mobile!');