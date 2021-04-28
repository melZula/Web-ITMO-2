const sqlite3 = require('sqlite3').verbose();

const DB_STRING = process.env.DB_STRING;

const db = new sqlite3.Database(DB_STRING, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
  if (err) {
    console.error('ERROR: ' + err.message);
    this.db = null;
  } else { console.log('Connected to the SQLite database'); }
});

process.on('exit', function () {
  db.close();
  console.log('Goodbye...');
});

module.exports = db;