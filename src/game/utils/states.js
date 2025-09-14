const States = {
    getColorHex(color) {
        const colors = {
            red: 0xff6b6b,
            blue: 0x4ecdc4,
            green: 0x45b7d1,
            yellow: 0xf9ca24,
            purple: 0x6c5ce7,
            orange: 0xfd79a8,
        };
        return colors[color] || 0x000000;
    },
};

export const { getColorHex } = States;
