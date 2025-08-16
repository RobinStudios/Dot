# AI Graphic Designer

A comprehensive AI-driven graphic design tool that generates complete design mockups, layouts, typography, and color schemes based on prompts. Built with Next.js, TypeScript, and AWS Bedrock.

## 🎨 Features

### AI-Powered Design Generation
- **Prompt-to-Design**: Instantly generate 10 deeply unique design mockups from a single text prompt, each tailored to your theme (e.g., "futuristic tech")
- **Agentic Smart Layouts**: AI generates advanced grid, flexbox, responsive, and custom layouts—every property is editable, just like Figma
- **Unlimited Color Schemes**: No palette limits—AI creates and manages endless color variations, including theme-specific and experimental palettes
- **Unlimited Typography**: AI selects and pairs fonts intelligently, but you can edit any font, size, or style—no restrictions
- **Infinite Style Variations**: Go beyond presets—AI invents new styles (e.g., futuristic, brutalist, glassmorphic, skeuomorphic, etc.), and generates 10+ alternatives within your chosen theme, changing not just color and typography but also iconography, icon position, animation, sound, and more
- **Full Component Editing**: Every design element (font, layout, icon, animation, sound, etc.) is fully editable—if you can do it in Figma (as of 8/11/2025), you can do it here

### Advanced AI System
- **Adaptive Agents**: AI learns from user behavior and optimizes selections
- **Modular Packs**: Install specialized AI capabilities on demand
- **Bulk Export**: Convert multiple mockups to production code simultaneously
- **Multi-Format Output**: HTML, React, Vue, Angular, Figma JSON

### Design Tools
- **Interactive Canvas**: Real-time design editing with zoom, pan, and grid
- **Element Library**: Text, shapes, images, icons, buttons, videos, and containers
- **Layer Management**: Hierarchical layer system with drag-and-drop
- **Properties Panel**: Real-time editing of element properties
- **Design System**: Centralized color, typography, spacing, and shadow management

### Collaboration & Workflow
**Real-time Collaboration**: Multi-user editing with live updates
**Version Control**: Design history and version management
**Team Workspaces**: Shared projects and design systems
**Comments & Feedback**: In-app commenting system
**AI-Powered Design Rating**: Automatic design critique and suggestions from ChatGPT-5

### Cross-Platform
- **Web Application**: Full-featured browser experience
- **Mobile Apps**: Native iOS and Android applications
- **VSCode Extension**: Design directly in your development environment
- **Responsive Design**: Mobile-first responsive layouts

## 🚀 Getting Started
> **Note:** This project is under active security audit. All endpoints are being refactored for best practices and production-readiness. See the [SECURITY.md](SECURITY.md) for details.

### Prerequisites
- Node.js 18+ 
- npm or yarn
- AWS Account with Bedrock access
- Git

### AWS Setup

1. **Create AWS Cognito Identity Pool**
   - Go to AWS Cognito Console
   - Create new Identity Pool
   - Enable unauthenticated access
   - Note the Identity Pool ID

2. **Configure Bedrock Access**
   - Ensure Bedrock service is available in your region
   - Enable Claude 3 and Stable Diffusion XL models
   - Configure IAM permissions for Cognito Identity Pool

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/ai-graphic-designer.git
   cd ai-graphic-designer
   ```

2. **Install dependencies**
   ```bash

3. **Configure AWS settings**
4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 Mobile Development

### Setup Mobile Environment

1. **Install Capacitor CLI**
   ```bash
   npm install -g @capacitor/cli
   ```

2. **Build for mobile**
   ```bash
   npm run mobile:build
   ```

3. **Run on Android**
   ```bash
   npm run mobile:android
   ```

4. **Run on iOS**
   ```bash
   npm run mobile:ios
   ```

## 🔌 VSCode Extension

### Build and Install Extension

1. **Build the extension**
   ```bash
   npm run extension:build
   ```

2. **Install in VSCode**
   ```bash
   npm run extension:install
   ```

