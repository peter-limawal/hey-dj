import React, { useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Dashboard from './Dashboard'
import useAuth from './useAuth'
import Login from './Login'
import './App.css'

const App: React.FC<{}> = () => {
  const { accessToken, refreshToken, expiresIn } = useAuth()

  return (
    <BrowserRouter>
      <div className="container">
        <h1>Hey DJ</h1>
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
