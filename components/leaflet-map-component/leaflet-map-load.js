import { css, html } from "./leaflet-map-dom.js"

class LeafletMapLoad {

    getStyleElement = () => {
        const el = document.createElement('style');
        el.innerText = css;
        return el;
    }

    getCustomStyle = (styleFile) => {
        const el = document.createElement('style');

        if (styleFile) {
            this.#fetchCss(styleFile)
            .then(css => el.innerText = css);
        }

        return el;
    }

    getHtml = () => {
        const el = document.createElement('div');
        el.innerHTML = html;

        const map = el.querySelectorAll('div#map')[0];
        return map;
    }

    getLeafletCss = () => {
        const el = document.createElement('style');
        this.#fetchLeafletCss().then(
            (css) => { el.innerText = css }
        );

        return el;
    }

    getLeafletScript = () => {
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

    #fetchCss = async (url) => {
        const response = await fetch(url);
        if (!response.ok) {
            const message = `An error has occured: ${response.status}`;
            throw new Error(message);
        }

        const css = await response.text();
        return css;
    }

    #fetchLeafletCss = () => {
        const leafletCss = {
            url: 'https://unpkg.com/leaflet@1.9.3/dist/leaflet.css',
            integrity: 'sha256-kLaT2GOSpHechhsozzB+flnD+zUyjE2LlfWPgU04xyI='
        };

        return this.#fetchCss(leafletCss.url);
    }
}

const loadMap = new LeafletMapLoad();
export { loadMap as LoadMap }