import React, { useState, useEffect } from 'react'

type Props = {
  token: string
}

const WebPlayback: React.FC<Props> = (props) => {
  const [player, setPlayer] = useState(undefined)

  return (
    <>
      <div className="container">
        <div className="main-wrapper"></div>
      </div>
    </>
  )
}

export default WebPlayback
