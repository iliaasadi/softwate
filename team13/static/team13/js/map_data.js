/**
 * Team 13 — همگام‌سازی لایه‌ها، جستجو، مسیریابی و ETA از بک‌اند، مراکز امدادی.
 * جستجوی آدرس با API جدید بعداً اضافه می‌شود.
 */
(function () {
  var SAGE_GREEN = '#40916c';
  var EVENT_MARKER_COLOR = '#c1121f';

  if (typeof window !== 'undefined') {
    window.allMarkers = window.allMarkers || {};
    window.currentlyShownPoiMarker = window.currentlyShownPoiMarker || null;
    window.emergencyPoiMarker = window.emergencyPoiMarker || null;
    window._team13PoiIconsVisible = window._team13PoiIconsVisible !== false;
    window.isPlacementMode = false;
  }

  function getMap() {
    return window.team13MapInstance || null;
  }

  function getConfig() {
    return window.MAPIR_CONFIG || {};
  }

  function escapeHtml(s) {
    if (!s) return '';
    var div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;

     var POI_ICON_MAP = {
    food: { emoji: '🍴', color: '#f97316', label: 'رستوران' },
    restaurant: { emoji: '🍴', color: '#f97316', label: 'رستوران' },
    hotel: { emoji: '🏨', color: '#2563eb', label: 'هتل' },
    hospital: { emoji: '🏥', color: '#dc2626', label: 'بیمارستان' },
    museum: { emoji: '🏛️', color: '#92400e', label: 'موزه' },
    entertainment: { emoji: '🎡', color: '#16a34a', label: 'تفریحی' },
    gym: { emoji: '🏋️', color: '#059669', label: 'ورزشگاه' },
    other: { emoji: '📍', color: SAGE_GREEN, label: 'سایر' },
  };

  function getPoiIconConfig(type) {
    var t = (type || '').toLowerCase().trim();
    return POI_ICON_MAP[t] || POI_ICON_MAP.other;
  }

  function createPlaceIcon(type) {
    if (typeof L === 'undefined') return null;
    var cfg = getPoiIconConfig(type);
    var html = '<span class="team13-poi-pin" style="' +
      'width:32px;height:32px;background:' + cfg.color + ';' +
      'border:2px solid #fff;border-radius:50%;' +
      'box-shadow:0 3px 10px rgba(0,0,0,0.25);' +
      'display:flex;align-items:center;justify-content:center;' +
      'font-size:16px;line-height:1;">' + cfg.emoji + '</span>';
    return L.divIcon({
      className: 'team13-place-marker team13-poi-marker',
      html: html,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
  }


  function createDiscoveryPlaceIcon(type) {
    if (typeof L === 'undefined') return null;
    var cfg = getPoiIconConfig(type);
    var html = '<span class="team13-poi-pin team13-discovery-marker" style="' +
      'width:32px;height:32px;background:' + cfg.color + ';' +
      'border:2px solid #fff;border-radius:50%;' +
      'box-shadow:0 3px 10px rgba(0,0,0,0.25);' +
      'display:flex;align-items:center;justify-content:center;' +
      'font-size:16px;line-height:1;">' + cfg.emoji + '</span>';
    return L.divIcon({
      className: 'team13-place-marker team13-discovery-marker',
      html: html,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
  }

  function createEventIcon() {
    if (typeof L === 'undefined') return null;
    return L.divIcon({
      className: 'team13-event-marker',
      html: '<span style="width:22px;height:22px;background:' + EVENT_MARKER_COLOR + ';border:2px solid #9d0208;border-radius:4px;display:block;box-shadow:0 2px 4px rgba(0,0,0,0.2);"></span>',
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    });
  }

  
  function createSearchResultIcon() {
    if (typeof L === 'undefined') return null;
    return L.divIcon({
      className: 'team13-search-marker',
      html: '<span style="width:20px;height:20px;background:#2563eb;border:2px solid #1d4ed8;border-radius:50%;display:block;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></span>',
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
  }

  function createSelectedPlaceIcon() {
    if (typeof L === 'undefined') return null;
    return L.divIcon({
      className: 'team13-place-marker team13-marker-selected',
      html: '<span style="width:24px;height:24px;background:' + SAGE_GREEN + ';border:2px solid #1b4332;border-radius:50%;display:block;box-shadow:0 2px 8px rgba(64,145,108,0.5);"></span>',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  }

  function createSelectedEventIcon() {
    if (typeof L === 'undefined') return null;
    return L.divIcon({
      className: 'team13-event-marker team13-marker-selected',
      html: '<span style="width:22px;height:22px;background:' + SAGE_GREEN + ';border:2px solid #1b4332;border-radius:4px;display:block;box-shadow:0 2px 8px rgba(64,145,108,0.5);"></span>',
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    });
  }

  function createEmergencyPoiIcon() {
    if (typeof L === 'undefined') return null;
    return L.divIcon({
      className: 'team13-emergency-poi-marker team13-marker-selected',
      html: '<span style="width:26px;height:26px;background:' + SAGE_GREEN + ';border:2px solid #1b4332;border-radius:50%;display:block;box-shadow:0 2px 10px rgba(64,145,108,0.6);"></span>',
      iconSize: [26, 26],
      iconAnchor: [13, 13],
    });
  }

  function createStartMarkerIcon() {
    if (typeof L === 'undefined') return null;
    return L.divIcon({
      className: 'team13-route-start-marker',
      html: '<span style="width:28px;height:28px;background:#22c55e;border:2px solid #1b4332;border-radius:50%;display:block;box-shadow:0 2px 8px rgba(0,0,0,0.25);font-size:12px;line-height:24px;text-align:center;color:#fff;font-weight:bold;">A</span>',
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });
  }

  function createDestMarkerIcon() {
    if (typeof L === 'undefined') return null;
    return L.divIcon({
      className: 'team13-route-dest-marker',
      html: '<span style="width:28px;height:28px;background:#dc2626;border:2px solid #991b1b;border-radius:50%;display:block;box-shadow:0 2px 8px rgba(0,0,0,0.25);font-size:12px;line-height:24px;text-align:center;color:#fff;font-weight:bold;">B</span>',
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });
  }

  /** Live user location: blue pulse marker (silent, no popup). */
  function createUserLocationIcon() {
    if (typeof L === 'undefined') return null;
    return L.divIcon({
      className: 'team13-user-location-marker',
      html: '<span class="team13-user-location-pulse"></span><span class="team13-user-location-dot"></span>',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
  }

  // --- Popup: Place — همان قالب پاپ‌آپ «انتخاب نقطه» برای یکپارچگی UI ---
  function buildPlacePopupContent(p, lat, lng) {
    var name = (p.name_fa || p.name_en || p.type_display || '').trim() || p.place_id;
    var typeDisplay = (p.type_display || p.type || '').trim() || '—';
    var address = (p.address || p.city || '').trim() || '—';
    var placeId = (p.place_id || p.id || '').toString();
    var base = (window.TEAM13_API_BASE || '/team13').replace(/\/$/, '');
    var detailPageUrl = base + '/places/' + (placeId || '') + '/';
    var rating = p.rating != null && !isNaN(parseFloat(p.rating)) ? parseFloat(p.rating) : null;
    var ratingHtml = rating != null ? ' · امتیاز: ' + rating + '/۵' : '';
    var addressLine = escapeHtml(name) + (typeDisplay !== '—' ? ' · ' + escapeHtml(typeDisplay) : '') + ratingHtml + (address !== '—' ? '<br><span class="text-muted">' + escapeHtml(address) + '</span>' : '');
    var btnDetails = '<button type="button" class="team13-reverse-popup-btn team13-btn-place-details" data-place-id="' + escapeHtml(placeId) + '" data-lat="' + lat + '" data-lng="' + lng + '" data-name="' + escapeHtml(name) + '">جزئیات (امتیاز / نظر / عکس)</button>';
    var linkDetailPage = '<a href="' + escapeHtml(detailPageUrl) + '" class="team13-reverse-popup-btn team13-btn-place-detail-page">صفحهٔ جزئیات مکان</a>';
    var btnRoute = '<button type="button" class="team13-reverse-popup-btn team13-btn-route-to-place" data-lat="' + lat + '" data-lng="' + lng + '" data-name="' + escapeHtml(name) + '">مسیریابی به اینجا</button>';
    return '<div class="team13-reverse-popup-content" dir="rtl">' +
      '<p class="team13-reverse-popup-address">' + addressLine + '</p>' +
      '<div class="team13-reverse-popup-actions">' + btnDetails + ' ' + linkDetailPage + ' ' + btnRoute + '</div>' +
      '</div>';
  }

  // --- Popup: Event — همان قالب پاپ‌آپ «انتخاب نقطه» برای یکپارچگی UI ---
  function buildEventPopupContent(e) {
    var lat = parseFloat(e.latitude);
    var lng = parseFloat(e.longitude);
    var title = (e.title_fa || e.title_en || e.event_id || '').trim();
    var timeText = (e.start_at || e.start_at_iso || '') + (e.end_at || e.end_at_iso ? ' تا ' + (e.end_at || e.end_at_iso) : '');
    var addressLine = escapeHtml(title) + '<br><span class="text-muted">زمان: ' + escapeHtml(timeText || '—') + '</span>';
    var routeBtn = '<button type="button" class="team13-reverse-popup-btn team13-btn-route-to-event" data-lat="' + lat + '" data-lng="' + lng + '" data-name="' + escapeHtml(title) + '">مسیریابی به رویداد</button>';
    return '<div class="team13-reverse-popup-content" dir="rtl">' +
      '<p class="team13-reverse-popup-address">' + addressLine + '</p>' +
      '<div class="team13-reverse-popup-actions">' + routeBtn + '</div>' +
      '</div>';
  }
  function syncDatabaseLayers() {
    var map = getMap();
    if (!map || !window.Team13Api || !window.Team13Api.loadMapData) return Promise.reject(new Error('Map or API not ready'));

    return window.Team13Api.loadMapData().then(function (data) {
      var places = data.places || [];
      var events = data.events || [];
      window._team13PlacesCache = places;
      window._team13EventsCache = events;
      clearPlaceAndEventMarkers(map);
      window.allMarkers = {};
      addPlaceMarkers(map, places);
      addEventMarkers(map, events);
      injectSidebarCards(places, events);
      bindRouteButtonInPopups(map);
      setPoiIconsVisible(window._team13PoiIconsVisible);
      var count = (places.length || 0) + (events.length || 0);
      if (count > 0 && window._team13PoiIconsVisible) {
        setTimeout(function () { setPoiIconsVisible(true); }, 250);
      }
      return { places: places, events: events };
    });
  }

  function clearPlaceAndEventMarkers(map) {
    if (!map) return;
    var allMarkers = window.allMarkers || {};
    Object.keys(allMarkers).forEach(function (id) {
      var m = allMarkers[id];
      if (m && typeof m.remove === 'function') m.remove();
    });
    window.allMarkers = {};
    if (window.currentlyShownPoiMarker) {
      map.removeLayer(window.currentlyShownPoiMarker);
      window.currentlyShownPoiMarker = null;
    }
    if (window.team13PlaceLayerGroup) {
      map.removeLayer(window.team13PlaceLayerGroup);
      window.team13PlaceLayerGroup = null;
    }
    if (window.team13EventLayerGroup) {
      map.removeLayer(window.team13EventLayerGroup);
      window.team13EventLayerGroup = null;
    }
    if (window.team13CityEventLayerGroup) {
      map.removeLayer(window.team13CityEventLayerGroup);
      window.team13CityEventLayerGroup = null;
    }
  }
  
  /**
   * Apply city-based event filter: clear event markers on map, filter by city, render filtered markers, update sidebar, optional center.
   * @param {string|null} cityName - null = show all events in sidebar only (no event markers on map)
   * @param {number|null} centerLat - optional center for map
   * @param {number|null} centerLng - optional center for map
   */
  function applyEventCityFilter(cityName, centerLat, centerLng) {
    var map = getMap();
    var events = window._team13EventsCache || [];
    if (!map || !L) return;

    var filtered = events;
    if (cityName && String(cityName).trim()) {
      var cityNorm = String(cityName).trim();
      filtered = events.filter(function (e) {
        var c = (e.city && String(e.city).trim()) || '';
        return c === cityNorm;
      });
    }

    if (window.team13CityEventLayerGroup) {
      map.removeLayer(window.team13CityEventLayerGroup);
      window.team13CityEventLayerGroup = null;
    }

    injectEventsList(filtered);

    if (!cityName || !String(cityName).trim()) {
      window.allMarkers = {};
      addPlaceMarkers(map, window._team13PlacesCache || []);
      addEventMarkers(map, window._team13EventsCache || []);
    } else if (filtered.length > 0) {
      var layer = L.layerGroup();
      var icon = createEventIcon();
      var allMarkers = Object.assign({}, window.allMarkers || {});
      filtered.forEach(function (e) {
        var lat = parseFloat(e.latitude);
        var lng = parseFloat(e.longitude);
        if (isNaN(lat) || isNaN(lng)) return;
        var id = 'event-' + (e.event_id || e.id || String(lat) + ',' + String(lng));
        var popupContent = buildEventPopupContent(e);
        var m = L.marker([lat, lng], { icon: icon }).bindPopup(popupContent);
        layer.addLayer(m);
        allMarkers[id] = m;
        if (window._team13PoiIconsVisible && typeof m.addTo === 'function') m.addTo(map);
      });
      window.allMarkers = allMarkers;
      if (window._team13PoiIconsVisible) layer.addTo(map);
      window.team13CityEventLayerGroup = layer;
      if (centerLat != null && centerLng != null && !isNaN(centerLat) && !isNaN(centerLng)) {
        flyTo(map, centerLat, centerLng, 12);
      } else {
        var first = filtered[0];
        flyTo(map, parseFloat(first.latitude), parseFloat(first.longitude), 11);
      }
    } else if (centerLat != null && centerLng != null && !isNaN(centerLat) && !isNaN(centerLng)) {
      flyTo(map, centerLat, centerLng, 12);
    }
  }

  
  /** Update only the events list in sidebar (used by city filter). */
  function injectEventsList(events) {
    var eventsList = document.getElementById('events-list');
    if (!eventsList) return;
    eventsList.innerHTML = '';
    (events || []).forEach(function (e) {
      eventsList.insertAdjacentHTML('beforeend', renderEventCard(e));
    });
  }



  
  /** مکان‌های دیتابیس را با طول و عرض جغرافیایی روی نقشه نمایش می‌دهد. هر مارکر با bindPopup به پاپ‌آپ متصل است؛ کلیک روی مارکر پاپ‌آپ را باز می‌کند (از طریق رفتار پیش‌فرض L.marker در wrapper). */
  function addPlaceMarkers(map, places) {
    if (!map || !L) return;
    var allMarkers = Object.assign({}, window.allMarkers || {});
    (places || []).forEach(function (p) {
      var lat = parseFloat(p.latitude);
      var lng = parseFloat(p.longitude);
      if (isNaN(lat) || isNaN(lng)) return;
      var id = 'place-' + (p.place_id || p.id || String(lat) + ',' + String(lng));
      var popupContent = buildPlacePopupContent(p, lat, lng);
      var icon = createPlaceIcon(p.type || p.category);
      var m = L.marker([lat, lng], { icon: icon }).bindPopup(popupContent);
      allMarkers[id] = m;
      if (window._team13PoiIconsVisible) m.addTo(map);
    });
    window.allMarkers = allMarkers;
  }

  /** رویدادهای دیتابیس را با طول و عرض جغرافیایی روی نقشه نمایش می‌دهد. */
  function addEventMarkers(map, events) {
    if (!map || !L) return;
    var icon = createEventIcon();
    var allMarkers = Object.assign({}, window.allMarkers || {});
    (events || []).forEach(function (e) {
      var lat = parseFloat(e.latitude);
      var lng = parseFloat(e.longitude);
      if (isNaN(lat) || isNaN(lng)) return;
      var id = 'event-' + (e.event_id || e.id || String(lat) + ',' + String(lng));
      var popupContent = buildEventPopupContent(e);
      var m = L.marker([lat, lng], { icon: icon }).bindPopup(popupContent);
      allMarkers[id] = m;
      if (window._team13PoiIconsVisible) m.addTo(map);
    });
    window.allMarkers = allMarkers;
  }

  function clearTemporaryMapItems(map) {
    if (!map) return;
    if (window.currentlyShownPoiMarker) {
      map.removeLayer(window.currentlyShownPoiMarker);
      window.currentlyShownPoiMarker = null;
    }
    if (searchResultMarker && map.hasLayer(searchResultMarker)) {
      map.removeLayer(searchResultMarker);
      searchResultMarker = null;
    }
    if (favoritePickMarker && map.hasLayer(favoritePickMarker)) {
      map.removeLayer(favoritePickMarker);
      favoritePickMarker = null;
    }
    if (window.emergencyPoiMarker && map.hasLayer(window.emergencyPoiMarker)) {
      map.removeLayer(window.emergencyPoiMarker);
      window.emergencyPoiMarker = null;
    }
    var routeLayer = window.currentPath || window.routeLayer || window.currentRoute || window.team13RouteLine;
    if (routeLayer && map.hasLayer(routeLayer)) {
      map.removeLayer(routeLayer);
    }
    window.currentPath = null;
    window.routeLayer = null;
    window.currentRoute = null;
    window.team13RouteLine = null;
  }

  function showPoiMarkerById(map, id, lat, lng, isPlace) {
    var allMarkers = window.allMarkers || {};
    var marker = allMarkers[id];
    if (!marker) return;
    clearTemporaryMapItems(map);
    marker.setIcon(isPlace ? createSelectedPlaceIcon() : createSelectedEventIcon());
    marker.addTo(map);
    window.currentlyShownPoiMarker = marker;
    flyTo(map, lat, lng, 15);
    marker.openPopup();
  }

  function runRouteToPoint(lat, lng, name) {
    if (isNaN(lat) || isNaN(lng)) return;
    setRouteLoading(true);
    if (window.Team13Api && typeof window.Team13Api.getRouteFromTo === 'function') {
      getCurrentPosition()
        .then(function (pos) {
          var userLat = pos.coords.latitude;
          var userLng = pos.coords.longitude;
          switchToRoutesTabAndSetRoute(userLat, userLng, lat, lng, name || 'مقصد', 'driving');
          setRouteLoading(false);
        })
        .catch(function () {
          setDestFromCoords(lat, lng, name || '');
          var tabBtn = document.querySelector('[data-tab="routes"]');
          if (tabBtn) tabBtn.click();
          setRouteLoading(false);
          if (window.showToast) window.showToast('مقصد تنظیم شد. مبدا را انتخاب کنید.');
        });
    } else if (window.Team13Api && typeof window.Team13Api.getRouteFromUserToPoint === 'function') {
      window.Team13Api.getRouteFromUserToPoint({ lat: lat, lng: lng }, 'driving')
        .then(function (r) {
          setRouteLoading(false);
          if (typeof window.updateRouteInfoBox === 'function') window.updateRouteInfoBox(r);
          var distStr = r && r.distanceKm != null ? (Math.round(r.distanceKm * 10) / 10) + ' کیلومتر' : '';
          var timeStr = r && r.durationMinutes != null ? r.durationMinutes + ' دقیقه' : '';
          showRouteInfo('فاصله: ' + distStr, 'زمان تقریبی: ' + timeStr);
        })
        .catch(function (err) {
          setRouteLoading(false);
          showRouteInfo('خطا: ' + (err && err.message ? err.message : 'مسیر ناموفق'), '');
        });
    } else {
      requestRouteFromUserTo(lat, lng);
    }
  }

  function bindRouteButtonInPopups(map) {
    if (!map) return;
    function bindRouteBtn(btn) {
      if (!btn) return;
      btn.onclick = function () {
        var lat = parseFloat(btn.getAttribute('data-lat'));
        var lng = parseFloat(btn.getAttribute('data-lng'));
        var name = (btn.getAttribute('data-name') || '').trim();
        runRouteToPoint(lat, lng, name);
      };
    }
    map.on('popupopen', function (e) {
      var popup = e.popup;
      var el = popup && popup.getElement && popup.getElement();
      if (!el) return;
      bindRouteBtn(el.querySelector('.team13-btn-route-to-place'));
      bindRouteBtn(el.querySelector('.team13-btn-route-to-event'));
      bindRouteBtn(el.querySelector('.team13-btn-discovery-route'));
      var btnDetails = el.querySelector('.team13-btn-place-details');
      if (btnDetails && typeof window.Team13OpenPlaceActionsModal === 'function') {
        btnDetails.onclick = function () {
          var placeId = btnDetails.getAttribute('data-place-id');
          var lat = parseFloat(btnDetails.getAttribute('data-lat'));
          var lng = parseFloat(btnDetails.getAttribute('data-lng'));
          var name = (btnDetails.getAttribute('data-name') || '').trim() || 'مکان';
          if (placeId) window.Team13OpenPlaceActionsModal(placeId, name, lat, lng);
        };
      }
    });
    if (!window._team13PopupDelegationBound) {
      window._team13PopupDelegationBound = true;
      document.addEventListener('click', function popupButtonDelegation(ev) {
        var target = ev.target;
        var routeBtn = target.closest && (target.closest('.team13-btn-route-to-place') || target.closest('.team13-btn-route-to-event') || target.closest('.team13-btn-discovery-route'));
        if (routeBtn) {
          var lat = parseFloat(routeBtn.getAttribute('data-lat'));
          var lng = parseFloat(routeBtn.getAttribute('data-lng'));
          var name = (routeBtn.getAttribute('data-name') || '').trim();
          runRouteToPoint(lat, lng, name);
          ev.preventDefault();
          ev.stopPropagation();
        }
        var detailsBtn = target.closest && target.closest('.team13-btn-place-details');
        if (detailsBtn && typeof window.Team13OpenPlaceActionsModal === 'function') {
          var placeId = detailsBtn.getAttribute('data-place-id');
          var lat = parseFloat(detailsBtn.getAttribute('data-lat'));
          var lng = parseFloat(detailsBtn.getAttribute('data-lng'));
          var name = (detailsBtn.getAttribute('data-name') || '').trim() || 'مکان';
          if (placeId) {
            window.Team13OpenPlaceActionsModal(placeId, name, lat, lng);
            ev.preventDefault();
            ev.stopPropagation();
          }
        }
      }, true);
    }
  }

  
  // --- User location then route + ETA ---
  function requestRouteFromUserTo(targetLat, targetLng) {
    setRouteLoading(true);
    hideRouteInfo();
    getCurrentPosition()
      .then(function (pos) {
        var userLat = pos.coords.latitude;
        var userLng = pos.coords.longitude;
        return fetchRouteAndEta(userLat, userLng, targetLat, targetLng);
      })
      .then(function (result) {
        setRouteLoading(false);
        if (result && result.polyline) {
          showRouteInfo(result.distanceText, result.etaText);
        }
      })
      .catch(function (err) {
        setRouteLoading(false);
        showRouteInfo('خطا: ' + (err && err.message ? err.message : 'موقعیت یا مسیر در دسترس نیست'), '');
      });
  }

  function getCurrentPosition() {
    return new Promise(function (resolve, reject) {
      if (!navigator.geolocation) return reject(new Error('Geolocation not supported'));
      navigator.geolocation.getCurrentPosition(
        resolve,
        function (e) {
          var msg = e.code === 1 ? 'دسترسی به موقعیت رد شد' : e.code === 2 ? 'موقعیت در دسترس نیست' : e.code === 3 ? 'زمان درخواست تمام شد' : (e.message || 'موقعیت یافت نشد');
          reject(new Error(msg));
        },
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
      );
    });
  }

  function setRouteLoading(show) {
    var el = document.getElementById('team13-route-loading');
    if (el) el.hidden = !show;
  }

  function showRouteInfo(distanceText, etaText) {
    var box = document.getElementById('team13-route-info');
    var distEl = document.getElementById('team13-route-distance');
    var etaEl = document.getElementById('team13-route-eta');
    if (box) box.hidden = false;
    if (distEl) distEl.textContent = distanceText || '';
    if (etaEl) etaEl.textContent = etaText || '';
  }

  function hideRouteInfo() {
    var box = document.getElementById('team13-route-info');
    if (box) box.hidden = true;
  }

  function fetchRouteAndEta(originLat, originLng, destLat, destLng, options) {
    var map = getMap();
    if (!map || typeof L === 'undefined') return Promise.reject(new Error('Map not ready'));

    var base = (window.TEAM13_API_BASE || '/team13').replace(/\/$/, '');
    var travelMode = (options && options.travel_mode) ? String(options.travel_mode).toLowerCase() : 'car';
    if (['car', 'walk', 'transit', 'motorcycle'].indexOf(travelMode) === -1) travelMode = 'car';
    var params = new URLSearchParams({
      format: 'json',
      source_lat: String(originLat),
      source_lng: String(originLng),
      source_name: 'مبدأ',
      dest_lat: String(destLat),
      dest_lng: String(destLng),
      dest_name: 'مقصد',
      travel_mode: travelMode,
    });
    if (options && options.no_traffic && travelMode === 'car') params.set('no_traffic', '1');
    if (options && options.bearing != null && options.bearing >= 0 && options.bearing <= 360) params.set('bearing', String(options.bearing));
    var url = base + '/routes/?' + params.toString();

    return fetch(url, { method: 'GET', headers: { Accept: 'application/json' }, credentials: 'same-origin' })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        var latlngs = [[originLat, originLng], [destLat, destLng]];
        if (data.route_geometry && window.Team13Api && typeof window.Team13Api.decodeRouteGeometry === 'function') {
          var decoded = window.Team13Api.decodeRouteGeometry(data.route_geometry);
          if (decoded && decoded.length > 0) latlngs = decoded;
        }
        var distanceKm = data.distance_km != null ? Number(data.distance_km) : null;
        var etaMinutes = data.eta_minutes != null ? Number(data.eta_minutes) : null;
        var durationSec = etaMinutes != null ? etaMinutes * 60 : null;
        return { latlngs: latlngs, distanceKm: distanceKm, durationSec: durationSec };
      })
      .then(function (out) {
        if (window.team13RouteLine && map) map.removeLayer(window.team13RouteLine);
        window.team13RouteLine = L.polyline(out.latlngs, {
          color: SAGE_GREEN,
          weight: 5,
          lineJoin: 'round',
          lineCap: 'round',
          smoothFactor: 1,
        }).addTo(map);
        map.fitBounds(window.team13RouteLine.getBounds(), { padding: [40, 40] });

        var distanceText = out.distanceKm != null ? 'فاصله: ' + (Math.round(out.distanceKm * 10) / 10) + ' کیلومتر' : '';
        var etaText = out.durationSec != null ? 'زمان تقریبی: ' + formatDuration(out.durationSec) : '';
        return { polyline: window.team13RouteLine, distanceText: distanceText, etaText: etaText };
      });
  }

  function parseRouteGeometry(data, oLat, oLng, tLat, tLng) {
    var latlngs = [];
    var route = data.route || (data.routes && data.routes[0]);
    if (route && route.legs && Array.isArray(route.legs)) {
      route.legs.forEach(function (leg) {
        if (leg.steps && Array.isArray(leg.steps)) {
          leg.steps.forEach(function (step) {
            if (step.polyline && Array.isArray(step.polyline)) {
              step.polyline.forEach(function (c) {
                if (Array.isArray(c) && c.length >= 2) latlngs.push([c[1], c[0]]);
              });
            }
          });
        }
      });
    }
    if (latlngs.length < 2 && data.waypoints && Array.isArray(data.waypoints)) {
      data.waypoints.forEach(function (p) {
        if (Array.isArray(p)) latlngs.push([p[1], p[0]]);
        else if (p && typeof p.lat !== 'undefined') latlngs.push([p.lat, p.lng]);
      });
    }
    if (latlngs.length < 2 && data.routes && data.routes[0] && data.routes[0].geometry && data.routes[0].geometry.coordinates) {
      latlngs = data.routes[0].geometry.coordinates.map(function (c) { return [c[1], c[0]]; });
    }
    if (latlngs.length < 2) latlngs = [[oLat, oLng], [tLat, tLng]];
    return latlngs;
  }

  function parseRouteDistance(data) {
    var route = data.route || (data.routes && data.routes[0]);
    if (route && typeof route.distance === 'number') return route.distance / 1000;
    if (route && route.legs && route.legs[0] && typeof route.legs[0].distance === 'number') {
      var d = 0;
      route.legs.forEach(function (leg) { d += leg.distance || 0; });
      return d / 1000;
    }
    return null;
  }

  function parseRouteDuration(data) {
    var route = data.route || (data.routes && data.routes[0]);
    if (route && typeof route.duration === 'number') return route.duration;
    if (route && route.legs && route.legs[0] && typeof route.legs[0].duration === 'number') {
      var d = 0;
      route.legs.forEach(function (leg) { d += leg.duration || 0; });
      return d;
    }
    return null;
  }

  function parseEtaDuration(data) {
    if (data && typeof data.duration === 'number') return data.duration;
    if (data && data.routes && data.routes[0] && typeof data.routes[0].duration === 'number') return data.routes[0].duration;
    return null;
  }

  function formatDuration(seconds) {
    if (seconds < 60) return seconds + ' ثانیه';
    var m = Math.floor(seconds / 60);
    var s = Math.round(seconds % 60);
    if (s === 0) return m + ' دقیقه';
    return m + ' دقیقه و ' + s + ' ثانیه';
  }

   // --- Sidebar: cards with flyTo on click ---
  function renderPlaceCard(p) {
    var name = (p.name_fa || p.name_en || p.type_display || p.place_id).trim();
    var lat = parseFloat(p.latitude);
    var lng = parseFloat(p.longitude);
    var btn = '<button type="button" class="team13-btn-show-map" data-lat="' + lat + '" data-lng="' + lng + '" data-place-id="' + escapeHtml(p.place_id) + '" data-name="' + escapeHtml(name) + '">نمایش روی نقشه</button>';
    return '<div class="team13-card team13-data-card team13-clickable-card" data-lat="' + lat + '" data-lng="' + lng + '" data-place-id="' + escapeHtml(p.place_id) + '" data-name="' + escapeHtml(name) + '"><p class="font-semibold text-[#1b4332]">' + escapeHtml(name) + '</p><p class="text-sm text-gray-600">' + escapeHtml(p.type_display || '') + (p.city ? ' — ' + escapeHtml(p.city) : '') + '</p>' + btn + '</div>';
  }

  function renderEventCard(e) {
    var title = (e.title_fa || e.title_en || e.event_id).trim();
    var eventId = e.event_id;
    var btn = '<button type="button" class="team13-btn-show-event-on-map" data-event-id="' + escapeHtml(eventId) + '" data-title="' + escapeHtml(title) + '">نمایش روی نقشه</button>';
    return '<div class="team13-card team13-data-card team13-clickable-card" data-event-id="' + escapeHtml(eventId) + '" data-title="' + escapeHtml(title) + '"><p class="font-semibold text-[#1b4332]">' + escapeHtml(title) + '</p><p class="text-sm text-gray-600">' + (e.start_at || e.start_at_iso || '') + (e.city ? ' — ' + escapeHtml(e.city) : '') + '</p>' + btn + '</div>';
  }

  function flyTo(map, lat, lng, zoom) {
    if (!map) return;
    var z = zoom != null ? zoom : (map.getZoom && map.getZoom()) || 14;
    if (map.flyTo) map.flyTo([lat, lng], z, { duration: 0.5 });
    else map.setView([lat, lng], z, { animate: true });
  }

  function haversineKm(lat1, lng1, lat2, lng2) {
    var R = 6371;
    var dLat = (lat2 - lat1) * Math.PI / 180;
    var dLng = (lng2 - lng1) * Math.PI / 180;
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function getCategoryIcon(type) {
    var icons = { hotel: '🛏', food: '🍴', hospital: '🏥', museum: '🎭', entertainment: '🎪' };
    return icons[type] || '📍';
  }

  function renderFacilityCard(place, distanceKm) {
    var name = (place.name_fa || place.name_en || place.type_display || '').trim() || place.place_id;
    var category = place.type_display || place.type || '—';
    var typeKey = (place.type || '').toLowerCase();
    var icon = getCategoryIcon(typeKey);
    var rating = place.rating != null ? Number(place.rating) : null;
    var starsHtml = rating != null
      ? ('<span class="team13-facility-stars" aria-label="امتیاز ' + rating + ' از ۵">' + '★'.repeat(Math.round(rating)) + '<span class="team13-facility-stars-empty">' + '☆'.repeat(5 - Math.round(rating)) + '</span></span>')
      : '<span class="text-gray-400 text-sm">—</span>';
    var distText = distanceKm != null ? (distanceKm < 1 ? (Math.round(distanceKm * 1000) + ' م') : (distanceKm.toFixed(1) + ' ک.م')) : '—';
    var lat = parseFloat(place.latitude);
    var lng = parseFloat(place.longitude);
    var placeId = place.place_id || '';
    return '<div class="team13-facility-card team13-clickable-card" data-lat="' + lat + '" data-lng="' + lng + '" data-place-id="' + escapeHtml(placeId) + '" data-name="' + escapeHtml(name) + '">' +
      '<div class="team13-facility-card-head">' +
      '<span class="team13-facility-icon" aria-hidden="true">' + icon + '</span>' +
      '<p class="team13-facility-name font-semibold text-[#1b4332]">' + escapeHtml(name) + '</p>' +
      '</div>' +
      '<p class="team13-facility-category text-sm text-gray-600">' + escapeHtml(category) + '</p>' +
      '<div class="team13-facility-meta">' + starsHtml + ' <span class="team13-facility-distance">' + escapeHtml(distText) + '</span></div>' +
      '<button type="button" class="team13-btn-show-map" data-lat="' + lat + '" data-lng="' + lng + '" data-place-id="' + escapeHtml(placeId) + '" data-name="' + escapeHtml(name) + '">نمایش روی نقشه</button>' +
      '</div>';
  }

  function getTop5PlacesNearby(places, userLat, userLng) {
    if (!places || !places.length) return [];
    var list = places.map(function (p) {
      var lat = parseFloat(p.latitude);
      var lng = parseFloat(p.longitude);
      var dist = (userLat != null && userLng != null && !isNaN(lat) && !isNaN(lng))
        ? haversineKm(userLat, userLng, lat, lng) : null;
      return { place: p, distanceKm: dist };
    });
    list.sort(function (a, b) {
      var ra = a.place.rating != null ? Number(a.place.rating) : 0;
      var rb = b.place.rating != null ? Number(b.place.rating) : 0;
      if (rb !== ra) return rb - ra;
      if (a.distanceKm != null && b.distanceKm != null) return a.distanceKm - b.distanceKm;
      if (a.distanceKm != null) return -1;
      if (b.distanceKm != null) return 1;
      return 0;
    });
    return list.slice(0, 5);
  }

  function refreshFacilitiesList() {
    var placesList = document.getElementById('places-list');
    var panelPlaces = document.getElementById('panel-places');
    if (!placesList) return;
    var isFacilitiesActive = panelPlaces && panelPlaces.classList.contains('active');
    if (!isFacilitiesActive) return;

    placesList.innerHTML = '<div class="team13-facilities-loading"><span class="team13-facilities-spinner" aria-hidden="true"></span><p class="team13-facilities-loading-text">در حال جستجو...</p></div>';
    var api = window.Team13Api;
    var loadPromise = window._team13PlacesCache && window._team13PlacesCache.length
      ? Promise.resolve({ places: window._team13PlacesCache })
      : (api && api.loadMapData ? api.loadMapData() : Promise.resolve({ places: [] }));
    var userPromise = window.userLocationCoords
      ? Promise.resolve(window.userLocationCoords)
      : (typeof getCurrentPosition === 'function' ? getCurrentPosition() : Promise.reject(new Error('no position'))).then(function (pos) {
          var lat = pos.coords && pos.coords.latitude;
          var lng = pos.coords && pos.coords.longitude;
          if (lat != null && lng != null) window.userLocationCoords = { lat: lat, lng: lng };
          return window.userLocationCoords || { lat: lat, lng: lng };
        }).catch(function () { return null; });

    Promise.all([loadPromise, userPromise]).then(function (results) {
      var places = (results[0] && results[0].places) ? results[0].places : [];
      if (results[0] && results[0].places && results[0].places.length) window._team13PlacesCache = results[0].places;
      var coords = results[1];
      var userLat = coords && coords.lat;
      var userLng = coords && coords.lng;
      var top5 = getTop5PlacesNearby(places, userLat, userLng);
      if (!top5.length) {
        placesList.innerHTML = '<div class="team13-facilities-list"><p class="text-sm text-gray-600 py-4 text-center">مکانی یافت نشد.</p></div>';
        return;
      }
      var html = '<div class="team13-facilities-list">';
      top5.forEach(function (item) {
        html += renderFacilityCard(item.place, item.distanceKm);
      });
      html += '</div>';
      placesList.innerHTML = html;
    }).catch(function () {
      placesList.innerHTML = '<div class="team13-facilities-list"><p class="text-sm text-gray-600 py-4 text-center">خطا در بارگذاری. دوباره تلاش کنید.</p></div>';
    });
  }

  function onPlacesTabActivated() {
    refreshFacilitiesList();
  }

  function injectSidebarCards(places, events) {
    var eventsList = document.getElementById('events-list');
    if (eventsList) {
      eventsList.innerHTML = '';
      (events || []).forEach(function (e) {
        eventsList.insertAdjacentHTML('beforeend', renderEventCard(e));
      });
    }
    var map = getMap();
    function openActionMenuAt(lat, lng, name) {
      flyTo(map, lat, lng);
      if (typeof window.showActionMenu === 'function') window.showActionMenu(lat, lng, name || 'مکان');
    }

    eventsList && eventsList.addEventListener('click', function (ev) {
      var btn = ev.target.closest('.team13-btn-show-event-on-map');
      if (btn) {
        var eventId = btn.getAttribute('data-event-id');
        var title = btn.getAttribute('data-title') || '';
        if (eventId && window.Team13Api && window.Team13Api.api) {
          window.Team13Api.api.eventDetail(eventId).then(function (detail) {
            var lat = detail.latitude != null ? parseFloat(detail.latitude) : NaN;
            var lng = detail.longitude != null ? parseFloat(detail.longitude) : NaN;
            if (!isNaN(lat) && !isNaN(lng)) {
              if (window.allMarkers && window.allMarkers['event-' + eventId]) {
                showPoiMarkerById(map, 'event-' + eventId, lat, lng, false);
              } else {
                openActionMenuAt(lat, lng, title);
              }
            }
          }).catch(function () {});
        }
        if (typeof window.Team13CloseSidebar === 'function') window.Team13CloseSidebar();
        return;
      }
      var card = ev.target.closest('.team13-clickable-card[data-event-id]');
      if (card && window.Team13Api && window.Team13Api.api) {
        var eventId = card.getAttribute('data-event-id');
        var title = card.getAttribute('data-title') || '';
        window.Team13Api.api.eventDetail(eventId).then(function (detail) {
          var lat = detail.latitude != null ? parseFloat(detail.latitude) : NaN;
          var lng = detail.longitude != null ? parseFloat(detail.longitude) : NaN;
          if (!isNaN(lat) && !isNaN(lng)) {
            if (window.allMarkers && window.allMarkers['event-' + eventId]) {
              showPoiMarkerById(map, 'event-' + eventId, lat, lng, false);
            } else {
              openActionMenuAt(lat, lng, title);
            }
          }
        }).catch(function () {});
        if (typeof window.Team13CloseSidebar === 'function') window.Team13CloseSidebar();
      }
    });
  }


  // --- Search (جستجوی آدرس با API جدید بعداً اضافه می‌شود) ---
  var searchDebounceTimer;
  var searchResultMarker = null;
  var favoritePickMarker = null;

  /** به‌روزرسانی لیست نتایج در سایدبار راست (هم جستجوی متنی هم جستجو در محدوده). */
  function updateSidebarResults(items) {
    var sidebarWrap = document.getElementById('team13-sidebar-search-results-wrap');
    var sidebarResultsEl = document.getElementById('team13-sidebar-search-results');
    var sidebarTitle = document.querySelector('#team13-sidebar-search-results-wrap .team13-sidebar-search-results-title');
    if (!sidebarWrap || !sidebarResultsEl) return;
    if (!items || items.length === 0) {
      sidebarWrap.hidden = true;
      sidebarResultsEl.innerHTML = '';
      return;
    }
    renderSearchResults(sidebarResultsEl, items);
    if (sidebarTitle) sidebarTitle.textContent = 'نتایج جستجو' + (items.length ? ' (' + items.length + ')' : '');
    sidebarWrap.hidden = false;
  }

  function initSearch() {
    var input = document.getElementById('team13-search-input');
    var resultsEl = document.getElementById('team13-search-results');
    if (!input || !resultsEl) return;

    input.addEventListener('input', function () {
      clearTimeout(searchDebounceTimer);
      var q = (input.value || '').trim();
      if (q.length < 2) {
        resultsEl.hidden = true;
        resultsEl.innerHTML = '';
        updateSidebarResults([]);
        return;
      }
      searchDebounceTimer = setTimeout(function () {
        var map = getMap();
        var lat, lng;
        if (map && map.getCenter) { var c = map.getCenter(); lat = c.lat; lng = c.lng; }
        mapirAutocomplete(q, lat, lng).then(function (items) {
          renderSearchResults(resultsEl, items);
          resultsEl.hidden = items.length === 0;
          updateSidebarResults(items);
        }).catch(function () {
          resultsEl.hidden = true;
          resultsEl.innerHTML = '';
          updateSidebarResults([]);
        });
      }, 300);
    });

    input.addEventListener('blur', function () {
      setTimeout(function () {
        resultsEl.hidden = true;
      }, 200);
    });

    var btnClearSearch = document.getElementById('team13-clear-search');
    if (btnClearSearch) btnClearSearch.addEventListener('click', function () {
      clearSearchResult();
    });
  }

  var API_BASE = (window.TEAM13_API_BASE || '/team13').replace(/\/$/, '');
  var SEARCH_PLACES_URL = API_BASE + '/search-places/';
  var NESHAN_SEARCH_URL = API_BASE + '/neshan-search/';

  /** جستجو: ترکیب دادهٔ دیتابیس (خودمان) + نتایج API نشان — هر دو با طول و عرض روی نقشه قابل نمایش. */
  function mapirAutocomplete(text, lat, lng) {
    if (!(text && text.trim())) return Promise.resolve([]);
    var q = text.trim();
    var params = 'q=' + encodeURIComponent(q) + '&limit=30';
    if (lat != null && lng != null && !isNaN(Number(lat)) && !isNaN(Number(lng))) {
      params += '&lat=' + encodeURIComponent(Number(lat)) + '&lng=' + encodeURIComponent(Number(lng));
    }
    var seen = {};
    function key(la, ln) { return (Number(la).toFixed(5) + ',' + Number(ln).toFixed(5)); }
    function norm(it, keepItemType) {
      var ll = (it.lat != null && it.lng != null) ? { lat: it.lat, lng: it.lng } : (it.y != null && it.x != null) ? { lat: it.y, lng: it.x } : null;
      if (!ll) return null;
      var o = { title: it.title || it.address, address: it.address || it.title, lat: ll.lat, lng: ll.lng, y: ll.lat, x: ll.lng };
      if (keepItemType && it.item_type) o.item_type = it.item_type;
      return o;
    }
    return fetch(SEARCH_PLACES_URL + '?' + params, { method: 'GET', headers: { Accept: 'application/json' }, credentials: 'same-origin' })
      .then(function (res) {
        if (!res.ok) return [];
        return res.json();
      })
      .then(function (data) {
        var fromDb = (data && data.items) ? data.items : [];
        return fromDb.map(function (it) { return norm(it, true); }).filter(Boolean);
      })
      .catch(function () { return []; })
      .then(function (dbItems) {
        dbItems.forEach(function (it) { seen[key(it.lat, it.lng)] = true; });
        return fetch(NESHAN_SEARCH_URL + '?' + params, { method: 'GET', headers: { Accept: 'application/json' }, credentials: 'same-origin' })
          .then(function (res) {
            if (!res.ok) return dbItems;
            return res.json();
          })
          .then(function (data) {
            var neshanItems = (data && data.items) ? data.items : [];
            var merged = dbItems.slice();
            neshanItems.forEach(function (it) {
              var n = norm(it, false);
              if (n && !seen[key(n.lat, n.lng)]) {
                seen[key(n.lat, n.lng)] = true;
                merged.push(n);
              }
            });
            return merged;
          })
          .catch(function () { return dbItems; });
      });
  }

  function getItemLatLng(item) {
    if (item.y != null && item.x != null) return { lat: parseFloat(item.y), lng: parseFloat(item.x) };
    if (item.lat != null && item.lon != null) return { lat: parseFloat(item.lat), lng: parseFloat(item.lon) };
    if (item.latitude != null && item.longitude != null) return { lat: parseFloat(item.latitude), lng: parseFloat(item.longitude) };
    var geom = item.geom || item.geometry;
    if (geom && geom.coordinates && Array.isArray(geom.coordinates) && geom.coordinates.length >= 2)
      return { lng: parseFloat(geom.coordinates[0]), lat: parseFloat(geom.coordinates[1]) };
    return null;
  }

  function renderSearchResults(container, items) {
    if (!container) return;
    container.innerHTML = '';
    (items || []).forEach(function (item) {
      var title = (item.title || item.address || item.name || item.text || '').trim() || 'مکان';
      var ll = getItemLatLng(item);
      if (!ll) return;
      var lat = ll.lat;
      var lng = ll.lng;
      var isCity = item.item_type === 'city';
      var displayTitle = isCity ? ('شهر ' + title) : title;
      var div = document.createElement('div');
      div.className = 'team13-search-result-item' + (isCity ? ' team13-search-result-city' : '');
      div.textContent = displayTitle;
      div.dataset.lat = lat;
      div.dataset.lng = lng;
      div.dataset.title = displayTitle;
      div.addEventListener('click', function () {
        selectSearchResult(lat, lng, displayTitle);
      });
      container.appendChild(div);
    });
  }

  function selectSearchResult(lat, lng, title) {
    var map = getMap();
    var input = document.getElementById('team13-search-input');
    var resultsEl = document.getElementById('team13-search-results');
    if (input) input.value = title || '';
    if (resultsEl) { resultsEl.hidden = true; resultsEl.innerHTML = ''; }

    setDestFromCoords(lat, lng, title || '');
    var inputDest = document.getElementById('team13-input-dest');
    if (inputDest) inputDest.value = title || '';
    clearTemporaryMapItems(map);
    flyTo(map, lat, lng, 15);
  }

  function clearFavoritePickMarker() {
    var map = getMap();
    if (favoritePickMarker && map && map.hasLayer(favoritePickMarker)) {
      map.removeLayer(favoritePickMarker);
      favoritePickMarker = null;
    }
  }

  function showFavoritePickMarker(lat, lng, title) {
    var map = getMap();
    if (!map) return;
    clearFavoritePickMarker();
    flyTo(map, lat, lng, 15);
    favoritePickMarker = L.marker([lat, lng], { icon: createDestMarkerIcon() }).addTo(map);
    if (title) {
      favoritePickMarker.bindPopup('<div class="team13-popup"><strong>' + escapeHtml(title) + '</strong></div>');
    }
  }

  // --- Emergency: انتخاب موقعیت (زنده یا نقشه) سپس نمایش مراکز در شعاع ۱۰ کیلومتر ---
  var emergencyMarkersLayer = null;

  function showModalById(id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.hidden = false;
    el.classList.add('team13-modal-open');
    document.body.classList.add('team13-favorite-modal-open');
  }

  function hideModalById(id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.hidden = true;
    el.classList.remove('team13-modal-open');
    document.body.classList.remove('team13-favorite-modal-open');
  }

  /** در صورت ناموفق بودن GPS، جستجوی امداد را با مرکز فعلی نقشه انجام می‌دهد (دیتابیس خودمان). */
  function runEmergencySearchFromMapCenter() {
    var map = getMap();
    if (map && typeof map.getCenter === 'function') {
      var c = map.getCenter();
      if (c && c.lat != null && c.lng != null) {
        runEmergencySearch(c.lat, c.lng);
        return;
      }
    }
    runEmergencySearch(35.6892, 51.3890);
  }

  function runEmergencySearch(lat, lng) {
    lat = parseFloat(lat);
    lng = parseFloat(lng);
    if (isNaN(lat) || isNaN(lng)) {
      if (window.showToast) window.showToast('موقعیت انتخاب‌شده نامعتبر است.');
      return;
    }
    var api = window.Team13Api;
    var emergencyFn = (api && api.emergency) ? api.emergency : (api && api.api && api.api.emergency) ? api.api.emergency.bind(api.api) : null;
    if (!emergencyFn) {
      if (window.showToast) window.showToast('سرویس امداد در دسترس نیست.');
      return;
    }
    if (window.showToast) window.showToast('در حال جستجوی مراکز امدادی از دیتابیس در شعاع ۱۰ کیلومتر…');
    emergencyFn(lat, lng, 50, 10)
      .then(function (data) {
        var places = (data && data.emergency_places) ? data.emergency_places : [];
        showEmergencyResults(lat, lng, places);
      })
      .catch(function (err) {
        if (window.showToast) window.showToast('خطا در دریافت مراکز امدادی از دیتابیس. لطفاً دوباره تلاش کنید.');
        showEmergencyResults(lat, lng, []);
      });
  }

  function showEmergencyResults(centerLat, centerLng, places) {
    var map = getMap();
    if (map && emergencyMarkersLayer) {
      map.removeLayer(emergencyMarkersLayer);
      emergencyMarkersLayer = null;
    }
    if (window.emergencyPoiMarker && map && map.hasLayer(window.emergencyPoiMarker)) {
      map.removeLayer(window.emergencyPoiMarker);
      window.emergencyPoiMarker = null;
    }
    emergencyMarkersLayer = L.layerGroup();
    var bounds = L.latLngBounds([centerLat, centerLng], [centerLat, centerLng]);
    (places || []).forEach(function (p) {
      var lat = parseFloat(p.latitude);
      var lng = parseFloat(p.longitude);
      if (isNaN(lat) || isNaN(lng)) return;
      bounds.extend([lat, lng]);
      var name = (p.name_fa || p.type_display || '').trim() || 'مرکز امدادی';
      var icon = createEmergencyPoiIcon();
      var m = L.marker([lat, lng], { icon: icon }).bindPopup(
        '<div class="team13-popup" dir="rtl"><strong>' + escapeHtml(name) + '</strong><br><span class="text-muted">' + escapeHtml(p.type_display || '') + ' — ' + (p.distance_km != null ? p.distance_km + ' ک.م' : '') + '</span></div>'
      );
      emergencyMarkersLayer.addLayer(m);
    });
    if (map && emergencyMarkersLayer) {
      emergencyMarkersLayer.addTo(map);
      if (places && places.length > 0 && bounds.isValid()) map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
      else if (centerLat != null && centerLng != null) map.setView([centerLat, centerLng], 12);
    }
    var listEl = document.getElementById('team13-emergency-results-list');
    if (listEl) {
      if (!places || places.length === 0) {
        listEl.innerHTML = '<p class="team13-emergency-no-results">مرکزی در شعاع ۱۰ کیلومتر یافت نشد.</p>';
      } else {
        var html = '';
        places.forEach(function (p) {
          var name = (p.name_fa || p.type_display || '').trim() || 'مرکز امدادی';
          var dist = p.distance_km != null ? p.distance_km + ' ک.م' : '';
          html += '<div class="team13-emergency-result-item" data-lat="' + p.latitude + '" data-lng="' + p.longitude + '">' +
            '<strong>' + escapeHtml(name) + '</strong>' +
            '<span class="team13-emergency-type">' + escapeHtml(p.type_display || '') + '</span>' +
            (dist ? '<span class="team13-emergency-dist">' + escapeHtml(dist) + '</span>' : '') +
            '<p class="team13-emergency-address">' + escapeHtml(p.address || '—') + '</p></div>';
        });
        listEl.innerHTML = html;
      }
    }
    showModalById('team13-modal-emergency-results');
  }

  function initEmergencyButtons() {
    var btnEmergency = document.getElementById('team13-btn-emergency');
    if (btnEmergency) {
      btnEmergency.addEventListener('click', function () {
        showModalById('team13-modal-emergency-source');
      });
    }
    var btnUseLive = document.getElementById('team13-emergency-use-live');
    if (btnUseLive) {
      btnUseLive.addEventListener('click', function () {
        hideModalById('team13-modal-emergency-source');
        if (!navigator.geolocation) {
          if (window.showToast) window.showToast('موقعیت جغرافیایی پشتیبانی نمی‌شود. جستجو بر اساس مرکز نقشه انجام می‌شود.');
          runEmergencySearchFromMapCenter();
          return;
        }
        if (window.showToast) window.showToast('در حال دریافت موقعیت…');
        navigator.geolocation.getCurrentPosition(
          function (pos) {
            runEmergencySearch(pos.coords.latitude, pos.coords.longitude);
          },
          function (err) {
            var msg = err && err.code === 1 ? 'دسترسی به موقعیت رد شد.' : err && err.code === 3 ? 'زمان درخواست موقعیت تمام شد.' : 'موقعیت در دسترس نبود.';
            if (window.showToast) window.showToast(msg + ' جستجو بر اساس مرکز نقشه انجام می‌شود.');
            runEmergencySearchFromMapCenter();
          },
          { enableHighAccuracy: false, timeout: 12000, maximumAge: 60000 }
        );
      });
    }
    var btnPickMap = document.getElementById('team13-emergency-pick-map');
    if (btnPickMap) {
      btnPickMap.addEventListener('click', function () {
        hideModalById('team13-modal-emergency-source');
        window._team13EmergencyPickMode = true;
        if (window.showToast) window.showToast('روی نقشه کلیک کنید تا نقطهٔ جستجو انتخاب شود.');
      });
    }
    var btnHospital = document.getElementById('team13-btn-nearest-hospital');
    var btnFire = document.getElementById('team13-btn-nearest-fire');
    if (btnHospital) btnHospital.addEventListener('click', triggerNearestHospital);
    if (btnFire) btnFire.addEventListener('click', triggerNearestFireStation);
  }
/**
   * Emergency: find nearest POI, clear other markers, draw multi-point route, show only that POI marker.
   * @param {string} category - "بیمارستان" or "آتش نشانی"
   */
  function triggerNearestPoi(category) {
    var map = getMap();
    setRouteLoading(true);
    hideRouteInfo();
    clearTemporaryMapItems(map);
    if (!window.Team13Api || typeof window.Team13Api.findNearest !== 'function' || typeof window.Team13Api.getRouteFromUserToPoint !== 'function') {
      setRouteLoading(false);
      showRouteInfo('خطا: سرویس مسیریابی در دسترس نیست', '');
      return;
    }
    window.Team13Api.findNearest(category)
      .then(function (poi) {
        if (!poi || poi.lat == null || poi.lng == null) throw new Error(category === 'بیمارستان' ? 'بیمارستانی یافت نشد' : 'آتش‌نشانی یافت نشد');
        if (map && window.emergencyPoiMarker && map.hasLayer(window.emergencyPoiMarker)) map.removeLayer(window.emergencyPoiMarker);
        window.emergencyPoiMarker = L.marker([poi.lat, poi.lng], { icon: createEmergencyPoiIcon() })
          .bindPopup('<div class="team13-popup"><strong>' + escapeHtml(poi.title || category) + '</strong></div>');
        window.emergencyPoiMarker.addTo(map);
        return window.Team13Api.getRouteFromUserToPoint({ lat: poi.lat, lng: poi.lng }, 'driving');
      })
      .then(function (r) {
        setRouteLoading(false);
        if (typeof window.updateRouteInfoBox === 'function') window.updateRouteInfoBox(r);
      })
      .catch(function (err) {
        setRouteLoading(false);
        if (window.emergencyPoiMarker && map && map.hasLayer(window.emergencyPoiMarker)) {
          map.removeLayer(window.emergencyPoiMarker);
          window.emergencyPoiMarker = null;
        }
        showRouteInfo('خطا: ' + (err && err.message ? err.message : (category === 'بیمارستان' ? 'بیمارستان' : 'آتش‌نشانی') + ' یافت نشد'), '');
        clearTimeout(window._team13EmergencyErrorDismiss);
        window._team13EmergencyErrorDismiss = setTimeout(function () {
          var box = document.getElementById('team13-route-info');
          if (box) {
            box.classList.add('team13-route-info-fade-out');
            setTimeout(function () {
              hideRouteInfo();
              box.classList.remove('team13-route-info-fade-out');
            }, 500);
          }
        }, 5000);
      });
  }

  function triggerNearestHospital() {
    triggerNearestPoi('بیمارستان');
  }

  function triggerNearestFireStation() {
    triggerNearestPoi('آتش نشانی');
  }

  // --- Start/Destination routing state ---
  var startCoords = null;
  var startAddress = '';
  var destCoords = null;
  var destAddress = '';
  var startMarker = null;
  var destMarker = null;
  var pickMode = null;
  var routeMode = 'driving';
  var reverseGeocodeMarker = null;

  function setRouteMode(mode) {
    routeMode = (mode || 'driving').toLowerCase();
    var wrap = document.getElementById('team13-route-mode-wrap');
    if (wrap) {
      wrap.querySelectorAll('.team13-route-mode-btn').forEach(function (b) {
        b.classList.remove('active', 'active-transport');
        if ((b.getAttribute('data-mode') || '') === routeMode) b.classList.add('active', 'active-transport');
      });
    }
  }

  /** Update crosshair cursor class on map container when any point-selection mode is active. */
  function updateSelectionActiveCursor() {
    var active = !!(window.isPlacementMode || pickMode || pickModeDiscovery);
    var container = document.getElementById('map-container');
    if (container) {
      if (active) container.classList.add('selection-active');
      else container.classList.remove('selection-active');
    }
  }

  function setPickMode(mode) {
    pickMode = mode;
    updateSelectionActiveCursor();
    var btnStart = document.getElementById('team13-btn-pick-start');
    var btnDest = document.getElementById('team13-btn-pick-dest');
    if (btnStart) btnStart.classList.toggle('active', mode === 'start');
    if (btnDest) btnDest.classList.toggle('active', mode === 'dest');
  }

  function syncRouteInputHasText(inputId) {
    var input = document.getElementById(inputId);
    if (!input) return;
    var wrap = input.closest ? input.closest('.team13-input-with-clear') : input.parentNode;
    if (!wrap || !wrap.classList) return;
    if ((input.value || '').trim()) wrap.classList.add('team13-has-text');
    else wrap.classList.remove('team13-has-text');
  }

  function setStartFromCoords(lat, lng, address) {
    startCoords = { lat: lat, lng: lng };
    startAddress = address || '';
    var input = document.getElementById('team13-input-start');
    if (input) input.value = startAddress;
    syncRouteInputHasText('team13-input-start');
    var map = getMap();
    if (map && startMarker) map.removeLayer(startMarker);
    startMarker = L.marker([lat, lng], { icon: createStartMarkerIcon(), draggable: true })
      .on('dragend', function () {
        var pos = startMarker.getLatLng();
        startCoords = { lat: pos.lat, lng: pos.lng };
        window.Team13Api.reverseGeocode(pos.lat, pos.lng).then(function (data) {
          startAddress = (data && (data.address || data.address_compact || data.postal_address)) || '';
          var inp = document.getElementById('team13-input-start');
          if (inp) inp.value = startAddress;
          syncRouteInputHasText('team13-input-start');
          drawRouteFromToIfBoth();
        });
      })
      .addTo(map);
    drawRouteFromToIfBoth();
  }

  function setDestFromCoords(lat, lng, address) {
    destCoords = { lat: lat, lng: lng };
    destAddress = address || '';
    var input = document.getElementById('team13-input-dest');
    if (input) input.value = destAddress;
    syncRouteInputHasText('team13-input-dest');
    var topInput = document.getElementById('team13-search-input');
    if (topInput) topInput.value = destAddress;
    var map = getMap();
    if (map && destMarker) map.removeLayer(destMarker);
    destMarker = L.marker([lat, lng], { icon: createDestMarkerIcon(), draggable: true })
      .on('dragend', function () {
        var pos = destMarker.getLatLng();
        destCoords = { lat: pos.lat, lng: pos.lng };
        window.Team13Api.reverseGeocode(pos.lat, pos.lng).then(function (data) {
          destAddress = (data && (data.address || data.address_compact || data.postal_address)) || '';
          var inp = document.getElementById('team13-input-dest');
          if (inp) inp.value = destAddress;
          var top = document.getElementById('team13-search-input');
          if (top) top.value = destAddress;
          syncRouteInputHasText('team13-input-dest');
          drawRouteFromToIfBoth();
        });
      })
      .addTo(map);
    drawRouteFromToIfBoth();
  }

  function drawRouteFromToIfBoth() {
    if (!startCoords || !destCoords || !window.Team13Api || typeof window.Team13Api.getRouteFromTo !== 'function') return null;
    var clearWrap = document.getElementById('team13-clear-route-wrap');
    var clearBtn = document.getElementById('team13-btn-clear-path');
    if (clearWrap) clearWrap.style.display = '';
    else if (clearBtn) clearBtn.style.display = 'block';
    return window.Team13Api.getRouteFromTo(startCoords, destCoords, routeMode)
      .then(function (r) {
        if (typeof window.updateRouteInfoBox === 'function') window.updateRouteInfoBox(r);
        if (typeof window.Team13MapCleanup === 'function') window.Team13MapCleanup();
        return r;
      })
      .catch(function (err) {
        if (typeof window.updateRouteInfoBox === 'function') window.updateRouteInfoBox(null);
        if (typeof window.showToast === 'function') window.showToast('خطا: ' + (err && err.message ? err.message : 'مسیریابی ناموفق'));
        throw err;
      });
  }

  function clearRouteLine() {
    var map = getMap();
    [window.currentPath, window.routeLayer, window.currentRoute, window.team13RouteLine].forEach(function (layer) {
      if (layer && map && map.hasLayer(layer)) map.removeLayer(layer);
    });
    window.currentPath = null;
    window.routeLayer = null;
    window.currentRoute = null;
    window.team13RouteLine = null;
    hideRouteInfo();
    if (typeof window.updateRouteInfoBox === 'function') window.updateRouteInfoBox(null);
    var clearWrap = document.getElementById('team13-clear-route-wrap');
    var clearBtn = document.getElementById('team13-btn-clear-path');
    if (clearWrap) clearWrap.style.display = 'none';
    else if (clearBtn) clearBtn.style.display = 'none';
  }

  function clearStart() {
    startCoords = null;
    startAddress = '';
    var input = document.getElementById('team13-input-start');
    if (input) input.value = '';
    syncRouteInputHasText('team13-input-start');
    var map = getMap();
    if (startMarker && map && map.hasLayer(startMarker)) {
      map.removeLayer(startMarker);
    }
    startMarker = null;
    clearRouteLine();
  }

  function clearDest() {
    destCoords = null;
    destAddress = '';
    var input = document.getElementById('team13-input-dest');
    if (input) input.value = '';
    syncRouteInputHasText('team13-input-dest');
    var topInput = document.getElementById('team13-search-input');
    if (topInput) topInput.value = '';
    var map = getMap();
    if (destMarker && map && map.hasLayer(destMarker)) {
      map.removeLayer(destMarker);
    }
    destMarker = null;
    clearRouteLine();
  }

  function swapStartDest() {
    var sC = startCoords;
    var sA = startAddress;
    var dC = destCoords;
    var dA = destAddress;
    startCoords = dC;
    startAddress = dA || '';
    destCoords = sC;
    destAddress = sA || '';
    var inputStart = document.getElementById('team13-input-start');
    var inputDest = document.getElementById('team13-input-dest');
    var topInput = document.getElementById('team13-search-input');
    if (inputStart) inputStart.value = startAddress;
    if (inputDest) inputDest.value = destAddress;
    if (topInput) topInput.value = destAddress;
    var map = getMap();
    if (startMarker && map && map.hasLayer(startMarker)) map.removeLayer(startMarker);
    if (destMarker && map && map.hasLayer(destMarker)) map.removeLayer(destMarker);
    startMarker = null;
    destMarker = null;
    if (startCoords && map) {
      startMarker = L.marker([startCoords.lat, startCoords.lng], { icon: createStartMarkerIcon(), draggable: true })
        .on('dragend', function () {
          var pos = startMarker.getLatLng();
          startCoords = { lat: pos.lat, lng: pos.lng };
          window.Team13Api.reverseGeocode(pos.lat, pos.lng).then(function (data) {
            startAddress = (data && (data.address || data.address_compact || data.postal_address)) || '';
            var inp = document.getElementById('team13-input-start');
            if (inp) inp.value = startAddress;
            drawRouteFromToIfBoth();
          });
        })
        .addTo(map);
    }
    if (destCoords && map) {
      destMarker = L.marker([destCoords.lat, destCoords.lng], { icon: createDestMarkerIcon(), draggable: true })
        .on('dragend', function () {
          var pos = destMarker.getLatLng();
          destCoords = { lat: pos.lat, lng: pos.lng };
          window.Team13Api.reverseGeocode(pos.lat, pos.lng).then(function (data) {
            destAddress = (data && (data.address || data.address_compact || data.postal_address)) || '';
            var inp = document.getElementById('team13-input-dest');
            if (inp) inp.value = destAddress;
            var top = document.getElementById('team13-search-input');
            if (top) top.value = destAddress;
            drawRouteFromToIfBoth();
          });
        })
        .addTo(map);
    }
    drawRouteFromToIfBoth();
  }

  function initStartDestUI() {
    var inputStart = document.getElementById('team13-input-start');
    var inputDest = document.getElementById('team13-input-dest');
    var resultsStart = document.getElementById('team13-start-results');
    var resultsDest = document.getElementById('team13-dest-results');
    var btnPickStart = document.getElementById('team13-btn-pick-start');
    var btnPickDest = document.getElementById('team13-btn-pick-dest');
    var btnMyLocation = document.getElementById('team13-btn-my-location');
    var modeWrap = document.getElementById('team13-route-mode-wrap');
    if (!inputStart || !inputDest) return;

    function bindAutocomplete(inputEl, resultsEl, setter) {
      if (!inputEl || !resultsEl) return;
      var debounce;
      inputEl.addEventListener('input', function () {
        clearTimeout(debounce);
        var q = (inputEl.value || '').trim();
        if (q.length < 2) { resultsEl.hidden = true; resultsEl.innerHTML = ''; return; }
        debounce = setTimeout(function () {
          var map = getMap();
          var lat, lng;
          if (map && map.getCenter) { var c = map.getCenter(); lat = c.lat; lng = c.lng; }
          mapirAutocomplete(q, lat, lng).then(function (items) {
            resultsEl.innerHTML = '';
            items.forEach(function (item) {
              var title = (item.title || item.address || item.name || item.text || '').trim();
              var ll = getItemLatLng(item);
              if (!ll) return;
              var div = document.createElement('div');
              div.className = 'team13-search-result-item';
              div.textContent = title;
              div.dataset.lat = ll.lat;
              div.dataset.lng = ll.lng;
              div.dataset.title = title;
              div.addEventListener('click', function () {
                setter(ll.lat, ll.lng, title);
                resultsEl.hidden = true;
                resultsEl.innerHTML = '';
              });
              resultsEl.appendChild(div);
            });
            resultsEl.hidden = items.length === 0;
          });
        }, 300);
      });
      inputEl.addEventListener('blur', function () {
        setTimeout(function () { resultsEl.hidden = true; }, 200);
      });
    }

    bindAutocomplete(inputStart, resultsStart, setStartFromCoords);
    bindAutocomplete(inputDest, resultsDest, setDestFromCoords);

    function syncClearHasText(inputEl) {
      var wrap = inputEl && inputEl.closest ? inputEl.closest('.team13-input-with-clear') : (inputEl && inputEl.parentNode);
      if (!wrap) return;
      if ((inputEl.value || '').trim()) wrap.classList.add('team13-has-text');
      else wrap.classList.remove('team13-has-text');
    }
    if (inputStart) {
      inputStart.addEventListener('input', function () { syncClearHasText(inputStart); });
      inputStart.addEventListener('change', function () { syncClearHasText(inputStart); });
      syncClearHasText(inputStart);
    }
    if (inputDest) {
      inputDest.addEventListener('input', function () { syncClearHasText(inputDest); });
      inputDest.addEventListener('change', function () { syncClearHasText(inputDest); });
      syncClearHasText(inputDest);
    }

    if (btnPickStart) {
      btnPickStart.addEventListener('click', function () {
        setPickMode(pickMode === 'start' ? null : 'start');
      });
    }
    if (btnPickDest) {
      btnPickDest.addEventListener('click', function () {
        setPickMode(pickMode === 'dest' ? null : 'dest');
      });
    }
    if (btnMyLocation) {
      btnMyLocation.addEventListener('click', function () {
        if (!navigator.geolocation) {
          if (window.showToast) window.showToast('مرورگر از موقعیت جغرافیایی پشتیبانی نمی‌کند');
          return;
        }
        if (window.showToast) window.showToast('در حال دریافت موقعیت فعلی...');
        navigator.geolocation.getCurrentPosition(
          function (pos) {
            var lat = pos.coords.latitude;
            var lng = pos.coords.longitude;
            window.Team13Api.reverseGeocode(lat, lng).then(function (data) {
              var addr = (data && (data.address || data.address_compact || data.postal_address)) || '';
              setStartFromCoords(lat, lng, addr);
              if (window.showToast) window.showToast('مبدا روی موقعیت شما تنظیم شد');
            }).catch(function () {
              setStartFromCoords(lat, lng, 'موقعیت من');
              if (window.showToast) window.showToast('مبدا روی موقعیت شما تنظیم شد');
            });
          },
          function (e) {
            var msg = e.code === 1 ? 'دسترسی به موقعیت رد شد. در تنظیمات مرورگر اجازهٔ مکان را فعال کنید.' : e.code === 2 ? 'موقعیت در دسترس نیست.' : e.code === 3 ? 'زمان درخواست تمام شد.' : 'دسترسی به موقعیت امکان‌پذیر نیست';
            if (window.showToast) window.showToast(msg);
          },
          { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
        );
      });
    }
    if (modeWrap) {
      modeWrap.querySelectorAll('.team13-route-mode-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
          routeMode = this.getAttribute('data-mode') || 'driving';
          modeWrap.querySelectorAll('.team13-route-mode-btn').forEach(function (b) {
            b.classList.remove('active', 'active-transport');
          });
          this.classList.add('active', 'active-transport');
          drawRouteFromToIfBoth();
          if (typeof window.Team13CloseSidebar === 'function') window.Team13CloseSidebar();
        });
      });
    }

    var btnClearStart = document.getElementById('team13-clear-start');
    var btnClearDest = document.getElementById('team13-clear-dest');
    var btnSwap = document.getElementById('team13-btn-swap-route');
    if (btnClearStart) btnClearStart.addEventListener('click', clearStart);
    if (btnClearDest) btnClearDest.addEventListener('click', clearDest);
    if (btnSwap) {
      btnSwap.addEventListener('click', function () {
        swapStartDest();
        btnSwap.classList.toggle('team13-swap-route-rotated');
      });
    }
    var btnCalcRoute = document.getElementById('team13-btn-calc-route');
    var calcRouteText = btnCalcRoute ? btnCalcRoute.querySelector('.team13-btn-calc-route-text') : null;
    var calcRouteSpinner = btnCalcRoute ? btnCalcRoute.querySelector('.team13-btn-calc-route-spinner') : null;
    if (btnCalcRoute) {
      btnCalcRoute.addEventListener('click', function () {
        if (!startCoords || !destCoords) {
          if (window.showToast) window.showToast('مبدا و مقصد را انتخاب کنید.');
          return;
        }
        if (btnCalcRoute.disabled) return;
        btnCalcRoute.disabled = true;
        btnCalcRoute.classList.add('team13-btn-calc-route-loading');
        if (calcRouteText) calcRouteText.textContent = 'در حال محاسبه...';
        if (calcRouteSpinner) calcRouteSpinner.hidden = false;
        var p = drawRouteFromToIfBoth();
        function done() {
          btnCalcRoute.disabled = false;
          btnCalcRoute.classList.remove('team13-btn-calc-route-loading');
          if (calcRouteText) calcRouteText.textContent = 'مسیریابی';
          if (calcRouteSpinner) calcRouteSpinner.hidden = true;
        }
        if (p && typeof p.then === 'function') {
          p.then(done).catch(done);
        } else {
          setTimeout(done, 1500);
        }
      });
    }
  }

  
  function onMapClickForStartDest(e) {
    if (!pickMode || pickMode !== 'start' && pickMode !== 'dest') return false;
    var map = getMap();
    if (!map || !e || !e.latlng) return true;
    var lat = e.latlng.lat;
    var lng = e.latlng.lng;
    var mode = pickMode;
    setPickMode(null);
    window.Team13Api.reverseGeocode(lat, lng)
      .then(function (data) {
        var addr = (data && (data.address || data.address_compact || data.postal_address)) || '';
        if (mode === 'start') setStartFromCoords(lat, lng, addr);
        else setDestFromCoords(lat, lng, addr);
      })
      .catch(function () {
        if (mode === 'start') setStartFromCoords(lat, lng, '');
        else setDestFromCoords(lat, lng, '');
      });
    return true;
  }

  // --- Placement mode: add pointer only when user has toggled it via "Select Point" button ---
  function setPlacementModeActive(active) {
    window.isPlacementMode = !!active;
    updateSelectionActiveCursor();
    var btn = document.getElementById('team13-btn-add-pointer');
    if (btn) btn.classList.toggle('active-btn', active);
  }

  // --- Map click: show green button only; second click (on button) → nearest-place then register or rate/photo ---
  // Ensure clicks on markers/popups do not trigger placement or other map-click logic (event priority).
  function initReverseGeocodeClick() {
    var map = getMap();
    if (!map || !window.Team13Api) return;
    map.off('click', onMapClickReverseGeocode);
    map.on('click', onMapClickReverseGeocode);

    var container = document.getElementById('map-container');
    if (container && !container._team13CaptureClickInstalled) {
      container._team13CaptureClickInstalled = true;
      container.addEventListener('click', function (e) {
        var target = e.target;
        if (target && typeof target.closest === 'function') {
          if (target.closest('.mapboxgl-marker') || target.closest('.team13-neshan-marker') ||
              target.closest('.mapboxgl-popup') || target.closest('.team13-reverse-popup-content') ||
              target.closest('.team13-reverse-popup') || target.closest('.team13-place-marker')) {
            window._team13ClickOnMarkerOrPopup = true;
          }
        }
        setTimeout(function () { window._team13ClickOnMarkerOrPopup = false; }, 0);
      }, true);
    }
  }


  
  /** پاپ‌آپ دکمهٔ سبز: یک دکمه «ادامه»؛ با کلیک روی آن nearest-place صدا زده می‌شود و بر اساس نتیجه ثبت مکان یا امتیاز/عکس. */
  function buildGreenButtonPopupContent(lat, lng, markerRef, mapRef) {
    var wrap = document.createElement('div');
    wrap.className = 'team13-reverse-popup-content';
    wrap.setAttribute('dir', 'rtl');
    wrap.innerHTML =
      '<p class="team13-reverse-popup-address">برای ثبت مکان یا امتیاز/عکس اینجا کلیک کنید.</p>' +
      '<div class="team13-reverse-popup-actions">' +
      '<button type="button" class="team13-reverse-popup-btn team13-reverse-popup-btn-green">ادامه</button>' +
      '</div>' +
      '<div class="team13-reverse-popup-footer">' +
      '<button type="button" class="team13-reverse-popup-delete-link">حذف نقطه</button>' +
      '</div>';
    var btnGreen = wrap.querySelector('.team13-reverse-popup-btn-green');
    var btnDelete = wrap.querySelector('.team13-reverse-popup-delete-link');
    if (btnGreen) {
      btnGreen.addEventListener('click', function () {
        if (!window.Team13Api || typeof window.Team13Api.fetchData !== 'function') return;
        var params = { lat: String(lat), lng: String(lng), radius_km: '0.05' };
        window.Team13Api.fetchData('nearest-place/', params)
          .then(function (data) {
            if (!data) data = {};
            var place = data.place;
            if (!place) {
              if (!window.confirm('آیا می‌خواهید در این نقطه موقعیتی ثبت کنید؟')) {
                clearReverseGeocodeMarker();
                return;
              }
              if (typeof window.Team13OpenContributionModal === 'function') {
                window.Team13OpenContributionModal(lat, lng);
              }
              clearReverseGeocodeMarker();
              return;
            }
            var placeId = place.place_id;
            var name = place.name_fa || place.name_en || 'مکان';
            if (typeof window.Team13OpenPlaceActionsModal === 'function') {
              window.Team13OpenPlaceActionsModal(placeId, name, lat, lng);
            }
            clearReverseGeocodeMarker();
          })
          .catch(function () {
            if (window.showToast) window.showToast('خطا در ارتباط با سرور.');
          });
      });
    }
    if (btnDelete) {
      btnDelete.addEventListener('click', function () { clearReverseGeocodeMarker(); });
    }
    return wrap;
  }

  function buildReversePopupContent(lat, lng, address, markerRef, mapRef) {
    var wrap = document.createElement('div');
    wrap.className = 'team13-reverse-popup-content';
    wrap.setAttribute('dir', 'rtl');
    wrap.innerHTML =
      '<p class="team13-reverse-popup-address">' + escapeHtml(address) + '</p>' +
      '<div class="team13-reverse-popup-actions">' +
      '<button type="button" class="team13-reverse-popup-btn team13-reverse-popup-btn-fav"><span class="team13-popup-star" aria-hidden="true">⭐</span> افزودن به علاقه‌مندی</button>' +
      '<button type="button" class="team13-reverse-popup-btn team13-reverse-popup-btn-start">تعیین به عنوان مبدا</button>' +
      '<button type="button" class="team13-reverse-popup-btn team13-reverse-popup-btn-dest">تعیین به عنوان مقصد</button>' +
      '</div>' +
      '<div class="team13-reverse-popup-footer">' +
      '<button type="button" class="team13-reverse-popup-delete-link">حذف نقطه</button>' +
      '</div>';
    var btnFav = wrap.querySelector('.team13-reverse-popup-btn-fav');
    var btnStart = wrap.querySelector('.team13-reverse-popup-btn-start');
    var btnDest = wrap.querySelector('.team13-reverse-popup-btn-dest');
    var btnDelete = wrap.querySelector('.team13-reverse-popup-delete-link');
    if (btnFav) {
      btnFav.addEventListener('click', function () {
        if (typeof window.Team13OpenAddFavoriteWithLocation === 'function') {
          window.Team13OpenAddFavoriteWithLocation(lat, lng, address);
        }
      });
    }
    if (btnStart) {
      btnStart.addEventListener('click', function () {
        if (typeof window.Team13OpenSidebarAndRouteTab === 'function') window.Team13OpenSidebarAndRouteTab();
        setStartFromCoords(lat, lng, address);
      });
    }
    if (btnDest) {
      btnDest.addEventListener('click', function () {
        if (typeof window.Team13OpenSidebarAndRouteTab === 'function') window.Team13OpenSidebarAndRouteTab();
        setDestFromCoords(lat, lng, address);
      });
    }
    if (btnDelete) {
      btnDelete.addEventListener('click', function () {
        clearReverseGeocodeMarker();
      });
    }
    return wrap;
  }

  function clearReverseGeocodeMarker() {
    var map = getMap();
    if (reverseGeocodeMarker && map && map.hasLayer(reverseGeocodeMarker)) {
      map.removeLayer(reverseGeocodeMarker);
    }
    reverseGeocodeMarker = null;
  }

  function onMapClickReverseGeocode(e) {
    if (window._team13ClickOnMarkerOrPopup) {
      window._team13ClickOnMarkerOrPopup = false;
      return;
    }
    if (window._team13EmergencyPickMode && e && e.latlng) {
      window._team13EmergencyPickMode = false;
      var lat = e.latlng.lat;
      var lng = e.latlng.lng;
      if (window.showToast) window.showToast('در حال جستجوی مراکز امدادی در شعاع ۱۰ کیلومتر…');
      runEmergencySearch(lat, lng);
      return;
    }
    if (onMapClickForDiscovery(e)) return;
    if (onMapClickForStartDest(e)) return;
    if (window._team13PickForFavorite && typeof window._team13PickForFavorite === 'function') {
      var cb = window._team13PickForFavorite;
      window._team13PickForFavorite = null;
      var lat = e.latlng.lat;
      var lng = e.latlng.lng;
      cb(lat, lng);
      return;
    }
    if (!window.isPlacementMode) return;
    var map = getMap();
    if (!map || !e || !e.latlng) return;
    var lat = e.latlng.lat;
    var lng = e.latlng.lng;

    if (reverseGeocodeMarker && map) {
      map.removeLayer(reverseGeocodeMarker);
      reverseGeocodeMarker = null;
    }

    var markerIcon = L.divIcon({
      className: 'team13-reverse-marker',
      html: '<span style="width:22px;height:22px;background:#40916c;border:2px solid #1b4332;border-radius:50%;display:block;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></span>',
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    });
    reverseGeocodeMarker = L.marker([lat, lng], { icon: markerIcon }).addTo(map);

    function openPopupWithAddress(address) {
      var wrap = buildReversePopupContent(lat, lng, address, reverseGeocodeMarker, map);
      reverseGeocodeMarker.bindPopup(wrap, { className: 'team13-reverse-popup', closeButton: true }).openPopup();
      setPlacementModeActive(false);
    }

    if (window.Team13Api && typeof window.Team13Api.reverseGeocode === 'function') {
      window.Team13Api.reverseGeocode(lat, lng)
        .then(function (data) {
          var address = (data && (data.formatted_address || data.address || data.address_compact || data.postal_address)) || '';
          openPopupWithAddress(address || ('مختصات: ' + lat.toFixed(5) + ', ' + lng.toFixed(5)));
        })
        .catch(function () {
          openPopupWithAddress('آدرس یافت نشد');
        });
    } else {
      openPopupWithAddress('مختصات: ' + lat.toFixed(5) + ', ' + lng.toFixed(5));
    }
  }

  }})