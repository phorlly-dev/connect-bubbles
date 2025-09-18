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
        const safeName = formatName(player);
        const ref = doc(db, "players", safeName);

        await updateDoc(ref, {
            score, // number
            move, // number
            level, // number
            updated_at: serverTimestamp(),
        });
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
