class LeafletMap extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this._fetch("https://unpkg.com/leaflet@1.9.3/dist/leaflet.css")
            .then(this._appendStyle);

        this._fetch("components/leaflet-map-component/leaflet-map.css")
            .then(this._appendStyle);
        this._fetch("components/leaflet-map-component/leaflet-map.html")
            .then(this._appendAndInitializeMap);

        this._addMapToBodyAsReference();
    }

    _appendAndInitializeMap = htmlMap => {
        const el = document.createElement('div');
        el.innerHTML = htmlMap;
        this._appendChild(el);

        const elMap = el.querySelectorAll("div#map")[0];
        console.log(elMap);

        const map = L.map(elMap).setView([51.505, -0.09], 13);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);
    }

    _appendChild = element => this.shadowRoot.appendChild(element)

    _appendStyle = css => {
        const el = document.createElement('style');
        el.innerText = css;
        this._appendChild(el);
    }

    async _fetch(url) {
        const response = await fetch(url);

        if (!response.ok) {
            const message = `An error has occured fetching '${url}': ${response.status}`;
            throw new Error(message);
        }

        const text = await response.text();
        return text;
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

customElements.define('leaflet-map', LeafletMap);