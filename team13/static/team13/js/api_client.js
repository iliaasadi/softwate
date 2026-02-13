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


/**
 * POST JSON to an endpoint (e.g. map-matching). Sends CSRF via header.
 */
async function postJson(endpoint, data) {
  const csrf = getCsrfToken();
  const fullUrl = endpoint.startsWith('http') ? endpoint : API_BASE + '/' + (endpoint || '').replace(/^\//, '');
  const res = await fetch(fullUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrf || '',
      'Accept': 'application/json',
    },
    body: JSON.stringify(data),
    credentials: 'same-origin',
  });
  if (!res.ok) throw new Error('HTTP ' + res.status + ': ' + res.statusText);
  return res.json();
}


// Convenience API names — مسیرها نسبی به API_BASE (مثلاً /team13)
const api = {
  places: (params) => fetchData('places/', params),
  placeDetail: (placeId) => fetchData(`places/${placeId}/`),
  placeRate: (placeId, rating) => postRating(`places/${placeId}/rate/`, { rating }),
  events: (params) => fetchData('events/', params || {}),
  eventDetail: (eventId) => fetchData(`events/${eventId}/`),
  eventRate: (eventId, rating) => postRating(`events/${eventId}/rate/`, { rating }),
  routes: (sourcePlaceId, destinationPlaceId, travelMode = 'car', options = {}) => {
    const params = {
      source_place_id: sourcePlaceId,
      destination_place_id: destinationPlaceId,
      travel_mode: travelMode,
    };
    if (options.no_traffic) params.no_traffic = '1';
    if (options.bearing != null && options.bearing >= 0 && options.bearing <= 360) params.bearing = String(options.bearing);
    if (options.avoid_traffic_zone) params.avoid_traffic_zone = '1';
    if (options.avoid_odd_even_zone) params.avoid_odd_even_zone = '1';
    if (options.alternative) params.alternative = '1';
    return fetchData('routes/', params);
  },
  emergency: (lat, lon, limit = 50, radiusKm = 10) => {
    const params = { lat: String(lat), lon: String(lon), limit: String(limit), radius_km: String(radiusKm) };
    return fetchData('emergency/', params);
  },
  tsp: (waypoints, options = {}) => {
    const params = {};
    if (Array.isArray(waypoints) && waypoints.length >= 2) {
      params.waypoints = waypoints.map(w => (Array.isArray(w) ? w[0] + ',' + w[1] : (w.lat + ',' + w.lng))).join('|');
    } else if (typeof waypoints === 'string' && waypoints.indexOf('|') !== -1) {
      params.waypoints = waypoints;
    } else {
      return Promise.reject(new Error('waypoints باید آرایه‌ای از حداقل دو نقطه [lat,lng] یا رشتهٔ lat,lng|lat,lng باشد'));
    }
    if (options.round_trip !== undefined) params.round_trip = options.round_trip ? '1' : '0';
    if (options.source_is_any_point !== undefined) params.source_is_any_point = options.source_is_any_point ? '1' : '0';
    if (options.last_is_any_point !== undefined) params.last_is_any_point = options.last_is_any_point ? '1' : '0';
    return fetchData('tsp/', params);
  },
  distanceMatrix: (origins, destinations, options = {}) => {
    const toStr = (points) => {
      if (typeof points === 'string') return points;
      if (Array.isArray(points) && points.length > 0) {
        return points.map(p => (Array.isArray(p) ? p[0] + ',' + p[1] : (p.lat + ',' + p.lng))).join('|');
      }
      return '';
    };
    const o = toStr(origins);
    const d = toStr(destinations);
    if (!o || !d) return Promise.reject(new Error('origins و destinations الزامی هستند (آرایه یا رشتهٔ lat,lng|...)'));
    const params = { origins: o, destinations: d };
    if (options.type === 'motorcycle') params.type = 'motorcycle';
    if (options.no_traffic) params.no_traffic = '1';
    return fetchData('distance-matrix/', params);
  },
  isochrone: (lat, lng, options = {}) => {
    const params = { lat: String(lat), lng: String(lng) };
    if (options.distance_km != null) params.distance = String(options.distance_km);
    if (options.time_minutes != null) params.time = String(options.time_minutes);
    if (options.polygon) params.polygon = '1';
    if (options.denoise != null && options.denoise >= 0 && options.denoise <= 1) params.denoise = String(options.denoise);
    if (params.distance === undefined && params.time === undefined) return Promise.reject(new Error('حداقل distance_km یا time_minutes الزامی است'));
    return fetchData('isochrone/', params);
  },
  search: (term, options = {}) => {
    const params = { q: String(term || '').trim() };
    if (params.q === '') return Promise.resolve({ count: 0, items: [] });
    if (options.lat != null && options.lng != null) { params.lat = String(options.lat); params.lng = String(options.lng); }
    if (options.limit != null) params.limit = String(Math.min(30, Math.max(1, Number(options.limit))));
    return fetchData('neshan-search/', params);
  },
  /**
   * تبدیل آدرس متنی به مختصات (Geocoding) نشان.
   * @param {string} address - آدرس مورد نظر
   * @param {{ province?: string, city?: string, lat?: number, lng?: number, plus?: boolean, extent?: { southWest: {latitude,longitude}, northEast: {latitude,longitude} } }} [options]
   * @returns {Promise<{ items: Array<{ location: { latitude, longitude }, province, city, neighbourhood, unMatchedTerm }> }>}
   */
  geocode: (address, options = {}) => {
    const params = { address: String(address || '').trim() };
    if (params.address === '') return Promise.resolve({ items: [] });
    if (options.province) params.province = String(options.province);
    if (options.city) params.city = String(options.city);
    if (options.lat != null && options.lng != null) {
      params.lat = String(options.lat);
      params.lng = String(options.lng);
    }
    if (options.plus) params.plus = '1';
    if (options.extent && options.extent.southWest && options.extent.northEast) {
      const sw = options.extent.southWest;
      const ne = options.extent.northEast;
      params.sw_lat = String(sw.latitude);
      params.sw_lng = String(sw.longitude);
      params.ne_lat = String(ne.latitude);
      params.ne_lng = String(ne.longitude);
    }
    return fetchData('geocode/', params);
  },
  mapMatching: (path) => {
    let pathStr;
    if (typeof path === 'string') {
      pathStr = path.trim();
      if (pathStr.indexOf('|') === -1) return Promise.reject(new Error('path باید حداقل دو نقطه به صورت lat,lng|lat,lng داشته باشد'));
    } else if (Array.isArray(path) && path.length >= 2) {
      pathStr = path.map(p => (Array.isArray(p) ? p[0] + ',' + p[1] : (p.lat + ',' + p.lng))).join('|');
    } else {
      return Promise.reject(new Error('path باید رشتهٔ lat,lng|... یا آرایهٔ حداقل دو نقطه باشد'));
    }
    return postJson('map-matching/', { path: pathStr });
  },
};



