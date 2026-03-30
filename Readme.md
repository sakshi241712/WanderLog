# WanderLog - Indian Travel Journal

A full-stack travel journal web application for exploring Indian destinations, tracking trip expenses, and collaborating with fellow travelers.

## 🌟 Features

| Feature | Description |
|---------|-------------|
| **Trip Management** | Create, view, and search trips (public/private) |
| **Expense Tracking** | Add expenses, split equally, see who owes whom |
| **Interactive Map** | Leaflet map with markers for all trip locations |
| **Dashboard** | View "My Trips", collaborations, balances, recent expenses |
| **Image Gallery** | Grid of travel images with lightbox popup |
| **Search Trips** | Real-time filter by name, location, or creator |
| **YouTube Video** | Embedded India travel video (plays on click) |
| **Booking Form** | Request a tour (demo functionality) |
| **Responsive Design** | Works on desktop, tablet, and mobile |

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | HTML5, CSS3, JavaScript (ES6) |
| Mapping | Leaflet.js + OpenStreetMap |
| Backend | Node.js + Express.js |
| Database | SQLite3 (file-based, no server needed) |
| Version Control | Git + GitHub |

## 📁 Project Structure
WanderLog/
├── public/
│ ├── images/ # Travel images (add your own)
│ │ ├── alleppey.jpg
│ │ ├── goa.jpg
│ │ ├── jaipur.jpg
│ │ ├── kedarkantha.jpg
│ │ ├── munnar.jpg
│ │ ├── taj_mahal.jpg
│ │ ├── varanasi.jpg
│ │ └── dal_lake.jpg
│ ├── index.html # Main webpage
│ ├── style.css # All styles
│ └── script.js # Frontend logic
├── server.js # Express + SQLite backend
├── package.json # Dependencies
├── .gitignore # Excludes node_modules, wanderlog.db
└── README.md # Project documentation

