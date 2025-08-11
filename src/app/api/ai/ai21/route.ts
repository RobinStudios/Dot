import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { prompt, model, framework } = await request.json()

    const response = await fetch('https://api.ai21.com/studio/v1/j2-ultra/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.AI21_API_KEY}`
      },
      body: JSON.stringify({
        prompt: `Create a ${framework} frontend component for: ${prompt}\n\nGenerate clean, modern code with Tailwind CSS:\n\n`,
        maxTokens: 4000,
        temperature: 0.7
      })
    })

    const result = await response.json()
    
    return NextResponse.json({
      code: result.completions[0]?.data?.text || '',
      content: result.completions[0]?.data?.text || '',
      provider: 'ai21',
      framework
    })
  } catch (error) {
    return NextResponse.json({ error: 'AI21 API failed' }, { status: 500 })
  }
}