class LeafletMap extends HTMLElement{

    connectedCallback() {
        this.textContent = 'Hello, World!';
    }
}

customElements.define('leaflet-map', LeafletMap);