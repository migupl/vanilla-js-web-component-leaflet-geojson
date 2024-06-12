const css = `
:host {
      display: block;
    }

#map {
    position: absolute;
    inset: 0px;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
}

.leaflet-container {
    max-width: 100%;
    max-height: 100%;
}

.leaflet-control-zoom {
    display: none;
}
`

const html = `
<div id="map"
    class="leaflet-container leaflet-touch leaflet-fade-anim leaflet-grab leaflet-touch-drag leaflet-touch-zoom"
    tabindex="0">
    <div class="leaflet-pane leaflet-map-pane" style="transform: translate3d(0px, 0px, 0px);">
        <div class="leaflet-pane leaflet-tile-pane">
            <div class="leaflet-layer " style="z-index: 1; opacity: 1;">
                <div class="leaflet-tile-container leaflet-zoom-animated"
                    style="z-index: 19; transform: translate3d(0px, 0px, 0px) scale(1);">
                </div>
            </div>
        </div>
        <div class="leaflet-pane leaflet-overlay-pane"></div>
        <div class="leaflet-pane leaflet-shadow-pane"></div>
        <div class="leaflet-pane leaflet-marker-pane"></div>
        <div class="leaflet-pane leaflet-tooltip-pane"></div>
        <div class="leaflet-pane leaflet-popup-pane"></div>
        <div class="leaflet-proxy leaflet-zoom-animated"
            style="transform: translate3d(1048050px, 697379px, 0px) scale(4096);"></div>
    </div>
    <div class="leaflet-control-container">
        <div class="leaflet-top leaflet-left">
            <div class="leaflet-control-zoom leaflet-bar leaflet-control"><a class="leaflet-control-zoom-in" href="#"
                    title="Zoom in" role="button" aria-label="Zoom in" aria-disabled="false"><span
                        aria-hidden="true">+</span></a><a class="leaflet-control-zoom-out" href="#" title="Zoom out"
                    role="button" aria-label="Zoom out" aria-disabled="false"><span aria-hidden="true">−</span></a>
            </div>
        </div>
        <div class="leaflet-top leaflet-right"></div>
        <div class="leaflet-bottom leaflet-left"></div>
        <div class="leaflet-bottom leaflet-right">
            <div class="leaflet-control-attribution leaflet-control"><a href="https://leafletjs.com"
                    title="A JavaScript library for interactive maps">Leaflet</a> <span aria-hidden="true">|</span> © <a
                    href="http://www.openstreetmap.org/copyright">OpenStreetMap</a></div>
        </div>
    </div>
</div>
`

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

const mapElements = () => {
    return new LeafletMapLoad();
}

export const loadMap = mapElements()