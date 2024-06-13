;(() => {
    class LeafletMap extends HTMLElement {

        maps = new WeakMap();

        constructor() {
            super();
            this.attachShadow({ mode: 'open' });

            this.#registerEvents();
        }

        connectedCallback() {
            const css = mapElements.getWcStyleNode();
            this.#appendChild(css);

            const [customStyleClass, customStyleFile] = this.#getCustomStyle();

            const customCss = mapElements.getStyleNodeFrom(customStyleFile);
            this.#appendChild(customCss);

            const markerClusterCss = mapElements.getMarkerClusterStyleNode();
            markerClusterCss.forEach(style => this.#appendChild(style))

            const leafletCss = mapElements.getLeafletStyleNode();
            this.#appendChild(leafletCss);

            const map = mapElements.getWcNode();
            this.#addCustomStyleClass(customStyleClass, map);
            this.#appendChild(map);
            this.#initializeMap(map);
        }

        #addCustomStyleClass = (styleClass, el) => {
            if (styleClass) {
                el.classList.add(styleClass);
            }
        }

        #addNewMarkerTo = map => {
            const isAddingAllowed = this.hasAttribute('allowAddMarker');
            if (!isAddingAllowed) return;

            const getAddingButton = latlng => {
                const { lat, lng } = latlng;

                let btn = document.createElement('button');
                btn.style = 'background-color: blue; border: none; border-radius: 8px; color: white; padding: 10px;';
                btn.innerText = `Click to adding a point at lat: ${lat}, lng: ${lng}`;
                btn.onclick = _ => {
                    this.#emitEventMarkerAdded(latlng);
                    map.closePopup();
                };

                return btn;
            }

            map.addEventListener('contextmenu', e => {
                const { latlng } = e;
                const btn = getAddingButton(latlng);
                map.openPopup(btn, latlng, { closeButton: false })
            });

        }

        #appendChild = element => this.shadowRoot.appendChild(element)

        #emitEvent = (eventName, detail) => {
            const evt = new CustomEvent(eventName, {
                bubbles: true,
                composed: true,
                detail: detail
            });
            this.shadowRoot.dispatchEvent(evt);
        }

        #emitEventMarkerAdded = latlng => {
            this.#emitEvent('x-leaflet-map:marker-pointed-out', {
                latlng: latlng
            });
        }

        #emitEventMarkerRemoved = feature => {
            this.#emitEvent('x-leaflet-map:marker-removed', {
                feature: feature
            });
        }

        #getCustomStyle = () => (this.getAttribute('customStyle') || '').split(':')

        #initializeMap = mapElement => {
            const opts = this.#mapOptions();
            const map = L.map(mapElement, opts);

            this.#addNewMarkerTo(map);

            this.maps.set(this, {
                map: map,
                tile: opts.layers,
                markers: null,
                onMarkerRemoved: this.#remove,
                latLngPoints: []
            });
        }

        #isThisMap = mapId => mapId === this.id

        #mapOptions = () => {
            const defaults = {
                latitude: 51.505,
                longitude: -0.09,
                maxZoom: 19,
                tileCopyright: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                tileServer: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                zoom: 13
            }

            const tileCopyright = this.getAttribute('tileCopyright') ||
                (this.getAttribute('tileServer') ? '' : defaults.tileCopyright);
            const opts = {
                center: new L.LatLng(
                    this.getAttribute('latitude') || defaults.latitude,
                    this.getAttribute('longitude') || defaults.longitude
                ),
                zoom: this.getAttribute('zoom') || defaults.zoom,
                layers: L.tileLayer(this.getAttribute('tileServer') || defaults.tileServer, {
                    maxZoom: this.getAttribute('maxZoom') || defaults.maxZoom,
                    attribution: tileCopyright
                })
            };
            return opts;
        }

        #registerEvents = () => {
            [
                'x-leaflet-map-clear',
                'x-leaflet-map-geojson-add',
                'x-leaflet-map-geojson:include-latlng-to-fly',
            ].forEach(eventName => this.addEventListener(eventName, ev =>
                ev.stopPropagation()
            ))

            this.addEventListener('x-leaflet-map-clear', (event) => {
                const targetMap = event.target;

                if (this.#isThisMap(targetMap.id)) {
                    const { map, tile } = this.maps.get(targetMap);
                    map.eachLayer(function (layer) {
                        if (layer !== tile) layer.removeFrom(map);
                    });
                }
            });

            this.addEventListener('x-leaflet-map-geojson-add', (event) => {
                const targetMap = event.target;

                if (this.#isThisMap(targetMap.id)) {
                    const map = this.maps.get(targetMap);
                    const { geojson } = event.detail;

                    this.#actions.addTo(geojson, targetMap, map);
                }
            });

            this.addEventListener('x-leaflet-map-geojson:include-latlng-to-fly', (event) => {
                const targetMap = event.target;

                if (this.#isThisMap(targetMap.id)) {
                    const { map, latLngPoints } = this.maps.get(targetMap);

                    const { latlng: { lng, lat } } = event.detail;
                    const latLng = L.latLng(lat, lng);

                    latLngPoints.push(latLng);

                    this.#setViewToBounds(map, latLngPoints);
                }
            });
        }

        #remove = ({ layer, markers, removingLatLng, theMap }) => {
            const { feature } = layer;
            if (feature) {
                let { map, latLngPoints } = theMap;
                const removingPoint = L.latLng(removingLatLng);
                const remainingPoints = latLngPoints.filter(point => !point.equals(removingPoint, 0));

                markers.removeLayer(layer);
                this.#emitEventMarkerRemoved(feature);

                theMap.latLngPoints = remainingPoints;

                if (remainingPoints.length)
                    this.#setViewToBounds(map, remainingPoints);
            }
        }

        #setViewToBounds(map, latLngPoints) {
            if (this.hasAttribute('fitToBounds'))
                map.fitBounds(latLngPoints);
            else if (this.hasAttribute('flyToBounds'))
                map.flyToBounds(latLngPoints);
        }

        #actions = ((defaultMarker) => {
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
    }

    const mapElements = (() => {
        const getRemoteCssFile = url => {
            return fetch(url)
                .then(response => response.text())
                .catch(error => {
                    const message = `An error has occured: ${response.status}`;
                    throw new Error(message)
                })
        }
        const markerClusterVersion = '1.5.3';

        const getWcStyleNode = () => {
            const el = document.createElement('style');
            el.innerText =
                ':host {' +
                    'display: block;' +
                '}' +
                '#map {' +
                    'position: absolute;' +
                    'inset: 0px;' +
                    'top: 0;' +
                    'right: 0;' +
                    'bottom: 0;' +
                    'left: 0;' +
                '}' +
                '.leaflet-container {' +
                    'max-width: 100%;' +
                    'max-height: 100%;' +
                '}' +
                '.leaflet-control-zoom {' +
                    'display: none;' +
                '}'

            return el
        }

        const getStyleNodeFrom = (styleFile) => {
            const el = document.createElement('style');

            if (styleFile) {
               getRemoteCssFile(styleFile)
                    .then(css => el.innerText = css);
            }

            return el;
        }

        const getWcNode = () => {
            const el = document.createElement('div');
            el.id = 'map'
            el.className = 'leaflet-container leaflet-touch leaflet-fade-anim leaflet-grab leaflet-touch-drag leaflet-touch-zoom'
            el.tabIndex = '0'

            el.innerHTML =
                '<div class="leaflet-pane leaflet-map-pane" style="transform: translate3d(0px, 0px, 0px);">' +
                    '<div class="leaflet-pane leaflet-tile-pane">' +
                        '<div class="leaflet-layer " style="z-index: 1; opacity: 1;">' +
                            '<div class="leaflet-tile-container leaflet-zoom-animated"' +
                                'style="z-index: 19; transform: translate3d(0px, 0px, 0px) scale(1);">' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                    '<div class="leaflet-pane leaflet-overlay-pane"></div>' +
                    '<div class="leaflet-pane leaflet-shadow-pane"></div>' +
                    '<div class="leaflet-pane leaflet-marker-pane"></div>' +
                    '<div class="leaflet-pane leaflet-tooltip-pane"></div>' +
                    '<div class="leaflet-pane leaflet-popup-pane"></div>' +
                    '<div class="leaflet-proxy leaflet-zoom-animated"' +
                        'style="transform: translate3d(1048050px, 697379px, 0px) scale(4096);"></div>' +
                '</div>' +
                '<div class="leaflet-control-container">' +
                    '<div class="leaflet-top leaflet-left">' +
                        '<div class="leaflet-control-zoom leaflet-bar leaflet-control"><a class="leaflet-control-zoom-in" href="#"' +
                            'title="Zoom in" role="button" aria-label="Zoom in" aria-disabled="false"><span' +
                            'aria-hidden="true">+</span></a><a class="leaflet-control-zoom-out" href="#" title="Zoom out"' +
                            'role="button" aria-label="Zoom out" aria-disabled="false"><span aria-hidden="true">−</span></a>' +
                        '</div>' +
                    '</div>' +
                    '<div class="leaflet-top leaflet-right"></div>' +
                    '<div class="leaflet-bottom leaflet-left"></div>' +
                    '<div class="leaflet-bottom leaflet-right">' +
                        '<div class="leaflet-control-attribution leaflet-control"><a href="https://leafletjs.com"' +
                            'title="A JavaScript library for interactive maps">Leaflet</a> <span aria-hidden="true">|</span> © <a' +
                            'href="http://www.openstreetmap.org/copyright">OpenStreetMap</a></div>' +
                    '</div>' +
                '</div>'

            return el
        }

        const getLeafletStyleNode = () => {
            const leafletCss = {
                url: 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
                integrity: 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY='
            };

            const el = document.createElement('style');
            getRemoteCssFile(leafletCss.url)
                .then(css => el.innerText = css)

            return el;
        }

        const getLeafletScriptNode = () => {
            const dependency = {
                url: 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
                integrity: 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo='
            };

            let js = document.createElement('script');
            js.src = dependency.url;
            js.integrity = dependency.integrity;

            js.crossOrigin = '';
            js.async = 'false';

            return js;
        }

        const getMarkerClusterScriptNode = () => {
            let js = document.createElement('script');
            js.src = `https://unpkg.com/leaflet.markercluster@${markerClusterVersion}/dist/leaflet.markercluster.js`;

            js.crossOrigin = '';
            js.async = 'false';
            return js;
        }

        const getMarkerClusterStyleNode = () => {
            const getMarkerClusterStyle = cssFile => {
                const el = document.createElement('style');
                const url = `https://unpkg.com/leaflet.markercluster@${markerClusterVersion}/dist/${cssFile}`;
                getRemoteCssFile(url)
                    .then(css => el.innerText = css);

                return el;
            };

            return [
                getMarkerClusterStyle('MarkerCluster.Default.css'),
                getMarkerClusterStyle('MarkerCluster.css')
            ];
        }

        return {
            getWcStyleNode,
            getStyleNodeFrom,
            getWcNode,
            getLeafletStyleNode,
            getLeafletScriptNode,
            getMarkerClusterScriptNode,
            getMarkerClusterStyleNode
        }
    })();

    let leafletjs = mapElements.getLeafletScriptNode();
    leafletjs.onload = (ev) => {
        customElements.define('leaflet-map', LeafletMap);

        const markerClusterScript = mapElements.getMarkerClusterScriptNode();
        document.body.appendChild(markerClusterScript);
    }

    document.body.append(leafletjs);
})();
