import express, { Request, Response } from 'express'
import cors from 'cors'
import { Configuration, OpenAIApi } from 'openai'
import dotenv from 'dotenv'
import axios from 'axios'
import { URLSearchParams } from 'url'

dotenv.config()

const app = express()
const port = process.env.PORT || 5000

// Initialize OpenAI API and Spotify credentials
const openai = new OpenAIApi(
  new Configuration({ apiKey: process.env.OPENAI_API_KEY })
)
const spotifyClientID = process.env.SPOTIFY_CLIENT_ID as string
const spotifyClientSecret = process.env.SPOTIFY_CLIENT_SECRET as string
const redirectURI = process.env.REDIRECT_URI as string

// In-memory storage for tokens
var accessToken = ''

// Set up express middleware
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
)
app.use(express.json())

app.get('/', (req, res) => {
  res.send('Hello from the backend server!')
})

// Generate a random string for the state parameter
const generateRandomString = function (length: number): string {
  let text = ''
  const possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return text
}

// Handle Spotify authentication
app.get('/auth/login', (req, res) => {
  const scope =
    'streaming user-read-email user-read-private app-remote-control user-read-playback-state user-modify-playback-state'
  const state = generateRandomString(16)
  const auth_query_parameters = new URLSearchParams({
    response_type: 'code',
    client_id: spotifyClientID,
    scope: scope,
    redirect_uri: redirectURI,
    state: state,
  })

  res.redirect(
    'https://accounts.spotify.com/authorize/?' +
      auth_query_parameters.toString()
  )
})

app.get('/auth/callback', async (req, res) => {
  const code = req.query.code as string
  const authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      code: code,
      redirect_uri: redirectURI,
      grant_type: 'authorization_code',
    },
    headers: {
      Authorization:
        'Basic ' +
        Buffer.from(spotifyClientID + ':' + spotifyClientSecret).toString(
          'base64'
        ),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    json: true,
  }

  axios
    .post(authOptions.url, new URLSearchParams(authOptions.form), {
      headers: authOptions.headers,
    })
    .then((response) => {
      if (response.status === 200) {
        accessToken = response.data.access_token

        // Redirect to the frontend
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

// Get a song list from GPT
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

// Return the access token
app.get('/auth/token', (req, res) => {
  res.json({
    access_token: accessToken,
  })
})

// Handle song input and return the song list
app.post('/input', async (req, res) => {
  const input = req.body.input
  const songs = await getSongListFromGPT(input)
  res.send({ songs })
})

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
