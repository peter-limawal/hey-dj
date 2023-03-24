import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const AuthCallback: React.FC<{}> = () => {
  const navigate = useNavigate()

  useEffect(() => {
    async function exchangeCodeForToken() {
      // Extract the code and state from the URL query string
      const urlParams = new URLSearchParams(window.location.search)
      const code = urlParams.get('code')
      const state = urlParams.get('state')

      if (code) {
        try {
          // Exchange the authorization code for an access token
          await axios.get('http://localhost:5000/auth/callback', {
            params: { code, state },
            withCredentials: true,
          })

          // Redirect to the main page
          navigate('/')
        } catch (error) {
          console.error('Error exchanging code for token:', error)
        }
      } else {
        console.error('Authorization code not found in URL')
      }
    }

    exchangeCodeForToken()
  }, [navigate])

  return <div>Authenticating...</div>
}

export default AuthCallback
