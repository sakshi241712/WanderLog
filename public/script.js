// ==================== API HELPERS ====================
const API_BASE = '/api';

async function fetchTrips() {
  const res = await fetch(`${API_BASE}/trips`);
  return await res.json();
}

async function fetchExpenses() {
  const res = await fetch(`${API_BASE}/expenses`);
  return await res.json();
}

async function createTripAPI(tripData) {
  const res = await fetch(`${API_BASE}/trips`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(tripData)
  });
  return await res.json();
}

async function addExpenseAPI(expenseData) {
  const res = await fetch(`${API_BASE}/expenses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(expenseData)
  });
  return await res.json();
}

// ==================== GLOBAL STATE ====================
let allTrips = [];
let allExpenses = [];
const currentUser = 'Arjun M.';

// Gallery images – exact filenames as they appear in public/images/
const galleryImages = [
  'alleppey.jpg',
  'goa.jpg',
  'jaipur.jpg',
  'kedarkantha.jpg',
  'munnar.jpg',
  'taj_mahal.jpg',
  'varanasi.jpg'
];

// ==================== RENDER FUNCTIONS ====================
function renderTripStrip() {
  const grid = document.getElementById('tripsGrid');
  if (!grid) return;
  const featured = allTrips.slice(0, 4);
  grid.innerHTML = featured.map((t, i) => `
    <div class="trip-card reveal reveal-delay-${i%3+1}" onclick="showToast('Opening: ${t.name}','teal')">
      <img class="trip-card-img" src="/images/${t.image}" alt="${t.name}">
      <div class="trip-card-overlay"></div>
      <div class="trip-card-body">
        <div class="trip-card-num">TOUR ${i+1}</div>
        <div class="trip-card-name">${t.name}</div>
        <div class="trip-card-loc">${t.location}</div>
      </div>
    </div>
  `).join('');
  observeReveal();
}

function renderGallery() {
  const grid = document.getElementById('galleryGrid');
  if (!grid) return;
  grid.innerHTML = galleryImages.map((img, i) => `
    <div class="gallery-item reveal reveal-delay-${i%3+1}" onclick="openLightbox(${i})">
      <img src="/images/${img}" alt="Gallery ${i+1}">
      <div class="gallery-overlay"><span class="gallery-overlay-icon">⊕</span></div>
    </div>
  `).join('');
  observeReveal();
}

function renderSearchResults(trips) {
  const container = document.getElementById('searchResults');
  if (!container) return;
  if (!trips.length) {
    container.innerHTML = '<div class="no-results">No destinations found.</div>';
    return;
  }
  container.innerHTML = trips.map(t => `
    <div class="result-card reveal" onclick="showToast('Opening: ${t.name}','teal')">
      <img class="result-img" src="/images/${t.image}" alt="${t.name}">
      <div class="result-body">
        <div class="result-name">${t.name}</div>
        <div class="result-meta">${t.location} · ${t.startDate}</div>
        <div class="result-creator">by ${t.creator}</div>
      </div>
    </div>
  `).join('');
  observeReveal();
}

function filterTrips() {
  const q = document.getElementById('searchInput').value.toLowerCase().trim();
  if (!q) { renderSearchResults(allTrips); return; }
  const filtered = allTrips.filter(t =>
    t.name.toLowerCase().includes(q) ||
    t.location.toLowerCase().includes(q) ||
    t.creator.toLowerCase().includes(q)
  );
  renderSearchResults(filtered);
}

function renderDashboard() {
  // My trips
  const myTrips = allTrips.filter(t => t.creator === currentUser);
  const myTripsList = document.getElementById('myTripsList');
  if (myTripsList) {
    myTripsList.innerHTML = myTrips.map(t => `
      <div class="trip-list-item">
        <img class="trip-thumb" src="/images/${t.image}" alt="${t.name}">
        <div class="trip-info">
          <div class="trip-info-name">${t.name}</div>
          <div class="trip-info-meta">${t.location} · ${t.startDate}</div>
        </div>
        <span class="trip-badge ${t.isPublic ? 'badge-public':'badge-private'}">${t.isPublic?'Public':'Private'}</span>
      </div>
    `).join('');
  }

  // Collaborations
  const collabs = allTrips.filter(t => t.creator !== currentUser);
  const collabList = document.getElementById('collabList');
  if (collabList) {
    collabList.innerHTML = collabs.map(t => `
      <div class="trip-list-item">
        <img class="trip-thumb" src="/images/${t.image}" alt="${t.name}">
        <div class="trip-info">
          <div class="trip-info-name">${t.name}</div>
          <div class="trip-info-meta">by ${t.creator}</div>
        </div>
        <span class="trip-badge badge-private">Collab</span>
      </div>
    `).join('');
  }

  renderExpenses();
  renderBalances();
}

function renderExpenses() {
  const expenseList = document.getElementById('expenseList');
  if (!expenseList) return;
  expenseList.innerHTML = allExpenses.map(e => `
    <div class="expense-row">
      <div>
        <div class="expense-desc">${e.desc}</div>
        <div class="expense-payer">Paid by ${e.paidBy}</div>
      </div>
      <div class="expense-amount">₹${e.amount.toLocaleString()}</div>
    </div>
  `).join('');
}

function renderBalances() {
  const people = ['Arjun M.', 'Priya P.', 'Rahul D.', 'Neha S.'];
  const net = {};
  people.forEach(p => net[p] = 0);
  allExpenses.forEach(e => {
    const share = e.amount / e.participants.length;
    e.participants.forEach(p => { net[p] -= share; });
    net[e.paidBy] += e.amount;
  });
  const maxAbs = Math.max(...Object.values(net).map(Math.abs));
  const balanceList = document.getElementById('balanceList');
  if (!balanceList) return;
  balanceList.innerHTML = people.map(p => {
    const v = net[p];
    const pct = maxAbs > 0 ? Math.abs(v) / maxAbs * 100 : 0;
    const isOwed = v > 0;
    return `
      <div class="balance-item">
        <div class="balance-header">
          <span class="balance-name">${p}</span>
          <span class="balance-val ${isOwed ? 'owes':'owed'}">${isOwed ? '+':'-'}₹${Math.abs(v).toFixed(0)}</span>
        </div>
        <div class="balance-bar-track">
          <div class="balance-bar-fill ${isOwed ? 'fill-owes':'fill-owed'}" style="width:${pct}%"></div>
        </div>
      </div>
    `;
  }).join('');
}

// ==================== MAP ====================
let map;
let markers = [];

function initMap() {
  if (map) return;
  map = L.map('map', { zoomControl: true }).setView([20, 0], 2);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 18
  }).addTo(map);
}

function updateMapMarkers() {
  if (!map) initMap();
  markers.forEach(m => map.removeLayer(m));
  markers = [];

  const tealIcon = L.divIcon({
    className: '',
    html: `<div style="width:14px;height:14px;border-radius:50%;background:#00e5c3;border:2px solid #fff;box-shadow:0 0 8px rgba(0,229,195,0.6)"></div>`,
    iconSize: [14,14], iconAnchor: [7,7]
  });

  const pinList = document.getElementById('mapPinList');
  if (pinList) pinList.innerHTML = '';

  allTrips.forEach((t, i) => {
    if (t.lat && t.lng) {
      const marker = L.marker([t.lat, t.lng], { icon: tealIcon }).addTo(map);
      marker.bindPopup(`<strong style="color:#00e5c3">${t.name}</strong><br>${t.location}`);
      markers.push(marker);
      if (pinList) {
        pinList.innerHTML += `
          <div class="map-pin-item" onclick="map.setView([${t.lat},${t.lng}],8); markers[${i}].openPopup();">
            <div class="pin-num">${i+1}</div>
            <div>
              <div class="pin-info-name">${t.name}</div>
              <div class="pin-info-loc">${t.location}</div>
            </div>
          </div>
        `;
      }
    }
  });
}

// ==================== MODALS ====================
function showModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function switchModal(fromId, toId) {
  closeModal(fromId);
  setTimeout(() => showModal(toId), 300);
}

// ==================== ACTIONS ====================
function handleLogin() {
  closeModal('loginModal');
  showToast('Welcome back, Arjun ✓', 'teal');
}

function handleRegister() {
  closeModal('registerModal');
  showToast('Account created! Verify your email.', 'teal');
}

function handleBooking(e) {
  e.preventDefault();
  showToast('Tour booking submitted! We\'ll contact you shortly.', 'teal');
}

async function createTrip() {
  const name = document.getElementById('newTripName').value.trim();
  const loc = document.getElementById('newTripLoc').value.trim();
  const lat = parseFloat(document.getElementById('newTripLat').value) || 0;
  const lng = parseFloat(document.getElementById('newTripLng').value) || 0;
  const isPublic = document.getElementById('newTripPublic').checked;
  if (!name || !loc) {
    showToast('Please fill in all required fields.', 'red');
    return;
  }
  const image = 'default.jpg'; // Placeholder
  const newTrip = {
    name,
    location: loc,
    creator: currentUser,
    isPublic,
    startDate: document.getElementById('newTripStart').value || '2026-01-01',
    endDate: document.getElementById('newTripEnd').value || '2026-01-07',
    lat,
    lng,
    image,
    desc: document.getElementById('newTripDesc').value
  };
  await createTripAPI(newTrip);
  await refreshData();
  closeModal('createTripModal');
  showToast(`Trip "${name}" created!`, 'teal');
}

async function addExpense() {
  const desc = document.getElementById('expDesc').value.trim();
  const amount = parseFloat(document.getElementById('expAmount').value);
  const paidBy = document.getElementById('expPaidBy').value;
  if (!desc || isNaN(amount) || amount <= 0) {
    showToast('Please enter valid expense details.', 'red');
    return;
  }
  const participants = ['Arjun M.', 'Priya P.', 'Rahul D.', 'Neha S.'];
  const newExpense = {
    desc,
    amount,
    paidBy,
    participants
  };
  await addExpenseAPI(newExpense);
  await refreshData();
  closeModal('expenseModal');
  showToast('Expense added & balances updated!', 'teal');
}

function showToast(msg, type = 'teal') {
  const t = document.getElementById('toast');
  if (!t) return;
  t.className = `toast toast-${type} show`;
  t.textContent = msg;
  setTimeout(() => t.classList.remove('show'), 3000);
}

function openLightbox(idx) {
  const imgSrc = `/images/${galleryImages[idx % galleryImages.length]}`;
  const imgEl = document.getElementById('lightboxImg');
  if (imgEl) imgEl.src = imgSrc;
  const lightbox = document.getElementById('lightbox');
  if (lightbox) lightbox.classList.add('active');
}

function closeLightbox() {
  const lightbox = document.getElementById('lightbox');
  if (lightbox) lightbox.classList.remove('active');
}

// ==================== YOUTUBE VIDEO ====================
function loadYouTubeVideo() {
  const container = document.getElementById('videoThumbBg');
  if (!container) return;
  container.innerHTML = `
    <iframe 
      width="100%" 
      height="100%" 
      src="https://www.youtube.com/embed/1K4fL_P5rQI?autoplay=1&rel=0" 
      frameborder="0" 
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
      allowfullscreen>
    </iframe>
  `;
}

// ==================== REFRESH DATA ====================
async function refreshData() {
  try {
    const [trips, expenses] = await Promise.all([fetchTrips(), fetchExpenses()]);
    allTrips = trips;
    allExpenses = expenses;
    renderTripStrip();
    renderSearchResults(allTrips);
    renderDashboard();
    updateMapMarkers();
    renderGallery();
  } catch (err) {
    console.error('Failed to fetch data:', err);
    showToast('Failed to load data. Please refresh.', 'red');
  }
}

// ==================== SCROLL REVEAL ====================
function observeReveal() {
  const els = document.querySelectorAll('.reveal:not(.in)');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  els.forEach(el => obs.observe(el));
}

// ==================== HERO COUNTER ====================
document.querySelectorAll('.hero-counter span').forEach((s, i) => {
  s.addEventListener('click', () => {
    document.querySelectorAll('.hero-counter span').forEach(x => x.classList.remove('active'));
    s.classList.add('active');
  });
});

// ==================== INITIALIZE ====================
document.addEventListener('DOMContentLoaded', async () => {
  initMap();
  await refreshData();
  observeReveal();
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.active').forEach(m => closeModal(m.id));
    closeLightbox();
  }
});