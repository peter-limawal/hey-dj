import React, { useState, useEffect } from 'react'
import WebPlayback from './WebPlayback'
import Login from './Login'
import InputBox from './InputBox'
import './App.css'

function App() {
  const [token, setToken] = useState('')

  useEffect(() => {
    async function getToken() {
      const getAccessTokenFromUrl = () => {
        const queryString = window.location.search
        const urlParams = new URLSearchParams(queryString)
        return urlParams.get('access_token')
      }

      const accessTokenFromUrl = getAccessTokenFromUrl()
      if (accessTokenFromUrl) {
        console.log('Access token found in URL:', accessTokenFromUrl)
        setToken(accessTokenFromUrl)
        localStorage.setItem('access_token', accessTokenFromUrl)

        // Remove the access token from the URL
        const cleanUrl = window.location.href.split('?')[0]
        window.history.replaceState({}, document.title, cleanUrl)
      } else {
        const accessTokenFromLocalStorage = localStorage.getItem('access_token')
        if (accessTokenFromLocalStorage) {
          console.log(
            'Access token found in localStorage:',
            accessTokenFromLocalStorage
          )
          setToken(accessTokenFromLocalStorage)
        } else {
          console.log('Access token not found')
        }
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
