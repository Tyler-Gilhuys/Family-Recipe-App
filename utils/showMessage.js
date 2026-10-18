import { Alert, Platform } from "react-native";

export function showMessage(title, message) {
    if (Platform.OS === "web") {
        window.alert(`${title}\n\n${message}`);
    } else {
        Alert.alert(title, message);
    }
}

// Turns a PocketBase error into readable text, including per-field problems.
export function describeError(error) {
    const data = error?.response?.data;
    if (data && Object.keys(data).length > 0) {
        return Object.entries(data)
            .map(([field, info]) => `${field}: ${info?.message ?? "invalid"}`)
            .join("\n");
    }
    return error?.message || "Something went wrong.";
}