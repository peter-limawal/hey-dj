import React from 'react'

interface AppLayerProps {
  input: string
  setInput: (value: string) => void
  songs: string[]
  handleSubmit: () => void
}

const AppLayer: React.FC<AppLayerProps> = ({
  input,
  setInput,
  songs,
  handleSubmit,
}) => {
  return (
    <div className="app-layer">
      <input
        type="text"
        placeholder="Type your song request here"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button onClick={handleSubmit}>Submit</button>
      {songs.length > 0 && (
        <div className="songs">
          <h2>Suggested Songs:</h2>
          <ul>
            {songs.map((song: string, index: number) => (
              <li key={index}>{song}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default AppLayer
