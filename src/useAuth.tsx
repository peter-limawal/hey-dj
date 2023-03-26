import React, { useState, useEffect } from 'react'
import axios from 'axios'

const useAuth = (code: string) => {
  const [accessToken, setAccessToken] = useState(null)
  const [refreshToken, setRefreshToken] = useState(null)
  const [expiresIn, setExpiresIn] = useState(null)

  useEffect(() => {
    axios.post('/auth/callback', { code }).then((response) => {
      console.log(response.data)
    })
  }, [code])
}

export default useAuth
