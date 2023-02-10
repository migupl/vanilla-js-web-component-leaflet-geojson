import { eventBus } from "./event-bus.js";
import { loadMap } from "./leaflet-map-load.js";
import { features } from "./leaflet-map-features.js";

class LeafletMap extends HTMLElement {

    static maps = new WeakMap();

    get eventBus() {
        return eventBus;
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        this._registerEvents();
    }

    connectedCallback() {
        const css = loadMap.getStyleElement();
        this._appendChild(css);

        const leafletCss = loadMap.getLeafletCss();
        this._appendChild(leafletCss);

        const map = loadMap.getHtml();
        this._appendChild(map);
        this._initializeMap(map);
    }

    _appendChild = element => this.shadowRoot.appendChild(element)

    _initializeMap = mapElement => {
        const opts = this._mapOptions();
        const map = L.map(mapElement, opts);

        LeafletMap.maps.set(this, map);
    }

    _mapOptions() {
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

    _registerEvents() {
        eventBus.register('x-leaflet-map-clear', (event) => {
            const { leafletMap } = event.detail;

            const map = LeafletMap.maps.get(leafletMap);
            map.eachLayer(function (layer) {
                map.removeLayer(layer);
            });
            event.stopPropagation();
        });

        eventBus.register('x-leaflet-map-geojson-add', (event) => {
            const { leafletMap, geojson } = event.detail;

            const map = LeafletMap.maps.get(leafletMap);
            features.addTo(geojson, map);
            event.stopPropagation();
        });
    }
}

let leafletjs = loadMap.getLeafletScript();
leafletjs.onload = function (ev) {
    customElements.define('leaflet-map', LeafletMap);
    leaflet = null;
}

document.head.append(leafletjs);