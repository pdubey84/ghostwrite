/**
 * LinkedIn post and comment extractor.
 * Depends on: dom-utils.js (loaded before this file via manifest.json)
 */

/* global cleanText, uniqueNonEmpty, visibleElements, getVisiblePageTextFallback, MAX_COMMENTS */
/* exported extractLinkedIn */

function extractLinkedIn() {
    let postText = "";
    let authorName = "";
    let highlightedElement = null;

    const postCandidates = [
        ".feed-shared-update-v2__description",
        ".update-components-text",
        ".feed-shared-text",
        "[data-test-id='main-feed-activity-card'] .break-words",
        "article .break-words"
    ];

    for (const selector of postCandidates) {
        const nodes = visibleElements(selector);
        if (nodes.length) {
            const best = nodes
                .map((n) => cleanText(n.innerText || n.textContent || ""))
                .filter(Boolean)
                .sort((a, b) => b.length - a.length)[0];
            if (best) {
                postText = best;
                // Find the actual element that contains this text
                highlightedElement = nodes.find(n => 
                    cleanText(n.innerText || n.textContent || "") === best
                );
                break;
            }
        }
    }

    const authorCandidates = [
        ".feed-shared-actor__name",
        ".update-components-actor__name",
        "a[data-control-name='actor'] span[aria-hidden='true']",
        "h2 a span"
    ];

    for (const selector of authorCandidates) {
        const node = document.querySelector(selector);
        const text = cleanText(node ? node.textContent : "");
        if (text) {
            authorName = text;
            break;
        }
    }

    const commentSelectors = [
        ".comments-comment-item__main-content",
        ".comments-comment-item-content-body",
        ".comments-comment-entity__main-content",
        ".update-components-comments .break-words"
    ];

    let comments = [];
    for (const selector of commentSelectors) {
        const nodes = visibleElements(selector);
        comments = nodes.map((node) => cleanText(node.innerText || node.textContent || ""));
        comments = uniqueNonEmpty(comments);
        if (comments.length) break;
    }

    comments = comments.slice(0, MAX_COMMENTS);

    const extractionFailed = !postText;
    if (extractionFailed) {
        postText = getVisiblePageTextFallback();
    }

    // Highlight the detected post element
    if (highlightedElement) {
        const originalBorder = highlightedElement.style.border;
        const originalBoxShadow = highlightedElement.style.boxShadow;
        
        highlightedElement.style.border = "3px solid #ff1493";
        highlightedElement.style.boxShadow = "0 0 10px rgba(255, 20, 147, 0.5)";
        
        // Remove highlight after 3 seconds
        setTimeout(() => {
            if (highlightedElement) {
                highlightedElement.style.border = originalBorder;
                highlightedElement.style.boxShadow = originalBoxShadow;
            }
        }, 3000);
    }

    return {
        platform: "linkedin",
        url: window.location.href,
        author_name: authorName || "Unknown",
        post_text: postText,
        comments,
        used_fallback: extractionFailed
    };
}
