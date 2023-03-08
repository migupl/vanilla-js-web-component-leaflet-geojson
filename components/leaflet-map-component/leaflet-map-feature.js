import { EventBus } from "./event-bus.js";

class LeafletMapFeature {

    constructor(mapId) {
        this._mapId = mapId;
    }

    coordsToLatLng = coordinates => {
        const latlng = L.GeoJSON.coordsToLatLng(coordinates);
        latlng.mapId = this._mapId;
        EventBus.dispatch('x-leaflet-map-geojson:add-latlng', latlng);

        return latlng;
    }
}

export { LeafletMapFeature }