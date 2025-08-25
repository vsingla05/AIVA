import express from 'express'

const app = express()
const port = 6000

app.listen(port, ()=>console.log(`Server Started On Port: http://localhost:${port}`))
