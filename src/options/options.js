/**
 * Options page logic.
 * Manages API key, voice profile, and default mode settings.
 */

import { getStorage, setStorage } from "../shared/storage.js";

const apiKeyInput = document.getElementById("apiKey");
const myVoiceInput = document.getElementById("myVoice");
const defaultModeSelect = document.getElementById("defaultMode");
const saveBtn = document.getElementById("saveBtn");
const clearApiKeyBtn = document.getElementById("clearApiKeyBtn");
const statusEl = document.getElementById("status");

function setStatus(message, isError = false) {
    statusEl.textContent = message;
    statusEl.style.color = isError ? "#b42318" : "#4a4f56";
}

async function loadSettings() {
    try {
        const data = await getStorage(["openaiApiKey", "myVoiceProfile", "defaultMode"]);
        apiKeyInput.value = data.openaiApiKey || "";
        myVoiceInput.value = data.myVoiceProfile || "";
        defaultModeSelect.value = data.defaultMode || "Builder";
        setStatus("Settings loaded.");
    } catch (_error) {
        setStatus("Failed to load settings.", true);
    }
}

async function saveSettings() {
    try {
        await setStorage({
            openaiApiKey: apiKeyInput.value.trim(),
            myVoiceProfile: myVoiceInput.value.trim(),
            defaultMode: defaultModeSelect.value
        });
        setStatus("Settings saved.");
    } catch (_error) {
        setStatus("Failed to save settings.", true);
    }
}

async function clearApiKey() {
    try {
        apiKeyInput.value = "";
        await setStorage({ openaiApiKey: "" });
        setStatus("API key cleared.");
    } catch (_error) {
        setStatus("Failed to clear API key.", true);
    }
}

saveBtn.addEventListener("click", saveSettings);
clearApiKeyBtn.addEventListener("click", clearApiKey);

loadSettings();
