/* ============================================ */
/* PAGE TRANSITION — ZAP WALL OVERLAY           */
/* ============================================ */
/* Fires only on internal link navigation between pages, never on a
   direct URL load — that's the whole point of gating through sessionStorage
   instead of just animating on every DOMContentLoaded. */
(function () {
    const STORAGE_KEY      = 'zapPageTransition';
    const PATTERN_LENGTH   = 260;
    const TEAL_CHANCE      = 0.22;
    const ROWS             = 9;
    const ZAPS_PER_ROW     = 14;
    const ROW_TRANSITION_MS = 550;
    const STAGGER_STEP_MS   = 70;
    // Bottom row starts first (delay 0) in both directions, so the top row
    // — largest delay — is always the last strip to finish animating.
    const ANIMATION_MS = (ROWS - 1) * STAGGER_STEP_MS + ROW_TRANSITION_MS + 100;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function buildOverlay(pattern) {
        const overlay = document.createElement('div');
        overlay.className = 'page-transition-overlay';

        const field = document.createElement('div');
        field.className = 'pt-zap-field';

        let cellIndex = 0;
        for (let r = 0; r < ROWS; r++) {
            const row = document.createElement('div');
            row.className = 'pt-row';
            const bottomUpIndex = ROWS - 1 - r; // last DOM row (bottom of screen) = 0
            row.style.setProperty('--pt-delay', (bottomUpIndex * STAGGER_STEP_MS) + 'ms');
            for (let c = 0; c < ZAPS_PER_ROW; c++) {
                const span = document.createElement('span');
                span.textContent = 'ZAP';
                if (pattern[cellIndex % PATTERN_LENGTH]) span.classList.add('pt-teal');
                row.appendChild(span);
                cellIndex++;
            }
            field.appendChild(row);
        }

        overlay.appendChild(field);
        document.body.appendChild(overlay);
        return overlay;
    }

    function randomPattern() {
        return Array.from({ length: PATTERN_LENGTH }, () => Math.random() < TEAL_CHANCE);
    }

    function isInternalPageNav(anchor) {
        if (!anchor || !anchor.href) return false;
        if (anchor.target && anchor.target !== '_self') return false;
        if (anchor.hasAttribute('download')) return false;

        let url;
        try { url = new URL(anchor.href, window.location.href); }
        catch (e) { return false; }

        if (url.origin !== window.location.origin) return false;
        if (url.pathname === window.location.pathname) return false; // same-page hash link

        return true;
    }

    // --- Leaving current page: fade + slide in from bottom-left, ends stationary ---
    document.addEventListener('click', function (e) {
        if (e.defaultPrevented || e.button !== 0) return;
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

        const anchor = e.target.closest('a[href]');
        if (!isInternalPageNav(anchor)) return;

        e.preventDefault();
        const destination = anchor.href;

        sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ pattern: randomPattern() }));

        if (reduceMotion) {
            window.location.href = destination;
            return;
        }

        const stored = JSON.parse(sessionStorage.getItem(STORAGE_KEY));
        const overlay = buildOverlay(stored.pattern);
        // Force layout so the initial (off-screen, transparent) state is
        // committed before the class swap kicks off the transition.
        overlay.getBoundingClientRect();
        overlay.classList.add('pt-leaving');

        window.setTimeout(function () {
            window.location.href = destination;
        }, ANIMATION_MS);
    }, true);

    // --- Arriving on new page: starts stationary, fades + slides out to top-right ---
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return; // direct URL load — no overlay, no animation
    sessionStorage.removeItem(STORAGE_KEY);

    if (reduceMotion) return;

    let stored;
    try { stored = JSON.parse(raw); } catch (e) { return; }
    if (!stored || !stored.pattern) return;

    const overlay = buildOverlay(stored.pattern);
    overlay.classList.add('pt-stationary');

    requestAnimationFrame(function () {
        requestAnimationFrame(function () {
            overlay.classList.remove('pt-stationary');
            overlay.classList.add('pt-arriving');
        });
    });

    window.setTimeout(function () { overlay.remove(); }, ANIMATION_MS);
})();
