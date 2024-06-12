import { loadMap as LoadMap } from "./leaflet-map-load.js";
import { Features } from "./leaflet-map-features.js";

;(() => {
    class LeafletMap extends HTMLElement {

        static maps = new WeakMap();

        constructor() {
            super();
            this.attachShadow({ mode: 'open' });

            this.#registerEvents();
        }

        connectedCallback() {
            const css = LoadMap.getStyleElement();
            this.#appendChild(css);

            const [customStyleClass, customStyleFile] = this.#getCustomStyle();

            const customLeafletStyle = LoadMap.getCustomStyle(customStyleFile);
            this.#appendChild(customLeafletStyle);

            const markerClusterStyles = LoadMap.getMarkerClusterStyles();
            markerClusterStyles.forEach(style => this.#appendChild(style))

            const leafletCss = LoadMap.getLeafletCss();
            this.#appendChild(leafletCss);

            const map = LoadMap.getHtml();
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

            LeafletMap.maps.set(this, {
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
                    const { map, tile } = LeafletMap.maps.get(targetMap);
                    map.eachLayer(function (layer) {
                        if (layer !== tile) layer.removeFrom(map);
                    });
                }
            });

            this.addEventListener('x-leaflet-map-geojson-add', (event) => {
                const targetMap = event.target;

                if (this.#isThisMap(targetMap.id)) {
                    const map = LeafletMap.maps.get(targetMap);
                    const { geojson } = event.detail;

                    Features.addTo(geojson, targetMap, map);
                }
            });

            this.addEventListener('x-leaflet-map-geojson:include-latlng-to-fly', (event) => {
                const targetMap = event.target;

                if (this.#isThisMap(targetMap.id)) {
                    const { map, latLngPoints } = LeafletMap.maps.get(targetMap);

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
    }

    let leafletjs = LoadMap.getLeafletScript();
    leafletjs.onload = (ev) => {
        customElements.define('leaflet-map', LeafletMap);

        const markerClusterScript = LoadMap.getMarkerClusterScript();
        document.body.appendChild(markerClusterScript);
    }

    document.body.append(leafletjs);
})();
