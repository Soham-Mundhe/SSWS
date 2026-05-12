// Mock Soldier Database
const squad = [
    {
        id: "OPR-7X-99",
        name: "JAXSON, ELI",
        rank: "SERGEANT",
        unit: "ALPHA SQUAD",
        blood: "O-",
        age: 28,
        height: "185cm",
        weight: "88kg",
        status: "ACTIVE",
        avatar: "https://ui-avatars.com/api/?name=EJ&background=000&color=00f3ff&size=150",
        biometrics: { spo2: 98, stress: 35, fatigue: 40 },
        mission: { obj: "INFILTRATE POINT C", risk: "HIGH", dur: "04:12:00" },
        device: { bat: 84 },
        aiText: "Soldier nominal. Heart rate slightly elevated but within operational parameters."
    },
    {
        id: "OPR-2A-14",
        name: "VOSS, SARAH",
        rank: "LIEUTENANT",
        unit: "ALPHA SQUAD",
        blood: "A+",
        age: 32,
        height: "172cm",
        weight: "65kg",
        status: "STATIONARY",
        avatar: "https://ui-avatars.com/api/?name=SV&background=000&color=00f3ff&size=150",
        biometrics: { spo2: 99, stress: 20, fatigue: 15 },
        mission: { obj: "OVERWATCH POS 2", risk: "LOW", dur: "06:05:00" },
        device: { bat: 95 },
        aiText: "Vitals optimal. Holding position."
    },
    {
        id: "OPR-9C-42",
        name: "KANE, MARCUS",
        rank: "CORPORAL",
        unit: "BRAVO SQUAD",
        blood: "B-",
        age: 24,
        height: "190cm",
        weight: "95kg",
        status: "CRITICAL",
        avatar: "https://ui-avatars.com/api/?name=MK&background=000&color=ff003c&size=150",
        biometrics: { spo2: 88, stress: 92, fatigue: 85 },
        mission: { obj: "BREACH SECTOR 4", risk: "EXTREME", dur: "11:45:00" },
        device: { bat: 12 },
        aiText: "WARNING: High fatigue and stress detected. SpO2 levels dropping. Evac recommended."
    },
    {
        id: "OPR-1B-88",
        name: "CHEN, WEI",
        rank: "SPECIALIST",
        unit: "BRAVO SQUAD",
        blood: "AB+",
        age: 26,
        height: "178cm",
        weight: "75kg",
        status: "ACTIVE",
        avatar: "https://ui-avatars.com/api/?name=WC&background=000&color=00f3ff&size=150",
        biometrics: { spo2: 96, stress: 55, fatigue: 60 },
        mission: { obj: "DATA EXTRACTION", risk: "MEDIUM", dur: "02:30:00" },
        device: { bat: 60 },
        aiText: "Mild stress detected. Proceeding with objective."
    }
];

let activeSoldier = squad[0];

// DOM Elements
const rosterListEl = document.getElementById('roster-list');
const searchInput = document.getElementById('search-input');
const filterStatus = document.getElementById('filter-status');
const filterUnit = document.getElementById('filter-unit');

// Profile Elements
const sAvatar = document.getElementById('s-avatar');
const sName = document.getElementById('s-name');
const sId = document.getElementById('s-id');
const sRank = document.getElementById('s-rank');
const sUnit = document.getElementById('s-unit');
const sBlood = document.getElementById('s-blood');
const sAge = document.getElementById('s-age');
const sHeight = document.getElementById('s-height');
const sWeight = document.getElementById('s-weight');

// Ring Elements
const valSpo2 = document.getElementById('val-spo2');
const ringSpo2 = document.getElementById('ring-spo2');
const valStress = document.getElementById('val-stress');
const ringStress = document.getElementById('ring-stress');
const valFatigue = document.getElementById('val-fatigue');
const ringFatigue = document.getElementById('ring-fatigue');

// Status Elements
const sObjective = document.getElementById('s-objective');
const sRisk = document.getElementById('s-risk');
const sDuration = document.getElementById('s-duration');
const sBattery = document.getElementById('s-battery');

// Chart Elements
let hrChart, stressChart;

// Clock
const timeEl = document.getElementById('live-time');
setInterval(() => {
    timeEl.innerText = new Date().toLocaleTimeString('en-US', { hour12: false });
}, 1000);

// Initialize Roster
function renderRoster() {
    const term = searchInput.value.toLowerCase();
    const statusF = filterStatus.value;
    const unitF = filterUnit.value;

    rosterListEl.innerHTML = '';

    const filtered = squad.filter(s => {
        const matchName = s.name.toLowerCase().includes(term) || s.id.toLowerCase().includes(term);
        const matchStatus = statusF === 'ALL' || s.status === statusF;
        const matchUnit = unitF === 'ALL' || s.unit.includes(unitF);
        return matchName && matchStatus && matchUnit;
    });

    filtered.forEach(s => {
        let statusClass = 'safe';
        if(s.status === 'CRITICAL') statusClass = 'critical';
        if(s.status === 'STATIONARY') statusClass = 'warning';

        const div = document.createElement('div');
        div.className = `roster-card ${activeSoldier.id === s.id ? 'active-card' : ''}`;
        div.innerHTML = `
            <img src="${s.avatar}" class="roster-avatar">
            <div class="roster-info">
                <h4>${s.id}</h4>
                <p>${s.name}</p>
            </div>
            <div class="roster-status ${statusClass}"></div>
        `;
        div.onclick = () => loadSoldier(s);
        rosterListEl.appendChild(div);
    });
}

