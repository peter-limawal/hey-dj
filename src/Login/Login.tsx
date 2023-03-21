import React from 'react'
import './Login.css'

function Login() {
  return (
    <div className="App">
      <header className="App-header">
        <a className="login-button" href="http://localhost:5000/auth/login">
          Login with Spotify
        </a>
      </header>
    </div>
  )
}

export default Login
