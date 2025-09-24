import * as React from "react";
import Auth from "./components/Auth";
import { isLoaded } from "./hooks/load";

const Content = React.lazy(() => import("./components/Content"));
const Banner = React.lazy(() => import("./components/Banner"));
const App = () => {
    const [isTailwind, setIsTailwind] = React.useState(false);
    const [showBanner, setShowBanner] = React.useState(true);
    const [loading, setLoading] = React.useState(true);
    const [player, setPlayer] = React.useState(null);

    // Load game data when player logs in
    React.useEffect(() => {
        setIsTailwind(isLoaded());
        const savedName = localStorage.getItem("playerName");
        if (savedName) {
            setPlayer(savedName);
        }
        setLoading(true);
        setShowBanner(true);
    }, [isTailwind]);

    if (!player) {
        return (
            <Auth
                isTailwind={isTailwind}
                onAuth={(name) => {
                    setPlayer(name);
                    localStorage.setItem("playerName", name);
                    // Load from Firebase
                    // const saved = await loadData(name);
                    // if (!saved) {
                    //     // new player → create with defaults
                    //     const defaults = { level: 1, move: 0, score: 0 };
                    //     await createPlayer(name, defaults);
                    // }
                    setLoading(true);
                    setShowBanner(true);
                }}
            />
        );
    } else if (showBanner) {
        return (
            <Banner
                isTailwind={isTailwind}
                onClose={() => {
                    setShowBanner(false);
                    setLoading(false);
                }}
            />
        );
    } else {
        return (
            <React.Suspense fallback={loading && <div> Loading... </div>}>
                <Content
                    player={player}
                    isTailwind={isTailwind}
                    onLogout={() => {
                        localStorage.removeItem("playerName");
                        setPlayer(null);
                        setShowBanner(true);
                        setLoading(true);
                    }}
                />
            </React.Suspense>
        );
    }
};

export default App;
