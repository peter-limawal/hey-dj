import React, { useState } from 'react'
import Login from './Login'
import './App.css'

const authorizeSpotify = async () => {
  console.log('Authorize Spotify')
  return true
}

const playSong = (songURI: string) => {
  console.log('Play song:', songURI)
}

function App() {
  const [input, setInput] = useState('')
  const [songs, setSongs] = useState<string[]>([])
  const [loggedIn, setLoggedIn] = useState(false)

  const handleSubmit = async () => {
    const response = await fetch('http://localhost:3001/input', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ input }),
    })

    const data = await response.json()
    console.log(data)
    setSongs(data.songs)
  }

  const login = async () => {
    let loginSuccessful = false
    const success = await authorizeSpotify()
    if (success) {
      loginSuccessful = true
    }
    setLoggedIn(loginSuccessful)
  }

  const renderLoginLayer = () => <Login />

  const renderAppLayer = () => (
    <div className="app-layer">
      <input
        type="text"
        placeholder="Type your song request here"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button onClick={handleSubmit}>Submit</button>
      {songs.length > 0 && (
        <div className="songs">
          <h2>Suggested Songs:</h2>
          <ul>
            {songs.map((song: string, index: number) => (
              <li key={index}>{song}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )

  return (
    <div className="container">
      {loggedIn ? renderAppLayer() : renderLoginLayer()}
    </div>
  )
}

export default App
