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
        if (!player) return null;
        try {
            const safeName = formatName(player);
            const ref = doc(db, "connect_bubbles", safeName);

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

            console.log("Saved successfully!");
        } catch (error) {
            console.error("Saving player failed:", error);
            return null;
        }
    },

    // Update only changed progress
    async updateProgress(player, { score, move, level }) {
        if (!player) return null;
        try {
            const safeName = formatName(player);
            const ref = doc(db, "connect_bubbles", safeName);

            await updateDoc(ref, {
                score, // number
                move, // number
                level, // number
                updated_at: serverTimestamp(),
            });

            console.info("Updated successfully!");
        } catch (error) {
            console.error("Udating progress failed:", error);
            return null;
        }
    },

    // Load existing data
    async loadData(player) {
        if (!player) return null;

        try {
            const safeName = formatName(player);
            const ref = doc(db, "connect_bubbles", safeName);
            const snap = await getDoc(ref);

            return snap.exists() ? snap.data() : null;
        } catch (error) {
            console.error("Loading data failed:", error);
            return null;
        }
    },
};

export const { createPlayer, updateProgress, loadData } = GameData;
