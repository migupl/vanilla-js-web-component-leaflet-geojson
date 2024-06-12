export const features = ((defaultMarker) => {

    const addTo = (geojson, map, theMap) => {
        if (!theMap.markers) {
            theMap.markers = getClusterAndOnDblclickDo(theMap);
        }

        const features = getFeaturesArray(geojson);
        const { points, polygons } = groupPointsAndPolygons(features);

        addPoints(points, map, theMap);
        addPolygons(polygons, map, theMap);
    }

    const addPoints = (points, sourceMap, theMap) => {
        const { map, markers } = theMap;
        points &&
            markers
                .addLayer(pointToLayer(points, sourceMap))
                .addTo(map)
    }

    const addPolygons = (polygons, sourceMap, theMap) => {
        const { map, markers } = theMap;
        polygons &&
            markers
                .addLayer(polygonToLayer(polygons, sourceMap))
                .addTo(map)
    }

    const coordsToLatLng = map => {
        const emitLatlngEvent = latlng => {
            map.dispatchEvent(new CustomEvent('x-leaflet-map-geojson:include-latlng-to-fly', {
                bubbles: true,
                composed: true,
                detail: {
                    latlng,
                }
            }))
        }

        const coordsToLatLng = coordinates => {
            const latlng = L.GeoJSON.coordsToLatLng(coordinates);
            emitLatlngEvent(latlng)
            return latlng;
        }

        return coordsToLatLng
    }

    const deleteMarker = ({ markers, layer, latlng, theMap }) => {
        const initialPopupContent = layer.getPopup()._content;

        let btn = document.createElement('button');
        btn.style = 'background-color: red; border: none; border-radius: 8px; color: white; padding: 10px;'
        btn.innerText = 'Delete Marker';
        btn.onclick = () => theMap.onMarkerRemoved({
            layer, markers,
            removingLatLng: latlng,
            theMap
        })

        bindPopup(layer, btn).openPopup();
        layer.getPopup().on('remove', () => {
            bindPopup(layer, initialPopupContent);
            layer.getPopup().off('remove');
        });
    }

    const getFeaturesArray = geojson => 'FeatureCollection' === geojson.type ? geojson.features : [geojson]

    const getClusterAndOnDblclickDo = (theMap) => {
        const markers = L.markerClusterGroup();
        markers.on('dblclick', ev => {
            const { layer, latlng } = ev;
            deleteMarker({ markers, layer, latlng, theMap });
        });

        return markers;
    }

    const groupPointsAndPolygons = features => features.reduce((r, feature) => {
        const group = feature.geometry.type == 'Point' ? 'points' : 'polygons';
        r[group] = r[group] || [];
        r[group].push(feature);
        return r;
    }, Object.create(null));


    const onEachFeature = (feature, layer) => {
        if (feature?.properties?.popupContent) {
            bindPopup(layer, feature.properties.popupContent);
        }
    }

    const pointToLayer = (feature, map) => {
        const makeDraggable = marker => marker
            .on('dragend', ev => {
                const marker = ev.target;
                const { lat, lng } = marker.getLatLng();
                const position = new L.LatLng(lat, lng);
                marker.setLatLng(position);
            });

        return L.geoJSON(feature, {
            coordsToLatLng: coordsToLatLng(map),
            onEachFeature: onEachFeature,
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
                        icon: L.icon(feature?.properties?.icon || defaultMarker),
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

    const polygonToLayer = (feature, map) => {
        return L.geoJSON(feature, {
            coordsToLatLng: coordsToLatLng(map),
            onEachFeature: onEachFeature,
            pointToLayer: function (feature, latlng) {
                const icon = {
                    icon: L.icon(feature?.properties?.icon || defaultMarker)
                };
                return L.marker(latlng, icon);
            },
            style(feature) {
                return feature?.properties?.style;
            },
        });
    }

    const bindPopup = (layer, content) => layer.bindPopup(content, {
        closeButton: false
    })

    return {
        addTo
    }
})({
    iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
})
