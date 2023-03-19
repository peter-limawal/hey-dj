import React, { useState } from 'react'
import './App.css'

function App() {
  const [input, setInput] = useState('')
  const [songs, setSongs] = useState<string[]>([])

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

  return (
    <div className="container">
      <h1>Hey DJ</h1>
      <input
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
      )}
    </div>
  )
}

export default App
