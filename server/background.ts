import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import session from 'express-session'
import SpotifyWebApi from 'spotify-web-api-node'
import { OpenAI } from 'openai'

dotenv.config({ path: '../.env' })

const app = express().disable('x-powered-by')
const port = process.env.PORT || 5000

// Generate a random string based on a number
const generateRandomString = function (length: number): string {
  let text = ''
  const possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return text
}

// Initialize OpenAI API and Spotify credentials
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})
const spotifyClientID = process.env.SPOTIFY_CLIENT_ID as string
const spotifyClientSecret = process.env.SPOTIFY_CLIENT_SECRET as string
const redirectURI = process.env.REDIRECT_URI as string

// Initialize Spotify API
const spotifyApi = new SpotifyWebApi({
  clientId: spotifyClientID,
  clientSecret: spotifyClientSecret,
  redirectUri: redirectURI,
})

// Set up express middleware
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
)

// Set up express-session middleware
const sessionSecret = generateRandomString(64)
app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 3600000, // 1 hour in milliseconds
    },
  })
)

app.use(express.json())

// Augment express-session with a custom SessionData object
declare module 'express-session' {
  interface SessionData {
    accessToken: string
    refreshToken: string
    expiresIn: number
  }
}

app.get('/', (req, res) => {
  res.send('Hello from the backend server!')
})

// Handle Spotify authentication
app.get('/auth/login', (req, res) => {
  const scopes = [
    'streaming',
    'user-read-email',
    'user-read-private',
    'app-remote-control',
    'user-read-playback-state',
    'user-modify-playback-state',
  ]
  const state = generateRandomString(16)
  res.redirect(spotifyApi.createAuthorizeURL(scopes, state))
  console.log('Redirecting to Spotify')
})

app.get('/auth/callback', async (req, res) => {
  const code = req.query.code as string
  spotifyApi
    .authorizationCodeGrant(code)
    .then((data: any) => {
      // Save the tokens and expiration time in the session
      req.session.accessToken = data.body.access_token
      req.session.refreshToken = data.body.refresh_token
      req.session.expiresIn = data.body.expires_in

      res.redirect('/')
    })
    .catch((error) => {
      console.error('Error in /auth/callback', error)
      res.status(500).send('Internal Server Error')
    })
})

app.get('/auth/token', (req, res) => {
  if (
    req.session.accessToken &&
    req.session.refreshToken &&
    req.session.expiresIn
  ) {
    res.json({
      accessToken: req.session.accessToken,
      refreshToken: req.session.refreshToken,
      expiresIn: req.session.expiresIn,
    })
  } else {
    res.status(401).json({ error: 'Not authenticated' })
  }
})

app.post('/auth/refresh', async (req, res) => {
  const refreshToken = req.body.refreshToken as string

  if (!refreshToken) {
    res.status(400).json({ error: 'Refresh token is missing' })
    return
  }

  spotifyApi.setRefreshToken(refreshToken)

  spotifyApi
    .refreshAccessToken()
    .then((data) => {
      const accessToken = data.body.access_token
      const expiresIn = data.body.expires_in
      const newRefreshToken = data.body.refresh_token

      req.session.accessToken = accessToken
      req.session.expiresIn = expiresIn
      // Update the refresh token if a new one is provided
      if (newRefreshToken) {
        req.session.refreshToken = newRefreshToken
      }
      res.json({
        accessToken,
        refreshToken: newRefreshToken || refreshToken,
        expiresIn,
      })
    })
    .catch((error) => {
      console.error('Error in /auth/refresh', error)
      res.status(500).send('Internal Server Error')
    })
})

async function getSongListFromGPT(input: string): Promise<string[]> {
  console.log('getSongListFromGPT called with input:', input)

  try {
    const gptResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are an AI that can suggest a list of songs based on user input. Consistently generate a list of 10 songs following the "Song Name - Artist" format. Do not include any additional text, numbering, or variations in the output. Provide the list of songs in the exact format requested:

          List 10 songs below:
          
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
    console.log('GPT API response:', gptResponse)

    const songsText = gptResponse.choices[0].message?.content || ''
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
  const accessToken = req.body.accessToken
  const songs = await getSongListFromGPT(input)
  const trackURIs = await searchTracks(accessToken, songs.slice(1)) // Exclude the first item
  res.send({ songs, trackURIs })
})

function parseTrackInfo(
  track: string
): { title: string; artist: string } | null {
  const match = track.match(/^\d+\.?\s?(.+)\s-\s(.+)$/)

  if (match && match.length === 3) {
    const title = match[1].trim()
    const artist = match[2].trim()
    return { title, artist }
  }

  return null
}

async function searchTracks(
  accessToken: string,
  tracks: string[]
): Promise<string[]> {
  spotifyApi.setAccessToken(accessToken)

  const trackURIs: string[] = []

  for (const track of tracks) {
    const trackInfo = parseTrackInfo(track)

    if (trackInfo) {
      const { title, artist } = trackInfo
      const searchQuery = `track:${title} artist:${artist}`

      try {
        console.log(searchQuery)
        const result = await spotifyApi.searchTracks(searchQuery, { limit: 1 })
        const trackItem = result.body.tracks?.items[0]

        if (trackItem) {
          trackURIs.push(trackItem.uri)
        }
      } catch (error) {
        console.error(`Error searching for track "${searchQuery}":`, error)
      }
    }
  }

  return trackURIs
}

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
