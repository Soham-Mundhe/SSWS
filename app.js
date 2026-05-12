// Firebase V8 Initialization (Fixes local execution issues)
const firebaseConfig = {
    apiKey: "AIzaSyAIdElTNeqNDZ81qBfPquRgIpzQadcik4U",
    authDomain: "ssws-628b0.firebaseapp.com",
    databaseURL: "https://ssws-628b0-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "ssws-628b0",
    storageBucket: "ssws-628b0.firebasestorage.app",
    messagingSenderId: "830954775948",
    appId: "1:830954775948:web:27d969a54759c8751422a9"
};
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// DOM Elements
const timeEl = document.getElementById('live-time');
const dateEl = document.getElementById('live-date');
const statusText = document.getElementById('system-status-text');

// Cards
const valSpo2 = document.getElementById('val-spo2');
const valHr = document.getElementById('val-hr');
const valBp = document.getElementById('val-bp');
const valBtemp = document.getElementById('val-btemp');
const valGas = document.getElementById('val-gas');
const valEtemp = document.getElementById('val-etemp');
const valStatus = document.getElementById('val-status');
const overallStatusEl = document.getElementById('soldier-overall');
const alertOverlay = document.getElementById('alert-overlay');
const alertMessage = document.getElementById('alert-message');
const alertBadge = document.getElementById('alert-badge');

let alertsCount = 0;

// Update Live Time
function updateClock() {
    const now = new Date();
    timeEl.innerText = now.toLocaleTimeString('en-US', { hour12: false });
    dateEl.innerText = now.toISOString().split('T')[0];
}
setInterval(updateClock, 1000);
updateClock();

// Chart.js Setup
Chart.defaults.color = '#8892b0';
Chart.defaults.font.family = 'Rajdhani';

const vitalsCtx = document.getElementById('vitalsChart').getContext('2d');
const vitalsChart = new Chart(vitalsCtx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [
            { label: 'SpO2 (%)', borderColor: '#00f3ff', data: [], tension: 0.4, borderWidth: 2, pointRadius: 0 },
            { label: 'Heart Rate (BPM)', borderColor: '#39ff14', data: [], tension: 0.4, borderWidth: 2, pointRadius: 0 }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: { grid: { color: 'rgba(255,255,255,0.05)' } },
            x: { grid: { color: 'rgba(255,255,255,0.05)' }, display: false }
        },
        plugins: { legend: { labels: { color: '#e6f1ff' } } },
        animation: { duration: 0 } // disable animation for smoother streaming
    }
});

const envCtx = document.getElementById('envChart').getContext('2d');
const envChart = new Chart(envCtx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [
            { label: 'Toxic Gas (PPM)', borderColor: '#ffea00', data: [], tension: 0.4, borderWidth: 2, pointRadius: 0 },
            { label: 'Temp (°C)', borderColor: '#ff003c', data: [], tension: 0.4, borderWidth: 2, pointRadius: 0 }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: { grid: { color: 'rgba(255,255,255,0.05)' } },
            x: { grid: { color: 'rgba(255,255,255,0.05)' }, display: false }
        },
        plugins: { legend: { labels: { color: '#e6f1ff' } } },
        animation: { duration: 0 }
    }
});

// Map Setup (Leaflet)
let map, marker;
function initMap() {
    const tacticalDark = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO'
    });
    
    const satelliteView = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri'
    });

    map = L.map('tactical-map', { 
        zoomControl: false,
        layers: [tacticalDark]
    }).setView([0, 0], 2);

    const baseMaps = {
        "Tactical Dark": tacticalDark,
        "Satellite": satelliteView
    };
    L.control.layers(baseMaps).addTo(map);

    const customIcon = L.divIcon({
        className: 'custom-soldier-marker',
        html: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#00f3ff" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/></svg>',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
    });

    marker = L.marker([0, 0], { icon: customIcon }).addTo(map);

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            map.setView([lat, lng], 15);
            marker.setLatLng([lat, lng]);
            document.getElementById('loc-coords').innerText = `LAT: ${lat.toFixed(4)} | LNG: ${lng.toFixed(4)}`;
            document.getElementById('loc-name').innerText = "LIVE SIGNAL";
            
            // Trigger weather fetch mock
            fetchWeather(lat, lng);
        }, error => {
            console.error("GPS Error:", error);
            document.getElementById('loc-name').innerText = "GPS SIGNAL LOST";
        });
    }
}
initMap();

// Weather Simulation / Fetch
function fetchWeather(lat, lng) {
    setTimeout(() => {
        document.getElementById('w-icon').innerText = '⛈️';
        document.getElementById('w-temp').innerText = '32°C';
        document.getElementById('w-cond').innerText = 'THUNDERSTORM';
        document.getElementById('w-hum').innerText = '85%';
        document.getElementById('w-wind').innerText = '12 m/s';
    }, 1000);
}

// FIREBASE LIVE DATA INTEGRATION - HARDWARE /logs/
const historyLen = 20;
const logsRef = database.ref('logs');

