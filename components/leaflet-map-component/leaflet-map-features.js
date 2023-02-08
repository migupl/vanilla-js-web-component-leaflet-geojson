class LeafletMapFeatures {

    add(geojson, leafletMap) {
        const features = this._getFeaturesArray(geojson);
        const pointsAndPolygons = this._groupPointsAndPolygons(features);

        this._addPoints(pointsAndPolygons?.point)
            .addTo(leafletMap);

        this._addPolygons(pointsAndPolygons?.polygon)
            .addTo(leafletMap);
    }

    _addPoints = points => points && this._pointToLayer(points)
    _addPolygons = polygons => polygons && this._polygonToLayer(polygons)

    _getFeaturesArray = geojson => 'FeatureCollection' === geojson.type ? geojson.features : [geojson]

    _groupPointsAndPolygons = features => features.reduce((r, feature) => {
        const group = feature.geometry.type == 'Point' ? 'point' : 'polygon';
        r[group] = r[group] || [];
        r[group].push(feature);
        return r;
    }, Object.create(null));

    _onEachFeature(feature, layer) {
        if (feature?.properties?.popupContent) {
            layer.bindPopup(feature.properties.popupContent);
        }
    }

    _pointToLayer = feature => {
        return L.geoJSON(feature, {
            onEachFeature: this._onEachFeature,
            pointToLayer: function (feature, latlng) {
                let point;
                const isCircle = feature?.properties?.radius;

                if (isCircle) {
                    const properties = {
                        ...feature.properties,
                        ...feature.properties.style
                    }
                    point = L.circleMarker(latlng, properties);
                }
                else {
                    const icon = feature?.properties?.icon ? L.icon(feature.properties.icon) : L.icon();
                    point = L.marker(latlng, icon);
                }

                return point;
            }
        });
    }

    _polygonToLayer = feature => {
        return L.geoJSON(feature, {
            onEachFeature: this._onEachFeature,
            pointToLayer: function (feature, latlng) {
                const icon = feature?.properties?.icon ? L.icon(feature.properties.icon) : L.icon();
                return L.marker(latlng, icon);
            },
            style(feature) {
                return feature?.properties?.style;
            },
        });
    }
}

const features = new LeafletMapFeatures();
export { features }