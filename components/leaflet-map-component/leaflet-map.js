import { eventBus } from "./event-bus.js";
import { loadMap } from "./leaflet-map-load.js";
import { features } from "./leaflet-map-features.js";

class LeafletMap extends HTMLElement {

    static MAPS = new WeakMap();

    static get observedAttributes() {
        return [
            'latitude',
            'longitude',
            'maxZoom',
            'tileCopyright', 'tileServer',
            'zoom'
        ];
    }

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

        this._addMapToBodyAsReference();
    }

    _appendChild = element => this.shadowRoot.appendChild(element)

    _initializeMap = mapElement => {
        const opts = this._mapOptions();
        const map = L.map(mapElement, opts);

        LeafletMap.MAPS.set(this, map);
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

            const map = LeafletMap.MAPS.get(leafletMap);
            map.eachLayer(function (layer) {
                map.removeLayer(layer);
            });
            event.stopPropagation();
        });

        eventBus.register('x-leaflet-map-geojson-add', (event) => {
            const { leafletMap, geojson } = event.detail;

            const map = LeafletMap.MAPS.get(leafletMap);
            features.addTo(geojson, map);
            event.stopPropagation();
        });
    }

    _addMapToBodyAsReference() {
        const template = document.querySelector('template');
        const node = document.importNode(template.content, true);
        document.body.appendChild(node);

        const map = L.map('map').setView([51.505, -0.09], 13);

        const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);

        const marker = L.marker([51.5, -0.09]).addTo(map);
        marker.bindPopup("<b>Hello world!</b><br>I am a popup.");

        const circle = L.circle([51.508, -0.11], {
            color: 'red',
            fillColor: '#f03',
            fillOpacity: 0.5,
            radius: 500
        }).addTo(map);
        circle.bindPopup("I am a circle.");

        const polygon = L.polygon([
            [51.509, -0.08],
            [51.503, -0.06],
            [51.51, -0.047]
        ]).addTo(map);
        polygon.bindPopup("I am a polygon.");
    }
}

const leafletjs = loadMap.getLeafletScript();
leafletjs.onload = function (ev) {
    customElements.define('leaflet-map', LeafletMap);
}

document.head.append(leafletjs);