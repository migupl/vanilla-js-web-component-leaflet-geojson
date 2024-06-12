class LeafletMapLoad {

    #markerClusterVersion = '1.5.3';

    getStyleElement = () => {
        const el = document.createElement('style');
        el.innerText =
            ':host {' +
                'display: block;' +
            '}' +
            '#map {' +
                'position: absolute;' +
                'inset: 0px;' +
                'top: 0;' +
                'right: 0;' +
                'bottom: 0;' +
                'left: 0;' +
            '}' +
            '.leaflet-container {' +
                'max-width: 100%;' +
                'max-height: 100%;' +
            '}' +
            '.leaflet-control-zoom {' +
                'display: none;' +
            '}'

        return el
    }

    getCustomStyle = (styleFile) => {
        const el = document.createElement('style');

        if (styleFile) {
            this.#getRemoteCssFile(styleFile)
                .then(css => el.innerText = css);
        }

        return el;
    }

    getHtml = () => {
        const el = document.createElement('div');
        el.id = 'map'
        el.className = 'leaflet-container leaflet-touch leaflet-fade-anim leaflet-grab leaflet-touch-drag leaflet-touch-zoom'
        el.tabIndex = '0'

        el.innerHTML =
            '<div class="leaflet-pane leaflet-map-pane" style="transform: translate3d(0px, 0px, 0px);">' +
                '<div class="leaflet-pane leaflet-tile-pane">' +
                    '<div class="leaflet-layer " style="z-index: 1; opacity: 1;">' +
                        '<div class="leaflet-tile-container leaflet-zoom-animated"' +
                            'style="z-index: 19; transform: translate3d(0px, 0px, 0px) scale(1);">' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="leaflet-pane leaflet-overlay-pane"></div>' +
                '<div class="leaflet-pane leaflet-shadow-pane"></div>' +
                '<div class="leaflet-pane leaflet-marker-pane"></div>' +
                '<div class="leaflet-pane leaflet-tooltip-pane"></div>' +
                '<div class="leaflet-pane leaflet-popup-pane"></div>' +
                '<div class="leaflet-proxy leaflet-zoom-animated"' +
                    'style="transform: translate3d(1048050px, 697379px, 0px) scale(4096);"></div>' +
            '</div>' +
            '<div class="leaflet-control-container">' +
                '<div class="leaflet-top leaflet-left">' +
                    '<div class="leaflet-control-zoom leaflet-bar leaflet-control"><a class="leaflet-control-zoom-in" href="#"' +
                        'title="Zoom in" role="button" aria-label="Zoom in" aria-disabled="false"><span' +
                        'aria-hidden="true">+</span></a><a class="leaflet-control-zoom-out" href="#" title="Zoom out"' +
                        'role="button" aria-label="Zoom out" aria-disabled="false"><span aria-hidden="true">−</span></a>' +
                    '</div>' +
                '</div>' +
                '<div class="leaflet-top leaflet-right"></div>' +
                '<div class="leaflet-bottom leaflet-left"></div>' +
                '<div class="leaflet-bottom leaflet-right">' +
                    '<div class="leaflet-control-attribution leaflet-control"><a href="https://leafletjs.com"' +
                        'title="A JavaScript library for interactive maps">Leaflet</a> <span aria-hidden="true">|</span> © <a' +
                        'href="http://www.openstreetmap.org/copyright">OpenStreetMap</a></div>' +
                '</div>' +
            '</div>'

        return el
    }

    getLeafletCss = () => {
        const leafletCss = {
            url: 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
            integrity: 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY='
        };

        const el = document.createElement('style');
        this.#getRemoteCssFile(leafletCss.url).then(
            (css) => { el.innerText = css}
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
        const getMarkerClusterStyle = cssFile => {
            const el = document.createElement('style');
            const url = `https://unpkg.com/leaflet.markercluster@${this.#markerClusterVersion}/dist/${cssFile}`;
            this.#getRemoteCssFile(url)
                .then(css => el.innerText = css);

            return el;
        };

        return [
            getMarkerClusterStyle('MarkerCluster.Default.css'),
            getMarkerClusterStyle('MarkerCluster.css')
        ];
    }

    #getRemoteCssFile = url => {
        return fetch(url)
            .then(response => response.text())
            .catch(error => {
                const message = `An error has occured: ${response.status}`;
                throw new Error(message)
            })
    }
}

