import React, { useState, useEffect } from 'react'
import WebPlayback from './WebPlayback'
import Login from './Login'
import './App.css'

const App: React.FC<{}> = () => {
  // const [input, setInput] = useState('')
  // const [songs, setSongs] = useState<string[]>([])
  // const [loggedIn, setLoggedIn] = useState(false)

  const [token, setToken] = useState('')

  useEffect(() => {
    async function getToken() {
      const response = await fetch('http://localhost:5000/auth/token')
      const json = await response.json()
      if (json.access_token) {
        setToken(json.access_token)
      } else {
        console.error('Failed to fetch the access token.')
      }
    }

    getToken()
  }, [])

  // const handleSubmit = async () => {
  //   const response = await fetch('http://localhost:3001/input', {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({ input }),
  //   })

  //   const data = await response.json()
  //   console.log(data)
  //   setSongs(data.songs)
  // }

  // const renderAppLayer = () => (
  //   <div className="app-layer">
  //     <input
  //       type="text"
  //       placeholder="Type your song request here"
  //       value={input}
  //       onChange={(e) => setInput(e.target.value)}
  //     />
  //     <button onClick={handleSubmit}>Submit</button>
  //     {songs.length > 0 && (
  //       <div className="songs">
  //         <h2>Suggested Songs:</h2>
  //         <ul>
  //           {songs.map((song: string, index: number) => (
  //             <li key={index}>{song}</li>
  //           ))}
  //         </ul>
  //       </div>
  //     )}
  //   </div>
  // )

  return (
    <div className="container">
      {token === '' ? <Login /> : <WebPlayback token={token} />}
      {/* {token && renderAppLayer()} */}
    </div>
  )
}

export default App
