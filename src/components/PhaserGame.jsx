import * as React from "react";
import StartGame from "../game";
import { offEvent, onEvent } from "../hooks/remote";

export const PhaserGame = React.forwardRef((_props, ref) => {
    const game = React.useRef();

    // Create the game inside a useLayoutEffect hook to avoid the game being created outside the DOM
    React.useLayoutEffect(() => {
        if (!game.current) {
            game.current = StartGame("game-container");

            if (ref) ref.current = { game: game.current, scene: null };
        }

        return () => {
            if (game.current) {
                game.current.destroy(true);
                game.current = undefined;
            }
        };
    }, [ref]);

    // Listen for scene ready
    React.useLayoutEffect(() => {
        const handleSceneReady = (scene) => {
            if (ref) ref.current.scene = scene;
        };
        onEvent("current-scene-ready", handleSceneReady);

        return () => offEvent("current-scene-ready", handleSceneReady);
    }, [ref]);

    return <div id="game-container"></div>;
});
