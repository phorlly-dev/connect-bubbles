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
    React.useEffect(() => setIsTailwind(isLoaded()), []);

    // Load from Firebase when player logs in
    const handleAuth = async (name) => {
        setPlayer(name);
        localStorage.setItem("playerName", name);
        // Load from Firebase
        // const saved = await loadData(name);
        // if (!saved) {
        //     // new player → create with defaults
        //     const defaults = { level: 1, move: 0, score: 0 };
        //     await createPlayer(name, defaults);
        // }
        setLoading(false);
    };

    // Load game data when player logs in
    React.useEffect(() => {
        const savedName = localStorage.getItem("playerName");
        if (savedName) {
            setPlayer(savedName);
        }
        setLoading(false);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("playerName");
        setPlayer(null);
    };

    if (!player) return <Auth onAuth={handleAuth} isTailwind={isTailwind} />;
    else if (showBanner)
        return (
            <Banner
                onClose={() => setShowBanner(false)}
                isTailwind={isTailwind}
            />
        );
    else
        return (
            <React.Suspense fallback={loading && <div> Loading... </div>}>
                <Content
                    player={player}
                    onLogout={handleLogout}
                    isTailwind={isTailwind}
                />
            </React.Suspense>
        );
};

export default App;
