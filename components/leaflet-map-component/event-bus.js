class EventBus {
    constructor() {
        this._bus = document.createElement('div');
        this._bus.id = 'x-event-bus';
    }

    register(event, callback) {
        this._bus.addEventListener(event, callback);
    }

    unregister(event, callback) {
        this._bus.removeEventListener(event, callback);
    }

    dispatch(event, detail = {}) {
        this._bus.dispatchEvent(new CustomEvent(event, { detail }));
    }
}

var eventBus = new EventBus();
export { eventBus as EventBus }