3. **Use the extension**
   - Open Command Palette (`Ctrl+Shift+P`)
   - Run `AI Designer: Open AI Graphic Designer`
   - Login with your account credentials
   - Generate designs directly in VSCode!

### Extension Features
- **User Authentication**: Login/signup with your account
- **Design Generation**: Create designs using your subscription
- **Design Management**: Save and organize designs
- **Code Export**: Export designs to HTML/CSS/React
- **Subscription Integration**: Respects your plan limits

## 🏗️ Architecture

### Tech Stack

### Security Architecture
- **Authentication**: All endpoints require Cognito JWT or session token
- **Rate Limiting**: All sensitive endpoints are rate-limited (see `src/lib/security/rate-limit.ts`)
- **Input Validation**: Zod schemas for all API routes
- **Logging**: Centralized error and access logging
- **Secrets Management**: AWS IAM roles and environment variables
- **CSRF & Security Headers**: Enforced via Next.js middleware

### AI System Architecture
- **Adaptive Agent Registry**: Manages AI models and capabilities
- **Modular Pack System**: Install specialized AI functionality
- **Bulk Export Engine**: Multi-format code generation
- **Learning System**: Adapts to user preferences and behavior

## 🎯 Usage

### Creating Designs

1. **Generate with AI**
   - Click "Generate Design" button
   - Enter a design prompt (e.g., "Modern landing page for a tech startup")
   - Select style, layout, color scheme, and typography
   - Choose specific AI agent or let system auto-select
   - Click "Generate Designs" to create 10 variations

2. **AI Pack Management**
   - Click "AI Packs" to browse available capabilities
   - Install specialized packs for advanced features
   - Core packs include design, code export, and bulk operations
   - Premium packs add 3D mockups, enterprise frameworks, and content AI

3. **Bulk Export**
   - Select multiple designs from gallery
   - Click "Bulk Export" button
   - Choose output format (HTML, React, Vue, Angular, Figma)
   - Configure styling options (CSS, Tailwind, Styled Components)
   - Download ZIP file with all generated code

### Advanced Features

1. **Concept Clustering**
   - AI automatically groups similar designs
   - Highlights top 3 designs based on quality metrics
   - Filter by style, mood, and performance scores

2. **Collaborative Voting**
   - Team members vote on favorite designs
   - Real-time analytics and trending indicators
   - Top-rated designs highlighted automatically

3. **Guided Tours**
   - Step-by-step explanation of each design approach
   - Shows how designs address original prompt goals
   - Auto-play mode for presentations

## 🔧 Configuration

### AWS Bedrock Models
- **Text Generation**: Claude 3 Sonnet (anthropic.claude-3-sonnet-20240229-v1:0)
- **Image Generation**: Stable Diffusion XL (stability.stable-diffusion-xl-v1)
- **Code Generation**: Claude 3 for HTML/React/Vue export

### Customization
1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/ai-graphic-designer.git
   cd ai-graphic-designer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure AWS settings**
   # See AWS_SETUP.md and SECURITY.md for IAM and Cognito configuration

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)
   - Connect repository to Vercel
   - Configure environment variables
   - Deploy automatically

2. **Environment Variables**
   ```
   NEXT_PUBLIC_AWS_REGION=us-east-1
   NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID=us-east-1:your-identity-pool-id
   ```

### Other Platforms

1. **Docker**
   ```bash
   docker build -t ai-graphic-designer .
   docker run -p 3000:3000 ai-graphic-designer
   ```

2. **Self-hosted**
   - Set up Node.js environment
   - Configure reverse proxy (nginx)
   - Set up SSL certificates
   - Configure AWS credentials

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- AWS Bedrock for AI capabilities
- Vercel for hosting and deployment
- Tailwind CSS for styling
- Next.js team for the amazing framework

## 📞 Support

- **Documentation**: [docs.ai-graphic-designer.com](https://docs.ai-graphic-designer.com)
- **Issues**: [GitHub Issues](https://github.com/your-username/ai-graphic-designer/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/ai-graphic-designer/discussions)
- **Email**: support@ai-graphic-designer.com