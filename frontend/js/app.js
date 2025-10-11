// small helper functions for frontend
const API_BASE = ''; // backend origin if needed e.g. 'http://localhost:8080'

function authHeaders() {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': 'Bearer ' + token } : {};
}

async function postJson(path, body) {
  const res = await fetch(API_BASE + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(body)
  });
  const data = await res.json().catch(()=>({}));
  if (!res.ok) {
    const msg = data.message || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

async function getJson(path) {
  const res = await fetch(API_BASE + path, { headers: {...authHeaders()} });
  const data = await res.json();
  if (!res.ok) throw new Error('Fetch failed');
  return data;
}
