import React from 'react'

interface DashboardProps {
  accessToken: string | null
  refreshToken: string | null
  expiresIn: number | null
}

const Dashboard: React.FC<DashboardProps> = ({
  accessToken,
  refreshToken,
  expiresIn,
}) => {
  return (
    <div>
      <h1>Dashboard</h1>
      <p>accessToken: {accessToken ? accessToken : 'Not available'}</p>
      <p>refreshToken: {refreshToken ? refreshToken : 'Not available'}</p>
      <p>expiresIn: {expiresIn ? expiresIn : 'Not available'}</p>
    </div>
  )
}

export default Dashboard
