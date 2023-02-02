import { EVENT_BUS } from "./event-bus.js";
import { loadMap } from "./leaflet-map-load.js";

class LeafletMap extends HTMLElement {

    static get observedAttributes() {
        return [
            'latitude',
            'longitude',
            'maxZoom',
            'tileCopyright', 'tileServer',
            'zoom'
        ];
    }

    attributeChangedCallback(attrName, oldValue, newValue) {
        if (newValue !== oldValue) {
            this[attrName] = this.hasAttribute(attrName);
        }
    }

    get eventBus() {
        return this._eventBus;
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

        this._leafletMap = {
            map: map,
            el: mapElement
        }
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
        this._eventBus = EVENT_BUS;
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
    }
}

const leafletjs = loadMap.getLeafletScript();
leafletjs.onload = function (ev) {
    customElements.define('leaflet-map', LeafletMap);
}

document.head.append(leafletjs);