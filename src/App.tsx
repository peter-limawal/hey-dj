import React, { useState, useEffect } from 'react'
import {
  BrowserRouter,
  Route,
  Routes,
  useNavigate,
  NavigateFunction,
} from 'react-router-dom'
import WebPlayback from './WebPlayback'
import AppLayer from './AppLayer'
import Login from './Login'
import './App.css'
import axios from 'axios'

const App: React.FC<{}> = () => {
  const [input, setInput] = useState('')
  const [songs, setSongs] = useState<string[]>([])
  const [token, setToken] = useState('')

  useEffect(() => {
    async function getToken() {
      await axios
        .get('/auth/token')
        .then((response) => {
          const json = response.data
          setToken(json.access_token)
        })
        .catch((error) => {
          console.error('Error fetching access token:', error)
        })
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
