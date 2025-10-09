// student scanning + geolocation flow

const statusEl = document.getElementById('status');
const manualPayload = document.getElementById('manualPayload');
const manualSubmit = document.getElementById('manualSubmit');

function setStatus(text){
  statusEl.textContent = 'Status: ' + text;
}

// helper to get high-accuracy location
function getLocationOnce(timeout = 10000) {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('Geolocation not supported'));
    navigator.geolocation.getCurrentPosition(
      pos => {
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy
        });
      },
      err => reject(err),
      { enableHighAccuracy: true, timeout, maximumAge: 0 }
    );
  });
}

// submission flow
async function submitAttendance(qrPayload, lectureId){
  setStatus('Requesting location...');
  try {
    const loc = await getLocationOnce();
    setStatus(`Got location (accuracy ${Math.round(loc.accuracy)} m). Sending...`);
    const body = {
      qrPayload, lectureId,
      lat: loc.lat, lng: loc.lng, accuracy: loc.accuracy,
      clientTimestamp: new Date().toISOString()
    };
    const res = await postJson('/api/attendance/mark', body);
    setStatus(`Server: ${res.status} (distance: ${res.distanceMeters?.toFixed(1) ?? 'n/a'} m)`);
  } catch (err) {
    console.error(err);
    if (err.code === 1) setStatus('Location permission denied. Please allow location access in browser settings.');
    else setStatus('Error: ' + (err.message || err));
  }
}

// manual submit handler
manualSubmit.addEventListener('click', async () => {
  const payload = manualPayload.value.trim();
  if (!payload) return alert('Enter qrPayload or lectureId');
  // If payload is only lectureId, set lectureId var
  const possibleLectureId = parseInt(payload, 10);
  if (!isNaN(possibleLectureId)) {
    await submitAttendance(null, possibleLectureId);
  } else {
    await submitAttendance(payload, null);
  }
});

// camera scanning using html5-qrcode (if available)
if (window.Html5Qrcode) {
  const qrRegion = document.getElementById('qr-reader');
  const html5Qr = new Html5Qrcode("qr-reader");
  Html5Qrcode.getCameras().then(cameras => {
    const cameraId = cameras && cameras[0] ? cameras[0].id : null;
    if (!cameraId) {
      setStatus('No camera found.');
      return;
    }
    html5Qr.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: 250 },
      qrText => {
        // qrText is the scanned text payload
        setStatus('QR scanned, obtaining location...');
        html5Qr.stop().catch(()=>{});
        // Try to parse lectureId from qrText if it's a URL or payload
        let lectureId = null;
        try {
          const u = new URL(qrText);
          // if qr contains url with payload param
          if (u.searchParams.has('payload') || u.searchParams.has('lectureId')) {
            const p = u.searchParams.get('payload') || u.searchParams.get('lectureId');
            // if numeric -> lectureId
            const n = parseInt(p,10);
            if (!isNaN(n)) lectureId = n;
            // else treat p as qrPayload
            submitAttendance(p, lectureId);
            return;
          }
        } catch(e){ /* not a url */ }

        // default: treat scanned text as qrPayload
        submitAttendance(qrText, null);
      },
      error => {
        // scanning error (ignore often)
      }
    ).catch(err => {
      console.error('QR start failed', err);
      setStatus('Failed to start camera QR scanner.');
    });
  }).catch(err => {
    console.warn('No cameras', err);
  });
} else {
  setStatus('Camera scanner not available (html5-qrcode not loaded). Use manual input or QR link.');
}
