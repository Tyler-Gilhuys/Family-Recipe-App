let listener = null;

export function setConfirmListener(fn) {
    listener = fn;
}

export function requestConfirm(options) {
    return new Promise((resolve) => {
        if (listener) {
            listener({ ...options, resolve });
        } else {
            // No ConfirmProvider mounted yet; fail safe to "cancelled".
            resolve(false);
        }
    });
}