// Listen for Hardware Logs
logsRef.on('value', (snapshot) => {
    const data = snapshot.val();
    if (!data) return;

    // Filter out 'unknown' and sort keys chronologically
    let keys = Object.keys(data).filter(k => k !== 'unknown');
    keys.sort(); // Lexicographical sort works for YYYY-MM-DD_HH-MM-SS

    if (keys.length === 0) return;

    // --- CHART UPDATES (Last 20 entries) ---
    const recentKeys = keys.slice(-historyLen);
    
    // Clear chart data
    vitalsChart.data.labels = [];
    vitalsChart.data.datasets[0].data = []; // SpO2
    vitalsChart.data.datasets[1].data = []; // HR

    envChart.data.labels = [];
    envChart.data.datasets[0].data = []; // Gas
    envChart.data.datasets[1].data = []; // Temp

    recentKeys.forEach(key => {
        const logData = data[key];
        
        // Format timestamp for X-axis (e.g., 19-34-59 -> 19:34:59)
        const timeParts = key.split('_');
        const displayTime = timeParts.length > 1 ? timeParts[1].replace(/-/g, ':') : key;

        vitalsChart.data.labels.push(displayTime);
        vitalsChart.data.datasets[0].data.push(Math.round(logData.SpO2 || 0));
        vitalsChart.data.datasets[1].data.push(Math.round(logData.BPM || 0));

        envChart.data.labels.push(displayTime);
        envChart.data.datasets[0].data.push(logData.Gas ? parseFloat(logData.Gas).toFixed(2) : 0);
        envChart.data.datasets[1].data.push(28.5); // Static fallback for Env Temp
    });

    vitalsChart.update();
    envChart.update();

    // --- UI CARDS UPDATE (Absolute Latest Entry) ---
    const latestKey = keys[keys.length - 1];
    const latestData = data[latestKey];

    const currentValues = {
        spo2: Math.round(latestData.SpO2 || 0),
        hr: Math.round(latestData.BPM || 0),
        sys: 120, // Static fallback
        dia: 80,  // Static fallback
        btemp: 37.0, // Static fallback
        gas: latestData.Gas ? parseFloat(latestData.Gas).toFixed(2) : 0,
        etemp: 28.5 // Static fallback
    };

    updateUI(currentValues);
    checkAlerts(currentValues);
});

function updateUI(data) {
    valSpo2.innerText = data.spo2;
    valHr.innerText = data.hr;
    valBp.innerText = `${data.sys}/${data.dia}`;
    valBtemp.innerText = data.btemp;
    valGas.innerText = data.gas;
    valEtemp.innerText = data.etemp;

    // Status logic
    setStatus('card-spo2', data.spo2 < 90 ? 'critical' : data.spo2 < 95 ? 'warning' : 'safe');
    setStatus('card-hr', data.hr > 120 ? 'critical' : data.hr > 100 ? 'warning' : 'safe');
    setStatus('card-btemp', data.btemp > 38.0 ? 'warning' : data.btemp > 39.0 ? 'critical' : 'safe');
    setStatus('card-gas', data.gas > 200 ? 'critical' : data.gas > 100 ? 'warning' : 'safe');
}

function setStatus(cardId, status) {
    const card = document.getElementById(cardId);
    const statusEl = card.querySelector('.card-status');
    
    card.classList.remove('safe', 'warning', 'critical');
    statusEl.classList.remove('safe', 'warning', 'critical');
    
    card.classList.add(status);
    statusEl.classList.add(status);
    statusEl.innerText = status.toUpperCase();
}

function checkAlerts(data) {
    let criticals = [];
    
    if(data.spo2 < 90) criticals.push("OXYGEN LEVEL CRITICAL");
    if(data.hr > 120) criticals.push("TACHYCARDIA DETECTED");
    if(data.btemp > 39.0) criticals.push("HYPERTHERMIA RISK");
    if(data.gas > 200) criticals.push("TOXIC GAS OVERLOAD");

    if(criticals.length > 0) {
        // Show Alert Toast Notification
        alertMessage.innerText = criticals.join(" | ");
        alertOverlay.classList.remove('hidden');
        
        // Update Overall Status
        overallStatusEl.className = "overall-status critical";
        valStatus.innerText = "CRITICAL CONDITION";
        
        alertsCount++;
        alertBadge.innerText = alertsCount;
    } else {
        alertOverlay.classList.add('hidden');
        
        // Return to normal
        overallStatusEl.className = "overall-status safe";
        valStatus.innerText = "SAFE";
    }
}

// Particle background logic
function createParticles() {
    const container = document.getElementById('particles');
    for (let i = 0; i < 50; i++) {
        const p = document.createElement('div');
        p.style.position = 'absolute';
        p.style.width = '2px';
        p.style.height = '2px';
        p.style.background = '#00f3ff';
        p.style.left = Math.random() * 100 + 'vw';
        p.style.top = Math.random() * 100 + 'vh';
        p.style.boxShadow = '0 0 5px #00f3ff';
        p.style.opacity = Math.random();
        p.style.animation = `float ${5 + Math.random() * 5}s infinite linear`;
        container.appendChild(p);
    }
}

// Add keyframes for float dynamic via JS
const style = document.createElement('style');
style.innerHTML = `
@keyframes float {
    0% { transform: translateY(0); opacity: 0; }
    50% { opacity: 1; }
    100% { transform: translateY(-100px); opacity: 0; }
}
`;
document.head.appendChild(style);
createParticles();
