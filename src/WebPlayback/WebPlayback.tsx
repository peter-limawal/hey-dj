import React, { useState, useEffect } from 'react'

interface WebPlaybackProps {
  token: string
}

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void
    Spotify: any
  }
}

function WebPlayback(props: WebPlaybackProps) {
  const [player, setPlayer] = useState<any>()

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://sdk.scdn.co/spotify-player.js'
    script.async = true

    document.body.appendChild(script)

    window.onSpotifyWebPlaybackSDKReady = () => {
      const playerInstance = new (window as any).Spotify.Player({
        name: 'Web Playback SDK',
        getOAuthToken: (cb: (token: string) => void) => {
          cb(props.token)
        },
        volume: 0.5,
      })

      setPlayer(playerInstance)

      playerInstance.addListener(
        'ready',
        ({ device_id }: { device_id: string }) => {
          console.log('Ready with Device ID', device_id)
        }
      )

      playerInstance.addListener(
        'not_ready',
        ({ device_id }: { device_id: string }) => {
          console.log('Device ID has gone offline', device_id)
        }
      )

      playerInstance.connect()
    }
  }, [props.token])

  return (
    <>
      <div className="container">
        <div className="main-wrapper"></div>
      </div>
    </>
  )
}

export default WebPlayback
