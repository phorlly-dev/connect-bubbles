import * as React from "react";
import Auth from "./components/Auth";
import { isLoaded } from "./hooks/load";
import { createPlayer, loadData } from "./hooks/storage";

const Content = React.lazy(() => import("./components/Content"));
const Banner = React.lazy(() => import("./components/Banner"));
const App = () => {
    const [isTailwind, setIsTailwind] = React.useState(false);
    const [showBanner, setShowBanner] = React.useState(true);
    const [loading, setLoading] = React.useState(true);
    const [player, setPlayer] = React.useState(null);
    const [gameData, setGameData] = React.useState(null);
    React.useEffect(() => setIsTailwind(isLoaded()), []);

    // Load from Firebase when player logs in
    const handleAuth = async (name) => {
        setPlayer(name);
        localStorage.setItem("playerName", name);

        // Load from Firebase
        const saved = await loadData(name);
        if (saved) {
            setGameData(saved); // restore old progress
        } else {
            // new player → create with defaults
            const defaults = { level: 1, move: 0, score: 0 };
            await createPlayer(name, defaults);
            setGameData(defaults);
        }
    };

    // Load game data when player logs in

    React.useEffect(() => {
        const fetchData = async () => {
            const savedName = localStorage.getItem("playerName");
            if (savedName) {
                setPlayer(savedName);
                const saved = await loadData(savedName);
                if (saved) setGameData(saved);
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("playerName");
        setPlayer(null);
        setGameData(null);
    };

    if (!player) {
        return <Auth onAuth={handleAuth} isTailwind={isTailwind} />;
    }

    if (showBanner) {
        return (
            <Banner
                onClose={() => setShowBanner(false)}
                isTailwind={isTailwind}
            />
        );
    }

    return (
        <React.Suspense fallback={loading && <div> Loading... </div>}>
            <Content
                player={player}
                gameData={gameData || { level: 1, score: 0, move: 0 }}
                onLogout={handleLogout}
                isTailwind={isTailwind}
            />
        </React.Suspense>
    );
};

export default App;
