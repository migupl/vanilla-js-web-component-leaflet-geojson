window.onload = (event) => {

    document.addEventListener('x-leaflet-map:marker-removed', ev => {
        console.log(ev);
    })

    const marker = {
        type: "Feature",
        geometry: {
            type: "Point",
            coordinates: [-0.09, 51.5]
        },
        properties: {
            popupContent: "<b>Hello world!</b><br>I am a popupContent.",
            icon: {
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
            }
        }
    }

    const multiPoint = {
        type: "Feature",
        geometry: {
            type: "MultiPoint",
            coordinates: [
                [-0.14082945900490862, 51.500729712288845],
                [-0.126152411319017, 51.518999110271444],
                [-0.09791411489411447, 51.513123787337804]
            ]
        },
        properties: {
            popupContent: "I am a MultiPoint.",
            icon: {
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-black.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
            }
        }
    };

    const lineString = {
        type: "Feature",
        geometry: {
            type: "LineString",
            coordinates: [
                [-0.14082945900490862, 51.500729712288845],
                [-0.126152411319017, 51.518999110271444],
                [-0.09791411489411447, 51.513123787337804]
            ]
        },
        properties: {
            popupContent: "I am a LineString.",
            style: {
                color: "black",
                opacity: 1,
            }
        }
    };

    const multiLineString = {
        type: "Feature",
        geometry: {
            type: "MultiLineString",
            coordinates: [
                [
                    [-0.12452174238299801, 51.50066274018154],
                    [-0.11752654129293857, 51.50076292147487]
                ],
                [
                    [-0.11752654129293857, 51.50076292147487],
                    [-0.11614252143672825, 51.50273310885865]
                ],
                [
                    [-0.11614252143672825, 51.50273310885865],
                    [-0.11935044340901013, 51.50326738227206]
                ],
            ]
        },
        properties: {
            popupContent: "I am a MultiLineString.",
            style: {
                color: "green",
                opacity: 1,
            }
        }
    };

    const polygon = {
        type: "Feature",
        geometry: {
            type: "Polygon",
            coordinates: [[
                [-0.08, 51.509],
                [-0.06, 51.503],
                [-0.047, 51.51]
            ]]
        },
        properties: {
            popupContent: "I am a polygon.",
            style: {
                color: "magenta",
                opacity: 1,
            }
        }
    };

    const multiPolygon = {
        type: "Feature",
        geometry: {
            type: "MultiPolygon",
            coordinates: [
                [
                    [
                        [-0.09365488101163101, 51.509838432977276],
                        [-0.09341884661902165, 51.5097449490648],
                        [-0.0944273572056253, 51.50808891653398],
                        [-0.09470630694234546, 51.508142337877736]
                    ],
                ],
                [
                    [
                        [-0.08751798680378747, 51.508930295422665],
                        [-0.08723903706706732, 51.50887687500278],
                        [-0.0879685979169508, 51.506926986810356],
                        [-0.08820463230956016, 51.506940342492776]
                    ]
                ]
            ]
        },
        properties: {
            popupContent: "I am a MultiPolygon.",
            style: {
                color: "red",
                opacity: 1,
            }
        }
    };

    const features = {
        type: "FeatureCollection",
        features: [{
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: [-0.11, 51.508]
            },
            properties: {
                popupContent: "<b>Hello world!</b><br>I am a popup."
            }
        },
        {
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: [-0.11, 51.508]
            },
            properties: {
                radius: 500,
                popupContent: "I am a circle.",
                style: {
                    color: 'red',
                    fillColor: '#f03',
                    fillOpacity: 0.5,
                }
            }
        }]
    };

    const map = document.querySelector('leaflet-map');
    const eventBus = map.eventBus;

    const geojson = [multiPolygon, marker, multiLineString, multiPoint, lineString, polygon, features];
    dispatchWithDelay(eventBus, map, geojson);
}
