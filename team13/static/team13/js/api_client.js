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