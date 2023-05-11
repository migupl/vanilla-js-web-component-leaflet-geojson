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

    addTo = (geojson, mapId, theMap) => {
        theMap.markers = theMap.markers || L.markerClusterGroup();

        const features = this.#getFeaturesArray(geojson);
        const { points, polygons } = this.#groupPointsAndPolygons(features);

        this.#addPoints(points, mapId, theMap);
        this.#addPolygons(polygons, mapId, theMap);
    }

    #addPoints = (points, mapId, theMap) => {
        const { map, markers } = theMap;
        points &&
            markers
                .addLayer(this.#pointToLayer(points, mapId))
                .addTo(map)
    }

    #addPolygons = (polygons, mapId, theMap) => {
        const { map, markers } = theMap;
        polygons &&
            markers
                .addLayer(this.#polygonToLayer(polygons, mapId))
                .addTo(map)
    }

    #coordsToLatLng = mapId => new LeafletMapFeature(mapId).coordsToLatLng

    #getFeaturesArray = geojson => 'FeatureCollection' === geojson.type ? geojson.features : [geojson]

    #groupPointsAndPolygons = features => features.reduce((r, feature) => {
        const group = feature.geometry.type == 'Point' ? 'points' : 'polygons';
        r[group] = r[group] || [];
        r[group].push(feature);
        return r;
    }, Object.create(null));

    #onEachFeature = (feature, layer) => {
        if (feature?.properties?.popupContent) {
            layer.bindPopup(feature.properties.popupContent);
            layer.on('dblclick', () => this.#remove(layer));
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

    #remove = layer => {
        const { type } = layer.feature.geometry
        const remove = confirm(`Are you sure you want to remove this '${type}'?`)
        if (remove) layer.remove();
    }
}

const features = new LeafletMapFeatures();
export { features as Features }