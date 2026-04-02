import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function generateCompletion(params: {
  system: string
  messages: { role: 'user' | 'assistant'; content: string }[]
  model?: string
  maxTokens?: number
  temperature?: number
}) {
  const {
    system,
    messages,
    model = 'claude-sonnet-4-20250514',
    maxTokens = 4096,
    temperature = 0.7,
  } = params

  const response = await anthropic.messages.create({
    model,
    max_tokens: maxTokens,
    temperature,
    system,
    messages,
  })

  const textBlock = response.content.find((block) => block.type === 'text')
  return {
    text: textBlock?.type === 'text' ? textBlock.text : '',
    usage: response.usage,
    model: response.model,
  }
}

export async function generateJSON<T>(params: {
  system: string
  prompt: string
  model?: string
  maxTokens?: number
}): Promise<{ data: T; usage: { input_tokens: number; output_tokens: number } }> {
  const {
    system,
    prompt,
    model = 'claude-sonnet-4-20250514',
    maxTokens = 4096,
  } = params

  const response = await anthropic.messages.create({
    model,
    max_tokens: maxTokens,
    temperature: 0.3,
    system:
      system +
      '\n\nYou MUST respond with valid JSON only. No markdown, no code fences, no explanation.',
    messages: [{ role: 'user', content: prompt }],
  })

  const textBlock = response.content.find((block) => block.type === 'text')
  const text = textBlock?.type === 'text' ? textBlock.text : '{}'

  // Try to extract JSON from the response
  let jsonStr = text.trim()
  if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr
      .replace(/^```(?:json)?\n?/, '')
      .replace(/\n?```$/, '')
  }

  const data = JSON.parse(jsonStr) as T
  return { data, usage: response.usage }
}

export { anthropic }
