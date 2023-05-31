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

export { css, html }