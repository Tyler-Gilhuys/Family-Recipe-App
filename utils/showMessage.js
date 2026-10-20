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

export function confirmAction(title, message, confirmLabel = "Delete") {
    if (Platform.OS === "web") {
        return Promise.resolve(window.confirm(`${title}\n\n${message}`));
    }

    return new Promise((resolve) => {
        Alert.alert(title, message, [
            { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
            {
                text: confirmLabel,
                style: "destructive",
                onPress: () => resolve(true),
            },
        ], { cancelable: true, onDismiss: () => resolve(false) });
    });
}