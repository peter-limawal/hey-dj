import express from 'express'
import cors from 'cors'

const app = express()
const port = process.env.PORT || 3001

// Add these two lines to enable CORS and parse JSON request bodies
app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.send('Hello from the backend server!')
})

// Add this new route to handle the input
app.post('/input', (req, res) => {
  console.log('Received input:', req.body.input)
  res.send({ message: 'Input received' })
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
