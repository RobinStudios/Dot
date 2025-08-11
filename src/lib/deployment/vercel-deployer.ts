export class VercelDeployer {
  private apiKey: string

  constructor() {
    this.apiKey = process.env.VERCEL_TOKEN || ''
  }

  async deployProject(template: any): Promise<{ success: boolean; url?: string; deploymentId?: string }> {
    try {
      const projectName = template.name.toLowerCase().replace(/[^a-z0-9-]/g, '-')
      
      const deploymentResponse = await fetch('https://api.vercel.com/v13/deployments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: projectName,
          files: [
            {
              file: 'package.json',
              data: this.generatePackageJson(projectName)
            },
            {
              file: 'pages/index.js',
              data: this.convertToNextJS(template.code)
            }
          ],
          projectSettings: {
            framework: 'nextjs'
          }
        })
      })

      if (!deploymentResponse.ok) {
        throw new Error('Deployment failed')
      }

      const deployment = await deploymentResponse.json()
      const deploymentUrl = `https://${deployment.url}`
      
      return {
        success: true,
        url: deploymentUrl,
        deploymentId: deployment.id
      }

    } catch (error: any) {
      return { success: false }
    }
  }

  private generatePackageJson(projectName: string): string {
    return JSON.stringify({
      name: projectName,
      version: '1.0.0',
      scripts: {
        build: 'next build',
        start: 'next start'
      },
      dependencies: {
        next: '^14.0.0',
        react: '^18.0.0',
        'react-dom': '^18.0.0'
      }
    })
  }

  private convertToNextJS(reactCode: string): string {
    return `import React from 'react'

${reactCode.replace('export default', 'const Component =')}

export default function Home() {
  return <Component />
}
`
  }
}

export const vercelDeployer = new VercelDeployer()