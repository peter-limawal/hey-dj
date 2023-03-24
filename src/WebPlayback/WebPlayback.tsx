import React, { useEffect, useRef } from 'react'

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

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://sdk.scdn.co/spotify-player.js'
    script.async = true
    document.body.appendChild(script)

    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new Spotify.Player({
        name: 'Web Playback SDK Quick Start Player',
        getOAuthToken: (cb) => {
          cb(token)
        },
        volume: 0.5,
      })

      playerRef.current = player

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

      player.connect()
    }

    return () => {
      document.body.removeChild(script)
      if (playerRef.current) {
        playerRef.current.disconnect()
      }
    }
  }, [])

  const togglePlay = () => {
    if (playerRef.current) {
      playerRef.current.togglePlay()
    }
  }

  return <button onClick={togglePlay}>Toggle Play</button>
}

export default WebPlayback
