const dispatchWithDelay = (map, geojson, delay = 200) => {
    setTimeout(function () {
        const [features, rest] = geojson;
        if (features) {
            map.dispatchEvent(new CustomEvent('x-leaflet-map-geojson-add', {
                detail: {
                    leafletMap: map,
                    geojson: features
                }
            }));

            dispatchWithDelay(map, geojson.slice(1), delay + 200)
        };
    }, delay);
}
