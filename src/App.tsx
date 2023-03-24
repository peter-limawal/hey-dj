import React, { useState, useEffect } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import axios from 'axios'
import AuthCallback from './AuthCallback'
import WebPlayback from './WebPlayback'
import AppLayer from './AppLayer'
import Login from './Login'
import './App.css'

const App: React.FC<{}> = () => {
  const [input, setInput] = useState('')
  const [songs, setSongs] = useState<string[]>([])
  const [token, setToken] = useState('')

  useEffect(() => {
    // Fetch access token from the backend
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
          // Save the access token in local storage
          localStorage.setItem('access_token', json.access_token)
        } else {
          console.error('Failed to fetch the access token.')
        }
      } catch (error) {
        console.error('Error fetching the access token:', error)
      }
    }

    getToken()
  }, [])

  // Handle form submission
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
        <Routes>
          <Route
            path="/"
            element={token === '' ? <Login /> : <WebPlayback token={token} />}
          />
          <Route path="/auth/callback" element={<AuthCallback />} />
        </Routes>
        <AppLayer
          input={input}
          setInput={setInput}
          songs={songs}
          handleSubmit={handleSubmit}
        />
      </div>
    </BrowserRouter>
  )
}

export default App
