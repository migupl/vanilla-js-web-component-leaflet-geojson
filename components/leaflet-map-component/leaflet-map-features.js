class LeafletMapFeatures {

    add(feature, leafletMap) {
        this._leafletMap = leafletMap;
        if ('Point' == feature.geometry.type) {
            this._pointToLayer(feature);
        } else {
            this._polygonToLayer(feature)
        }
    }

    _onEachFeature(feature, layer) {
        if (feature?.properties?.popupContent) {
            layer.bindPopup(feature.properties.popupContent);
        }
    }

    _pointToLayer = feature => {
        const isCircle = feature?.properties?.radius;
        L.geoJSON(feature, {
            onEachFeature: this._onEachFeature,
            pointToLayer: function (feature, latlng) {
                return isCircle ?
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