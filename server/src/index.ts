import express from 'express'
import cors from 'cors'
import { Configuration, OpenAIApi } from 'openai'
import dotenv from 'dotenv'
import axios from 'axios'

dotenv.config()

const app = express()
const port = process.env.PORT || 5000

// OpenAI API key
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})
const openai = new OpenAIApi(configuration)

// Spotify API keys
const spotify_client_id = process.env.SPOTIFY_CLIENT_ID as string
const spotify_client_secret = process.env.SPOTIFY_CLIENT_SECRET as string

// Redirect URI
const redirect_uri = process.env.REDIRECT_URI as string

// In-memory storage for tokens
const access_tokens: Set<string> = new Set()

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.send('Hello from the backend server!')
})

const generateRandomString = function (length: number): string {
  let text = ''
  const possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return text
}

app.get('/auth/login', (req, res) => {
  const scope = 'streaming user-read-email user-read-private'
  const state = generateRandomString(16)
  const auth_query_parameters = new URLSearchParams({
    response_type: 'code',
    client_id: spotify_client_id,
    scope: scope,
    redirect_uri: redirect_uri,
    state: state,
  })

  res.redirect(
    'https://accounts.spotify.com/authorize/?' +
      auth_query_parameters.toString()
  )
})

app.get('/auth/callback', async (req, res) => {
  const code = req.query.code as string

  const auth_options = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      code: code,
      redirect_uri: redirect_uri,
      grant_type: 'authorization_code',
    },
    headers: {
      Authorization:
        'Basic ' +
        Buffer.from(spotify_client_id + ':' + spotify_client_secret).toString(
          'base64'
        ),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    json: true,
  }

  axios
    .post(auth_options.url, new URLSearchParams(auth_options.form), {
      headers: auth_options.headers,
    })
    .then((response) => {
      if (response.status === 200) {
        const access_token = response.data.access_token
        access_tokens.add(access_token) // Store the access token in the Set
        res.redirect('/')
      } else {
        console.error(
          'Error in /auth/callback',
          response.status,
          response.statusText
        )
        res.status(response.status).send(response.statusText)
      }
    })
    .catch((error) => {
      console.error('Error in /auth/callback', error)
      res.status(500).send('Internal Server Error')
    })
})

app.get('/auth/token', (req, res) => {
  const access_token = req.query.access_token as string
  const stored_access_token = access_tokens.has(access_token)
    ? access_token
    : null
  res.json({
    access_token: stored_access_token,
  })
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
