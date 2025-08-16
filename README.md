# AI Graphic Designer

A comprehensive AI-driven graphic design tool that generates complete design mockups, layouts, typography, and color schemes based on prompts. Built with Next.js, TypeScript, and AWS Bedrock.

## 🎨 Features

### AI-Powered Design Generation
- **Prompt-to-Design**: Generate 10 unique design mockups from text prompts
- **Smart Layouts**: AI-generated grid, flexbox, and responsive layouts
- **Color Schemes**: Automatic color palette generation and management
- **Typography**: Intelligent font pairing and sizing
- **Style Variations**: Modern, minimalist, vintage, playful, professional, and artistic styles

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
- **Real-time Collaboration**: Multi-user editing with live updates
- **Version Control**: Design history and version management
- **Team Workspaces**: Shared projects and design systems
- **Comments & Feedback**: In-app commenting system
- **Collaborative Voting**: Team voting on design preferences

### Cross-Platform
- **Web Application**: Full-featured browser experience
- **Mobile Apps**: Native iOS and Android applications
- **VSCode Extension**: Design directly in your development environment
- **Responsive Design**: Mobile-first responsive layouts

## 🚀 Getting Started

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
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env.local` file in the root of the project and add the following variables:
   ```
   # AWS Configuration (Public - safe for client-side)
   NEXT_PUBLIC_AWS_REGION=us-east-1
   NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID=us-east-1:your-identity-pool-id

   # AWS Configuration (Server-side only - DO NOT EXPOSE TO CLIENT)
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=your_aws_access_key_id
   AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
   AWS_BEDROCK_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0
   AWS_BEDROCK_IMAGE_MODEL_ID=stability.stable-diffusion-xl-v1
   ```

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
- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **State Management**: Zustand
- **AI Services**: AWS Bedrock (Claude 3, Stable Diffusion XL)
- **Authentication**: AWS Cognito Identity Pool
- **Real-time**: Socket.io
- **Deployment**: Vercel

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

1. **AI Agent Configuration**
   - Modify agent specialties in `src/lib/ai/agent-registry.ts`
   - Add custom AI providers via API endpoints
   - Configure task-to-agent mappings

2. **Export Formats**
   - Extend bulk export engine in `src/lib/ai/bulk-export-engine.ts`
   - Add new framework support (Svelte, Angular, etc.)
   - Customize code generation templates

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect to Vercel**
   - Push code to GitHub
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