import * as React from "react";

const Footer = ({ isTailwind = true }) => {
    React.useEffect(() => {}, []);

    return isTailwind ? (
        <footer className="w-full bg-white/90 px-4 py-3 text-center sm:px-6 sm:py-4">
            <p className="text-sm text-gray-700 leading-relaxed">
                Draw lines to connect{" "}
                <span className="font-bold text-purple-400">3 or more</span>{" "}
                balls of the same color!
                <br />
                Release to clear the connected balls.{" "}
                <span className="font-semibold text-purple-400">
                    Reach the target score to win!
                </span>
            </p>
        </footer>
    ) : (
        <footer className="w-100 bg-white bg-opacity-90 text-center">
            <p className="small text-muted m-1">
                Draw lines to connect{" "}
                <span className="fw-semibold text-primary">3 or more</span>{" "}
                balls of the same color!
                <br />
                Release to clear the connected balls.{" "}
                <span className="fw-semibold text-primary">
                    Reach the target score to win!
                </span>
            </p>
        </footer>
    );
};

export default Footer;
