import React, { useEffect, useState } from 'react'
import { IconButton } from '@mui/material'
import SkipPreviousRoundedIcon from '@mui/icons-material/SkipPreviousRounded'
import PlayCircleRoundedIcon from '@mui/icons-material/PlayCircleRounded'
import PauseCircleRoundedIcon from '@mui/icons-material/PauseCircleRounded'
import SkipNextRoundedIcon from '@mui/icons-material/SkipNextRounded'
import './WebPlayback.css'

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void
  }
}

interface WebPlaybackProps {
  token: string
}

const track = {
  name: '',
  album: {
    images: [{ url: '' }],
  },
  artists: [{ name: '' }],
}

const WebPlayback: React.FC<WebPlaybackProps> = ({ token }) => {
  const [player, setPlayer] = useState<Spotify.Player | undefined>(undefined)
  const [is_paused, setPaused] = useState(false)
  const [is_active, setActive] = useState(false)
  const [current_track, setTrack] = useState(track)

  useEffect(() => {
    // Create a script tag and load the Spotify Web Playback SDK
    const script = document.createElement('script')
    script.src = 'https://sdk.scdn.co/spotify-player.js'
    script.async = true
    document.body.appendChild(script)

    // Initialize the Spotify Web Playback SDK when it's ready
    window.onSpotifyWebPlaybackSDKReady = () => {
      const newPlayer = new Spotify.Player({
        name: 'Web Playback SDK',
        getOAuthToken: (cb) => {
          cb(token)
        },
        volume: 1,
      })

      // Connect the player to Spotify
      newPlayer.connect().then((connected) => {
        if (connected) {
          setPlayer(newPlayer)
        }
      })
    }
  }, [])

  useEffect(() => {
    if (!player) return

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

    player.addListener('player_state_changed', (state) => {
      if (!state) {
        return
      }

      setTrack(state.track_window.current_track)
      setPaused(state.paused)

      player.getCurrentState().then((state) => {
        !state ? setActive(false) : setActive(true)
      })
    })
  }, [player])

  if (!is_active) {
    return (
      <>
        <div className="container">
          <div className="main-wrapper">
            <b>
              Instance not active. Transfer your playback using your Spotify app
            </b>
          </div>
        </div>
      </>
    )
  } else {
    return (
      <>
        <div className="container">
          <div className="main-wrapper">
            <img
              src={current_track.album.images[0].url}
              className="now-playing__cover"
              alt=""
            />
            <div className="now-playing__side">
              <div className="now-playing__name">{current_track.name}</div>
              <div className="now-playing__artist">
                {current_track.artists[0].name}
              </div>
            </div>
          </div>
          <div>
            <IconButton
              className="btn-spotify"
              onClick={() => {
                console.log('Previous track button clicked')
                player?.previousTrack().catch((error) => {
                  console.error('Error in previousTrack:', error)
                })
              }}
            >
              <SkipPreviousRoundedIcon />
            </IconButton>
            <IconButton
              className="btn-spotify"
              onClick={() => {
                console.log('Toggle play button clicked')
                player?.togglePlay().catch((error) => {
                  console.error('Error in togglePlay:', error)
                })
              }}
              color="primary"
            >
              {is_paused ? (
                <PlayCircleRoundedIcon />
              ) : (
                <PauseCircleRoundedIcon />
              )}
            </IconButton>
            <IconButton
              className="btn-spotify"
              onClick={() => {
                console.log('Next track button clicked')
                player?.nextTrack().catch((error) => {
                  console.error('Error in nextTrack:', error)
                })
              }}
            >
              <SkipNextRoundedIcon />
            </IconButton>
          </div>
        </div>
      </>
    )
  }
}

export default WebPlayback