const mapElements = () => {
    const getRemoteCssFile = url => {
        return fetch(url)
            .then(response => response.text())
            .catch(error => {
                const message = `An error has occured: ${response.status}`;
                throw new Error(message)
            })
    }
    const markerClusterVersion = '1.5.3';

    const getStyleElement = () => {
        const el = document.createElement('style');
        el.innerText =
            ':host {' +
                'display: block;' +
            '}' +
            '#map {' +
                'position: absolute;' +
                'inset: 0px;' +
                'top: 0;' +
                'right: 0;' +
                'bottom: 0;' +
                'left: 0;' +
            '}' +
            '.leaflet-container {' +
                'max-width: 100%;' +
                'max-height: 100%;' +
            '}' +
            '.leaflet-control-zoom {' +
                'display: none;' +
            '}'

        return el
    }

    const getCustomStyle = (styleFile) => {
        const el = document.createElement('style');

        if (styleFile) {
           getRemoteCssFile(styleFile)
                .then(css => el.innerText = css);
        }

        return el;
    }

    const getHtml = () => {
        const el = document.createElement('div');
        el.id = 'map'
        el.className = 'leaflet-container leaflet-touch leaflet-fade-anim leaflet-grab leaflet-touch-drag leaflet-touch-zoom'
        el.tabIndex = '0'

        el.innerHTML =
            '<div class="leaflet-pane leaflet-map-pane" style="transform: translate3d(0px, 0px, 0px);">' +
                '<div class="leaflet-pane leaflet-tile-pane">' +
                    '<div class="leaflet-layer " style="z-index: 1; opacity: 1;">' +
                        '<div class="leaflet-tile-container leaflet-zoom-animated"' +
                            'style="z-index: 19; transform: translate3d(0px, 0px, 0px) scale(1);">' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="leaflet-pane leaflet-overlay-pane"></div>' +
                '<div class="leaflet-pane leaflet-shadow-pane"></div>' +
                '<div class="leaflet-pane leaflet-marker-pane"></div>' +
                '<div class="leaflet-pane leaflet-tooltip-pane"></div>' +
                '<div class="leaflet-pane leaflet-popup-pane"></div>' +
                '<div class="leaflet-proxy leaflet-zoom-animated"' +
                    'style="transform: translate3d(1048050px, 697379px, 0px) scale(4096);"></div>' +
            '</div>' +
            '<div class="leaflet-control-container">' +
                '<div class="leaflet-top leaflet-left">' +
                    '<div class="leaflet-control-zoom leaflet-bar leaflet-control"><a class="leaflet-control-zoom-in" href="#"' +
                        'title="Zoom in" role="button" aria-label="Zoom in" aria-disabled="false"><span' +
                        'aria-hidden="true">+</span></a><a class="leaflet-control-zoom-out" href="#" title="Zoom out"' +
                        'role="button" aria-label="Zoom out" aria-disabled="false"><span aria-hidden="true">−</span></a>' +
                    '</div>' +
                '</div>' +
                '<div class="leaflet-top leaflet-right"></div>' +
                '<div class="leaflet-bottom leaflet-left"></div>' +
                '<div class="leaflet-bottom leaflet-right">' +
                    '<div class="leaflet-control-attribution leaflet-control"><a href="https://leafletjs.com"' +
                        'title="A JavaScript library for interactive maps">Leaflet</a> <span aria-hidden="true">|</span> © <a' +
                        'href="http://www.openstreetmap.org/copyright">OpenStreetMap</a></div>' +
                '</div>' +
            '</div>'

        return el
    }

    const getLeafletCss = () => {
        const leafletCss = {
            url: 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
            integrity: 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY='
        };

        const el = document.createElement('style');
        getRemoteCssFile(leafletCss.url)
            .then(css => el.innerText = css)

        return el;
    }

    const getLeafletScript = () => {
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

    const getMarkerClusterScript = () => {
        let js = document.createElement('script');
        js.src = `https://unpkg.com/leaflet.markercluster@${markerClusterVersion}/dist/leaflet.markercluster.js`;

        js.crossOrigin = '';
        js.async = 'false';
        return js;
    }

    const getMarkerClusterStyles = () => {
        const getMarkerClusterStyle = cssFile => {
            const el = document.createElement('style');
            const url = `https://unpkg.com/leaflet.markercluster@${markerClusterVersion}/dist/${cssFile}`;
            getRemoteCssFile(url)
                .then(css => el.innerText = css);

            return el;
        };

        return [
            getMarkerClusterStyle('MarkerCluster.Default.css'),
            getMarkerClusterStyle('MarkerCluster.css')
        ];
    }

    const nodes = new LeafletMapLoad();
    return {
        getStyleElement: nodes.getStyleElement,
        getCustomStyle: nodes.getCustomStyle,
        getHtml: nodes.getHtml,
        getLeafletCss: nodes.getLeafletCss,
        getLeafletScript: nodes.getLeafletScript,
        getMarkerClusterScript: nodes.getMarkerClusterScript,
        getMarkerClusterStyles: nodes.getMarkerClusterStyles
    }
}

export const loadMap = mapElements()