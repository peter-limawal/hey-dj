import React, { useState, useEffect } from 'react'
import WebPlayback from './WebPlayback'
import Login from './Login'
import './App.css'
import axios from 'axios'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AuthCallback from './AuthCallback'

const App: React.FC<{}> = () => {
  // const [input, setInput] = useState('')
  // const [songs, setSongs] = useState<string[]>([])
  // const [loggedIn, setLoggedIn] = useState(false)

  const [token, setToken] = useState('')

  useEffect(() => {
    async function getToken() {
      try {
        const response = await axios.get('http://localhost:5000/auth/token', {
          withCredentials: true,
        })
        const json = response.data
        console.log(response)
        console.log(json.access_token)
        if (json.access_token) {
          setToken(json.access_token)
        } else {
          console.error('Failed to fetch the access token.')
        }
      } catch (error) {
        console.error('Error fetching the access token:', error)
      }
    }

    getToken()
  }, [])

  // const handleSubmit = async () => {
  //   const response = await fetch('http://localhost:5000/input', {
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
    <BrowserRouter>
      <div className="container">
        <Routes>
          <Route
            path="/"
            element={token === '' ? <Login /> : <WebPlayback token={token} />}
          />
          <Route path="/auth/callback" element={<AuthCallback />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
