import { css } from "./leaflet-map-dom.js"

class LeafletMapLoad {

    getStyle() {
        const el = document.createElement('style');
        el.innerText = css;
        return el;
    }
}

const loadMap = new LeafletMapLoad();
export { loadMap }