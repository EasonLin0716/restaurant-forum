const express = require('express')
const handlebars = require('express-handlebars')
const app = express()
const port = 3000

app.engine('handlebars', handlebars())
app.set('view engine', 'handlebars')

app.get('/', (req, res) => {
  res.send('index')
})

app.listen(port, () => {
  console.log(`app is running at ${port}`)
})