import express from 'express'

const app = express()
const port = process.env.PORT || 3001

app.get('/', (req, res) => {
  res.send('Hello from the backend server!')
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
