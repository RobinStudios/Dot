import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { prompt, model, framework } = await request.json()

    const frontendPrompt = `Create a complete ${framework} frontend for: ${prompt}

Generate production-ready code with:
- Modern component structure
- Tailwind CSS styling
- Responsive design
- Clean architecture
- TypeScript support

Return only the main component code.`

    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`
      },
      body: JSON.stringify({
        model: model || 'mistral-large-latest',
        messages: [{ role: 'user', content: frontendPrompt }],
        max_tokens: 4000
      })
    })

    const result = await response.json()
    
    return NextResponse.json({
      code: result.choices[0]?.message?.content || '',
      content: result.choices[0]?.message?.content || '',
      provider: 'mistral',
      framework
    })
  } catch (error) {
    return NextResponse.json({ error: 'Mistral API failed' }, { status: 500 })
  }
}