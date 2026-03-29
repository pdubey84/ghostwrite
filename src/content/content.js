/**
 * Content script entry point.
 * Routes extraction requests to the appropriate platform extractor.
 * Depends on: dom-utils.js, linkedin.js, reddit.js (loaded before this file via manifest.json)
 */

/* global extractLinkedIn, extractReddit, getVisiblePageTextFallback */

(function () {
    function extractPageData() {
        const hostname = window.location.hostname;
        if (hostname.includes("linkedin.com")) return extractLinkedIn();
        if (hostname.includes("reddit.com")) return extractReddit();

        return {
            platform: "unknown",
            url: window.location.href,
            author_name: "Unknown",
            post_text: getVisiblePageTextFallback(),
            comments: [],
            used_fallback: true
        };
    }

    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
        if (message && message.type === "EXTRACT_POST_DATA") {
            try {
                const data = extractPageData();
                sendResponse({ ok: true, data });
            } catch (error) {
                sendResponse({
                    ok: false,
                    error: "Extraction failed.",
                    data: {
                        platform: "unknown",
                        url: window.location.href,
                        author_name: "Unknown",
                        post_text: getVisiblePageTextFallback(),
                        comments: [],
                        used_fallback: true
                    }
                });
            }
        }
        return true;
    });
})();
