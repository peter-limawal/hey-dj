import React, { useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Dashboard from './Dashboard'
import useAuth from './useAuth'
import Login from './Login'
import './App.css'
import bartGif from './assets/bart.gif'

const App: React.FC<{}> = () => {
  const { accessToken, refreshToken, expiresIn } = useAuth()

  return (
    <BrowserRouter>
      <header className="app-header">
        <h2>Hey DJ</h2>
      </header>
      <div className="container">
        <img className="bart-gif" src={bartGif} alt="bart" />
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
