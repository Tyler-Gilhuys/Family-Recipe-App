let listener = null;

export function setToastListener(fn) {
    listener = fn;
}

export function emitToast(toast) {
    if (listener) listener(toast);
}