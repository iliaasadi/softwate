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
  }})