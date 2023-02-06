class LeafletMapFeatures {

    add(geojson, leafletMap) {
        this._leafletMap = leafletMap;

        const features = this._getFeaturesArray(geojson);
        const pointsAndPolygons = this._groupPointsAndPolygons(features);

        this._addPoints(pointsAndPolygons?.point)
        this._addPolygons(pointsAndPolygons?.polygon);
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
        L.geoJSON(feature, {
            onEachFeature: this._onEachFeature,
            pointToLayer: function (feature, latlng) {
                return feature?.properties?.radius ?
                    L.circleMarker(latlng, feature.properties) :
                    L.marker(latlng, L.icon({}))
            }
        }).addTo(this._leafletMap);
    }

    _polygonToLayer = feature => {
        L.geoJSON(feature, {
            onEachFeature: this._onEachFeature
        }).addTo(this._leafletMap);
    }
}

const features = new LeafletMapFeatures();
export { features }