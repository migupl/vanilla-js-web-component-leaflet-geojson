class LeafletMap extends HTMLElement {
    static get observedAttributes() {
        return [
            'latitude',
            'longitude',
            'tileCopyright', 'tileServer',
            'zoom'
        ];
    }

    attributeChangedCallback(attrName, oldValue, newValue) {
        if (newValue !== oldValue) {
            this[attrName] = this.hasAttribute(attrName);
        }
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this._getRootContent()
            .then(([leafletCss, css, html]) => {
                this._appendStyle(leafletCss);
                this._appendStyle(css);
                this._appendAndInitializeMap(html);
            });

        this._addMapToBodyAsReference();
    }

    _appendAndInitializeMap = htmlMap => {
        const el = document.createElement('div');
        el.innerHTML = htmlMap;
        this._appendChild(el);

        const elMap = el.querySelectorAll('div#map')[0];

        const tileCopyright = this.getAttribute('tileCopyright') ||
            (this.getAttribute('tileServer') ? '' : '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>');
        const opts = {
            center: new L.LatLng(
                this.getAttribute('latitude') || 51.505,
                this.getAttribute('longitude') || -0.09
            ),
            zoom: this.getAttribute('zoom') || 13,
            layers: L.tileLayer(this.getAttribute('tileServer') || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: tileCopyright
            })
        };

        const map = L.map(elMap, opts);
    }

    _appendChild = element => this.shadowRoot.appendChild(element)

    _appendStyle = css => {
        const el = document.createElement('style');
        el.innerText = css;
        this._appendChild(el);
    }

    async _getRootContent() {
        const urls = {
            leaflet: {
                css: 'https://unpkg.com/leaflet@1.9.3/dist/leaflet.css',
                integrity: 'sha256-kLaT2GOSpHechhsozzB+flnD+zUyjE2LlfWPgU04xyI='
            },
            map: {
                css: 'components/leaflet-map-component/leaflet-map.css',
                html: 'components/leaflet-map-component/leaflet-map.html'
            }
        }
        const [leafletCssResponse, cssResponse, htmlResponse] = await Promise.all([
            fetch(urls.leaflet.css),
            fetch(urls.map.css),
            fetch(urls.map.html),
        ])

        const leafletCss = await leafletCssResponse.text();
        const css = await cssResponse.text();
        const html = await htmlResponse.text();

        return [leafletCss, css, html];
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
    }
}

const getLeafletScript = function () {
    const dependency = {
        url: 'https://unpkg.com/leaflet@1.9.3/dist/leaflet.js',
        integrity: 'sha256-WBkoXOwTeyKclOHuWtc+i2uENFpDZ9YPdf5Hf+D7ewM='
    };

    let js = document.createElement('script');
    js.src = dependency.url;
    js.integrity = dependency.integrity;

    js.crossOrigin = '';
    js.async = 'false';

    return js;
}

const leafletjs = getLeafletScript();
leafletjs.onload = function (ev) {
    customElements.define('leaflet-map', LeafletMap);
}

document.head.append(leafletjs);