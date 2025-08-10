# VSCode Marketplace Publishing Guide

## 🚀 Publishing to VSCode Marketplace

### 1. Install VSCE (Visual Studio Code Extension Manager)
```bash
npm install -g vsce
```

### 2. Create Azure DevOps Account
- Go to [dev.azure.com](https://dev.azure.com)
- Sign up with Microsoft account
- Create organization

### 3. Generate Personal Access Token
1. Go to Azure DevOps → User Settings → Personal Access Tokens
2. Click "New Token"
3. Name: "VSCode Extension Publishing"
4. Organization: All accessible organizations
5. Scopes: **Marketplace (Manage)**
6. Copy the token (save it securely)

### 4. Create Publisher Account
```bash
vsce create-publisher your-publisher-name
# Enter your Personal Access Token when prompted
```

### 5. Login to Publisher Account
```bash
vsce login your-publisher-name
# Enter your Personal Access Token
```

## 📦 Publishing Steps

### 1. Prepare Extension
```bash
cd vscode-extension
npm install
```

### 2. Update package.json
- Set your `publisher` name
- Update `repository` URL
- Add proper `icon.png` (128x128px)

### 3. Build Extension
```bash
npm run compile
```

### 4. Package Extension
```bash
vsce package
# Creates: ai-graphic-designer-1.0.0.vsix
```

### 5. Test Locally
```bash
code --install-extension ai-graphic-designer-1.0.0.vsix
```

### 6. Publish to Marketplace
```bash
# First time publish
vsce publish

# Or publish with version bump
vsce publish patch  # 1.0.0 -> 1.0.1
vsce publish minor  # 1.0.0 -> 1.1.0
vsce publish major  # 1.0.0 -> 2.0.0
```

### 7. Verify Publication
- Check [VSCode Marketplace](https://marketplace.visualstudio.com)
- Search for "AI Graphic Designer"
- Verify extension appears and installs correctly

## 🔧 Required Files

### Icon Requirements
- **File**: `icon.png`
- **Size**: 128x128 pixels
- **Format**: PNG with transparency
- **Style**: Clean, recognizable at small sizes

### Marketplace Assets
- **README.md**: Feature descriptions, screenshots
- **CHANGELOG.md**: Version history
- **LICENSE**: MIT or appropriate license

## 📊 Marketplace Optimization

### Keywords (package.json)
```json
"keywords": [
  "ai", "design", "figma", "graphics", 
  "brand", "logo", "typography", "react", 
  "html", "css", "export", "github"
]
```

### Categories
```json
"categories": ["Other", "Visualization", "Design"]
```

### Screenshots
Add to README.md:
- Extension in action
- Design interface
- Code export example
- GitHub integration

## 🔄 Updates

### Version Updates
```bash
# Patch version (1.0.0 → 1.0.1)
vsce publish patch

# Minor version (1.0.0 → 1.1.0)
vsce publish minor

# Major version (1.0.0 → 2.0.0)
vsce publish major
```

### Update Process
1. Make changes to code
2. Update CHANGELOG.md
3. Run `vsce publish patch/minor/major`

## 📈 Analytics

Monitor your extension:
- **Marketplace**: [marketplace.visualstudio.com](https://marketplace.visualstudio.com)
- **Publisher Portal**: Manage extensions, view stats
- **User Feedback**: Reviews and ratings

## 🛠️ Troubleshooting

### Common Issues
- **Authentication**: Regenerate Personal Access Token
- **Package Size**: Ensure < 50MB (exclude node_modules)
- **Icon Missing**: Add 128x128 PNG icon
- **Repository URL**: Must be public GitHub repo

### Validation
```bash
vsce ls  # List packaged files
vsce show your-publisher-name.ai-graphic-designer  # Show published info
```

## 🎯 Success Tips

1. **Clear Description**: Explain AI design capabilities
2. **Good Screenshots**: Show the extension working
3. **Regular Updates**: Keep extension current
4. **User Support**: Respond to issues/reviews
5. **SEO Keywords**: Use relevant search terms