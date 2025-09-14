export const isLoaded = () => {
    const element = document.createElement("div");
    element.className = "flex"; // Tailwind always includes flex
    document.body.appendChild(element);

    const isFlex = window.getComputedStyle(element).display === "flex";
    document.body.removeChild(element);

    if (!isFlex) {
        document.getElementById("bootstrap").disabled = false;
        console.warn("⚠️ Tailwind not detected, switching to Bootstrap...");

        return false;
    }

    return true;
};
