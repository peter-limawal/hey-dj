import React from 'react'

const Login: React.FC<{}> = () => {
  return (
    <div className="App">
      <header className="App-header">
        {/* Redirect to the server-side auth login route */}
        <a className="btn-spotify" href="/auth/login">
          Login with Spotify
        </a>
      </header>
    </div>
  )
}

export default Login