/**
 * Load places and events from backend for map and sidebar.
 * GET requests; no CSRF required.
 * @returns {Promise<{ places: Array, events: Array }>}
 */
async function loadMapData() {
  const baseUrl = window.location.origin + (API_BASE || '/team13');
  const [placesRes, eventsRes] = await Promise.all([
    fetch(`${baseUrl}/places/?format=json`, { method: 'GET', headers: { Accept: 'application/json' }, credentials: 'same-origin' }),
    fetch(`${baseUrl}/events/?format=json`, { method: 'GET', headers: { Accept: 'application/json' }, credentials: 'same-origin' }),
  ]);
  if (!placesRes.ok) throw new Error('Places fetch failed: ' + placesRes.status);
  if (!eventsRes.ok) throw new Error('Events fetch failed: ' + eventsRes.status);
  const placesData = await placesRes.json();
  const eventsData = await eventsRes.json();
  return {
    places: placesData.places || [],
    events: eventsData.events || [],
  };
}

/**
 * مسیریابی و ETA از بک‌اند (Haversine). خط مسیر فعلاً مستقیم (مبدأ–مقصد)؛ بعداً با API جدید جایگزین می‌شود.
 */
function toTravelMode(serviceType) {
  const mode = String(serviceType).toLowerCase();
  if (mode === 'walking') return 'walk';
  if (mode === 'bicycle') return 'bicycle';
  if (mode === 'transit') return 'transit';
  return 'car';
}

/**
 * استخراج مختصات مسیر از پاسخ مسیریابی نشان (overview_polyline یا legs[].steps[].polyline).
 * مستندات: https://platform.neshan.org/docs/sdk/web/mapboxgl/examples/neshan-mapbox-draw-route/
 * @param {object} routeGeometry - routes[0] از پاسخ API نشان
 * @returns {Array<[number,number]>} آرایهٔ [lat, lng] برای L.polyline؛ در صورت خطا null
 */
function decodeRouteGeometry(routeGeometry) {
  if (!routeGeometry || typeof polyline === 'undefined' || typeof polyline.decode !== 'function') return null;
  const precision = 5;
  const points = [];
  try {
    const overviewEncoded = (routeGeometry.overview_polyline && routeGeometry.overview_polyline.points) || (typeof routeGeometry.overview_polyline === 'string' ? routeGeometry.overview_polyline : null);
    if (overviewEncoded && typeof overviewEncoded === 'string') {
      const decoded = polyline.decode(overviewEncoded, precision);
      decoded.forEach((p) => points.push([p[0], p[1]]));
    }
    if (points.length === 0 && routeGeometry.legs && Array.isArray(routeGeometry.legs)) {
      for (const leg of routeGeometry.legs) {
        const steps = leg.steps || [];
        for (const step of steps) {
          const encoded = step.polyline;
          if (encoded && typeof encoded === 'string') {
            const decoded = polyline.decode(encoded, precision);
            decoded.forEach((p) => points.push([p[0], p[1]]));
          }
        }
      }
    }
    return points.length > 0 ? points : null;
  } catch (e) {
    return null;
  }
}


function drawStraightRouteLine(map, startLat, startLng, destLat, destLng, routeGeometry) {
  if (!map || typeof L === 'undefined') return;
  let linePoints = null;
  if (routeGeometry) linePoints = decodeRouteGeometry(routeGeometry);
  if (!linePoints || linePoints.length === 0) linePoints = [[startLat, startLng], [destLat, destLng]];
  if (window.currentPath && map) map.removeLayer(window.currentPath);
  if (window.routeLayer && map) map.removeLayer(window.routeLayer);
  if (window.currentRoute && map) map.removeLayer(window.currentRoute);
  if (window.team13RouteLine && map) map.removeLayer(window.team13RouteLine);
  const routePane = map.getPane && map.getPane('team13-route-pane') ? 'team13-route-pane' : 'overlayPane';
  window.currentPath = L.polyline(linePoints, {
    color: '#40916c',
    weight: 6,
    opacity: 1,
    pane: routePane,
  }).addTo(map);
  if (window.currentPath.bringToFront) window.currentPath.bringToFront();
  window.routeLayer = window.currentPath;
  window.currentRoute = window.currentPath;
  window.team13RouteLine = window.currentPath;
  map.fitBounds(window.currentPath.getBounds(), { padding: [40, 40] });
}