function loadSoldier(s) {
    activeSoldier = s;
    renderRoster(); // Update active class
    
    // Update Profile
    sAvatar.src = s.avatar;
    sName.innerText = s.name;
    sId.innerText = s.id;
    sRank.innerText = s.rank;
    sUnit.innerText = s.unit;
    sBlood.innerText = s.blood;
    sAge.innerText = s.age;
    sHeight.innerText = s.height;
    sWeight.innerText = s.weight;

    // Update Mission & Device
    sObjective.innerText = s.mission.obj;
    sRisk.innerText = s.mission.risk;
    sRisk.className = s.mission.risk === 'EXTREME' ? 'critical highlight' : s.mission.risk === 'HIGH' ? 'warning' : 'highlight';
    sDuration.innerText = s.mission.dur;
    sBattery.innerText = `${s.device.bat}%`;

    // Update Rings
    updateRing(ringSpo2, valSpo2, s.biometrics.spo2);
    updateRing(ringStress, valStress, s.biometrics.stress);
    updateRing(ringFatigue, valFatigue, s.biometrics.fatigue);

    // AI Text
    printToAI(s.aiText);

    // Reset Charts with new random data based on their state
    generateChartData();
}

function updateRing(ringEl, textEl, percentage) {
    textEl.innerText = percentage + (ringEl.id === 'ring-spo2' ? '%' : '');
    const dashArray = `${percentage}, 100`;
    ringEl.setAttribute('stroke-dasharray', dashArray);
}

// Chart.js Setup
Chart.defaults.color = '#8892b0';
Chart.defaults.font.family = 'Rajdhani';

function initCharts() {
    const hrCtx = document.getElementById('hrChart').getContext('2d');
    hrChart = new Chart(hrCtx, {
        type: 'line',
        data: { labels: [], datasets: [{ label: 'BPM', borderColor: '#39ff14', data: [], tension: 0.4, pointRadius: 0 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { display: false } } }
    });

    const stressCtx = document.getElementById('stressChart').getContext('2d');
    stressChart = new Chart(stressCtx, {
        type: 'bar',
        data: { labels: [], datasets: [{ label: 'Stress', backgroundColor: '#ffea00', data: [] }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { display: false } } }
    });
}

function generateChartData() {
    hrChart.data.labels = Array.from({length: 20}, (_, i) => i);
    stressChart.data.labels = Array.from({length: 20}, (_, i) => i);
    
    let baseHr = activeSoldier.status === 'CRITICAL' ? 130 : 80;
    hrChart.data.datasets[0].data = Array.from({length: 20}, () => baseHr + Math.random() * 20);
    
    let baseStress = activeSoldier.biometrics.stress;
    stressChart.data.datasets[0].data = Array.from({length: 20}, () => baseStress - 10 + Math.random() * 20);

    hrChart.update();
    stressChart.update();
}

// AI Terminal Logic
const aiTextEl = document.getElementById('ai-analysis-text');
let isTyping = false;

function printToAI(text) {
    if (isTyping) return;
    isTyping = true;
    aiTextEl.innerText = "";
    let i = 0;
    
    function typeChar() {
        if (i < text.length) {
            aiTextEl.innerText += text.charAt(i);
            i++;
            setTimeout(typeChar, 30);
        } else {
            isTyping = false;
        }
    }
    typeChar();
}

// Logs Generator
const logsEl = document.getElementById('terminal-logs');
const logMessages = [
    "Ping sent to device. Received ACK.",
    "GPS coordinates synced.",
    "Heart rate anomaly resolved.",
    "Syncing telemetry payload...",
    "Thermal scan completed.",
    "Battery saving mode inactive."
];

function generateLog() {
    const div = document.createElement('div');
    div.className = 'log-entry';
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    
    let msg = logMessages[Math.floor(Math.random() * logMessages.length)];
    if(activeSoldier.status === 'CRITICAL' && Math.random() > 0.5) {
        msg = "<span class='log-alert'>WARNING: Vitals threshold exceeded.</span>";
    }

    div.innerHTML = `<span class="log-time">[${time}]</span> ${msg}`;
    logsEl.prepend(div);
    
    if(logsEl.children.length > 20) {
        logsEl.removeChild(logsEl.lastChild);
    }
}

// Event Listeners
searchInput.addEventListener('input', renderRoster);
filterStatus.addEventListener('change', renderRoster);
filterUnit.addEventListener('change', renderRoster);

// Boot sequence
initCharts();
renderRoster();
loadSoldier(squad[0]);

setInterval(generateLog, 3000);
generateLog();
