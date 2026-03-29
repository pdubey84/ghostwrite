/**
 * Shared Chrome storage helpers.
 * Used by the background service worker and options page.
 */

export function getStorage(keys) {
    return new Promise((resolve) => {
        chrome.storage.local.get(keys, (result) => resolve(result || {}));
    });
}

export function setStorage(values) {
    return new Promise((resolve) => {
        chrome.storage.local.set(values, () => resolve());
    });
}
