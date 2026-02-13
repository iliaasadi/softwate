/**
 * Team 13 API Client — Places, Events, Routes, Emergency.
 * Appends format=json to all requests. CSRF helper for POST (rating).
 */

/** مسیر پایهٔ API تیم ۱۳ — همیشه به صورت مطلق مثلاً /team13 تا درخواست‌ها به بک‌اند درست بروند */
const API_BASE = (window.TEAM13_API_BASE || '/team13').replace(/\/$/, '');

/**
 * Get CSRF token from cookie (Django's csrftoken cookie).
 * @returns {string|null}
 */
function getCsrfToken() {
  const name = 'csrftoken';
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === name + '=') {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}


/**
 * Fetch JSON from a team13 endpoint. Automatically appends format=json.
 * @param {string} endpoint - Path relative to API_BASE, e.g. 'places/' or 'routes/'
 * @param {Record<string, string>} [params] - Optional query params (merged with format=json)
 * @returns {Promise<object>} Parsed JSON
 */
async function fetchData(endpoint, params = {}) {
  const path = endpoint.startsWith('http') ? endpoint : API_BASE + '/' + (endpoint || '').replace(/^\//, '');
  const url = new URL(path, window.location.origin);
  const query = { format: 'json', ...params };
  Object.keys(query).forEach(key => {
    if (query[key] != null && query[key] !== '') url.searchParams.set(key, query[key]);
  });
  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: { Accept: 'application/json' },
    credentials: 'same-origin',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  return res.json();
}

/**
 * POST for rating (place or event). Sends CSRF via header and form body.
 * @param {string} url - Path relative to API_BASE, e.g. places/<uuid>/rate/
 * @param {{ rating: number }} data - e.g. { rating: 5 }
 * @returns {Promise<Response>}
 */
async function postRating(url, data) {
  const csrf = getCsrfToken();
  const body = new URLSearchParams(data);
  if (csrf) body.append('csrfmiddlewaretoken', csrf);
  const fullUrl = url.startsWith('http') ? url : API_BASE + '/' + (url || '').replace(/^\//, '');
  return fetch(fullUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-CSRFToken': csrf || '',
      'Accept': 'application/json',
    },
    body: body.toString(),
    credentials: 'same-origin',
  });
}