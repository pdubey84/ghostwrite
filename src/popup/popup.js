const modeSelect = document.getElementById("modeSelect");
const extraContext = document.getElementById("extraContext");
const generateBtn = document.getElementById("generateBtn");
const regenerateBtn = document.getElementById("regenerateBtn");
const resultTextarea = document.getElementById("result");
const copyBtn = document.getElementById("copyBtn");
const exportBtn = document.getElementById("exportBtn");
const settingsBtn = document.getElementById("settingsBtn");
const statusEl = document.getElementById("status");
const loadingContainer = document.getElementById("loadingContainer");

let lastPayload = null;

function setStatus(message, type = "info") {
    statusEl.textContent = message;
    statusEl.className = `status status-${type}`;
}

function setLoading(loading) {
    generateBtn.disabled = loading;
    regenerateBtn.disabled = loading;
    copyBtn.disabled = loading;
    exportBtn.disabled = loading;
    settingsBtn.disabled = loading;

    if (loading) {
        loadingContainer.classList.add("active");
        resultTextarea.value = "";
        resultTextarea.classList.remove("typewriting");
        setStatus("Generating…", "info");
    } else {
        loadingContainer.classList.remove("active");
    }
}

async function getActiveTab() {
    return new Promise((resolve) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            resolve(tabs && tabs[0] ? tabs[0] : null);
        });
    });
}

function sendMessageToTab(tabId, message) {
    return new Promise((resolve) => {
        chrome.tabs.sendMessage(tabId, message, (response) => {
            if (chrome.runtime.lastError) {
                resolve({ ok: false, error: chrome.runtime.lastError.message });
            } else {
                resolve(response || { ok: false, error: "No response from content script." });
            }
        });
    });
}

function sendMessageToBackground(message) {
    return new Promise((resolve) => {
        chrome.runtime.sendMessage(message, (response) => {
            if (chrome.runtime.lastError) {
                resolve({ ok: false, error: chrome.runtime.lastError.message });
            } else {
                resolve(response || { ok: false, error: "No response from background." });
            }
        });
    });
}

/**
 * Typewriter effect — reveals text character by character.
 */
function typewriterReveal(textarea, text, speed = 12) {
    return new Promise((resolve) => {
        textarea.value = "";
        textarea.classList.add("typewriting");
        let i = 0;
        const interval = setInterval(() => {
            textarea.value += text[i];
            textarea.scrollTop = textarea.scrollHeight;
            i++;
            if (i >= text.length) {
                clearInterval(interval);
                textarea.classList.remove("typewriting");
                resolve();
            }
        }, speed);
    });
}

async function generate(useLastPayload = false) {
    setLoading(true);

    try {
        let pageData;

        if (useLastPayload && lastPayload) {
            pageData = lastPayload;
        } else {
            const tab = await getActiveTab();
            if (!tab || !tab.id) {
                setStatus("Could not access the active tab.", "error");
                setLoading(false);
                return;
            }

            // Try to inject content script first in case it's not loaded yet.
            try {
                await chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    files: [
                        "src/content/dom-utils.js",
                        "src/content/linkedin.js",
                        "src/content/reddit.js",
                        "src/content/content.js"
                    ]
                });
            } catch (_e) {
                // Script may already be injected; ignore the error.
            }

            const extraction = await sendMessageToTab(tab.id, { type: "EXTRACT_POST_DATA" });
            if (!extraction.ok) {
                setStatus(`Extraction failed: ${extraction.error}`, "error");
                setLoading(false);
                return;
            }
            pageData = extraction.data;
        }

        const payload = {
            ...pageData,
            mode: modeSelect.value,
            extra_context: extraContext.value.trim()
        };

        lastPayload = payload;

        const result = await sendMessageToBackground({
            type: "GENERATE_COMMENT",
            payload
        });

        setLoading(false);

        if (!result.ok) {
            setStatus(`Error: ${result.error}`, "error");
        } else {
            await typewriterReveal(resultTextarea, result.generatedComment);
            setStatus("✓ Comment ready", "success");
        }
    } catch (err) {
        setLoading(false);
        setStatus(`Unexpected error: ${err.message}`, "error");
    }
}

async function copyToClipboard() {
    const text = resultTextarea.value.trim();
    if (!text) {
        setStatus("Nothing to copy.", "error");
        return;
    }
    try {
        await navigator.clipboard.writeText(text);
        setStatus("✓ Copied to clipboard!", "success");

        // Brief flash on the copy button
        copyBtn.style.background = "rgba(52, 211, 153, 0.15)";
        copyBtn.style.borderColor = "rgba(52, 211, 153, 0.4)";
        setTimeout(() => {
            copyBtn.style.background = "";
            copyBtn.style.borderColor = "";
        }, 800);
    } catch (_err) {
        setStatus("Copy failed. Select and copy manually.", "error");
    }
}

async function exportHistory() {
    const response = await sendMessageToBackground({ type: "EXPORT_HISTORY" });
    if (!response.ok) {
        setStatus(`Export failed: ${response.error}`, "error");
        return;
    }

    const history = response.history || [];
    if (!history.length) {
        setStatus("No history to export.", "error");
        return;
    }

    const blob = new Blob([JSON.stringify(history, null, 2)], {
        type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const filename = `ghostwriter-history-${ts}.json`;

    await chrome.downloads.download({ url, filename, saveAs: false });
    URL.revokeObjectURL(url);
    setStatus("✓ History exported", "success");
}

async function loadDefaultMode() {
    const response = await sendMessageToBackground({ type: "GET_SETTINGS" });
    if (response.ok && response.settings.defaultMode) {
        modeSelect.value = response.settings.defaultMode;
    }
}

function openSettings() {
    chrome.tabs.create({ url: chrome.runtime.getURL("src/options/options.html") });
}

generateBtn.addEventListener("click", () => generate(false));
regenerateBtn.addEventListener("click", () => generate(true));
copyBtn.addEventListener("click", copyToClipboard);
exportBtn.addEventListener("click", exportHistory);
settingsBtn.addEventListener("click", openSettings);

loadDefaultMode();
