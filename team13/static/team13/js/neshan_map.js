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

  
  function wrapMap(map) {
    var eventHandlers = { click: [], mousedown: [], mouseup: [], mouseout: [], mouseleave: [], popupopen: [] };

    function makeClickPayload(e) {
      return { latlng: { lat: e.lngLat.lat, lng: e.lngLat.lng } };
    }
    function makePointerPayload(e) {
      var pt = e.point;
      return {
        containerPoint: pt ? { x: pt.x, y: pt.y } : null,
        latlng: e.lngLat ? { lat: e.lngLat.lat, lng: e.lngLat.lng } : null
      };
    }

    function onMapEvent(event, fn) {
      if (!eventHandlers[event]) eventHandlers[event] = [];
      var wrapperFn = function (e) {
        var payload = event === 'click' ? makeClickPayload(e) : makePointerPayload(e);
        if (!payload.latlng && e.lngLat) payload.latlng = { lat: e.lngLat.lat, lng: e.lngLat.lng };
        fn(payload);
      };
      eventHandlers[event].push({ userFn: fn, wrapperFn: wrapperFn });
      if ((event === 'mouseout' || event === 'mouseleave') && typeof map.getContainer === 'function') {
        var container = map.getContainer();
        if (container) container.addEventListener(event, wrapperFn);
      } else {
        map.on(event, wrapperFn);
      }
      return this;
    }

    function offMapEvent(event, fn) {
      var list = eventHandlers[event];
      if (!list) return this;
      for (var i = 0; i < list.length; i++) {
        if (list[i].userFn === fn) {
          var w = list[i].wrapperFn;
          if ((event === 'mouseout' || event === 'mouseleave') && typeof map.getContainer === 'function') {
            var container = map.getContainer();
            if (container) container.removeEventListener(event, w);
          } else {
            map.off(event, w);
          }
          list.splice(i, 1);
          break;
        }
      }
      return this;
    }

    return {
      _map: map,
      setView: function (center, zoom) {
        var lng = center[1], lat = center[0];
        if (center.lng != null) { lng = center.lng; lat = center.lat; }
        map.flyTo({ center: [lng, lat], zoom: zoom || DEFAULT_ZOOM });
        return this;
      },
      getCenter: function () {
        var c = map.getCenter();
        return { lat: c.lat, lng: c.lng };
      },
      getZoom: function () { return map.getZoom(); },
      flyTo: function (center, zoom, opts) {
        var lng = center[1], lat = center[0];
        if (center.lng != null) { lng = center.lng; lat = center.lat; }
        map.flyTo({ center: [lng, lat], zoom: zoom || map.getZoom(), duration: (opts && opts.duration) || 0.5 });
      },
      invalidateSize: function () { map.resize(); },
      createPane: function (name) {
        return { style: { zIndex: 1000 } };
      },
      getPane: function (name) {
        return null;
      },
      on: function (event, fn) {
        if (event === 'click' || event === 'mousedown' || event === 'mouseup' || event === 'mouseout' || event === 'mouseleave') {
          return onMapEvent(event, fn);
        }
        if (event === 'popupopen') {
          if (!eventHandlers.popupopen) eventHandlers.popupopen = [];
          eventHandlers.popupopen.push(fn);
        }
        return this;
      },
      off: function (event, fn) {
        if (event === 'click' || event === 'mousedown' || event === 'mouseup' || event === 'mouseout' || event === 'mouseleave') {
          return offMapEvent(event, fn);
        }
        if (event === 'popupopen' && eventHandlers.popupopen) {
          eventHandlers.popupopen = eventHandlers.popupopen.filter(function (f) { return f !== fn; });
        }
        return this;
      },
      _firePopupOpen: function (popupRef) {
        (eventHandlers.popupopen || []).forEach(function (fn) { fn({ popup: popupRef }); });
      },
      containerPointToLatLng: function (containerPoint) {
        if (!containerPoint || (containerPoint.x == null && containerPoint.y == null)) return null;
        var x = containerPoint.x != null ? containerPoint.x : 0;
        var y = containerPoint.y != null ? containerPoint.y : 0;
        try {
          var lngLat = map.unproject([x, y]);
          return { lat: lngLat.lat, lng: lngLat.lng };
        } catch (err) {
          return null;
        }
      },
      removeLayer: function (layer) {
        if (layer && typeof layer.remove === 'function') {
          layer.remove();
          return;
        }
        if (layer && layer._layerId && map.getLayer(layer._layerId)) {
          map.removeLayer(layer._layerId);
          if (layer._sourceId) map.removeSource(layer._sourceId);
        }
      },
      hasLayer: function (layer) {
        if (!layer) return false;
        if (layer._onMap === true) return true;
        if (layer._layerId) return !!map.getLayer(layer._layerId);
        return false;
      },
      fitBounds: function (bounds, opts) {
        if (!bounds || typeof bounds.getSouthWest !== 'function' || typeof bounds.getNorthEast !== 'function') return;
        var padding = (opts && opts.padding) || [40, 40];
        var sw = bounds.getSouthWest();
        var ne = bounds.getNorthEast();
        map.fitBounds([[sw.lng, sw.lat], [ne.lng, ne.lat]], { padding: padding });
      },
      getBounds: function () {
        var b = map.getBounds();
        return {
          getSouthWest: function () { return { lat: b.getSouth(), lng: b.getWest() }; },
          getNorthEast: function () { return { lat: b.getNorth(), lng: b.getEast() }; }
        };
      },
      getContainer: function () {
        return (typeof map.getContainer === 'function' && map.getContainer()) || null;
      }
    };
  }

  var mapWrapper = wrapMap(rawMap);

})