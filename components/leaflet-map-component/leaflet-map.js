import { LoadMap } from "./leaflet-map-load.js";
import { Features } from "./leaflet-map-features.js";

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
                this.#fireMarkerAdded(latlng);
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

    #fireEvent = (eventName, detail) => {
        const evt = new CustomEvent(eventName, {
            bubbles: true,
            composed: true,
            detail: detail
        });
        this.shadowRoot.dispatchEvent(evt);
    }

    #fireMarkerAdded = latlng => {
        this.#fireEvent('x-leaflet-map:marker-added', {
            latlng: latlng
        });
    }

    #fireMarkerRemoved = feature => {
        this.#fireEvent('x-leaflet-map:marker-removed', {
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
        this.addEventListener('x-leaflet-map-clear', (event) => {
            event.stopPropagation();

            const targetMap = event.target;

            if (this.#isThisMap(targetMap.id)) {
                const { map, tile } = LeafletMap.maps.get(targetMap);
                map.eachLayer(function (layer) {
                    if (layer !== tile) layer.removeFrom(map);
                });
            }
        });

        this.addEventListener('x-leaflet-map-geojson-add', (event) => {
            event.stopPropagation();

            const targetMap = event.target;

            if (this.#isThisMap(targetMap.id)) {
                const map = LeafletMap.maps.get(targetMap);
                const { geojson } = event.detail;

                Features.addTo(geojson, targetMap, map);
            }
        });

        this.addEventListener('x-leaflet-map-geojson:include-latlng-to-fly', (event) => {
            event.stopPropagation();

            const targetMap = event.target;

            if (this.#isThisMap(targetMap.id)) {
                const { map, latLngPoints } = LeafletMap.maps.get(targetMap);

                const { latlng: { lng, lat } } = event.detail;
                const latLng = L.latLng(lat, lng);

                const latLngBounds = L.latLngBounds([latLng]);
                latLngPoints.push(latLngBounds);

                if (this.hasAttribute('fitToBounds')) map.fitBounds(latLngPoints)
                else if (this.hasAttribute('flyToBounds')) map.flyToBounds(latLngPoints);
            }
        });
    }

    #remove = (layer, markers) => {
        if (layer.feature) {
            markers.removeLayer(layer);
            this.#fireMarkerRemoved(layer.feature);
        }
    }
}

let leafletjs = LoadMap.getLeafletScript();
leafletjs.onload = (ev) => {
    customElements.define('leaflet-map', LeafletMap);
    leaflet = null;

    const markerClusterScript = LoadMap.getMarkerClusterScript();
    document.head.appendChild(markerClusterScript);
}

document.head.append(leafletjs);