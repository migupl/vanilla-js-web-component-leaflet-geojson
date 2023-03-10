import { EventBus } from "./event-bus.js";
import { LoadMap } from "./leaflet-map-load.js";
import { Features } from "./leaflet-map-features.js";

class LeafletMap extends HTMLElement {

    static maps = new WeakMap();

    get eventBus() {
        return EventBus;
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        this.#registerEvents();
    }

    connectedCallback() {
        const css = LoadMap.getStyleElement();
        this.#appendChild(css);

        const leafletCss = LoadMap.getLeafletCss();
        this.#appendChild(leafletCss);

        const map = LoadMap.getHtml();
        this.#appendChild(map);
        this.#initializeMap(map);
    }

    #appendChild = element => this.shadowRoot.appendChild(element)

    #initializeMap = mapElement => {
        const opts = this.#mapOptions();
        const map = L.map(mapElement, opts);

        LeafletMap.maps.set(this, {
            map: map,
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
        EventBus.register('x-leaflet-map-clear', (event) => {
            event.stopPropagation();

            const { leafletMap } = event.detail;

            if (this.#isThisMap(leafletMap.id)) {
                const { map } = LeafletMap.maps.get(leafletMap);
                map.eachLayer(function (layer) {
                    map.removeLayer(layer);
                });
            }
        });

        EventBus.register('x-leaflet-map-geojson-add', (event) => {
            event.stopPropagation();

            const { leafletMap, geojson } = event.detail;

            if (this.#isThisMap(leafletMap.id)) {
                const { map, latLngPoints } = LeafletMap.maps.get(leafletMap);
                Features.addTo(geojson, map, leafletMap.id);
            }
        });

        EventBus.register('x-leaflet-map-geojson:add-latlng', (event) => {
            event.stopPropagation();

            const { map, latLngPoints } = LeafletMap.maps.get(this);
            const { lng, lat, alt, mapId } = event.detail;

            if (this.#isThisMap(mapId)) {
                const latLng = L.latLng(lat, lng);

                const latLngBounds = L.latLngBounds([latLng]);
                latLngPoints.push(latLngBounds);

                if (this.hasAttribute('fitToBounds')) map.fitBounds(latLngPoints)
                else if (this.hasAttribute('flyToBounds')) map.flyToBounds(latLngPoints);
            }
        });
    }
}

let leafletjs = LoadMap.getLeafletScript();
leafletjs.onload = (ev)  => {
    customElements.define('leaflet-map', LeafletMap);
    leaflet = null;
}

document.head.append(leafletjs);