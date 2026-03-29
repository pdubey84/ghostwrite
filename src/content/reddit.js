/**
 * Reddit post and comment extractor.
 * Depends on: dom-utils.js (loaded before this file via manifest.json)
 */

/* global cleanText, uniqueNonEmpty, visibleElements, getVisiblePageTextFallback, MAX_COMMENTS */
/* exported extractReddit */

function extractReddit() {
    let postTitle = "";
    let postBody = "";
    let authorName = "";

    const titleNode = document.querySelector("shreddit-post h1") || document.querySelector("h1");
    postTitle = cleanText(titleNode ? titleNode.textContent : "");

    const bodyCandidates = [
        "shreddit-post [slot='text-body']",
        "[data-test-id='post-content'] [data-click-id='text']",
        "[data-test-id='post-content'] div[style*='max-height']",
        "shreddit-post"
    ];

    for (const selector of bodyCandidates) {
        const node = document.querySelector(selector);
        const text = cleanText(node ? node.innerText || node.textContent : "");
        if (text && text !== postTitle) {
            postBody = text;
            break;
        }
    }

    const authorCandidates = [
        "shreddit-post a[slot='authorName']",
        "[data-testid='post_author_link']",
        "a[href*='/user/']"
    ];

    for (const selector of authorCandidates) {
        const node = document.querySelector(selector);
        const text = cleanText(node ? node.textContent : "");
        if (text) {
            authorName = text.replace(/^u\//, "");
            break;
        }
    }

    const commentSelectors = [
        "shreddit-comment [slot='comment']",
        "[data-test-id='comment'] [data-testid='comment']",
        "[data-testid='comment']"
    ];

    let comments = [];
    for (const selector of commentSelectors) {
        const nodes = visibleElements(selector);
        comments = uniqueNonEmpty(nodes.map((node) => cleanText(node.innerText || node.textContent || "")));
        if (comments.length) break;
    }

    comments = comments.slice(0, MAX_COMMENTS);

    let postText = cleanText([postTitle, postBody].filter(Boolean).join("\n\n"));
    const extractionFailed = !postText;
    if (extractionFailed) {
        postText = getVisiblePageTextFallback();
    }

    return {
        platform: "reddit",
        url: window.location.href,
        author_name: authorName || "Unknown",
        post_text: postText,
        comments,
        used_fallback: extractionFailed
    };
}
