// Tracking JS Logic

// Update Live Time
const timeEl = document.getElementById('live-time');
function updateClock() {
    const now = new Date();
    timeEl.innerText = now.toLocaleTimeString('en-US', { hour12: false });
}
setInterval(updateClock, 1000);
updateClock();

// Map Setup
let map = L.map('tracking-map', { zoomControl: false }).setView([48.8566, 2.3522], 14); // Default to Paris for simulation

const tacticalDark = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; CARTO'
});
const satelliteView = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri'
});

tacticalDark.addTo(map);

const baseMaps = {
    "Tactical Grid": tacticalDark,
    "Satellite Scan": satelliteView
};
L.control.layers(baseMaps, null, {position: 'bottomright'}).addTo(map);

// Custom Soldier Marker
const customIcon = L.divIcon({
    className: 'soldier-tracking-marker',
    html: '<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#00f3ff" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/></svg>',
    iconSize: [30, 30],
    iconAnchor: [15, 15]
});

let marker = L.marker([48.8566, 2.3522], { icon: customIcon }).addTo(map);

// Path History Trail
let pathLatLngs = [];
let pathLine = L.polyline(pathLatLngs, {
    color: '#00f3ff',
    weight: 3,
    opacity: 0.7,
    dashArray: '5, 10',
    lineCap: 'square'
}).addTo(map);

// Danger Zones
const dangerZones = [
    { center: [48.8580, 2.3550], radius: 300, name: "TOXIC GAS CLOUD" },
    { center: [48.8540, 2.3480], radius: 250, name: "HIGH THERMAL RADIATION" }
];

const dangerCircles = dangerZones.map(zone => {
    return L.circle(zone.center, {
        color: '#ff003c',
        fillColor: '#ff003c',
        fillOpacity: 0.2,
        radius: zone.radius,
        className: 'danger-zone-circle'
    }).addTo(map);
});

// Telemetry DOM Elements
const speedEl = document.getElementById('live-speed');
const distEl = document.getElementById('live-dist');
const movementStatusEl = document.getElementById('movement-status');
const droneCoordsEl = document.getElementById('drone-coords');

const dangerOverlay = document.getElementById('danger-overlay');
const dangerMessage = document.getElementById('danger-message');

// AI Terminal DOM
const aiTextEl = document.getElementById('ai-text');

// Simulation Variables
let currentLat = 48.8520;
let currentLng = 2.3400;
let distanceTraveled = 0;
let isDangerActive = false;

// Function to calculate distance between two lat/lng pairs in meters
function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // in metres
}

// Typewriter AI logic
let typingQueue = [];
let isTyping = false;

function printToAI(text) {
    typingQueue.push(text);
    if (!isTyping) {
        processQueue();
    }
}

function processQueue() {
    if (typingQueue.length === 0) {
        isTyping = false;
        return;
    }
    isTyping = true;
    const text = typingQueue.shift();
    aiTextEl.innerText = "";
    let i = 0;
    
    function typeChar() {
        if (i < text.length) {
            aiTextEl.innerText += text.charAt(i);
            i++;
            setTimeout(typeChar, 30 + Math.random() * 20);
        } else {
            setTimeout(processQueue, 2000); // Wait before next message
        }
    }
    typeChar();
}

// Main Simulation Loop
function simulateMovement() {
    // Randomize movement slightly towards North-East
    const deltaLat = 0.0001 + (Math.random() * 0.0001);
    const deltaLng = 0.0001 + (Math.random() * 0.0002);
    
    const prevLat = currentLat;
    const prevLng = currentLng;
    
    currentLat += deltaLat;
    currentLng += deltaLng;
    
    const newPos = [currentLat, currentLng];
    
    // Update Map
    marker.setLatLng(newPos);
    map.panTo(newPos, { animate: true, duration: 1.0 });
    
    // Update Path
    pathLatLngs.push(newPos);
    if(pathLatLngs.length > 50) pathLatLngs.shift(); // Keep trail length manageable
    pathLine.setLatLngs(pathLatLngs);
    
    // Update Stats
    const distStep = getDistance(prevLat, prevLng, currentLat, currentLng); // meters
    distanceTraveled += distStep;
    
    // Convert m/s to km/h (simulate 2 second interval)
    const speedKmh = ((distStep / 2) * 3.6).toFixed(1); 
    
    speedEl.innerText = speedKmh;
    distEl.innerText = (distanceTraveled / 1000).toFixed(2);
    droneCoordsEl.innerText = `LAT: ${currentLat.toFixed(5)} LNG: ${currentLng.toFixed(5)}`;
    
    if (parseFloat(speedKmh) > 2) {
        movementStatusEl.innerText = "ACTIVE MOVING";
        movementStatusEl.className = "t-value status-good";
    } else {
        movementStatusEl.innerText = "STATIONARY";
        movementStatusEl.className = "t-value highlight";
    }

    // Check Danger Zones
    let inDanger = false;
    let dangerName = "";
    
    for (let zone of dangerZones) {
        const d = getDistance(currentLat, currentLng, zone.center[0], zone.center[1]);
        if (d < zone.radius) {
            inDanger = true;
            dangerName = zone.name;
            break;
        }
    }

    if (inDanger && !isDangerActive) {
        isDangerActive = true;
        dangerOverlay.classList.remove('hidden');
        dangerMessage.innerText = `SOLDIER ENTERED: ${dangerName}`;
        printToAI(`ALERT: Soldier crossed into restricted zone: ${dangerName}. Immediate evac recommended.`);
    } else if (!inDanger && isDangerActive) {
        isDangerActive = false;
        dangerOverlay.classList.add('hidden');
        printToAI("STATUS UPDATE: Soldier cleared danger zone. Resuming standard surveillance.");
    }

    // Random AI chatter
    if (!isDangerActive && Math.random() > 0.8 && !isTyping && typingQueue.length === 0) {
        const messages = [
            "Analyzing surrounding topography...",
            "Vitals nominal. Pulse steady.",
            "Scanning for enemy radio frequencies... Clear.",
            "Uplink latency: 12ms. Connection secure.",
            "Route optimized. No anomalies detected."
        ];
        printToAI(messages[Math.floor(Math.random() * messages.length)]);
    }
}

// Center map initially
map.setView([currentLat, currentLng], 15);

// Initial AI message
setTimeout(() => {
    printToAI("Satellite link acquired. Commencing live tracking of OPR-7X-99...");
}, 1000);

// Run simulation
setInterval(simulateMovement, 2000);
