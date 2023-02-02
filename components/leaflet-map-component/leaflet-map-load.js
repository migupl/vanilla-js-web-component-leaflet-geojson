import { css } from "./leaflet-map-dom.js"

class LeafletMapLoad {

    getStyleElement() {
        const el = document.createElement('style');
        el.innerText = css;
        return el;
    }
}

const loadMap = new LeafletMapLoad();
export { loadMap }