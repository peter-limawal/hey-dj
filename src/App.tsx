import React, { useState, useEffect } from 'react'
import WebPlayback from './WebPlayback'
import Login from './Login'
import InputBox from './InputBox'
import './App.css'

function App() {
  const [token, setToken] = useState('')

  useEffect(() => {
    async function getToken() {
      try {
        const response = await fetch('/auth/token')
        if (response.ok) {
          const json = await response.json()
          setToken(json.access_token)
          localStorage.setItem('access_token', json.access_token)
        } else {
          console.error(
            'Error fetching access token:',
            response.status,
            response.statusText
          )
          // Log the response text
          const responseText = await response.text()
          console.error('Response text:', responseText)
        }
      } catch (error) {
        console.error('Error fetching access token:', error)
      }
    }

    getToken()
  }, [])

  const handleInputSubmit = async (input: string) => {
    const response = await fetch('http://localhost:5000/input', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ input }),
    })

    const data = await response.json()
    console.log(data)
  }

  return (
    <>
      {token === '' ? (
        <Login />
      ) : (
        <>
          <InputBox onInputSubmit={handleInputSubmit} />
          <WebPlayback token={token} />
        </>
      )}
    </>
  )
}

export default App
