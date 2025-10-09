document.getElementById('lectureForm').addEventListener('submit', async e => {
  e.preventDefault();
  const subject = document.getElementById('subject').value.trim();
  const scheduledAt = document.getElementById('scheduledAt').value; // local datetime input
  const lat = parseFloat(document.getElementById('lat').value);
  const lng = parseFloat(document.getElementById('lng').value);
  const radius = parseInt(document.getElementById('radius').value, 10) || 50;

  // basic validation
  if (!subject || !scheduledAt || isNaN(lat) || isNaN(lng)) {
    return alert('Please fill required fields');
  }

  try {
    const payload = {
      subject,
      scheduledAt, // backend should parse ISO or adjust
      latitude: lat,
      longitude: lng,
      radiusMeters: radius
    };
    // send to backend - teacher auth required
    const data = await postJson('/api/teacher/lectures', payload);
    // backend should return qrImageUrl or qrPayload
    const qrArea = document.getElementById('qrArea');
    qrArea.innerHTML = '';
    if (data.qrImageUrl) {
      const img = document.createElement('img');
      img.src = data.qrImageUrl;
      img.alt = 'QR for lecture';
      img.style.maxWidth = '260px';
      qrArea.appendChild(img);
    } else if (data.qrPayload) {
      // show payload and a small generated QR using a public API for preview (optional)
      const p = document.createElement('pre'); p.textContent = data.qrPayload;
      qrArea.appendChild(p);
      // quick client-side QR preview (if you want) using Google Chart API (for demo only)
      const img = document.createElement('img');
      img.src = `https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=${encodeURIComponent(data.qrPayload)}`;
      qrArea.appendChild(img);
    } else {
      qrArea.textContent = 'Created lecture. No QR returned from server.';
    }
  } catch (err) {
    console.error(err);
    alert('Failed to create lecture: ' + (err.message || err));
  }
});
