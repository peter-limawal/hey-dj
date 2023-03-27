import React, { useState } from 'react'
import axios from 'axios'
import InputBox from '../InputBox'
import SpotifyWebPlayback from 'react-spotify-web-playback'
import { spotifyWebPlayerStyles } from './SpotifyWebPlayerStyles'
import './Dashboard.css'

interface DashboardProps {
  accessToken: string | null
  refreshToken: string | null
  expiresIn: number | null
}

const Dashboard: React.FC<DashboardProps> = ({
  accessToken,
  refreshToken,
  expiresIn,
}) => {
  const [songs, setSongs] = useState<string[]>([])
  const [trackURIs, setTrackURIs] = useState<string[]>([])

  const handleInputSubmit = (input: string) => {
    axios
      .post('/input', { input, accessToken })
      .then((response) => {
        console.log(response.data)
        setSongs(response.data.songs)
        setTrackURIs(response.data.trackURIs)
      })
      .catch((error) => {
        console.error('Error fetching songs:', error)
      })
  }

  return (
    <div>
      <div className="web-playback-wrapper">
        {accessToken && (
          <SpotifyWebPlayback
            token={accessToken}
            uris={trackURIs}
            autoPlay={true}
            play={trackURIs.length > 0}
            name="Hey DJ - AI Music Curator"
            styles={spotifyWebPlayerStyles}
          />
        )}
      </div>
      <InputBox onInputSubmit={handleInputSubmit} />
      <div className="song-list">
        {songs.map((song, index) => (
          <p key={index}>{song}</p>
        ))}
      </div>
    </div>
  )
}

export default Dashboard
