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
  }})