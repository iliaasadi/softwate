/**
 * Team 13 — نقشهٔ نشان با Mapbox GL JS SDK
 * مستندات: https://platform.neshan.org/docs/sdk/web/mapboxgl/neshan-mapbox-gl-js/
 * مارکر: https://platform.neshan.org/docs/sdk/web/mapboxgl/examples/neshan-mapbox-add-marker/
 * رسم مسیر: https://platform.neshan.org/docs/sdk/web/mapboxgl/examples/neshan-mapbox-draw-route/
 * نقشه با nmp_mapboxgl.Map؛ مسیر با L.polyline (GeoJSON LineString)؛ کلید از window.NESHAN_MAP_KEY.
 */
(function () {
  var mapKey = typeof window !== 'undefined' && window.NESHAN_MAP_KEY;
  if (!mapKey || typeof nmp_mapboxgl === 'undefined') return;

  var TEHRAN_LNG = 51.3347;
  var TEHRAN_LAT = 35.7219;
  var DEFAULT_ZOOM = 12;
  var routeLayerId = 'team13-route-line';
  var routeSourceId = 'team13-route-source';
  var layerStore = {}; // id -> { remove: fn } for removeLayer/hasLayer

  var rawMap = new nmp_mapboxgl.Map({
    mapType: nmp_mapboxgl.Map.mapTypes.neshanVector,
    container: 'map-container',
    zoom: DEFAULT_ZOOM,
    pitch: 0,
    center: [TEHRAN_LNG, TEHRAN_LAT],
    minZoom: 2,
    maxZoom: 21,
    trackResize: true,
    mapKey: mapKey,
    poi: true,
    traffic: true,
    mapTypeControllerOptions: {
      show: true,
      position: 'bottom-left'
    }
  });
})