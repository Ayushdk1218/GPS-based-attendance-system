// js/teacher.js
const qrResult = document.getElementById('qrResult');
const attendanceTable = document.getElementById('attendanceTable');

async function renderAttendance(list){
  if(!list || list.length===0) return attendanceTable.innerHTML = '<p class="muted">No attendance yet</p>';
  let rows = `<table class="styled-table"><thead><tr><th>Roll</th><th>Name</th><th>Status</th><th>Marked At</th></tr></thead><tbody>`;
  for(const r of list){
    rows += `<tr><td>${r.roll_no||'-'}</td><td>${r.name||'-'}</td><td>${r.status}</td><td>${r.marked_at||'-'}</td></tr>`;
  }
  rows += '</tbody></table>';
  attendanceTable.innerHTML = rows;
}

// create lecture handler
document.getElementById('createLectureForm').addEventListener('submit', async (e)=>{
  e.preventDefault();
  const subject = document.getElementById('subject').value.trim();
  const scheduledAt = document.getElementById('scheduledAt').value;
  const lat = parseFloat(document.getElementById('lat').value);
  const lng = parseFloat(document.getElementById('lng').value);
  const radius = parseInt(document.getElementById('radius').value,10) || 50;
  try{
    const payload = { subject, scheduledAt, latitude: lat, longitude: lng, radiusMeters: radius };
    const data = await postJson('/api/teacher/lectures', payload);
    // expected: { lectureId, qrImageUrl, qrPayload, code }
    if(data.qrImageUrl){ qrResult.innerHTML = `<img src="${data.qrImageUrl}" style="max-width:220px" alt="QR"/>`; }
    else if(data.qrPayload){ qrResult.innerHTML = `<pre class="muted">${data.qrPayload}</pre><div style="margin-top:8px"><img src="https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=${encodeURIComponent(data.qrPayload)}"/></div>`; }
    if(data.code){ qrResult.innerHTML += `<p>Code: <strong>${data.code}</strong></p>`; }

    // auto-fetch attendance for this created lecture (if backend returns lectureId)
    if(data.lectureId) { loadAttendanceForLecture(data.lectureId); }
  }catch(err){ console.error(err); qrResult.innerHTML = `<p class="muted">Failed to create lecture: ${err.message}</p>`; }
});

async function loadAttendanceForLecture(lectureId){
  try{
    attendanceTable.innerHTML = '<p class="muted">Loading...</p>';
    const data = await getJson(`/api/teacher/lectures/${lectureId}/attendance`);
    renderAttendance(data.attendance || []);
  }catch(e){ console.error(e); attendanceTable.innerHTML = '<p class="muted">Failed to load attendance</p>'; }
}