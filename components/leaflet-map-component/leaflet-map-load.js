import { css, html } from "./leaflet-map-dom.js"

class LeafletMapLoad {

    getStyleElement() {
        const el = document.createElement('style');
        el.innerText = css;
        return el;
    }

    getHtml() {
        const el = document.createElement('div');
        el.innerHTML = html;

        const map = el.querySelectorAll('div#map')[0];
        return map;
    }
}

const loadMap = new LeafletMapLoad();
export { loadMap }