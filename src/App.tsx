import React, { useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Dashboard from './Dashboard'
import useAuth from './useAuth'
import Login from './Login'
import './App.css'

const App: React.FC<{}> = () => {
  const [input, setInput] = useState('')
  const [songs, setSongs] = useState<string[]>([])

  const { accessToken, refreshToken, expiresIn } = useAuth()

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
          <Route
            path="/"
            element={
              !accessToken ? (
                <Login />
              ) : (
                <Dashboard
                  accessToken={accessToken}
                  refreshToken={refreshToken}
                  expiresIn={expiresIn}
                />
              )
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
