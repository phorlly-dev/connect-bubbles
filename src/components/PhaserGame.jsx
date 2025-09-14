import * as React from "react";
import StartGame from "../game/init";
import { RemoteEvent } from "../hooks/remote";

export const PhaserGame = React.forwardRef(({ currentActiveScene }, ref) => {
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

    React.useEffect(() => {
        RemoteEvent.on("current-scene-ready", (currentScene) => {
            if (currentActiveScene instanceof Function) {
                currentActiveScene(currentScene);
            }
            ref.current.scene = currentScene;
        });

        return () => RemoteEvent.removeListener("current-scene-ready");
    }, [currentActiveScene, ref]);

    return <div id="game-container"></div>;
});
