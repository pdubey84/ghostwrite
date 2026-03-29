/**
 * Generation history persistence.
 */

import { getStorage, setStorage } from "../shared/storage.js";

const HISTORY_KEY = "generationHistory";

export async function appendHistory(record) {
    const existing = await getStorage([HISTORY_KEY]);
    const history = Array.isArray(existing[HISTORY_KEY]) ? existing[HISTORY_KEY] : [];
    history.unshift(record);
    await setStorage({ [HISTORY_KEY]: history.slice(0, 500) });
}

export async function getHistory() {
    const data = await getStorage([HISTORY_KEY]);
    return Array.isArray(data[HISTORY_KEY]) ? data[HISTORY_KEY] : [];
}
