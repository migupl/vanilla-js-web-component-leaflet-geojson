class LeafletMapFeature {

    #map;

    constructor(map) {
        this.#map = map;
    }

    coordsToLatLng = coordinates => {
        const latlng = L.GeoJSON.coordsToLatLng(coordinates);

        this.#map.dispatchEvent(new CustomEvent('x-leaflet-map-geojson:add-latlng', {
            bubbles: true,
            composed: true,
            detail: {
                latlng: latlng,
                map: this.#map
            }
        }));

        return latlng;
    }
}

export { LeafletMapFeature }