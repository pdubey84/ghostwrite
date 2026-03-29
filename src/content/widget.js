/**
 * Floating CTA widget injected into LinkedIn/Reddit pages.
 * Uses Shadow DOM to fully isolate styles from the host page.
 */

(function () {
    const WIDGET_ID = "ghostwriter-cta-widget";
    const DISMISSED_KEY = "__ghostwriter_dismissed__";

    // Don't inject twice
    if (document.getElementById(WIDGET_ID)) return;

    // Don't show if dismissed this session
    if (sessionStorage.getItem(DISMISSED_KEY)) return;

    const host = document.createElement("div");
    host.id = WIDGET_ID;
    host.style.cssText = "all:initial; position:fixed; z-index:2147483647; top:80px; right:24px;";

    const shadow = host.attachShadow({ mode: "closed" });

    shadow.innerHTML = `
        <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }

            @keyframes float {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-4px); }
            }

            @keyframes shimmer {
                0% { background-position: -200% center; }
                100% { background-position: 200% center; }
            }

            @keyframes glow-pulse {
                0%, 100% { box-shadow: 0 4px 20px rgba(139, 92, 246, 0.15), 0 0 0 0 rgba(139, 92, 246, 0.08); }
                50% { box-shadow: 0 4px 28px rgba(139, 92, 246, 0.25), 0 0 0 6px rgba(139, 92, 246, 0.04); }
            }

            .widget-container {
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                display: flex;
                align-items: center;
                gap: 6px;
                position: relative;
            }

            .widget-pill {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 12px 20px 12px 16px;
                border: 1.5px solid rgba(139, 92, 246, 0.2);
                border-radius: 50px;
                background: #ffffff;
                color: #1a1a2e;
                font-family: inherit;
                font-size: 13.5px;
                font-weight: 600;
                letter-spacing: 0.2px;
                cursor: pointer;
                animation: float 3s ease-in-out infinite, glow-pulse 3s ease-in-out infinite;
                transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s ease, border-color 0.25s ease;
                position: relative;
                overflow: hidden;
            }

            .widget-pill:hover {
                transform: scale(1.06) translateY(-2px);
                box-shadow: 0 6px 30px rgba(139, 92, 246, 0.3);
                border-color: rgba(139, 92, 246, 0.4);
                animation: none;
            }

            .widget-pill:active {
                transform: scale(0.97);
            }

            .sparkle-icon {
                font-size: 18px;
                display: flex;
                align-items: center;
                filter: drop-shadow(0 0 3px rgba(139, 92, 246, 0.3));
            }

            .label-text {
                background: linear-gradient(135deg, #7c3aed, #6366f1, #8b5cf6);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }

            .dismiss-btn {
                position: absolute;
                top: -6px;
                right: -6px;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                border: 1.5px solid rgba(139, 92, 246, 0.2);
                background: #ffffff;
                color: #8e91a8;
                font-size: 11px;
                font-weight: 700;
                line-height: 1;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                opacity: 0;
                transition: opacity 0.2s ease, background 0.2s ease, color 0.2s ease;
                font-family: inherit;
            }

            .widget-container:hover .dismiss-btn {
                opacity: 1;
            }

            .dismiss-btn:hover {
                background: #7c3aed;
                color: #fff;
                border-color: #7c3aed;
            }
        </style>

        <div class="widget-container">
            <button class="widget-pill" id="cta-btn" title="Generate a thoughtful comment with AI">
                <span class="sparkle-icon">✨</span>
                <span class="label-text">Ghostwrite</span>
            </button>
            <button class="dismiss-btn" id="dismiss-btn" title="Dismiss">✕</button>
        </div>
    `;

    const ctaBtn = shadow.getElementById("cta-btn");
    const dismissBtn = shadow.getElementById("dismiss-btn");

    ctaBtn.addEventListener("click", () => {
        // Send message to background to open the popup.
        // Chrome doesn't allow programmatic popup opening, so we use
        // the action API to trigger the popup.
        chrome.runtime.sendMessage({ type: "OPEN_POPUP" });
    });

    dismissBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        sessionStorage.setItem(DISMISSED_KEY, "1");
        host.remove();
    });

    // Wait for body to be ready
    if (document.body) {
        document.body.appendChild(host);
    } else {
        document.addEventListener("DOMContentLoaded", () => {
            document.body.appendChild(host);
        });
    }
})();
