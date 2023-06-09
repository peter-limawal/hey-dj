import React, { useState } from 'react'
import './InputBox.css'

interface InputBoxProps {
  onInputSubmit: (input: string) => void
}

const InputBox: React.FC<InputBoxProps> = ({ onInputSubmit }) => {
  const [input, setInput] = useState('')

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    onInputSubmit(input)
    setInput('')
  }

  return (
    <form onSubmit={handleSubmit} className="input-form">
      <label htmlFor="input-box" className="input-label">
        Tell me what you want to listen to:
      </label>
      <input
        id="input-box"
        type="text"
        value={input}
        onChange={(event) => setInput(event.target.value)}
        className="input-field"
        placeholder="Try: I'm feeling happy!"
      />
      <button type="submit" className="submit-button">
        Submit
      </button>
    </form>
  )
}

export default InputBox
