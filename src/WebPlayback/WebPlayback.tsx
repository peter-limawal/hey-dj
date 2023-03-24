import React, { useEffect, useRef, useState } from 'react'

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void
  }
}

interface WebPlaybackProps {
  token: string
}

const WebPlayback: React.FC<WebPlaybackProps> = ({ token }) => {
  const playerRef = useRef<Spotify.Player | null>(null)
  const [sdkReady, setSdkReady] = useState(false)

  useEffect(() => {
    if (!sdkReady) {
      // Create a script tag and load the Spotify Web Playback SDK
      const script = document.createElement('script')
      script.src = 'https://sdk.scdn.co/spotify-player.js'
      script.async = true
      document.body.appendChild(script)

      // Initialize the Spotify Web Playback SDK when it's ready
      window.onSpotifyWebPlaybackSDKReady = () => {
        setSdkReady(true)

        const player = new Spotify.Player({
          name: 'Web Playback SDK Quick Start Player',
          getOAuthToken: (cb) => {
            cb(token)
          },
          volume: 0.5,
        })

        playerRef.current = player

        // Add listeners to handle various events
        player.addListener('ready', ({ device_id }) => {
          console.log('Ready with Device ID', device_id)
        })

        player.addListener('not_ready', ({ device_id }) => {
          console.log('Device ID has gone offline', device_id)
        })

        player.addListener('initialization_error', ({ message }) => {
          console.error(message)
        })

        player.addListener('authentication_error', ({ message }) => {
          console.error(message)
        })

        player.addListener('account_error', ({ message }) => {
          console.error(message)
        })

        // Connect the player to Spotify
        player.connect()
      }

      // Clean up on unmount
      return () => {
        document.body.removeChild(script)
        if (playerRef.current) {
          playerRef.current.disconnect()
        }
      }
    }
  }, [sdkReady, token])

  // Toggle playback when the button is clicked
  const togglePlay = () => {
    if (playerRef.current) {
      playerRef.current.togglePlay()
    }
  }

  return <button onClick={togglePlay}>Toggle Play</button>
}

export default WebPlayback
