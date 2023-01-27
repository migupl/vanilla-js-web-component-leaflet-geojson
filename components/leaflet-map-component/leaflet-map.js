class LeafletMap extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this._fetch("components/leaflet-map-component/leaflet-map.css")
            .then(this._appendStyle);
        this._fetch("components/leaflet-map-component/leaflet-map.html")
            .then(this._appendHtml);

        this._addMapToBodyAsReference();
    }

    _appendStyle = css => {
        const el = document.createElement('style');
        el.innerHTML = css;
        this.shadowRoot.appendChild(el);
    }

    _appendHtml = html => {
        const el = document.createElement('div');
        el.innerHTML = html;
        this.shadowRoot.appendChild(el);
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