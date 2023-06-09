class LeafletMapFeature {

    #map;

    constructor(map) {
        this.#map = map;
    }

    coordsToLatLng = coordinates => {
        const latlng = L.GeoJSON.coordsToLatLng(coordinates);
        this.#map.dispatchEvent(new CustomEvent('x-leaflet-map-geojson:include-latlng-to-fly', {
            bubbles: true,
            composed: true,
            detail: {
                latlng: latlng,
            }
        }));

        return latlng;
    }
}

export { LeafletMapFeature }