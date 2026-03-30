const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const db = new sqlite3.Database('./wanderlog.db', (err) => {
  if (err) console.error('DB error:', err.message);
  else console.log('Connected to SQLite database.');
});

db.serialize(() => {
  // Trips table with image column
  db.run(`
    CREATE TABLE IF NOT EXISTS trips (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      location TEXT NOT NULL,
      creator TEXT NOT NULL,
      isPublic INTEGER NOT NULL DEFAULT 1,
      startDate TEXT,
      endDate TEXT,
      lat REAL,
      lng REAL,
      image TEXT,
      desc TEXT
    )
  `);

  // Expenses table
  db.run(`
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      desc TEXT NOT NULL,
      amount REAL NOT NULL,
      paidBy TEXT NOT NULL,
      participants TEXT NOT NULL
    )
  `);

  // Seed trips if empty
  db.get('SELECT COUNT(*) as count FROM trips', (err, row) => {
    if (err) return console.error(err);
    if (row.count === 0) {
      const sampleTrips = [
        { name: 'Kedarkantha Trek', location: 'Uttarakhand', creator: 'Arjun M.', isPublic: 1, startDate: '2026-01-10', endDate: '2026-01-15', lat: 31.0, lng: 78.0, image: 'kedarkantha.jpg', desc: 'Snow-covered peaks and pine forests.' },
        { name: 'Alleppey Backwaters', location: 'Kerala', creator: 'Priya P.', isPublic: 1, startDate: '2026-02-05', endDate: '2026-02-09', lat: 9.4981, lng: 76.3388, image: 'alleppey.jpg', desc: 'Houseboat stay and serene lagoons.' },
        { name: 'Jaipur Heritage', location: 'Rajasthan', creator: 'Rahul D.', isPublic: 0, startDate: '2026-03-12', endDate: '2026-03-18', lat: 26.9124, lng: 75.7873, image: 'jaipur.jpg', desc: 'Amber Fort, Hawa Mahal, and local cuisine.' },
        { name: 'Munnar Hills', location: 'Kerala', creator: 'Arjun M.', isPublic: 1, startDate: '2025-11-20', endDate: '2025-11-25', lat: 10.0889, lng: 77.0595, image: 'munnar.jpg', desc: 'Tea plantations and misty mountains.' }
      ];
      const insertTrip = db.prepare(`
        INSERT INTO trips (name, location, creator, isPublic, startDate, endDate, lat, lng, image, desc)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      sampleTrips.forEach(t => {
        insertTrip.run(t.name, t.location, t.creator, t.isPublic, t.startDate, t.endDate, t.lat, t.lng, t.image, t.desc);
      });
      insertTrip.finalize();
      console.log('Indian sample trips inserted.');
    }
  });

  // Seed expenses if empty
  db.get('SELECT COUNT(*) as count FROM expenses', (err, row) => {
    if (err) return console.error(err);
    if (row.count === 0) {
      const sampleExpenses = [
        { desc: 'Kedarkantha trek permit', amount: 1500, paidBy: 'Arjun M.', participants: JSON.stringify(['Arjun M.', 'Priya P.', 'Rahul D.']) },
        { desc: 'Houseboat stay (Alleppey)', amount: 8500, paidBy: 'Priya P.', participants: JSON.stringify(['Arjun M.', 'Priya P.']) },
        { desc: 'Dinner at Chokhi Dhani', amount: 3200, paidBy: 'Rahul D.', participants: JSON.stringify(['Arjun M.', 'Priya P.', 'Rahul D.']) },
        { desc: 'Tea estate tour', amount: 1200, paidBy: 'Arjun M.', participants: JSON.stringify(['Arjun M.', 'Priya P.']) }
      ];
      const insertExpense = db.prepare(`
        INSERT INTO expenses (desc, amount, paidBy, participants)
        VALUES (?, ?, ?, ?)
      `);
      sampleExpenses.forEach(e => {
        insertExpense.run(e.desc, e.amount, e.paidBy, e.participants);
      });
      insertExpense.finalize();
      console.log('Indian sample expenses inserted.');
    }
  });
});

// API Routes
app.get('/api/trips', (req, res) => {
  db.all('SELECT * FROM trips', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/trips', (req, res) => {
  const { name, location, creator, isPublic, startDate, endDate, lat, lng, image, desc } = req.body;
  db.run(`
    INSERT INTO trips (name, location, creator, isPublic, startDate, endDate, lat, lng, image, desc)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [name, location, creator, isPublic ? 1 : 0, startDate, endDate, lat, lng, image, desc], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: this.lastID });
  });
});

app.get('/api/expenses', (req, res) => {
  db.all('SELECT * FROM expenses', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const expenses = rows.map(row => ({ ...row, participants: JSON.parse(row.participants) }));
    res.json(expenses);
  });
});

app.post('/api/expenses', (req, res) => {
  const { desc, amount, paidBy, participants } = req.body;
  const participantsJson = JSON.stringify(participants);
  db.run(`
    INSERT INTO expenses (desc, amount, paidBy, participants)
    VALUES (?, ?, ?, ?)
  `, [desc, amount, paidBy, participantsJson], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: this.lastID });
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

process.on('SIGINT', () => {
  db.close((err) => {
    if (err) console.error(err.message);
    console.log('Database closed.');
    process.exit(0);
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});