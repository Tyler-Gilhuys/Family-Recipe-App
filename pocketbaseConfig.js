
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

const pb = new PocketBase("http://192.168.1.14:8090", authStore);

export const authReady = initialAuth;

export default pb;
