// ============================================
// PROJECTS.JS
// ============================================
// Drives projects.html: the card deck cycler at the top (cloned from the full
// grid so there's one source of card markup) and the "Show All" deal-out below.

document.addEventListener('DOMContentLoaded', () => {

    // ----------------------------------------
    // 1. MOBILE MENU TOGGLE
    // ----------------------------------------
    const menuToggleButton = document.querySelector('.menu-toggle');
    const navbarElement    = document.querySelector('.navbar');

    if (menuToggleButton && navbarElement) {
        menuToggleButton.addEventListener('click', () => {
            const isExpanded = navbarElement.classList.toggle('is-active');
            menuToggleButton.setAttribute('aria-expanded', isExpanded);
        });
        document.querySelectorAll('.navbar a').forEach(link => {
            link.addEventListener('click', () => {
                navbarElement.classList.remove('is-active');
                menuToggleButton.setAttribute('aria-expanded', 'false');
            });
        });
        document.addEventListener('click', e => {
            if (!navbarElement.contains(e.target) && !menuToggleButton.contains(e.target)) {
                navbarElement.classList.remove('is-active');
                menuToggleButton.setAttribute('aria-expanded', 'false');
            }
        });
    }


    // ----------------------------------------
    // 2. PRIMARY BUTTON RIPPLE BLOB
    // ----------------------------------------
    document.querySelectorAll('.button-primary').forEach(btn => {
        if (!btn.querySelector('span')) btn.innerHTML = `<span>${btn.innerHTML}</span>`;
        const blob = document.createElement('span');
        blob.classList.add('button-ripple-blob');
        blob.style.width = blob.style.height = '0';
        btn.appendChild(blob);

        const rel = e => { const r = btn.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
        btn.addEventListener('mouseenter', e => {
            const p = rel(e);
            blob.style.top = p.y + 'px'; blob.style.left = p.x + 'px';
            const sz = Math.max(btn.offsetWidth, btn.offsetHeight) * 2.5 + 'px';
            blob.style.width = blob.style.height = sz;
        });
        btn.addEventListener('mouseleave', e => {
            const p = rel(e);
            blob.style.top = p.y + 'px'; blob.style.left = p.x + 'px';
            blob.style.width = blob.style.height = '0';
        });
    });


    // ----------------------------------------
    // 3. SCROLL ANIMATIONS
    // ----------------------------------------
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const obs = new IntersectionObserver((entries, observer) => {
            entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } });
        }, { threshold: 0.15 });
        document.querySelectorAll('.section').forEach(el => obs.observe(el));
    } else {
        document.querySelectorAll('.section').forEach(el => el.classList.add('visible'));
    }


    // ----------------------------------------
    // 4. PROJECT DECK (cloned from the full grid)
    // ----------------------------------------
    const projectDeckEl = document.getElementById('projectDeck');
    const gridCards      = Array.from(document.querySelectorAll('#projectFullGrid .deal-card'));

    if (projectDeckEl && gridCards.length) {
        gridCards.forEach(source => {
            const clone = source.cloneNode(true); // deep copy keeps the inline --card-accent
            clone.classList.remove('deal-card');
            clone.classList.add('deck-card');
            projectDeckEl.appendChild(clone);
        });

        initProjectDeck(projectDeckEl);
    }

    // Same riffle behaviour as the home deck (see js/main.js §9): prev/next
    // buttons, click a side card to centre it, swipe, and arrow keys.
    function initProjectDeck(deckEl) {
        const deckCards = Array.from(deckEl.querySelectorAll('.deck-card'));
        const cardCount = deckCards.length;
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const controlsWrapEl = deckEl.nextElementSibling; // .deck-controls
        // The bulge arc aims at the cycle buttons, not the whole controls
        // block — on the home page that block also holds the "See More
        // Projects" link below the cycle row, which would pull the arc's
        // target lower than the buttons it's actually meant to fly past.
        const controlsEl = controlsWrapEl?.querySelector('.deck-cycle-row') || controlsWrapEl;
        const stackEl = document.getElementById(deckEl.id + 'Stack'); // spacer only, see CSS
        let deckStart = 0; // index of the card currently in the left slot

        // deckOrder maps logical sequence position -> physical deckCards index;
        // shuffleDeck() below permutes it, posInOrder is its inverse (kept in
        // sync via rebuildPosInOrder) so every other lookup can stay index-first.
        let deckOrder = deckCards.map((_, i) => i);
        let posInOrder = new Array(cardCount);
        function rebuildPosInOrder() { deckOrder.forEach((idx, p) => { posInOrder[idx] = p; }); }
        rebuildPosInOrder();
        // Guards Next/Prev/Shuffle against overlapping each other — without it,
        // a Shuffle (or another Next/Prev) landing mid-flight cancels the
        // in-progress staggered card animations at whatever point they'd each
        // individually reached, which is exactly what left random fanned cards
        // stuck looking packed ("ghost" cards) after a quick Next-then-Shuffle.
        let isBusy = false;

        const posOf = (i, start) => (i - start + cardCount) % cardCount;

        // Resting-state transform strings, shared between the static CSS
        // classes (slot-left/center/right/pack own these already) and the
        // flight keyframes below, so a flight always lands exactly where the
        // resting class would have put it — no snap at hand-off. Every stop
        // spells out the SAME function list (translate, rotate, rotateX,
        // rotateZ, scale), even when a value is a no-op identity — keyframes
        // whose transform lists don't line up function-for-function force
        // the browser into matrix-decomposition interpolation between them,
        // which produced wildly oversized/mispositioned in-between frames
        // during testing (cards briefly ballooning hundreds of px past their
        // real size). Matching lists keep the interpolation component-wise
        // and predictable. transform-origin is left at the base .deck-card
        // default ('center bottom') throughout — pack, bulge and fan all
        // share it, so there's nothing to switch mid-flight.
        const slotTransform = pos => {
            if (pos === 0) return 'translate(calc(-50% - var(--fan, 108%)), 0px) rotate(-7deg) rotateX(0deg) rotateZ(0deg) scale(1)';
            if (pos === 1) return 'translate(-50%, -6px) rotate(0deg) rotateX(0deg) rotateZ(0deg) scale(1)';
            return 'translate(calc(-50% + var(--fan, 108%)), 0px) rotate(7deg) rotateX(0deg) rotateZ(0deg) scale(1)';
        };
        // No per-depth x offset: the near corner of every packed card then
        // sits on the same vertical line as it recedes into the stack,
        // instead of drifting off diagonally.
        const packTransform = depth =>
            `translate(calc(-50% + var(--stack-x, 0px)), calc(var(--stack-y, 320px) + ${depth * 7}px)) rotate(0deg) rotateX(58deg) rotateZ(-18deg) scale(var(--stack-scale, 0.3))`;
        const BULGE_SCALE = 0.55; // must match the scale() used in the flight keyframes below

        // Probes the ACTUAL rendered extent (all 4 edges) of a given
        // rotate/scale pose at translate(-50%, 0), by briefly rendering an
        // invisible clone. 3D rotation + perspective make the relationship
        // between a translate argument and where the shape ends up on screen
        // hard to derive by hand — a hand-derived estimate was off by 200+px
        // vertically, and separately produced a real horizontal overflow on
        // narrow viewports, because perspective foreshortening doesn't
        // behave like flat 2D geometry. Since translate() is applied last in
        // the composed transform, though, shifting tx/ty shifts the
        // rendered shape by exactly that amount — so one probe at (0,0)
        // tells us everything needed (the offset between the argument and
        // the rendered center, and the rendered half-extent, on both axes)
        // to place and clamp it correctly for any tx/ty. transform-origin is
        // left unset here so the clone inherits .deck-card's own 'center
        // bottom' default, matching every real keyframe.
        function probeExtent(scale, rotate2D, rotateX, rotateZ) {
            const probe = deckCards[0].cloneNode(false);
            probe.style.visibility = 'hidden';
            probe.style.position = 'absolute';
            probe.style.transform = `translate(-50%, 0px) rotate(${rotate2D}deg) rotateX(${rotateX}deg) rotateZ(${rotateZ}deg) scale(${scale})`;
            deckEl.appendChild(probe);
            const rect = probe.getBoundingClientRect();
            deckEl.removeChild(probe);
            return rect;
        }

        // Measures where the stack spacer and the controls actually sit,
        // relative to the deck's own centre, and how far the flight arc can
        // bulge before a card would cross a viewport edge. Runs on init and
        // on resize/scroll (debounced) so the arc always stays on-screen —
        // scroll matters too, since it moves the deck within the viewport
        // just as much as a resize does.
        function measureGeometry() {
            if (!stackEl || !controlsEl || !deckCards.length) return;
            const deckRect = deckEl.getBoundingClientRect();
            const stackRect = stackEl.getBoundingClientRect();
            const controlsRect = controlsEl.getBoundingClientRect();
            // offsetHeight, not getBoundingClientRect(), because a remeasure
            // can land while deckCards[0] is mid-flight (shuffle/advance) and
            // already WAAPI-scaled down to its pack pose — dividing by that
            // transformed (tiny) height would inflate stackScale and leave
            // the whole pack stuck oversized until the next remeasure.
            // offsetHeight is the untransformed layout box, so it stays
            // correct regardless of any transform currently in flight.
            const cardHeight = deckCards[0].offsetHeight;
            const deckCenterX = deckRect.left + deckRect.width / 2;
            const margin = 24;

            const stackScale = Math.min(0.94, (stackRect.height * 0.88) / cardHeight);
            const stackCenterX = stackRect.left + stackRect.width / 2;
            const stackCenterY = stackRect.top + stackRect.height / 2;

            const packProbe = probeExtent(stackScale, 0, 58, -18);
            const packOffsetX = (packProbe.left + packProbe.right) / 2 - deckCenterX;
            const packOffsetY = (packProbe.top + packProbe.bottom) / 2 - deckRect.top;

            // stack-x/y are the pack's RESTING position — always just the
            // spacer's actual layout offset from the deck, with no viewport
            // clamp. deckCenterX/deckRect.top and stackCenterX/Y are all
            // viewport-relative and shift together on scroll, so their
            // difference here is already scroll-invariant; clamping it
            // against window.innerWidth/innerHeight (as the arc bulge below
            // needs to) would reintroduce scroll-dependence and make the
            // resting pack visibly drift as the page is scrolled.
            const stackX = stackCenterX - deckCenterX - packOffsetX;
            const stackY = stackCenterY - deckRect.top - packOffsetY;

            const bulgeProbe = probeExtent(BULGE_SCALE, 10, 28, -9);
            const bulgeOffsetX = (bulgeProbe.left + bulgeProbe.right) / 2 - deckCenterX;
            const bulgeHalfX = bulgeProbe.width / 2;
            const bulgeOffsetY = (bulgeProbe.top + bulgeProbe.bottom) / 2 - deckRect.top;
            const bulgeHalfY = bulgeProbe.height / 2;

            const controlsCenterY = (controlsRect.top + controlsRect.height / 2) - deckRect.top;
            const controlsYDesired = controlsCenterY - bulgeOffsetY;
            const controlsYMin = (margin - deckRect.top) - bulgeOffsetY + bulgeHalfY;
            const controlsYMax = (window.innerHeight - margin - deckRect.top) - bulgeOffsetY - bulgeHalfY;
            const controlsY = Math.max(controlsYMin, Math.min(controlsYDesired, controlsYMax));

            // arc-right is used as +arcRight in the enter/exit translateX;
            // arc-left as -arcLeft. Both need the bulge's own rendered
            // extent (not the flat card's) to actually guarantee containment.
            const arcRightMax = (window.innerWidth - margin - deckCenterX) - bulgeOffsetX - bulgeHalfX;
            const arcLeftMax = (deckCenterX - margin) + bulgeOffsetX - bulgeHalfX;

            deckEl.style.setProperty('--stack-x', stackX + 'px');
            deckEl.style.setProperty('--stack-y', stackY + 'px');
            deckEl.style.setProperty('--stack-scale', stackScale.toFixed(3));
            deckEl.style.setProperty('--controls-y', controlsY + 'px');
            deckEl.style.setProperty('--arc-right', Math.max(0, Math.min(220, arcRightMax)) + 'px');
            deckEl.style.setProperty('--arc-left', Math.max(0, Math.min(220, arcLeftMax)) + 'px');
        }

        measureGeometry();
        let geometryTimer = null;
        const scheduleRemeasure = () => {
            clearTimeout(geometryTimer);
            geometryTimer = setTimeout(measureGeometry, 150);
        };
        window.addEventListener('resize', scheduleRemeasure);
        window.addEventListener('scroll', scheduleRemeasure, { passive: true });

        // Below 768px the side slots are hidden outright (.slot-left/.slot-right
        // { opacity: 0 } — see the mobile media query in style.css, "too
        // cramped, show one at a time"). slot-pack has no such override, so a
        // card LEAVING one of those invisible slots must not fly the arc —
        // it would visibly pop into view and cross the screen on its way to
        // the pack, when it was never meant to be seen at all.
        const isHiddenMobileSlot = pos => (pos === 0 || pos === 2) && window.matchMedia('(max-width: 768px)').matches;

        // prevStart/dir are null/0 on the initial render (no card is
        // "crossing" yet); on every advance they tell us which cards just
        // left or joined the fan so only those fly the arc — everyone else
        // (fan-to-fan reshuffle, or pack cards just shifting depth) gets the
        // plain CSS transition already on .deck-card/.slot-pack.
        function renderDeck(prevStart, dir) {
            const flights = []; // crossing-card anim.finished promises, so callers can await the flight settling
            deckCards.forEach((card, i) => {
                const pos = posOf(posInOrder[i], deckStart); // 0/1/2 fanned, rest packed
                const isFanned = pos < 3;
                const wasPos = prevStart === null ? pos : posOf(posInOrder[i], prevStart);
                const wasFanned = wasPos < 3;
                const crossing = prevStart !== null && !reducedMotion && wasFanned !== isFanned
                    && !(wasFanned && isHiddenMobileSlot(wasPos));

                card.getAnimations().forEach(a => a.cancel()); // clean start if it was still mid-flight
                card.style.removeProperty('z-index'); // clear any leftover Prev-entry override (see below) from an interrupted flight

                if (isFanned) {
                    card.classList.remove('slot-pack');
                    card.style.removeProperty('--depth');
                    card.classList.toggle('slot-left', pos === 0);
                    card.classList.toggle('slot-center', pos === 1);
                    card.classList.toggle('slot-right', pos === 2);
                } else {
                    card.classList.remove('slot-left', 'slot-center', 'slot-right');
                    card.classList.add('slot-pack');
                    card.style.setProperty('--depth', pos - 3); // 0 = top of the pack
                }

                card.setAttribute('aria-hidden', String(!isFanned));
                card.querySelectorAll('a, button').forEach(el => { el.tabIndex = isFanned ? 0 : -1; });

                if (crossing) {
                    // Next deals left-to-right from the top of the pack, so
                    // staggering runs pos*90 (left first). Prev draws from the
                    // BOTTOM of the pack instead — the bottom-most card becomes
                    // the rightmost slot, so the whole stagger mirrors: right
                    // settles first, left last (same order it'd physically be
                    // set back down in when the fan returns to the pack).
                    const basePos = isFanned ? pos : wasPos;
                    const stagger = (dir < 0 ? (2 - basePos) : basePos) * 90;
                    // dir > 0 (Next): cards enter from the right, leave to the left.
                    // dir < 0 (Prev): mirrored.
                    const enterBulge = dir > 0 ? 'var(--arc-right, 220px)' : 'calc(-1 * var(--arc-left, 220px))';
                    const exitBulge  = dir > 0 ? 'calc(-1 * var(--arc-left, 220px))' : 'var(--arc-right, 220px)';
                    const spin = dir > 0 ? 10 : -10;

                    // The bulge waypoint deliberately stays at a moderate scale
                    // (no overshoot past full size) — an oversized, spinning
                    // card centred near the buttons is what pushed the arc's
                    // bounding box past the viewport edge during testing.
                    // Staying at/under resting size keeps the whole flight
                    // inside the deck widget's own footprint.
                    //
                    // transform-origin stays at the base .deck-card default
                    // ('center bottom') the whole time — pack, bulge and fan
                    // all share it now, so there's nothing to switch mid-flight
                    // (switching origin mid-animation was half of the
                    // oversized-bounding-box bug from earlier testing).
                    const keyframes = isFanned ? [
                        { transform: packTransform(wasPos - 3) },
                        { transform: `translate(calc(-50% + ${enterBulge}), var(--controls-y, 60px)) rotate(${spin}deg) rotateX(28deg) rotateZ(-9deg) scale(${BULGE_SCALE})` },
                        { transform: slotTransform(pos) },
                    ] : [
                        { transform: slotTransform(wasPos) },
                        { transform: `translate(calc(-50% + ${exitBulge}), var(--controls-y, 60px)) rotate(${-spin}deg) rotateX(28deg) rotateZ(-9deg) scale(${BULGE_SCALE})` },
                        { transform: packTransform(pos - 3) },
                    ];

                    // Prev's entering cards are drawn from the bottom of the
                    // pack, so they sweep in from BEHIND the whole deck rather
                    // than in front of it (only Next's top-of-pack cards fly in
                    // front) — order among the three still mirrors the resting
                    // fan z (left highest) so they layer correctly relative to
                    // each other while behind everything. Cleared once the
                    // flight lands so the normal above-pack resting z takes
                    // back over.
                    if (isFanned && dir < 0) {
                        card.style.zIndex = pos === 0 ? -1 : pos === 1 ? -2 : -3;
                    }

                    // fill: 'both' (not just 'forwards') so the card is held at
                    // its pack/fan starting keyframe through the staggered delay
                    // too — otherwise the class already reflects the destination
                    // slot and the plain CSS transition sneaks the card toward
                    // its new spot before the flight even starts, which read as
                    // the still-displayed cards flashing the next batch early.
                    const anim = card.animate(keyframes, {
                        duration: 700,
                        delay: stagger,
                        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
                        fill: 'both',
                    });
                    flights.push(anim.finished.then(() => { anim.cancel(); card.style.removeProperty('z-index'); }).catch(() => {})); // hand back control to the CSS class
                }
            });
            return Promise.all(flights);
        }

        function advanceDeck(step) {
            if (isBusy) return;
            isBusy = true;
            setDeckControlsDisabled(true);
            const prevStart = deckStart;
            deckStart = ((deckStart + step) % cardCount + cardCount) % cardCount;
            renderDeck(prevStart, Math.sign(step)).then(() => {
                isBusy = false;
                setDeckControlsDisabled(false);
            });
        }

        const deckPrevBtnEl = document.getElementById('deckPrevBtn');
        const deckNextBtnEl = document.getElementById('deckNextBtn');
        const deckShuffleBtnEl = document.getElementById('deckShuffleBtn');
        deckPrevBtnEl?.addEventListener('click', () => advanceDeck(-3));
        deckNextBtnEl?.addEventListener('click', () => advanceDeck(3));
        deckShuffleBtnEl?.addEventListener('click', shuffleDeck);

        // ---- RIFFLE SHUFFLE ----
        // Splits the deck into two random piles, then interleaves them back
        // together card-by-card with a bend as each one snaps into place. A
        // real riffle already randomises the order on its own, so the result
        // needs no separate shuffle pass beyond the initial pile split.
        const SHUFFLE_CUT_MS = 320;
        const SHUFFLE_FLIGHT_MS = 380;
        const SHUFFLE_STAGGER = 45;

        function shuffleArray(arr) {
            for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
            return arr;
        }

        function setDeckControlsDisabled(disabled) {
            [deckPrevBtnEl, deckNextBtnEl, deckShuffleBtnEl].forEach(btn => { if (btn) btn.disabled = disabled; });
        }

        // Same pose as packTransform (translate/rotate/rotateX/rotateZ/scale,
        // in that order) but offset sideways into a left or right pile, so the
        // cut phase can interpolate cleanly from/to either shape.
        function pileTransform(sign, depth) {
            const x = sign * 130 + depth * 3;
            return `translate(calc(-50% + var(--stack-x, 0px) + ${x}px), calc(var(--stack-y, 320px) + ${depth * 5}px)) rotate(0deg) rotateX(58deg) rotateZ(${sign * -12}deg) scale(var(--stack-scale, 0.3))`;
        }

        function shuffleDeck() {
            if (isBusy || cardCount < 2) return;
            isBusy = true;
            setDeckControlsDisabled(true);

            if (reducedMotion) {
                deckOrder = shuffleArray(deckOrder.slice());
                rebuildPosInOrder();
                deckStart = 0;
                renderDeck(null, 0);
                isBusy = false;
                setDeckControlsDisabled(false);
                return;
            }

            // Classes/--depth are left untouched for the whole shuffle (only
            // inline WAAPI transforms move cards) until the very end, when
            // renderDeck finally syncs them to the new order. Without this,
            // the plain CSS transition on .deck-card fires right then: its
            // "before" value is the stale PRE-shuffle class-based position
            // (the cascade never stopped saying that, even though WAAPI was
            // visually overriding it), so cancelling the WAAPI hold and
            // reclassifying in the same tick still kicks off a real, visible
            // 0.6s transition from the old arrangement to the new one — cards
            // flung back and re-dealt right after the reveal already finished.
            // Suppressing the transition for the shuffle's duration and only
            // restoring it once classes are back in sync avoids that entirely.
            deckCards.forEach(card => { card.style.transition = 'none'; });

            // Every card's pile and final resting slot are worked out up
            // front — nothing is decided mid-flight — so the z-index handed
            // out below already matches where each card is headed and never
            // needs to change again until the shuffle is fully done.
            const split = shuffleArray(deckOrder.slice());
            const half = Math.ceil(cardCount / 2);
            const leftPile = split.slice(0, half);
            const rightPile = split.slice(half);
            const newOrder = [];
            for (let k = 0; k < half; k++) {
                if (leftPile[k] !== undefined) newOrder.push(leftPile[k]);
                if (rightPile[k] !== undefined) newOrder.push(rightPile[k]);
            }
            const finalPosOf = new Array(cardCount);
            newOrder.forEach((cardIndex, k) => { finalPosOf[cardIndex] = k; });

            deckCards.forEach((card, i) => {
                card.getAnimations().forEach(a => a.cancel());
                card.style.zIndex = 2000 - finalPosOf[i];
            });

            // Phase 1: cut the deck into the two piles.
            const cutFlights = deckCards.map((card, i) => {
                const curPos = posOf(posInOrder[i], deckStart);
                const fromT = curPos < 3 ? slotTransform(curPos) : packTransform(curPos - 3);
                const inLeft = leftPile.includes(i);
                const pileDepth = inLeft ? leftPile.indexOf(i) : rightPile.indexOf(i);
                const sign = inLeft ? -1 : 1;
                const anim = card.animate([
                    { transform: fromT },
                    { transform: pileTransform(sign, pileDepth) },
                ], { duration: SHUFFLE_CUT_MS, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', fill: 'both' });
                return anim.finished.catch(() => {});
            });

            // Phase 2: riffle the piles back together, alternating left/right,
            // each card bending (skew + scaleY) at the midpoint of its flight.
            // The bulge stays low, near the pile/pack area (same neighbourhood
            // as pileTransform/packTransform), NOT up near the button row —
            // every card, including the eventual top 3, lands packed
            // (packTransform accepts negative depth, so the top 3 simply sit
            // a little proud of the real pack). Nothing approaches the fan
            // slots at all here, so nothing reads as "displayed" mid-shuffle.
            Promise.all(cutFlights).then(() => {
                const mergeFlights = newOrder.map((cardIndex, k) => {
                    const card = deckCards[cardIndex];
                    const inLeft = leftPile.includes(cardIndex);
                    const pileDepth = inLeft ? leftPile.indexOf(cardIndex) : rightPile.indexOf(cardIndex);
                    const sign = inLeft ? -1 : 1;

                    card.getAnimations().forEach(a => a.cancel());
                    const anim = card.animate([
                        { transform: pileTransform(sign, pileDepth) + ' skewX(0deg) scaleY(1)' },
                        { transform: `translate(-50%, calc(var(--stack-y, 320px) * 0.4)) rotate(0deg) rotateX(35deg) rotateZ(${sign * 14}deg) scale(calc(var(--stack-scale, 0.3) * 1.08)) skewX(${sign * -10}deg) scaleY(0.82)` },
                        { transform: packTransform(k - 3) + ' skewX(0deg) scaleY(1)' },
                    ], {
                        duration: SHUFFLE_FLIGHT_MS,
                        delay: k * SHUFFLE_STAGGER,
                        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
                        fill: 'both',
                    });
                    return anim.finished.catch(() => {});
                });

                // Reveal: only once the whole deck has visibly finished
                // riffling back into one stack do the top 3 get dealt out
                // into the fan, using the same arc the normal Next/Prev
                // flights use — the ONLY point in the whole shuffle where
                // anything approaches the fan slots, so there's no double
                // motion / ghosting through that area.
                Promise.all(mergeFlights).then(() => {
                    const revealFlights = [0, 1, 2].map(pos => {
                        const card = deckCards[newOrder[pos]];
                        card.getAnimations().forEach(a => a.cancel());
                        const anim = card.animate([
                            { transform: packTransform(pos - 3) },
                            { transform: `translate(calc(-50% + var(--arc-right, 220px)), var(--controls-y, 60px)) rotate(10deg) rotateX(28deg) rotateZ(-9deg) scale(0.55)` },
                            { transform: slotTransform(pos) },
                        ], {
                            duration: 700,
                            delay: pos * 90,
                            easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
                            fill: 'both',
                        });
                        return anim.finished.catch(() => {});
                    });

                    Promise.all(revealFlights).then(() => {
                        deckCards.forEach(card => {
                            card.getAnimations().forEach(a => a.cancel());
                            card.style.removeProperty('z-index');
                        });
                        deckOrder = newOrder;
                        rebuildPosInOrder();
                        deckStart = 0;
                        renderDeck(null, 0); // classes sync up here with the transition still suppressed — no jump to hide
                        // Force a style flush before lifting the suppression below. Without
                        // this, the class sync above and the transition restore below land in
                        // the same tick, so the browser never observes a rendered frame where
                        // the new classes apply WITH transitions off — it only diffs the stale
                        // pre-shuffle classes against the restored (transitions-on) state, and
                        // quietly starts a real 0.6s transition from the old arrangement. That
                        // was the actual cause of a random card appearing to peel back off the
                        // fan a moment after the reveal had already finished.
                        void deckEl.offsetHeight;
                        deckCards.forEach(card => card.style.removeProperty('transition')); // safe to resume normal transitions now that classes match reality
                        isBusy = false;
                        setDeckControlsDisabled(false);
                    });
                });
            });
        }

        let suppressCardClick = false;
        deckCards.forEach((card, i) => {
            card.addEventListener('click', e => {
                if (suppressCardClick || e.target.closest('a, button')) return;
                const pos = posOf(posInOrder[i], deckStart);
                if (pos === 0) advanceDeck(-1);
                else if (pos === 2) advanceDeck(1);
            });
        });

        let swipeStartX = null;
        deckEl.addEventListener('pointerdown', e => {
            if (e.target.closest('a, button')) return;
            swipeStartX = e.clientX;
        });
        deckEl.addEventListener('pointerup', e => {
            if (swipeStartX === null) return;
            const dx = e.clientX - swipeStartX;
            swipeStartX = null;
            suppressCardClick = Math.abs(dx) > 10;
            if (Math.abs(dx) > 60) advanceDeck(dx < 0 ? 3 : -3);
            setTimeout(() => { suppressCardClick = false; }, 0);
        });
        deckEl.addEventListener('pointercancel', () => { swipeStartX = null; });

        deckEl.addEventListener('keydown', e => {
            if (e.key === 'ArrowRight') { e.preventDefault(); advanceDeck(1); }
            if (e.key === 'ArrowLeft')  { e.preventDefault(); advanceDeck(-1); }
        });

        renderDeck(null, 0);
    }


    // ----------------------------------------
    // 5. GRID CARD TILT
    // ----------------------------------------
    // Subtle 3D tilt following the cursor on the full-grid cards. Inline
    // transform wins over the CSS hover lift, so the lift is folded in here
    // and cleared on leave to hand control back to the stylesheet. Deck cards
    // are excluded — their transform belongs to the slot classes.
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
        window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        gridCards.forEach(card => {
            card.addEventListener('pointermove', e => {
                const r = card.getBoundingClientRect();
                const px = (e.clientX - r.left) / r.width  - 0.5;
                const py = (e.clientY - r.top)  / r.height - 0.5;
                card.style.transform =
                    `perspective(900px) translateY(-8px) rotateX(${(py * -6).toFixed(2)}deg) rotateY(${(px * 8).toFixed(2)}deg)`;
            });
            card.addEventListener('pointerleave', () => { card.style.transform = ''; });
        });
    }


    // ----------------------------------------
    // 6. SHOW ALL — deal the pack out
    // ----------------------------------------
    const showAllButton = document.getElementById('showAllBtn');
    const fullGridEl     = document.getElementById('projectFullGrid');

    if (showAllButton && fullGridEl) {
        const dealCards = Array.from(fullGridEl.querySelectorAll('.deal-card'));

        // The ripple init (section 2) wraps the label in a <span>, so write the
        // label there rather than to the button to avoid nuking the ripple blob.
        const setLabel = text => {
            const labelSpan = showAllButton.querySelector('span:not(.button-ripple-blob)');
            if (labelSpan) labelSpan.textContent = text;
            else showAllButton.textContent = text;
        };

        let isDealing = false;

        // Real dealer's rhythm — one card visibly launches, THEN the next,
        // rather than the whole pack leaving at once. --deal-delay (the real
        // grid cards' own fade-in stagger) is kept in step with it so a card
        // lands right as its grid twin finishes fading in underneath it.
        const DEAL_STAGGER_MS = 130;
        const DEAL_FLIGHT_MS = 560;
        dealCards.forEach((card, i) => card.style.setProperty('--deal-delay', (i * DEAL_STAGGER_MS) + 'ms'));

        function revealGrid() {
            fullGridEl.removeAttribute('hidden');
            // Force layout before adding .dealt so the deal-in transition runs
            fullGridEl.getBoundingClientRect();
            fullGridEl.classList.add('dealt');
            setLabel('Hide Projects');
            showAllButton.setAttribute('aria-expanded', 'true');
        }

        // Once every card has been dealt out, the deck above has nothing
        // left in it — collapse the whole deck section (cards, controls,
        // stack spacer) instead of leaving an empty husk on the page.
        const deckSectionEl = document.querySelector('.projects-deck-section');
        function collapseDeckSection() {
            if (!deckSectionEl) return;
            deckSectionEl.classList.add('deck-emptied');
            deckSectionEl.addEventListener('transitionend', () => {
                deckSectionEl.setAttribute('hidden', '');
            }, { once: true });
        }

        // Flies each REAL deck card (the 3 fanned + the packed rest — same
        // elements, same order dealCards were originally cloned from in
        // section 4, so index i always maps to the same project) out of the
        // deck above and down into its resting spot in the grid below, like
        // an actual deck being dealt: the cards LEAVE the deck, so it ends
        // up empty once they land, rather than a copy flying while the deck
        // stays fully stocked.
        function dealOutFromDeck() {
            const deckFlightCards = Array.from(document.querySelectorAll('#projectDeck .deck-card'));
            if (!deckFlightCards.length) { revealGrid(); return Promise.resolve(); }

            ['deckPrevBtn', 'deckShuffleBtn', 'deckNextBtn'].forEach(id => {
                const btn = document.getElementById(id);
                if (btn) btn.disabled = true;
            });

            const startRects = deckFlightCards.map(c => c.getBoundingClientRect());

            // Reveal + settle the grid invisibly first, purely to measure
            // where each card lands, then roll it back to its pre-deal
            // (hidden) pose so the real cards fade in for real once the
            // flying cards arrive instead of just sitting there pre-revealed.
            fullGridEl.removeAttribute('hidden');
            fullGridEl.style.visibility = 'hidden';
            fullGridEl.classList.add('dealt');
            const endRects = dealCards.map(c => c.getBoundingClientRect());
            fullGridEl.classList.remove('dealt');
            fullGridEl.style.visibility = '';

            // Matches the isometric pack tilt (rotateX/rotateZ/scale) that
            // .deck-card.slot-pack and packTransform() in section 4 use, so
            // a packed card's flight starts from the exact pose it's already
            // showing instead of snapping to a flat rectangle first.
            const deckEl = document.getElementById('projectDeck');
            const stackScale = parseFloat(getComputedStyle(deckEl).getPropertyValue('--stack-scale')) || 0.3;
            // Matches the bulge waypoint next/prev/shuffle fly their own
            // cards through (see BULGE_SCALE / rotateX(28)/rotateZ(-9) in
            // section 4) — same 3D flourish, just re-declared here since
            // that scope isn't reachable from this section.
            const BULGE_SCALE = 0.55;

            const flights = deckFlightCards.map((card, i) => {
                const start = startRects[i];
                const end = endRects[i] || start;
                const fullW = card.offsetWidth;
                const fullH = card.offsetHeight;

                // Read the card's CURRENT pose straight off its slot class —
                // fanned tilt or packed isometric lie — so the flight's first
                // keyframe is whatever it's actually showing right now, the
                // same starting point next/prev/shuffle would use for it.
                let fromRotate = 0, fromRotateX = 0, fromRotateZ = 0, fromScale = 1;
                if (card.classList.contains('slot-left')) fromRotate = -7;
                else if (card.classList.contains('slot-right')) fromRotate = 7;
                else if (card.classList.contains('slot-pack')) {
                    fromRotateX = 58;
                    fromRotateZ = -18;
                    fromScale = stackScale;
                }

                const startCenterX = start.left + start.width / 2;
                const startCenterY = start.top + start.height / 2;
                const endCenterX = end.left + end.width / 2;
                const endCenterY = end.top + end.height / 2;
                const bulgeCenterX = (startCenterX + endCenterX) / 2;
                const bulgeCenterY = (startCenterY + endCenterY) / 2;
                const spin = i % 2 === 0 ? 10 : -10;

                const poseAt = (cx, cy, rotate, rotateX, rotateZ, scale) =>
                    `perspective(1400px) translate(${cx - fullW / 2}px, ${cy - fullH / 2}px) rotate(${rotate}deg) rotateX(${rotateX}deg) rotateZ(${rotateZ}deg) scale(${scale})`;

                card.getAnimations().forEach(a => a.cancel());
                // Reparent to <body> — this is what actually empties the
                // deck — before switching to fixed positioning. .project-deck
                // has `perspective`, which (like `transform`) establishes a
                // containing block for fixed descendants, so flying the card
                // in place would pin it to the deck's own box instead of the
                // viewport. perspective(1400px) is re-added directly in the
                // transform above so the card keeps its own 3D vanishing
                // point wherever it travels, instead of losing it along with
                // the deck's ancestor-level `perspective`.
                document.body.appendChild(card);
                card.classList.remove('slot-left', 'slot-center', 'slot-right', 'slot-pack');
                card.style.cssText = `position:fixed; top:0; left:0; margin:0; width:${fullW}px; height:${fullH}px; z-index:900; pointer-events:none;`;

                const anim = card.animate([
                    { transform: poseAt(startCenterX, startCenterY, fromRotate, fromRotateX, fromRotateZ, fromScale), opacity: 1 },
                    { transform: poseAt(bulgeCenterX, bulgeCenterY, spin, 28, -9, BULGE_SCALE), opacity: 1, offset: 0.6 },
                    { transform: poseAt(endCenterX, endCenterY, 0, 0, 0, 1), opacity: 0 },
                ], {
                    duration: DEAL_FLIGHT_MS,
                    delay: i * DEAL_STAGGER_MS,
                    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
                    fill: 'both',
                });
                return anim.finished.catch(() => {}).then(() => card.remove());
            });

            revealGrid();
            return Promise.all(flights).then(collapseDeckSection);
        }

        showAllButton.addEventListener('click', () => {
            if (isDealing) return;
            const opening = fullGridEl.hasAttribute('hidden');
            if (opening) {
                const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                isDealing = true;
                showAllButton.disabled = true;
                let done;
                if (reducedMotion) {
                    revealGrid();
                    done = Promise.resolve();
                } else {
                    done = dealOutFromDeck();
                }
                done.then(() => { isDealing = false; showAllButton.disabled = false; });
            } else {
                fullGridEl.classList.remove('dealt');
                fullGridEl.setAttribute('hidden', '');
                setLabel('Show All Projects');
                showAllButton.setAttribute('aria-expanded', 'false');
            }
        });
    }

});
