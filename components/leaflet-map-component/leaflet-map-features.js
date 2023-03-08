import { LeafletMapFeature } from "./leaflet-map-feature.js";

class LeafletMapFeatures {

    static DEFAULT_MARKER = {
        iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    };

    addTo(geojson, leafletMap, mapId) {
        const features = this.#getFeaturesArray(geojson);
        const { points, polygons } = this.#groupPointsAndPolygons(features);

        this.#addPoints(points, mapId, leafletMap);
        this.#addPolygons(polygons, mapId, leafletMap);
    }

    #addPoints = (points, mapId, leafletMap) => points && this.#pointToLayer(points, mapId).addTo(leafletMap)
    #addPolygons = (polygons, mapId, leafletMap) => polygons && this.#polygonToLayer(polygons, mapId).addTo(leafletMap)

    #coordsToLatLng = mapId => new LeafletMapFeature(mapId).coordsToLatLng

    #getFeaturesArray = geojson => 'FeatureCollection' === geojson.type ? geojson.features : [geojson]

    #groupPointsAndPolygons = features => features.reduce((r, feature) => {
        const group = feature.geometry.type == 'Point' ? 'points' : 'polygons';
        r[group] = r[group] || [];
        r[group].push(feature);
        return r;
    }, Object.create(null));

    #onEachFeature(feature, layer) {
        if (feature?.properties?.popupContent) {
            layer.bindPopup(feature.properties.popupContent);
        }
    }

    #pointToLayer = (feature, mapId) => {
        return L.geoJSON(feature, {
            coordsToLatLng: this.#coordsToLatLng(mapId),
            onEachFeature: this.#onEachFeature,
            pointToLayer: function (feature, latlng) {
                let point;
                const isCircle = feature?.properties?.radius;

                if (isCircle) {
                    const properties = {
                        ...feature.properties,
                    }
                    delete properties.style;
                    point = L.circle(latlng, properties);
                }
                else {
                    const icon = {
                        icon: L.icon(feature?.properties?.icon || LeafletMapFeatures.DEFAULT_MARKER)
                    };
                    point = L.marker(latlng, icon);
                }

                return point;
            },
            style(feature) {
                return feature?.properties?.style;
            }
        });
    }

    #polygonToLayer = (feature, mapId) => {
        return L.geoJSON(feature, {
            coordsToLatLng: this.#coordsToLatLng(mapId),
            onEachFeature: this.#onEachFeature,
            pointToLayer: function (feature, latlng) {
                const icon = {
                    icon: L.icon(feature?.properties?.icon || LeafletMapFeatures.DEFAULT_MARKER)
                };
                return L.marker(latlng, icon);
            },
            style(feature) {
                return feature?.properties?.style;
            },
        });
    }
}

const features = new LeafletMapFeatures();
export { features as Features }