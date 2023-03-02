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

    #byPairs = flatArr => flatArr.reduce((res, number, i, arr) => {
        if (0 === i % 2) {
            res.push(arr.slice(i, i + 2));
        };
        return res;
    }, [])

    #coordinatesToLatLng = coordinates => coordinates.reduce((arr, bound) => {
        const [lng, lat] = bound;
        const latLng = L.latLng(lat, lng);
        arr.push(latLng);
        return arr;
    }, [])

    #setMapViewOnBounds = (geojson, map) => {
        if (this.hasAttribute('fitToBounds') || this.hasAttribute('flyToBounds')) {
            const features = 'FeatureCollection' === geojson.type ? geojson.features : [ geojson ];

            const flatCoordinates = this.#flatCoordinates(features);
            const bounds = this.#byPairs(flatCoordinates);

            if (bounds.length) {
                const points = this.#coordinatesToLatLng(bounds);
                const latLngBounds = L.latLngBounds(points);

                if (this.hasAttribute('fitToBounds')) map.fitBounds(latLngBounds)
                else map.flyToBounds(latLngBounds);
            }
        }
    }

    #flatCoordinates = features => features.reduce((arr, feature) => {
        const coordinates = feature.geometry.coordinates;
        const flatCoordinates = coordinates.flat(Infinity);
        arr.push(...flatCoordinates);
        return arr;
    }, [])

    #initializeMap = mapElement => {
        const opts = this.#mapOptions();
        const map = L.map(mapElement, opts);

        LeafletMap.maps.set(this, map);
    }

    #isThisMap = mapId => mapId === this.id

    #mapOptions() {
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

    #registerEvents() {
        EventBus.register('x-leaflet-map-clear', (event) => {
            const { leafletMap } = event.detail;

            if (this.#isThisMap(leafletMap.id)) {
                const map = LeafletMap.maps.get(leafletMap);
                map.eachLayer(function (layer) {
                    map.removeLayer(layer);
                });
            }
            event.stopPropagation();
        });

        EventBus.register('x-leaflet-map-geojson-add', (event) => {
            const { leafletMap, geojson } = event.detail;

            if (this.#isThisMap(leafletMap.id)) {
                const map = LeafletMap.maps.get(leafletMap);
                Features.addTo(geojson, map);

                this.#setMapViewOnBounds(geojson, map);
            }

            event.stopPropagation();
        });
    }
}

let leafletjs = LoadMap.getLeafletScript();
leafletjs.onload = function (ev) {
    customElements.define('leaflet-map', LeafletMap);
    leaflet = null;
}

document.head.append(leafletjs);