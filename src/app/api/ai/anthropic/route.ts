import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { prompt, model } = await request.json()

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: model || 'claude-3-sonnet-20240229',
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }]
      })
    })

    const result = await response.json()
    
    return NextResponse.json({
      content: result.content[0]?.text || '',
      provider: 'anthropic'
    })
  } catch (error) {
    return NextResponse.json({ error: 'Anthropic API failed' }, { status: 500 })
  }
}