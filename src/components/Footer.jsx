import * as React from "react";

const Footer = ({ isTailwind = true }) => {
    React.useEffect(() => {}, []);

    return (
        <footer className="px-6 py-4 bg-white/80 border-t border-gray-200 text-center">
            <section className="flex flex-col gap-2">
                <p className="text-sm text-gray-700 mb-2">
                    Draw lines to connect 3 or more balls of the same color!
                </p>
            </section>
            <section className="flex flex-col gap-2">
                <p className="text-sm text-gray-700 mb-2">
                    Release to clear the connected balls. Clear all balls to
                    win!
                </p>
            </section>
        </footer>
    );
};

export default Footer;
