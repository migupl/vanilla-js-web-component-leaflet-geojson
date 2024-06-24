const dispatchWithDelay = (map, geojson, delay = 200) => {
    setTimeout(function () {
        const [features, _] = geojson;
        if (features) {
            map.dispatchEvent(new CustomEvent('x-leaflet-geojson-map:add', {
                detail: {
                    geojson: features
                }
            }));

            dispatchWithDelay(map, geojson.slice(1), delay + 200)
        };
    }, delay);
}
