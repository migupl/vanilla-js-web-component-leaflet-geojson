const dispatchWithDelay = (eventBus, map, geojson, delay = 200) => {
    setTimeout(function () {
        const [features, rest] = geojson;
        if (features) {
            eventBus.dispatch('x-leaflet-map-geojson-add', { leafletMap: map, geojson: features })
            dispatchWithDelay(eventBus, map, geojson.slice(1), delay + 200)
        };
    }, delay);
}
