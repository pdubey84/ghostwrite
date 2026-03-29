/**
 * DOM utility functions for content script extraction.
 * These run in the page's global scope (no ES module support in content scripts).
 */

/* exported cleanText, uniqueNonEmpty, visibleElements, getVisiblePageTextFallback, MAX_COMMENTS */

// Prevent redeclaration if already loaded
if (typeof MAX_COMMENTS === 'undefined') {
    var MAX_COMMENTS = 10;
}

function cleanText(value) {
    if (!value) return "";
    return value.replace(/\s+/g, " ").trim();
}

function uniqueNonEmpty(list) {
    const seen = new Set();
    const result = [];
    for (const item of list) {
        const text = cleanText(item);
        if (!text) continue;
        if (seen.has(text)) continue;
        seen.add(text);
        result.push(text);
    }
    return result;
}

function visibleElements(selector) {
    return Array.from(document.querySelectorAll(selector)).filter((el) => {
        const style = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        return (
            style &&
            style.visibility !== "hidden" &&
            style.display !== "none" &&
            rect.width > 0 &&
            rect.height > 0
        );
    });
}

function getVisiblePageTextFallback() {
    const candidates = visibleElements("main, article, [role='main'], body");
    const combined = candidates
        .map((node) => cleanText(node.innerText || node.textContent || ""))
        .join("\n")
        .trim();
    return cleanText(combined).slice(0, 4000);
}
