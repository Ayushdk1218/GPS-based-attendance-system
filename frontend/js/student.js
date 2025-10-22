// js/student.js
let html5QrScanner = null;
const statusBox = document.getElementById('statusBox');
const summaryBox = document.getElementById('summaryBox');

function setStatus(msg){ if(statusBox) statusBox.textContent = msg; }

async function getLocationOnce(){
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('Geolocation not supported'));
    navigator.geolocation.getCurrentPosition(pos => {
      resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy });
    }, err => reject(err), { enableHighAccuracy: true, timeout: 12000, maximumAge:0 });
  });
}

// scanner controls
document.getElementById('startScan').addEventListener('click', async () => {
  if (!window.Html5Qrcode) return setStatus('Scanner library missing');
  if (html5QrScanner) return setStatus('Scanner already running');
  const readerId = 'qr-reader';
  html5QrScanner = new Html5Qrcode(readerId);
  Html5Qrcode.getCameras().then(cameras => {
    const cameraId = cameras && cameras[0] ? cameras[0].id : null;
    if (!cameraId) return setStatus('No camera found');
    html5QrScanner.start({ facingMode: 'environment' }, { fps: 10, qrbox: 250 }, qrText => {
      setStatus('QR scanned — validating...');
      html5QrScanner.stop().catch(()=>{});
      html5QrScanner = null;
      handleScannedPayload(qrText);
    }, err => {
      // ignore frequent decode errors
    }).catch(e => setStatus('Failed to start scanner: ' + e.message));
  }).catch(e => setStatus('No camera access: ' + e.message));
});

document.getElementById('stopScan').addEventListener('click', ()=>{
  if (html5QrScanner) html5QrScanner.stop().then(()=>{ html5QrScanner = null; setStatus('Scanner stopped'); }).catch(()=>{});
});

// handle manual code submit
document.getElementById('submitCode').addEventListener('click', ()=>{
  const code = document.getElementById('codeInput').value.trim();
  if(!code) return setStatus('Enter code');
  handleScannedPayload(code);
});

async function handleScannedPayload(payload){
  try{
    setStatus('Acquiring location...');
    const loc = await getLocationOnce();
    setStatus(`Sending to server (accuracy ${Math.round(loc.accuracy)} m)`);
    const body = { qrPayload: payload, lat: loc.lat, lng: loc.lng, accuracy: loc.accuracy, clientTimestamp: new Date().toISOString() };
    const res = await postJson('/api/attendance/mark', body);
    setStatus(`Result: ${res.status} — distance ${res.distanceMeters?.toFixed(1) ?? 'n/a'} m`);
    await loadSummary();
  } catch(err){
    console.error(err); setStatus('Error: ' + (err.message || err));
  }
}

// summary loader (example uses /api/attendance/me endpoint)
async function loadSummary(){
  try{
    summaryBox.innerHTML = '<p class="muted">Loading...</p>';
    const data = await getJson('/api/attendance/me');
    if(!data || !data.summary) { summaryBox.innerHTML = '<p class="muted">No records</p>'; return; }
    // render summary
    const html = `\n      <p>Total lectures: ${data.summary.total}</p>\n      <p>Present: ${data.summary.present} | Absent: ${data.summary.absent}</p>\n      <div style="margin-top:8px"><a class="link" href="student_report.html">View detailed report</a></div>\n    `;
    summaryBox.innerHTML = html;
  }catch(e){ console.warn(e); summaryBox.innerHTML = '<p class="muted">Failed to load</p>'; }
}

// run initial summary load
loadSummary();