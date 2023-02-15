window.onload = (event) => {
    const introductionMap = document.getElementById('initial-map');
    const eventBus = introductionMap.eventBus;

    const features = {
        type: "FeatureCollection",
        features: [{
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: [-0.09, 51.5]
            },
            properties: {
                popupContent: "<b>Hello world!</b><br>I am a popup.",
                icon: {
                    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-violet.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41]
                }
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
                style: {
                    color: 'green',
                    fillColor: 'lightgreen',
                    fillOpacity: 0.5,
                }
            }
        },
        {
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
                    color: 'black'
                }
            }
        }]
    };

    eventBus.dispatch('x-leaflet-map-geojson-add', {
        leafletMap: introductionMap,
        geojson: features
    });

    const multiPoint = {
        type: "Feature",
        geometry: {
            type: "MultiPoint",
            coordinates: [
                [-3.682427584343109, 40.4111491873453],
                [-3.68192202963495, 40.41365692730523],
                [-3.681948851722108, 40.41519059487516]
            ]
        },
        properties: {
            popupContent: "I am a MultiPoint.",
            icon: {
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
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
                [-3.687652527491114, 40.409744093267946],
                [-3.682427584343109, 40.4111491873453]
            ]
        },
        properties: {
            popupContent: "I am a LineString.",
            style: {
                color: "darkgreen"
            }
        }
    };

    const multiLineString = {
        type: "Feature",
        geometry: {
            type: "MultiLineString",
            coordinates: [
                [
                    [-3.682427584343109, 40.4111491873453],
                    [-3.6826099745492304, 40.411341160113004]
                ],
                [
                    [-3.6826099745492304, 40.411341160113004],
                    [-3.6826528899000177, 40.411506583044506]
                ],
                [
                    [-3.6826528899000177, 40.411506583044506],
                    [-3.68243831317919853, 40.411606653500144]
                ],
                [
                    [-3.68243831317919853, 40.411606653500144],
                    [-3.682108401470939, 40.412278551277]
                ],
                [
                    [-3.682108401470939, 40.412278551277],
                    [-3.681923329048269, 40.41250115425148]
                ],
                [
                    [-3.681923329048269, 40.41250115425148],
                    [-3.6817275277905215, 40.41301170869761]
                ],
                [
                    [-3.6817275277905215, 40.41301170869761],
                    [-3.681829451732911, 40.41325473125318]
                ],
                [
                    [-3.681829451732911, 40.41325473125318],
                    [-3.6817870058620503, 40.41364722100761]
                ],
                [
                    [-3.6817870058620503, 40.41364722100761],
                    [-3.6819264807305836, 40.41399847689981]
                ],
                [
                    [-3.6819264807305836, 40.41399847689981],
                    [-3.681591447371322, 40.41409650736312]
                ],
                [
                    [-3.681591447371322, 40.41409650736312],
                    [-3.6818127296148377, 40.41472753715036]
                ],
                [
                    [-3.6818127296148377, 40.41472753715036],
                    [-3.6818435750184553, 40.414991996086876]
                ]
            ]
        },
        properties: {
            popupContent: "I am a MultiLineString.",
            style: {
                color: "green",
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
                        [-3.6851719536314866, 40.418190942101084],
                        [-3.6836913742578337, 40.41853094304074],
                        [-3.68269536666569, 40.41612787699837],
                        [-3.684217761317601, 40.415778927180085]
                    ],
                ],
                [
                    [
                        [-3.6818543038540397, 40.41399031407121],
                        [-3.6811368129438007, 40.41413326654296],
                        [-3.6811247430031844, 40.41355941263011],
                        [-3.6816638670142425, 40.41346649276557]
                    ]
                ]
            ]
        },
        properties: {
            popupContent: "I am a MultiPolygon.",
            style: {
                color: "black",
                opacity: 0.5,
            }
        }
    };

    const walking = document.getElementById('walk-throught-el-retiro');
    const walkThroughtElRetiro = {
        type: "FeatureCollection",
        features: [multiPoint, lineString, multiLineString, multiPolygon]
    };


    eventBus.dispatch('x-leaflet-map-geojson-add', {
        leafletMap: walking,
        geojson: walkThroughtElRetiro
    });
}

function copyEvent(id) {
    alert('Copying ', id);
}