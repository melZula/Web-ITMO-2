const express = require('express')
const fetch = require('node-fetch')
const path = require('path')
const app = express()
const port = 3000

const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database('./1/backend/database.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
  if (err) {
    console.error('ERROR: ' + err.message)
    this.db = null
  } else { console.log('Connected to the SQLite database') }
})

app.use(express.static(path.join(__dirname, './public')))

app.get('/weather/city', (req, res) => {
  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${req.query.q}&appid=31568c74ca98c06f4846aaf5ed73a884&units=metric`).then(async (resp) => {
    if (resp.ok) {
      res.send(await resp.json())
    } else {
      res.status(404)
    }
  })
})

app.get('/weather/coordinates', (req, res) => {
  fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${req.query.lat}&lon=${req.query.lon}&appid=31568c74ca98c06f4846aaf5ed73a884&units=metric`).then(async (resp) => {
    if (resp.ok) {
      res.send(await resp.json())
    } else {
      res.status(404)
    }
  })
})

app.route('/favourites')
  .get(function (req, res) {
    db.all('SELECT name FROM fv', [], (err, rows) => {
      if (err) {
        console.log(err)
        res.status(500).send('Unexpected error')
      } else {
        res.send(rows.map(entry => entry.name).join(';'))
      }
    })
  })
  .post(function (req, res) {
    db.run('INSERT INTO fv(name) VALUES (?)', [req.query.name], (err, rows) => {
      if (err) {
        console.log(err)
        res.status(500).send('Unexpected error')
      } else {
        res.status(201).send('OK')
      }
    })
  })
  .delete(function (req, res) {
    db.run('DELETE FROM fv WHERE name=?', [req.query.name], (err, rows) => {
      if (err) {
        console.log(err)
        res.status(500).send('Unexpected error')
      } else {
        res.status(200).send('OK')
      }
    })
  })

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

process.on('exit', function () {
  db.close()
  console.log('Goodbye...')
})
