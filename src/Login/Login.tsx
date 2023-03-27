import React from 'react'
import './Login.css'

const Login: React.FC<{}> = () => {
  return (
    <div className="login-container">
      <h1>Hey DJ</h1>
      <p>
        Hey DJ is a web app that generates a playlist based on your mood or
        preferences. Simply login with your Spotify account, and then describe
        your desired music. Our AI will generate a playlist for you to enjoy!
      </p>
      {/* Redirect to the server-side auth login route */}
      <a className="btn-spotify" href="/auth/login">
        Login with Spotify
      </a>
    </div>
  )
}

export default Login
