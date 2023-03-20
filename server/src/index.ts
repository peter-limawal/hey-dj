import express from 'express'
import cors from 'cors'
import { Configuration, OpenAIApi } from 'openai'
import dotenv from 'dotenv'
import querystring from 'querystring'
import fetch from 'node-fetch'

dotenv.config()

const app = express()
const port = process.env.PORT || 3001

// OpenAI API key
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})
const openai = new OpenAIApi(configuration)

const spotifyClientId = process.env.SPOTIFY_CLIENT_ID
const spotifyClientSecret = process.env.SPOTIFY_CLIENT_SECRET
const redirectUri = 'http://localhost:5173/auth/callback'

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
          content: `You are an AI that can suggest a list of songs based on user input. Consistently generate a list of 15-20 songs following the "Song Name - Artist" format. Do not include any additional text, numbering, or variations in the output. Provide the list of songs in the exact format requested:

          List songs below:
          
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

function generateRandomString(length: number): string {
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
  const redirect_uri = 'http://localhost:3000/auth/callback'

  const auth_query_parameters = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.SPOTIFY_CLIENT_ID as string,
    scope: scope,
    redirect_uri: redirect_uri,
    state: state,
  })

  res.redirect(
    'https://accounts.spotify.com/authorize/?' +
      auth_query_parameters.toString()
  )
})

// In-memory storage for tokens
const userTokens: Record<
  string,
  { access_token: string; refresh_token: string }
> = {}

app.get('/auth/callback', async (req, res) => {
  const code = req.query.code as string

  if (!code) {
    res.status(400).send('Authorization code is missing.')
    return
  }

  try {
    const tokenResponse = await fetch(
      'https://accounts.spotify.com/api/token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(
            `${spotifyClientId}:${spotifyClientSecret}`
          ).toString('base64')}`,
        },
        body: querystring.stringify({
          grant_type: 'authorization_code',
          code,
          redirect_uri: redirectUri,
        }),
      }
    )

    const tokenData: {
      access_token?: string
      refresh_token?: string
    } = (await tokenResponse.json()) as {
      access_token?: string
      refresh_token?: string
    }

    const { access_token: accessToken, refresh_token: refreshToken } = tokenData

    if (!accessToken || !refreshToken) {
      res.status(400).send('Failed to obtain access token and refresh token.')
      return
    }

    // Store the tokens
    userTokens['currentUser'] = {
      access_token: accessToken,
      refresh_token: refreshToken,
    }

    res.redirect(
      `http://localhost:3000?access_token=${accessToken}&refresh_token=${refreshToken}`
    )
  } catch (error) {
    console.error('Error during token exchange:', error)
    res
      .status(500)
      .send('Failed to exchange authorization code for access token.')
  }
})

app.get('/auth/token', (req, res) => {
  const currentUserTokens = userTokens['currentUser']

  if (currentUserTokens) {
    res.json({
      access_token: currentUserTokens.access_token,
    })
  } else {
    res.status(404).send('No access token found for the current user.')
  }
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
