# A vanilla JavaScript Web Component for Leaflet maps

Behind this idea is learning about:
- Use the open-source JavaScript library [Leaflet](https://leafletjs.com/index.html) for playing with maps
- Web Components

## About

### Web Components

Web Components[^1] use three separate technologies together:
- Custom Elements[^2]. Quite simply, these are fully-valid HTML elements with custom templates, behaviors and tag names (e.g. <leaflet-map>) made with a set of JavaScript APIs.
- Shadow DOM[^3]. Capable of isolating CSS and JavaScript. This is defined in the Living Standard DOM specification.
- HTML templates[^4]. User-defined templates in HTML that aren’t rendered until called upon.

#### Custom elements

Custom elements are like the standard elements - <div>, <head> or <footer> - except they always have a dash[^5] in them.

Custom elements contain their own semantics, behaviors, markup and can be shared across frameworks and browsers.

A basic example,

```javascript
class SayHello extends HTMLElement {
    constructor() {
        super(); // Required

        const root = this.attachShadow({ mode: 'open' });
        root.innerHTML = `
        <style>
        h1 {
            color: blue;
            font-size: 4em;
        }
        </style>
        <h1>Hello world!!!</h1>
        `
}
    
customElements.define('say-hello', SayHello);
```

```html
<say-hello></say-hello>
```

![result](./docs/hello-world-example.webp)

The content of the generated HTML code will be as follows

```html
<say-hello>
    <!-- #shadow-root (open) -->
    <style>
    h1 {
        color: blue;
        font-size: 4em;
    }
    </style>
    <h1>Hello world!!!</h1>
</say-hello>
```

All custom elements must in some way extend an HTMLElement in order to be registered with the browser.

The mode option[^6] in attachShadow specifies the *encaptulation mode* for the shadow DOM tree. See further, [Element.attachShadow()](https://developer.mozilla.org/en-US/docs/Web/API/Element/attachShadow)

#### Shadow DOM

The shadow DOM is an encapsulated version of the DOM that is inaccessible from it and defines its own behavior and style.

#### Template element

The HTML &lt;template&gt; element allows us to define a re-usable templates of code that won’t be rendered, but can be used at a later time.

## Install

Copy the directory */components/leaflet-map-component/* to your project

## Getting started

To get started you need to import the Web Component

```html
<head>
    <script type="module" src="./components/leaflet-map-component/leaflet-map.js"></script>
</head>
<body>
	<leaflet-map
		longitude="-3.7001448634709626"
		latitude="40.4237577382345"
        maxZoom="20"
		zoom="13">
	</leaflet-map>
</body>
```

The Web Component *leaflet-map* exposes an event bus[^7] at the property *eventBus*.

## Tiles

Change easily the tile layer on the map using the *tileServer* property.

Note that most tile servers require attribution, which you can set using the *tileCopyrigth* property.

```html
<body>
	<leaflet-map
		longitude="-3.7001448634709626"
		latitude="40.4237577382345"
		zoom="13"
		tileCopyright="Map data: &copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors, <a href='http://viewfinderpanoramas.org'>SRTM</a> | Map style: &copy; <a href='https://opentopomap.org'>OpenTopoMap</a> (<a href='https://creativecommons.org/licenses/by-sa/3.0/'>CC-BY-SA</a>)"
		tileServer="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png">
	</leaflet-map>
</body>
```

[Leaflet Provider Demo](http://leaflet-extras.github.io/leaflet-providers/preview/index.html) is a good resource for Leaflet layer providers

## Default values

All parameters are optional.

Default values are
```json
{
    latitude: 51.505,
    longitude: -0.09,
    maxZoom: 19,
    tileCopyright: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    tileServer: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    zoom: 13
}
```


## Helpers

A [container is used for hot reloading](https://github.com/migupl/hot-reloading-container) during development.

Good luck and I hope you enjoy it.

## License

[MIT license](http://www.opensource.org/licenses/mit-license.php)

[^1]: [An introduction to Web Components](https://css-tricks.com/an-introduction-to-web-components/)
[^2]: [HTML Living Standard specification](https://html.spec.whatwg.org/multipage/custom-elements.html#custom-elements)
[^3]: [Living Standard DOM specification](https://dom.spec.whatwg.org/#shadow-trees)
[^4]: The [<template> tag specification](https://html.spec.whatwg.org/multipage/scripting.html#the-template-element)
[^5]: [Valid custom element name](https://html.spec.whatwg.org/multipage/custom-elements.html#valid-custom-element-name)
[^6]: [Associated mode](https://dom.spec.whatwg.org/#shadowroot-mode) to shadow root
[^7]: [Creating a JavaScript Event Bus](https://pineco.de/creating-a-javascript-event-bus/)