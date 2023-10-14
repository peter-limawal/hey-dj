import { useState, useEffect } from 'react'
import axios from 'axios'

const useAuth = () => {
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState<string | null>(null)
  const [expiresIn, setExpiresIn] = useState<number | null>(null)

  useEffect(() => {
    axios
      .get('/auth/token')
      .then((response) => {
        console.log(response.data)
        setAccessToken(response.data.accessToken)
        setRefreshToken(response.data.refreshToken)
        setExpiresIn(response.data.expiresIn)
      })
      .catch((error) => {
        console.error('Error in the useAuth hook:', error)
      })
  }, [])

  useEffect(() => {
    if (!refreshToken || !expiresIn) return

    const interval = setInterval(() => {
      axios
        .post('/auth/refresh', { refreshToken })
        .then((response) => {
          console.log(response.data)
          setAccessToken(response.data.accessToken)
          setRefreshToken(response.data.refreshToken)
          setExpiresIn(response.data.expiresIn)
        })
        .catch((error) => {
          console.error('Error refreshing access token:', error)
        })
    }, (expiresIn - 60) * 1000) // Refresh the token 1 minute before it expires

    return () => clearInterval(interval)
  }, [refreshToken, expiresIn])

  return { accessToken, refreshToken, expiresIn }
}

export default useAuth
