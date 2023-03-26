import React, { useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Login from './Login'
import './App.css'

function App() {
  const [input, setInput] = useState('')
  const [songs, setSongs] = useState<string[]>([])

  const [token, setToken] = useState('')

  const handleSubmit = async () => {
    const response = await fetch('http://localhost:5000/input', {
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

  return (
    <BrowserRouter>
      <div className="container">
        <h1>Hey DJ</h1>
        <Routes>
          <Route path="/" element={<Login />} />
          {/* <Route
            path="/"
            element={token === '' ? <Login /> : <WebPlayback token={token} />}
          /> */}
          {/* <Route path="/auth/callback" element={<AuthCallback />} /> */}
        </Routes>
        {/* <input
          type="text"
          placeholder="Type your song request here"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button onClick={handleSubmit}>Submit</button>
        {songs.length > 0 && (
          <div>
            <h2>Suggested Songs:</h2>
            <ul>
              {songs.map((song: string, index: number) => (
                <li key={index}>{song}</li>
              ))}
            </ul>
          </div>
        )} */}
      </div>
    </BrowserRouter>
  )
}

export default App
