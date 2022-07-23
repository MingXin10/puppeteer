require('dotenv').config()
const express = require('express')
const cors = require('cors')
const app = express()
const bodyParser = require('body-parser')
app.use(cors())
app.use(express.text())
app.use(bodyParser.json({ limit: '50mb', type: 'application/json' }))
app.use('/puppeteer', require('./routes/puppeteer'))

const port = process.env.PORT || 3010
app.listen(port, () => {
  console.log(new Date().toLocaleString())
  console.log(`App running on port ${port}...😊 `)
})
