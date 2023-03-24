import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import { Configuration, OpenAIApi } from 'openai'
import dotenv from 'dotenv'
import axios from 'axios'
import cookieParser from 'cookie-parser'
import { URLSearchParams } from 'url'
import querystring from 'querystring'

dotenv.config()

const app = express()
const port = process.env.PORT || 5000

// Initialize OpenAI API and Spotify credentials
const openai = new OpenAIApi(
  new Configuration({ apiKey: process.env.OPENAI_API_KEY })
)
const spotify_client_id = process.env.SPOTIFY_CLIENT_ID as string
const spotify_client_secret = process.env.SPOTIFY_CLIENT_SECRET as string
const redirect_uri = process.env.REDIRECT_URI as string

// Set up express middleware
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
)
app.use(express.json())
app.use(cookieParser())

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
    'streaming user-read-email user-read-private user-read-playback-state user-modify-playback-state'
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
        const expires_in = response.data.expires_in

        res.cookie('access_token', access_token, {
          maxAge: expires_in * 1000,
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
        })

        res.redirect('http://localhost:5173/')
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

// Refresh the access token if it has expired
const refreshTokenIfExpired = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const stored_access_token = req.cookies.access_token || null
  const stored_refresh_token = req.cookies.refresh_token || null
  const stored_expiration_time = req.cookies.expires_at || 0

  if (
    stored_access_token &&
    stored_refresh_token &&
    stored_expiration_time &&
    Date.now() > stored_expiration_time
  ) {
    const refresh_token = stored_refresh_token
    const auth_options = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        grant_type: 'refresh_token',
        refresh_token: refresh_token,
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

    try {
      const response = await axios.post(
        auth_options.url,
        new URLSearchParams(auth_options.form),
        {
          headers: auth_options.headers,
        }
      )

      if (response.status === 200) {
        const new_access_token = response.data.access_token
        const new_expiration_time = Date.now() + response.data.expires_in * 1000

        res.cookie('access_token', new_access_token)
        res.cookie('expires_at', new_expiration_time)
        req.cookies.access_token = new_access_token
        req.cookies.expires_at = new_expiration_time
      } else {
        console.error(
          'Error in refreshTokenIfExpired',
          response.status,
          response.statusText
        )
      }
    } catch (error) {
      console.error('Error in refreshTokenIfExpired', error)
    }
  }

  next()
}

// Return the access token
app.get('/auth/token', refreshTokenIfExpired, (req, res) => {
  const stored_access_token = req.cookies.access_token || null
  res.json({
    access_token: stored_access_token,
  })
})

// Handle song input and return the song list
app.post('/input', refreshTokenIfExpired, async (req, res) => {
  const input = req.body.input
  const songs = await getSongListFromGPT(input)
  res.send({ songs })
})

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
