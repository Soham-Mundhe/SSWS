// Settings Logic

const timeEl = document.getElementById('live-time');
setInterval(() => {
    timeEl.innerText = new Date().toLocaleTimeString('en-US', { hour12: false });
}, 1000);

// Simulated System Monitor
const cpuVal = document.getElementById('cpu-val');
const cpuBar = document.getElementById('cpu-bar');

const memVal = document.getElementById('mem-val');
const memBar = document.getElementById('mem-bar');

const netVal = document.getElementById('net-val');
const netBar = document.getElementById('net-bar');

function updateMonitor() {
    // CPU: 30-80%
    const cpu = 30 + Math.floor(Math.random() * 50);
    cpuVal.innerText = `${cpu}%`;
    cpuBar.style.width = `${cpu}%`;
    
    if (cpu > 70) {
        cpuBar.style.backgroundColor = 'var(--warning-yellow)';
        cpuBar.style.boxShadow = '0 0 10px var(--warning-yellow)';
    } else {
        cpuBar.style.backgroundColor = 'var(--neon-cyan)';
        cpuBar.style.boxShadow = '0 0 10px var(--neon-cyan)';
    }

    // Memory: 6-12 GB out of 16 (approx 35-75%)
    const memPercent = 35 + Math.floor(Math.random() * 40);
    const memGB = (16 * (memPercent / 100)).toFixed(1);
    memVal.innerText = `${memGB} GB`;
    memBar.style.width = `${memPercent}%`;

    // Network: 50 - 300 Mbps (approx 10-60% of theoretical 500 max)
    const net = 50 + Math.floor(Math.random() * 250);
    const netPercent = (net / 500) * 100;
    netVal.innerText = `${net} Mbps`;
    netBar.style.width = `${netPercent}%`;
}

// Update monitor every 2 seconds
setInterval(updateMonitor, 2000);
updateMonitor();
