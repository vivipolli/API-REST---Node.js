const express = require('express')
const morgan = require('morgan')
const moment = require('moment');


const app = express()

app.use(morgan('tiny'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(require('./routes/index.routes'))

app.get('/', (req, res) => {
    res.json({ message: 'Hello world' })
})
app.listen('5000', () => {
  console.log('app is running');
});
