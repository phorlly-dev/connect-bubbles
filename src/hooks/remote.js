import * as Phaser from "phaser";

// Used to emit events between components, HTML and Phaser scenes
export const RemoteEvent = new Phaser.Events.EventEmitter();
const GameEvent = {
    onEvents({ events, callbacks }) {
        events.forEach((event, idx) => {
            RemoteEvent.on(event, callbacks[idx]);
        });
    },
    offEvents({ events, callbacks }) {
        events.forEach((event, idx) => {
            RemoteEvent.off(event, callbacks[idx]);
        });
    },
    emitEvents({ events, args }) {
        events.forEach((event, idx) => {
            RemoteEvent.emit(event, args[idx]);
        });
    },
    emitEvent(event, arg) {
        RemoteEvent.emit(event, arg);
    },
};

export const { onEvents, offEvents, emitEvents, emitEvent } = GameEvent;
