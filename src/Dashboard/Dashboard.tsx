import React, { useState } from 'react'
import axios from 'axios'
import InputBox from '../InputBox'
import SpotifyWebPlayback from 'react-spotify-web-playback'

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
      <h1>Dashboard</h1>
      {accessToken && (
        <SpotifyWebPlayback
          token={accessToken}
          uris={trackURIs}
          autoPlay={true}
          play={trackURIs.length > 0}
        />
      )}
      <InputBox onInputSubmit={handleInputSubmit} />
      <div className="song-list">
        {songs.map((song, index) => (
          <p key={index}>{song}</p>
        ))}
      </div>
      <p>accessToken: {accessToken ? accessToken : 'Not available'}</p>
      <p>refreshToken: {refreshToken ? refreshToken : 'Not available'}</p>
      <p>expiresIn: {expiresIn ? expiresIn : 'Not available'}</p>
    </div>
  )
}

export default Dashboard
