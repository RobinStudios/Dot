import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { prompt, model, framework } = await request.json()

    const response = await fetch('https://api.stability.ai/v2beta/stable-code/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.STABILITY_API_KEY}`
      },
      body: JSON.stringify({
        prompt: `Generate a ${framework} component for: ${prompt}. Use modern patterns and Tailwind CSS.`,
        model: model || 'stable-code-instruct-3b',
        max_tokens: 4000
      })
    })

    const result = await response.json()
    
    return NextResponse.json({
      code: result.text || result.content || '',
      content: result.text || result.content || '',
      provider: 'stability',
      framework
    })
  } catch (error) {
    return NextResponse.json({ error: 'Stability API failed' }, { status: 500 })
  }
}