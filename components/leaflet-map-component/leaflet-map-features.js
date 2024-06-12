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

class LeafletMapFeatures {

    static DEFAULT_MARKER = {
        iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    };

    addTo = (geojson, map, theMap) => {
        if (!theMap.markers) {
            theMap.markers = this.#getClusterAndOnDblclickDo(theMap);
        }

        const features = this.#getFeaturesArray(geojson);
        const { points, polygons } = this.#groupPointsAndPolygons(features);

        this.#addPoints(points, map, theMap);
        this.#addPolygons(polygons, map, theMap);
    }

    #addPoints = (points, sourceMap, theMap) => {
        const { map, markers } = theMap;
        points &&
            markers
                .addLayer(this.#pointToLayer(points, sourceMap))
                .addTo(map)
    }

    #addPolygons = (polygons, sourceMap, theMap) => {
        const { map, markers } = theMap;
        polygons &&
            markers
                .addLayer(this.#polygonToLayer(polygons, sourceMap))
                .addTo(map)
    }

    #coordsToLatLng = map => new LeafletMapFeature(map).coordsToLatLng

    #deleteMarker = ({ markers, layer, latlng, theMap }) => {
        const initialPopupContent = layer.getPopup()._content;

        let btn = document.createElement('button');
        btn.style = 'background-color: red; border: none; border-radius: 8px; color: white; padding: 10px;'
        btn.innerText = 'Delete Marker';
        btn.onclick = () => theMap.onMarkerRemoved({
            layer, markers,
            removingLatLng: latlng,
            theMap
        })

        this.#bindPopup(layer, btn).openPopup();
        layer.getPopup().on('remove', () => {
            this.#bindPopup(layer, initialPopupContent);
            layer.getPopup().off('remove');
        });
    }

    #getFeaturesArray = geojson => 'FeatureCollection' === geojson.type ? geojson.features : [geojson]

    #getClusterAndOnDblclickDo = (theMap) => {
        const markers = L.markerClusterGroup();
        markers.on('dblclick', ev => {
            const { layer, latlng } = ev;
            this.#deleteMarker({ markers, layer, latlng, theMap });
        });

        return markers;
    }

    #groupPointsAndPolygons = features => features.reduce((r, feature) => {
        const group = feature.geometry.type == 'Point' ? 'points' : 'polygons';
        r[group] = r[group] || [];
        r[group].push(feature);
        return r;
    }, Object.create(null));

    #makeDraggable = marker => marker
        .on('dragend', ev => {
            const marker = ev.target;
            const { lat, lng } = marker.getLatLng();
            const position = new L.LatLng(lat, lng);
            marker.setLatLng(position);
        });

    #onEachFeature = (feature, layer) => {
        if (feature?.properties?.popupContent) {
            this.#bindPopup(layer, feature.properties.popupContent);
        }
    }

    #pointToLayer = (feature, map, makeDraggable = this.#makeDraggable) => {
        return L.geoJSON(feature, {
            coordsToLatLng: this.#coordsToLatLng(map),
            onEachFeature: this.#onEachFeature,
            pointToLayer: function (feature, latlng) {
                let point;
                const isCircle = feature?.properties?.radius;

                if (isCircle) {
                    const options = {
                        ...feature.properties,
                    }
                    delete options.style;
                    delete options.draggable;
                    point = L.circle(latlng, options);
                }
                else {
                    const isDraggable = feature?.properties?.draggable || false;
                    const options = {
                        icon: L.icon(feature?.properties?.icon || LeafletMapFeatures.DEFAULT_MARKER),
                        draggable: isDraggable
                    };

                    point = L.marker(latlng, options);
                    if (isDraggable) makeDraggable(point);
                }

                return point;
            },
            style(feature) {
                return feature?.properties?.style;
            }
        });
    }

    #polygonToLayer = (feature, map) => {
        return L.geoJSON(feature, {
            coordsToLatLng: this.#coordsToLatLng(map),
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

    #bindPopup = (layer, content) => layer.bindPopup(content, {
        closeButton: false
    })
}

const features = new LeafletMapFeatures();
export { features as Features }