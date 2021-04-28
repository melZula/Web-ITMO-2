const express = require('express');
const fetch = require('node-fetch');
const db = require('./model');
const router = express.Router();

const API_KEY = process.env.API_KEY;

router.get('/weather/city', (req, res) => {
  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${req.query.q}&appid=${API_KEY}&units=metric`).then(async (resp) => {
    if (resp.ok) {
      res.send(await resp.json());
    } else {
      res.status(404);
    }
  });
});

router.get('/weather/coordinates', (req, res) => {
  fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${req.query.lat}&lon=${req.query.lon}&appid=${API_KEY}&units=metric`).then(async (resp) => {
    if (resp.ok) {
      res.send(await resp.json());
    } else {
      res.status(404);
    }
  });
});

router.route('/favourites')
  .get(function (req, res) {
    db.all('SELECT name FROM fv', [], (err, rows) => {
      if (err) {
        console.log(err);
        res.status(500).send('Unexpected error');
      } else {
        res.send(rows.map(entry => entry.name).join(';'));
      }
    });
  })
  .post(function (req, res) {
    db.run('INSERT INTO fv(name) VALUES (?)', [req.query.name], (err, rows) => {
      if (err) {
        console.log(err);
        res.status(500).send('Unexpected error');
      } else {
        res.status(201).send('OK');
      }
    });
  })
  .delete(function (req, res) {
    db.run('DELETE FROM fv WHERE name=?', [req.query.name], (err, rows) => {
      if (err) {
        console.log(err);
        res.status(500).send('Unexpected error');
      } else {
        res.status(200).send('OK');
      }
    });
  });

module.exports = router;