import React, { useEffect } from 'react'
import { useHistory } from 'react-router-dom'

interface AuthCallbackProps {
  onTokenReceived: (token: string) => void
}

const AuthCallback: React.FC<AuthCallbackProps> = ({ onTokenReceived }) => {
  const history = useHistory()

  useEffect(() => {
    async function fetchToken() {
      const response = await fetch(window.location.href)

      if (response.ok) {
        const json = await response.json()
        const accessToken = json.access_token
        onTokenReceived(accessToken)
        history.push('/')
      } else {
        console.error(
          'Error fetching access token:',
          response.status,
          response.statusText
        )
      }
    }

    fetchToken()
  }, [history, onTokenReceived])

  return <div>Processing authentication...</div>
}

export default AuthCallback
