import * as React from "react";
import { PhaserGame } from "./components/PhaserGame";
import Header from "./components/Header";
import Footer from "./components/Footer";

const App = () => {
    const phaserRef = React.useRef();

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center ">
            {/* Card Frame */}
            <div className="bg-white/90 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
                {/* HEADER */}
                <Header />

                {/* GAME BOARD */}
                <main className="flex items-center justify-center bg-gray-900 p-3">
                    <section className="w-full flex justify-center">
                        <PhaserGame ref={phaserRef} />
                    </section>
                </main>

                {/* FOOTER */}
                <Footer />
            </div>
        </div>
    );
};

export default App;
