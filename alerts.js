// Alerts Logic

const timeEl = document.getElementById('live-time');
setInterval(() => {
    timeEl.innerText = new Date().toLocaleTimeString('en-US', { hour12: false });
}, 1000);

const mockAlerts = [
    {
        id: "ALT-902",
        type: "CRITICAL",
        title: "TOXIC GAS OVERLOAD",
        soldier: "OPR-9C-42 (KANE, M)",
        location: "SECTOR 4 - LAT 48.8580 LNG 2.3550",
        time: "JUST NOW",
        icon: "⚠️"
    },
    {
        id: "ALT-901",
        type: "WARNING",
        title: "ELEVATED HEART RATE",
        soldier: "OPR-7X-99 (JAXSON, E)",
        location: "POINT C - LAT 48.8520 LNG 2.3400",
        time: "-02 MIN",
        icon: "💓"
    },
    {
        id: "ALT-900",
        type: "WARNING",
        title: "GPS SIGNAL WEAK",
        soldier: "OPR-1B-88 (CHEN, W)",
        location: "UNDERGROUND TRENCH",
        time: "-15 MIN",
        icon: "📡"
    }
];

const container = document.getElementById('alerts-container');

function renderAlerts() {
    container.innerHTML = '';
    mockAlerts.forEach(a => {
        const div = document.createElement('div');
        div.className = `alert-card ${a.type === 'CRITICAL' ? 'critical-type' : 'warning-type'}`;
        
        div.innerHTML = `
            <div class="ac-icon">${a.icon}</div>
            <div class="ac-details">
                <div class="ac-title">${a.title}</div>
                <div class="ac-info">
                    <div><span>ID:</span> ${a.soldier}</div>
                    <div><span>LOC:</span> ${a.location}</div>
                </div>
            </div>
            <div class="ac-time">${a.time}</div>
        `;
        container.appendChild(div);
    });
}
renderAlerts();

// Mini Map Setup
let map = L.map('alert-map', { zoomControl: false, attributionControl: false }).setView([48.8550, 2.3500], 14);
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(map);

// Add danger zone to map
L.circle([48.8580, 2.3550], {
    color: '#ff003c', fillColor: '#ff003c', fillOpacity: 0.3, radius: 300
}).addTo(map);

const alertIcon = L.divIcon({
    className: 'alert-map-marker',
    html: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#ff003c" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>',
    iconSize: [24, 24], iconAnchor: [12, 12]
});
L.marker([48.8580, 2.3550], { icon: alertIcon }).addTo(map);

// AI Terminal
const aiTextEl = document.getElementById('ai-threat-text');
const aiMessage = "CRITICAL ALERT ASSESSED: OPR-9C-42 exposed to lethal gas concentration in Sector 4. Probability of incapacitation: 89%. Immediate drone med-evac required. Proceed with Protocol Omega.";

let i = 0;
function typeAI() {
    if (i < aiMessage.length) {
        aiTextEl.innerText += aiMessage.charAt(i);
        i++;
        setTimeout(typeAI, 20 + Math.random() * 30);
    }
}
setTimeout(typeAI, 1000);

// Timeline Logs
const timelineEl = document.getElementById('alert-timeline');
const logs = [
    "14:02:11 - KANE, M: Gas sensor spiked > 200PPM",
    "14:02:15 - KANE, M: Auto-injecting antidote...",
    "14:02:18 - SYSTEM: Antidote injection failed. Suit breach.",
    "14:02:22 - KANE, M: Heart rate > 140BPM. Panic state.",
    "14:02:30 - COMMAND: Evac drone dispatched to Sector 4.",
    "14:02:45 - JAXSON, E: Commencing rescue assist."
];

let logIndex = 0;
function addLog() {
    if (logIndex < logs.length) {
        const div = document.createElement('div');
        div.className = 'log-entry log-alert';
        div.innerText = logs[logIndex];
        timelineEl.appendChild(div);
        timelineEl.scrollTop = timelineEl.scrollHeight;
        logIndex++;
        setTimeout(addLog, 2000);
    }
}
setTimeout(addLog, 1500);
