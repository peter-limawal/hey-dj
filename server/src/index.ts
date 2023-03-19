import express from 'express'
import cors from 'cors'
import { Configuration, OpenAIApi } from 'openai'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const port = process.env.PORT || 3001

// OpenAI API key
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})
const openai = new OpenAIApi(configuration)

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.send('Hello from the backend server!')
})

async function getSongListFromGPT(input: string): Promise<string[]> {
  console.log('getSongListFromGPT called with input:', input)

  try {
    const gptResponse = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are an AI that can suggest a list of songs based on user input. Consistently generate a list of 20 songs following the "Song Name - Artist" format. Do not include any additional text, numbering, or variations in the output. Provide the list of songs in the exact format requested:

          List 20 songs below:
          
          Song Name - Artist
          Song Name - Artist
          ...
          Song Name - Artist
                   
          `,
        },
        {
          role: 'user',
          content: input,
        },
      ],
      max_tokens: 300,
      n: 1,
      temperature: 0.8,
    })

    // Log the raw response from the GPT API
    console.log('GPT API response:', gptResponse.data)

    const songsText = gptResponse.data.choices[0].message?.content || ''
    const songs = songsText
      .split('\n')
      .filter((song: string) => song.trim() !== '')

    return songs
  } catch (error) {
    console.error('Error calling the GPT API:', error)
    return []
  }
}

app.post('/input', async (req, res) => {
  const input = req.body.input
  const songs = await getSongListFromGPT(input)
  res.send({ songs })
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
