import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { prompt, model, framework } = await request.json()

    const response = await fetch('https://api.together.xyz/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}`
      },
      body: JSON.stringify({
        model: model || 'meta-llama/Llama-3-70b-chat-hf',
        messages: [{
          role: 'user',
          content: `Create a ${framework} frontend component for: ${prompt}. Include modern styling with Tailwind CSS and responsive design.`
        }],
        max_tokens: 4000
      })
    })

    const result = await response.json()
    
    return NextResponse.json({
      code: result.choices[0]?.message?.content || '',
      content: result.choices[0]?.message?.content || '',
      provider: 'meta',
      framework
    })
  } catch (error) {
    return NextResponse.json({ error: 'Meta API failed' }, { status: 500 })
  }
}