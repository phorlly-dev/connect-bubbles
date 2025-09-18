import {
    doc,
    getDoc,
    serverTimestamp,
    setDoc,
    updateDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import { formatName } from "./format";

const GameData = {
    // Save only if new player
    async createPlayer(player, { score, move, level }) {
        const safeName = formatName(player);
        const ref = doc(db, "players", safeName);

        await setDoc(
            ref,
            {
                score, // number
                move, // number
                level, // number
                created_at: serverTimestamp(),
                updated_at: serverTimestamp(),
            },
            { merge: true }
        );
    },

    // Update only changed progress
    async updateProgress(player, { score, move, level }) {
        try {
            const safeName = formatName(player);
            const ref = doc(db, "players", safeName);
            await updateDoc(ref, {
                score,
                move,
                level,
                updated_at: serverTimestamp(),
            });
        } catch (err) {
            console.error("🔥 Error syncing progress:", err);
        }
    },

    // Load existing data
    async loadData(player) {
        const safeName = formatName(player);
        const ref = doc(db, "players", safeName);
        const snap = await getDoc(ref);

        return snap.exists() ? snap.data() : null;
    },
};

export const { createPlayer, updateProgress, loadData } = GameData;
