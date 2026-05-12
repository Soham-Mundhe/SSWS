// Reports Logic

const timeEl = document.getElementById('live-time');
setInterval(() => {
    timeEl.innerText = new Date().toLocaleTimeString('en-US', { hour12: false });
}, 1000);

Chart.defaults.color = '#8892b0';
Chart.defaults.font.family = 'Rajdhani';

// Trend Chart (Health)
const trendCtx = document.getElementById('trendChart').getContext('2d');
new Chart(trendCtx, {
    type: 'line',
    data: {
        labels: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
        datasets: [
            {
                label: 'Avg SpO2 %',
                data: [98, 97, 96.5, 95, 96, 98, 97.5],
                borderColor: '#00f3ff',
                backgroundColor: 'rgba(0, 243, 255, 0.1)',
                tension: 0.4,
                fill: true
            },
            {
                label: 'Avg Stress Index',
                data: [30, 35, 45, 60, 55, 40, 32],
                borderColor: '#ffea00',
                backgroundColor: 'transparent',
                tension: 0.4,
                borderDash: [5, 5]
            }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: { grid: { color: 'rgba(255,255,255,0.05)' }, min: 0, max: 100 },
            x: { grid: { color: 'rgba(255,255,255,0.05)' } }
        },
        plugins: { legend: { labels: { color: '#e6f1ff' } } }
    }
});

// Env Chart (Hazards)
const envCtx = document.getElementById('envChartReport').getContext('2d');
new Chart(envCtx, {
    type: 'bar',
    data: {
        labels: ['Sector 1', 'Sector 2', 'Sector 3', 'Sector 4', 'Sector 5'],
        datasets: [
            {
                label: 'Toxic Gas Events',
                data: [2, 0, 5, 18, 1],
                backgroundColor: '#ff003c'
            },
            {
                label: 'Extreme Temp Events',
                data: [0, 1, 2, 8, 4],
                backgroundColor: '#ffea00'
            }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: { grid: { color: 'rgba(255,255,255,0.05)' } },
            x: { grid: { display: false } }
        },
        plugins: { legend: { labels: { color: '#e6f1ff' } } }
    }
});

// AI Terminal Typewriter
const aiTextEl = document.getElementById('ai-report-text');
const fullText = aiTextEl.innerText;
aiTextEl.innerText = "";
let i = 0;

function typeAI() {
    if (i < fullText.length) {
        aiTextEl.innerText += fullText.charAt(i);
        i++;
        setTimeout(typeAI, 20 + Math.random() * 30);
    }
}
setTimeout(typeAI, 500);
