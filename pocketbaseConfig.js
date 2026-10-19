
import PocketBase, { AsyncAuthStore } from "pocketbase";
import AsyncStorage from "@react-native-async-storage/async-storage";

const initialAuth = AsyncStorage.getItem("pb_auth").then(
    (value) => value || ""
);

const authStore = new AsyncAuthStore({
    save: async (serialized) => {
        await AsyncStorage.setItem("pb_auth", serialized);
    },
    initial: initialAuth,
});

const POCKETBASE_URL =
    process.env.EXPO_PUBLIC_POCKETBASE_URL || "http://192.168.1.14:8090";

const pb = new PocketBase(POCKETBASE_URL, authStore);

export const authReady = initialAuth;

export default pb;
