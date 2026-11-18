import { emitToast } from "./toastBus";
import { requestConfirm } from "./confirmBus";

export function showMessage(title, message, type = "info") {
    emitToast({ title, message, type });
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
    return requestConfirm({ title, message, confirmLabel });
}