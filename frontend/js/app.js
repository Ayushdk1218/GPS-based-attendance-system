// js/app.js - shared helpers
const API_BASE = ''; // set backend base url if your API runs on another origin

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
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

async function getJson(path) {
  const res = await fetch(API_BASE + path, { headers: {...authHeaders()} });
  if (!res.ok) throw new Error('Fetch failed');
  return res.json();
}