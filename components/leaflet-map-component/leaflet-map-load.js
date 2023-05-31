import { css, html } from "./leaflet-map-dom.js"

class LeafletMapLoad {

    #markerClusterVersion = '1.5.3';

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
            url: 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
            integrity: 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo='
        };

        let js = document.createElement('script');
        js.src = dependency.url;
        js.integrity = dependency.integrity;

        js.crossOrigin = '';
        js.async = 'false';

        return js;
    }

    getMarkerClusterScript = () => {
        let js = document.createElement('script');
        js.src = `https://unpkg.com/leaflet.markercluster@${this.#markerClusterVersion}/dist/leaflet.markercluster.js`;

        js.crossOrigin = '';
        js.async = 'false';
        return js;
    }

    getMarkerClusterStyles = () => {
        return [
            this.#getMarkerClusterStyle('MarkerCluster.Default.css'),
            this.#getMarkerClusterStyle('MarkerCluster.css')
        ];
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
            url: 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
            integrity: 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY='
        };

        return this.#fetchCss(leafletCss.url);
    }

    #getMarkerClusterStyle = cssFile => {
        const el = document.createElement('style');
        const url = `https://unpkg.com/leaflet.markercluster@${this.#markerClusterVersion}/dist/${cssFile}`;
        this.#fetchCss(url)
            .then(css => el.innerText = css);

        return el;
    }
}

const loadMap = new LeafletMapLoad();
export { loadMap as LoadMap }