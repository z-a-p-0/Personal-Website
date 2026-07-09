// ============================================
// ABOUT.JS
// Circle heading letters: bounce freely (zero-gravity
// style) until the circle is hovered, then align into
// the heading text at the circle's centre. Hovering also
// fades the circle's full text in behind the letters, wrapped
// small within the circle. Clicking a circle flies those exact
// background letters out into the space below the grid to spell
// out the full text at readable size; clicking a different circle
// makes the current text bounce up and tumble off the bottom of the
// stage under gravity, then flies the new one out. The heading
// letters keep bouncing/aligning the whole time.
// ============================================

document.addEventListener('DOMContentLoaded', () => {

    const aboutCircleElements = document.querySelectorAll('.about-circle');
    if (!aboutCircleElements.length) return;

    const aboutStageEl    = document.getElementById('aboutStage');
    const aboutOutputEl   = document.getElementById('aboutTextOutput');
    const aboutCarouselEl = document.getElementById('aboutCarousel');
    const stageCanvasEl   = document.getElementById('aboutStageCanvas');
    const stageCtx        = stageCanvasEl ? stageCanvasEl.getContext('2d') : null;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const CIRCLE_LETTER_COLOR_IDLE    = 'rgba(41, 41, 41, 0.55)';
    const CIRCLE_LETTER_COLOR_ALIGNED = '#1DD3B0';
    const LETTER_BOUNCE_SPEED_MIN     = 0.4;
    const LETTER_BOUNCE_SPEED_MAX     = 1.3;
    const LETTER_ROTATION_SPEED_MAX   = 0.03;
    const ALIGN_LERP_FACTOR           = 0.16;
    const ALIGN_ROTATION_LERP_FACTOR  = 0.2;
    const ALIGN_SNAP_DISTANCE         = 0.6;

    const TEXT_COLOR         = '#292929';
    const BG_TEXT_ALPHA_MAX  = 0.3;
    const BG_TEXT_FADE_LERP  = 0.12;

    const FLIGHT_LERP_FACTOR      = 0.2;
    const FLIGHT_SNAP_DISTANCE    = 0.6;
    const FLIGHT_MAX_DELAY_FRAMES = 30;
    const PARAGRAPH_FONT_SIZE     = 24;
    const PARAGRAPH_LINE_HEIGHT   = 40;
    const PARAGRAPH_MAX_WIDTH     = 760;

    const FALL_GRAVITY            = 1;
    const FALL_BOUNCE_MIN         = 6;
    const FALL_BOUNCE_MAX         = 12;
    const FALL_DRIFT_MAX          = 3;
    const FALL_ROTATION_SPEED_MAX = 0.16;
    const FALL_MAX_DURATION_MS    = 2000;

    // ---- Carousel: circles sit at fractional "slots" around carouselPosition,
    // always upright. Clicking eases the carousel to that circle's slot; the
    // paragraph flight only starts once the circle has arrived at centre. ----
    const CAROUSEL_AUTO_SPEED      = 0.0026; // slots/frame while idle
    const CAROUSEL_NAV_LERP        = 0.08;   // ease toward a clicked circle's slot
    const CAROUSEL_SCALE_FALLOFF   = 0.12;
    const CAROUSEL_OPACITY_FALLOFF = 0.25;

    let carouselPosition    = 0;
    let carouselSpacing     = 260;
    let carouselHovered     = false;
    let carouselTargetIndex = null;

    let circleStates = [];

    let stageLetters        = [];
    let stagePhase          = 'idle'; // 'idle' | 'flying' | 'resting' | 'falling'
    let activeCircleIndex   = null;
    let awaitingFlightIndex = null; // circle whose text should fly out once it's centred and any old text is gone
    let flightActiveIndex   = null; // circle whose paragraph has actually launched (stageLetters is theirs)
    let activeOriginLeft    = 0;
    let activeOriginTop     = 0;
    let stageFrame          = 0;

    // ---- Word-wrap `text` at `fontSize` to fit `maxWidth`, returning per-non-space-char positions ----
    function layoutWrappedText(ctx, text, fontSize, lineHeight, maxWidth, centerX, topY, centerVertically) {
        ctx.font = `500 ${fontSize}px 'Poppins', sans-serif`;

        const words = text.split(' ');
        const lines = [];
        let currentLine = '';
        words.forEach(word => {
            const test = currentLine ? currentLine + ' ' + word : word;
            if (ctx.measureText(test).width > maxWidth && currentLine) {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = test;
            }
        });
        if (currentLine) lines.push(currentLine);

        let startY = topY;
        if (centerVertically) {
            const totalHeight = lines.length * lineHeight;
            startY = topY - totalHeight / 2 + lineHeight / 2;
        }

        const positions = [];
        lines.forEach((line, lineIndex) => {
            const lineWidth = ctx.measureText(line).width;
            let cursorX = centerX - lineWidth / 2;
            const y = startY + lineIndex * lineHeight;
            line.split('').forEach(ch => {
                const w = ctx.measureText(ch).width;
                if (ch !== ' ') positions.push({ char: ch, x: cursorX + w / 2, y });
                cursorX += w;
            });
        });
        return positions;
    }

    // ---- Build one circle's letter data from its heading + current size ----
    function buildCircleState(circleEl) {
        const canvasEl      = circleEl.querySelector('.about-circle-canvas');
        const headingText   = circleEl.dataset.heading || '';
        const paragraphText = circleEl.dataset.text || '';
        // Temp per-circle palette — border/subtitle colour, page-background fade
        // target, and on-stage paragraph text colour. Real values TBD later.
        const color         = circleEl.dataset.color     || CIRCLE_LETTER_COLOR_ALIGNED;
        const bgColor       = circleEl.dataset.bgColor   || '';
        const textColor     = circleEl.dataset.textColor || TEXT_COLOR;
        circleEl.style.setProperty('--circle-accent', color);
        // offsetWidth/Height, not getBoundingClientRect, so the carousel's scale()
        // transform on off-centre circles doesn't shrink their canvas geometry
        const rect          = { width: circleEl.offsetWidth, height: circleEl.offsetHeight };
        const dpr           = window.devicePixelRatio || 1;

        canvasEl.width  = rect.width  * dpr;
        canvasEl.height = rect.height * dpr;
        canvasEl.style.width  = rect.width  + 'px';
        canvasEl.style.height = rect.height + 'px';

        const ctx = canvasEl.getContext('2d');
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const circleRadius = rect.width / 2;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        // Shrink font until the heading fits comfortably inside the circle
        let fontSize = circleRadius * 0.34;
        const maxTextWidth = circleRadius * 1.7;
        ctx.font = `700 ${fontSize}px 'Poppins', sans-serif`;
        while (ctx.measureText(headingText).width > maxTextWidth && fontSize > 10) {
            fontSize -= 1;
            ctx.font = `700 ${fontSize}px 'Poppins', sans-serif`;
        }

        // Measure each character to compute its centred target position
        const chars = headingText.split('');
        const charWidths = chars.map(ch => ctx.measureText(ch).width);
        const totalTextWidth = charWidths.reduce((sum, w) => sum + w, 0);
        const startX = centerX - totalTextWidth / 2;

        const letters = [];
        let cumulativeWidth = 0;

        chars.forEach((ch, i) => {
            const letterWidth = charWidths[i];
            const targetX = startX + cumulativeWidth + letterWidth / 2;
            cumulativeWidth += letterWidth;

            if (ch === ' ') return; // spaces only affect layout, not a bouncing body

            const letterRadius = fontSize * 0.32;
            const spawnAngle   = Math.random() * Math.PI * 2;
            const spawnRadius  = Math.random() * (circleRadius - letterRadius);
            const moveAngle    = Math.random() * Math.PI * 2;
            const speed        = LETTER_BOUNCE_SPEED_MIN + Math.random() * (LETTER_BOUNCE_SPEED_MAX - LETTER_BOUNCE_SPEED_MIN);

            letters.push({
                char: ch,
                x: centerX + Math.cos(spawnAngle) * spawnRadius,
                y: centerY + Math.sin(spawnAngle) * spawnRadius,
                vx: Math.cos(moveAngle) * speed,
                vy: Math.sin(moveAngle) * speed,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * LETTER_ROTATION_SPEED_MAX,
                letterRadius,
                fontSize,
                targetX,
                targetY: centerY
            });
        });

        // Small wrapped layout of the full paragraph, faded in behind the heading on hover.
        // Same non-space character order as the below-grid layout, so flight origins line up 1:1.
        const bgFontSize = Math.max(9, circleRadius * 0.1);
        const bgLineHeight = bgFontSize * 1.4;
        const bgTextLayout = layoutWrappedText(
            ctx, paragraphText, bgFontSize, bgLineHeight, circleRadius * 1.7, centerX, centerY, true
        );

        return {
            circleEl, canvasEl, ctx, circleRadius, centerX, centerY, letters,
            aligned: false, hovered: false,
            paragraphText, bgTextLayout, bgFontSize,
            textOpacity: 0, textFadeTarget: 0,
            color, bgColor, textColor
        };
    }

    function rebuildAllCircles() {
        circleStates = Array.from(aboutCircleElements).map(buildCircleState);
        sizeStageCanvas();
        sizeCarousel();
        if (stagePhase !== 'idle') relayoutStageLetters();
    }

    // ---- Carousel positioning: spacing scales with both circle size and available width,
    // but is capped so circles at the farthest *settled* slot (an integer offset — circles
    // only pass through the half-integer wrap point for an instant) stay inside the
    // carousel's clip box, and floored at a full diameter so neighbours never overlap and
    // steal each other's hover/click target. ----
    function sizeCarousel() {
        if (!aboutCarouselEl || !circleStates.length) return;
        const carouselRect = aboutCarouselEl.getBoundingClientRect();
        const circleDiameter = circleStates[0].circleRadius * 2;
        const maxSettledOffset = Math.max(1, Math.floor(circleStates.length / 2));
        const maxSpacing = (carouselRect.width / 2 - circleDiameter / 2) / maxSettledOffset;
        const desiredSpacing = Math.max(circleDiameter * 1.15, carouselRect.width / 3.4);
        carouselSpacing = Math.max(circleDiameter * 1.05, Math.min(desiredSpacing, maxSpacing));
    }

    if (aboutCarouselEl) {
        aboutCarouselEl.addEventListener('mouseenter', () => { carouselHovered = true; });
        aboutCarouselEl.addEventListener('mouseleave', () => { carouselHovered = false; });
    }

    // Shortest signed distance (in slot units) from `from` to `to` around an n-slot loop
    function shortestSlotDelta(from, to, count) {
        let delta = (to - from) % count;
        if (delta > count / 2) delta -= count;
        if (delta < -count / 2) delta += count;
        return delta;
    }

    function updateCarousel() {
        const count = circleStates.length;
        if (!count || !aboutCarouselEl) return;

        const paused = activeCircleIndex !== null || carouselHovered;

        if (prefersReducedMotion) {
            if (carouselTargetIndex !== null) {
                carouselPosition = carouselTargetIndex;
                carouselTargetIndex = null;
            }
        } else if (!paused) {
            carouselPosition += CAROUSEL_AUTO_SPEED;
        } else if (carouselTargetIndex !== null) {
            const delta = shortestSlotDelta(carouselPosition, carouselTargetIndex, count);
            if (Math.abs(delta) < 0.01) {
                carouselPosition = carouselTargetIndex;
                carouselTargetIndex = null;
            } else {
                carouselPosition += delta * CAROUSEL_NAV_LERP;
            }
        }
        carouselPosition = ((carouselPosition % count) + count) % count;

        circleStates.forEach((state, i) => {
            const slotOffset = shortestSlotDelta(carouselPosition, i, count);
            const x = slotOffset * carouselSpacing;
            const distAbs = Math.min(2, Math.abs(slotOffset));
            const scale = 1 - CAROUSEL_SCALE_FALLOFF * distAbs;
            const opacity = 1 - CAROUSEL_OPACITY_FALLOFF * distAbs;
            const isThisActive = i === activeCircleIndex;

            // Kept strictly positive (never dips below the stage canvas's z-index: -1,
            // and never negative at all) so distant circles can't end up behind anything
            // and lose hover/click responsiveness.
            const zIndex = 10 + Math.round((2 - distAbs) * 20) + (isThisActive ? 50 : 0);
            state.circleEl.style.transform = `translate(calc(-50% + ${x}px), -50%) scale(${scale})`;
            state.circleEl.style.opacity = opacity;
            state.circleEl.style.zIndex = zIndex;
        });

        maybeLaunchFlight();
    }

    // ---- Launch the paragraph flight once the target circle is centred and any
    // previous text has finished falling away ----
    function maybeLaunchFlight() {
        if (awaitingFlightIndex === null) return;
        if (stagePhase !== 'idle') return;
        if (carouselTargetIndex !== null) return;
        const idx = awaitingFlightIndex;
        awaitingFlightIndex = null;
        launchFlight(idx);
    }

    // ---- Hover handlers: align letters + fade in background text ----
    aboutCircleElements.forEach(circleEl => {
        circleEl.addEventListener('mouseenter', () => {
            const state = circleStates.find(s => s.circleEl === circleEl);
            if (!state) return;
            state.hovered = true;
        });

        circleEl.addEventListener('mouseleave', () => {
            const state = circleStates.find(s => s.circleEl === circleEl);
            if (!state) return;
            state.hovered = false;
            // Send letters back out into free movement from wherever they are now
            state.letters.forEach(letter => {
                const angle = Math.random() * Math.PI * 2;
                const speed = LETTER_BOUNCE_SPEED_MIN + Math.random() * (LETTER_BOUNCE_SPEED_MAX - LETTER_BOUNCE_SPEED_MIN);
                letter.vx = Math.cos(angle) * speed;
                letter.vy = Math.sin(angle) * speed;
                letter.rotationSpeed = (Math.random() - 0.5) * LETTER_ROTATION_SPEED_MAX;
            });
        });
    });

    // ---- Free-floating bounce physics (circle wall + letter-letter collision) ----
    function stepBouncingLetters(state) {
        const { letters, circleRadius, centerX, centerY } = state;

        letters.forEach(letter => {
            letter.x += letter.vx;
            letter.y += letter.vy;
            letter.rotation += letter.rotationSpeed;

            const dx = letter.x - centerX;
            const dy = letter.y - centerY;
            const distFromCenter = Math.hypot(dx, dy);
            const maxDist = circleRadius - letter.letterRadius;

            if (distFromCenter > maxDist) {
                const normalX = dx / distFromCenter;
                const normalY = dy / distFromCenter;
                letter.x = centerX + normalX * maxDist;
                letter.y = centerY + normalY * maxDist;
                const dot = letter.vx * normalX + letter.vy * normalY;
                letter.vx -= 2 * dot * normalX;
                letter.vy -= 2 * dot * normalY;
            }
        });

        for (let i = 0; i < letters.length; i++) {
            for (let j = i + 1; j < letters.length; j++) {
                const a = letters[i], b = letters[j];
                const dx = b.x - a.x;
                const dy = b.y - a.y;
                const dist = Math.hypot(dx, dy);
                const minDist = a.letterRadius + b.letterRadius;

                if (dist > 0 && dist < minDist) {
                    const normalX = dx / dist;
                    const normalY = dy / dist;
                    const overlap = (minDist - dist) / 2;
                    a.x -= normalX * overlap; a.y -= normalY * overlap;
                    b.x += normalX * overlap; b.y += normalY * overlap;

                    const relVx = b.vx - a.vx;
                    const relVy = b.vy - a.vy;
                    const relDot = relVx * normalX + relVy * normalY;
                    if (relDot < 0) {
                        a.vx += relDot * normalX; a.vy += relDot * normalY;
                        b.vx -= relDot * normalX; b.vy -= relDot * normalY;
                    }
                }
            }
        }
    }

    // ---- Alignment: lerp letters toward their heading-text position ----
    function stepAligningLetters(state) {
        state.letters.forEach(letter => {
            letter.x += (letter.targetX - letter.x) * ALIGN_LERP_FACTOR;
            letter.y += (letter.targetY - letter.y) * ALIGN_LERP_FACTOR;

            let rotDelta = (0 - letter.rotation) % (Math.PI * 2);
            if (rotDelta > Math.PI)  rotDelta -= Math.PI * 2;
            if (rotDelta < -Math.PI) rotDelta += Math.PI * 2;
            letter.rotation += rotDelta * ALIGN_ROTATION_LERP_FACTOR;

            const distToTarget = Math.hypot(letter.targetX - letter.x, letter.targetY - letter.y);
            if (distToTarget < ALIGN_SNAP_DISTANCE) {
                letter.x = letter.targetX;
                letter.y = letter.targetY;
                letter.rotation = 0;
            }
        });
    }

    // Letters (heading or in-flight) fade to fully transparent as they near/cross the
    // circle's own edge, so text too large for its circle disappears like the background
    // text does instead of visibly poking out past the round border.
    // Heading letters are already sized (font shrink loop) to fit within ~0.85R of
    // centre, so their fade band stays loose — it's a last-resort safety net, not
    // the primary containment. The wrapped paragraph (and flying letters born from
    // it) aren't width-shrunk per line, so lines near the top/bottom sit at a wider
    // chord than the circle allows there — that band needs to be much tighter.
    function circleEdgeFade(localX, localY, state, tight) {
        const dist = Math.hypot(localX - state.centerX, localY - state.centerY);
        const fadeStart = state.circleRadius * (tight ? 0.35 : 0.78);
        const fadeEnd    = state.circleRadius * (tight ? 0.85 : 1.02);
        if (dist <= fadeStart) return 1;
        if (dist >= fadeEnd) return 0;
        return 1 - (dist - fadeStart) / (fadeEnd - fadeStart);
    }

    function renderCircle(state, isActive) {
        const { ctx, canvasEl, letters, aligned, bgTextLayout, bgFontSize, centerX, centerY, circleRadius } = state;
        const dpr = window.devicePixelRatio || 1;
        ctx.clearRect(0, 0, canvasEl.width / dpr, canvasEl.height / dpr);

        // Hard clip to the circle — belt-and-suspenders on top of the distance fades
        // above, since the CSS overflow:hidden + border-radius clip on the canvas
        // element hasn't reliably contained fast-growing flight-letter glyphs.
        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, circleRadius, 0, Math.PI * 2);
        ctx.clip();

        if (isActive) {
            // The circle's own text has been replaced by the flying letters below;
            // draw them here too (behind the heading) while they're still near this circle.
            stageLetters.forEach(letter => {
                const localX = letter.x - activeOriginLeft;
                const localY = letter.y - activeOriginTop;
                const fade = circleEdgeFade(localX, localY, state, true);
                if (fade <= 0) return;
                drawFlightLetter(ctx, letter, activeOriginLeft, activeOriginTop, fade);
            });
        } else if (state.textOpacity > 0.01) {
            const baseAlpha = state.textOpacity * BG_TEXT_ALPHA_MAX;
            ctx.font = `500 ${bgFontSize}px 'Poppins', sans-serif`;
            ctx.fillStyle = TEXT_COLOR;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            bgTextLayout.forEach(p => {
                const fade = circleEdgeFade(p.x, p.y, state, true);
                if (fade <= 0) return;
                ctx.save();
                ctx.globalAlpha = baseAlpha * fade;
                ctx.fillText(p.char, p.x, p.y);
                ctx.restore();
            });
        }

        letters.forEach(letter => {
            const fade = circleEdgeFade(letter.x, letter.y, state);
            if (fade <= 0) return;
            ctx.save();
            ctx.translate(letter.x, letter.y);
            ctx.rotate(letter.rotation);
            ctx.font = `700 ${letter.fontSize}px 'Poppins', sans-serif`;
            ctx.fillStyle = aligned ? state.color : CIRCLE_LETTER_COLOR_IDLE;
            ctx.globalAlpha = fade;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(letter.char, 0, 0);
            ctx.restore();
        });

        ctx.restore();
    }

    // ============================================
    // STAGE: click-to-fly-out text + poof transition
    // ============================================

    function sizeStageCanvas() {
        if (!stageCanvasEl || !aboutStageEl) return;
        const rect = aboutStageEl.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        stageCanvasEl.width  = rect.width  * dpr;
        stageCanvasEl.height = rect.height * dpr;
        stageCanvasEl.style.width  = rect.width  + 'px';
        stageCanvasEl.style.height = rect.height + 'px';
        stageCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    // Word-wrap paragraphText to fit the output zone (large, readable size) and return per-letter targets
    function layoutParagraph(text, stageRect) {
        const outputRect = aboutOutputEl.getBoundingClientRect();
        const maxWidth = Math.min(PARAGRAPH_MAX_WIDTH, stageRect.width - 40);
        const centerX = stageRect.width / 2;
        const topY = (outputRect.top - stageRect.top) + PARAGRAPH_LINE_HEIGHT * 0.7;
        return layoutWrappedText(
            stageCtx, text, PARAGRAPH_FONT_SIZE, PARAGRAPH_LINE_HEIGHT, maxWidth, centerX, topY, false
        );
    }

    function relayoutStageLetters() {
        if (activeCircleIndex === null || !stageLetters.length) return;
        const state = circleStates[activeCircleIndex];
        const text = state ? state.paragraphText : (aboutCircleElements[activeCircleIndex].dataset.text || '');
        const stageRect  = aboutStageEl.getBoundingClientRect();
        const circleRect = aboutCircleElements[activeCircleIndex].getBoundingClientRect();
        activeOriginLeft = circleRect.left - stageRect.left;
        activeOriginTop  = circleRect.top  - stageRect.top;
        const targets = layoutParagraph(text, stageRect);
        stageLetters.forEach((letter, i) => {
            if (!targets[i]) return;
            letter.targetX = targets[i].x;
            letter.targetY = targets[i].y;
            if (stagePhase === 'resting') {
                letter.x = targets[i].x;
                letter.y = targets[i].y;
            }
        });
    }

    function launchFlight(idx) {
        const state = circleStates[idx];
        if (!state) return;

        const stageRect  = aboutStageEl.getBoundingClientRect();
        const circleRect = state.circleEl.getBoundingClientRect();
        activeOriginLeft = circleRect.left - stageRect.left;
        activeOriginTop  = circleRect.top  - stageRect.top;
        const fallbackX  = activeOriginLeft + circleRect.width / 2;
        const fallbackY  = activeOriginTop  + circleRect.height / 2;

        // Match exactly what's currently on screen for the background text right now
        const startAlpha = state.textOpacity * BG_TEXT_ALPHA_MAX;

        const targets = layoutParagraph(state.paragraphText, stageRect);

        stageLetters = targets.map((t, i) => {
            const origin = state.bgTextLayout[i];
            // Letters born past the circle's edge (the wrapped paragraph runs wider
            // than the circle allows near the top/bottom) were already invisible as
            // background text via circleEdgeFade — match that here so they spawn
            // invisible instead of popping in at startAlpha on the unclipped stage
            // canvas, then fade in as they fly (see the alpha lerp below).
            const originFade = origin ? circleEdgeFade(origin.x, origin.y, state, true) : 0;
            return {
                char: t.char,
                x: origin ? activeOriginLeft + origin.x : fallbackX,
                y: origin ? activeOriginTop + origin.y : fallbackY,
                rotation: 0,
                targetX: t.x,
                targetY: t.y,
                fontSize: state.bgFontSize,
                alpha: startAlpha * originFade,
                delayFrames: Math.random() * FLIGHT_MAX_DELAY_FRAMES,
                spawnFrame: stageFrame
            };
        });
        stagePhase = 'flying';
        flightActiveIndex = idx;
    }

    function startFall() {
        const now = performance.now();
        stageLetters.forEach(letter => {
            letter.fallStart = now;
            letter.vy = -(FALL_BOUNCE_MIN + Math.random() * (FALL_BOUNCE_MAX - FALL_BOUNCE_MIN));
            letter.vx = (Math.random() - 0.5) * FALL_DRIFT_MAX * 2;
            letter.rotationSpeed = (Math.random() - 0.5) * FALL_ROTATION_SPEED_MAX;
        });
        stagePhase = 'falling';
        // The falling letters are no longer "owned" by any circle from here on —
        // they keep tumbling on the stage canvas, but no circle should draw them.
        flightActiveIndex = null;
    }

    // Whole-page theme fades toward the active circle's palette (background, accent,
    // text) via root CSS custom properties — about.css reads these with fallbacks
    // to the site defaults so buttons/cards/headings/logo pick it up too, and reverts
    // once no circle is focused.
    function applyCircleTheme(idx) {
        const root = document.documentElement;
        const state = idx !== null ? circleStates[idx] : null;
        if (state && state.bgColor)   root.style.setProperty('--circle-bg', state.bgColor);
        else root.style.removeProperty('--circle-bg');
        if (state && state.color)     root.style.setProperty('--circle-accent', state.color);
        else root.style.removeProperty('--circle-accent');
        if (state && state.textColor) root.style.setProperty('--circle-text', state.textColor);
        else root.style.removeProperty('--circle-text');
    }

    function onCircleClick(idx) {
        const textIsOut = stagePhase === 'flying' || stagePhase === 'resting';

        // Clicking the already-active circle while its text is out: deselect,
        // let the text fall away, and let the carousel resume auto-cycling.
        if (activeCircleIndex === idx && (textIsOut || stagePhase === 'falling')) {
            awaitingFlightIndex = null;
            if (textIsOut) startFall();
            return;
        }

        // Focus this circle: carousel starts easing to centre immediately.
        // Any text already on screen breaks apart in parallel; the new text
        // only flies out once both the fall is done and the circle has arrived.
        activeCircleIndex = idx;
        carouselTargetIndex = idx;
        awaitingFlightIndex = idx;
        applyCircleTheme(idx);
        if (textIsOut) startFall();
    }

    aboutCircleElements.forEach((circleEl, idx) => {
        circleEl.addEventListener('click', () => onCircleClick(idx));
    });

    function stepStageLetters() {
        stageFrame++;

        if (stagePhase === 'flying') {
            let allArrived = true;
            stageLetters.forEach(letter => {
                if (stageFrame - letter.spawnFrame < letter.delayFrames) {
                    allArrived = false;
                    return;
                }
                letter.x += (letter.targetX - letter.x) * FLIGHT_LERP_FACTOR;
                letter.y += (letter.targetY - letter.y) * FLIGHT_LERP_FACTOR;
                letter.rotation += (0 - letter.rotation) * FLIGHT_LERP_FACTOR;
                letter.alpha += (1 - letter.alpha) * FLIGHT_LERP_FACTOR;
                letter.fontSize += (PARAGRAPH_FONT_SIZE - letter.fontSize) * FLIGHT_LERP_FACTOR;

                const dist = Math.hypot(letter.targetX - letter.x, letter.targetY - letter.y);
                if (dist < FLIGHT_SNAP_DISTANCE) {
                    letter.x = letter.targetX;
                    letter.y = letter.targetY;
                    letter.rotation = 0;
                    letter.alpha = 1;
                    letter.fontSize = PARAGRAPH_FONT_SIZE;
                } else {
                    allArrived = false;
                }
            });
            if (allArrived) stagePhase = 'resting';

        } else if (stagePhase === 'falling') {
            const stageRect  = aboutStageEl.getBoundingClientRect();
            const bottomEdge = stageRect.height + 60;
            const now = performance.now();
            let allDone = true;

            stageLetters.forEach(letter => {
                letter.vy += FALL_GRAVITY;
                letter.x += letter.vx;
                letter.y += letter.vy;
                letter.rotation = (letter.rotation || 0) + letter.rotationSpeed;

                const timedOut = (now - letter.fallStart) >= FALL_MAX_DURATION_MS;
                if (letter.y < bottomEdge && !timedOut) allDone = false;
            });

            if (allDone) {
                stageLetters = [];
                if (awaitingFlightIndex === null) {
                    activeCircleIndex = null;
                    applyCircleTheme(null);
                }
                stagePhase = 'idle';
            }
        }
    }

    // Draws one flight/resting/falling letter. `offsetX/offsetY` convert stage-space
    // coordinates into a target canvas's local space (0,0 for the stage canvas itself;
    // the active circle's own on-screen offset when drawn on that circle's canvas).
    // `extraAlpha` layers on an edge fade: the circle's own edge fade when drawn on a
    // circle's canvas, or the inverse (fade-in-once-clear-of-origin) on the stage canvas.
    function drawFlightLetter(ctx, letter, offsetX, offsetY, extraAlpha = 1, color = TEXT_COLOR) {
        ctx.save();
        ctx.translate(letter.x - offsetX, letter.y - offsetY);
        ctx.rotate(letter.rotation || 0);
        ctx.globalAlpha = letter.alpha * extraAlpha;
        ctx.font = `500 ${letter.fontSize}px 'Poppins', sans-serif`;
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(letter.char, 0, 0);
        ctx.restore();
    }

    function renderStage() {
        if (!stageCtx || !aboutStageEl) return;
        const rect = aboutStageEl.getBoundingClientRect();
        stageCtx.clearRect(0, 0, rect.width, rect.height);

        // While a letter is still near its origin circle, that circle's own canvas
        // already draws it (clipped + faded to the circle). This unclipped stage
        // canvas must stay silent for that same letter, or it leaks past the border —
        // fade it in here only once the letter has actually cleared the circle.
        const originState = (stagePhase !== 'falling' && flightActiveIndex !== null)
            ? circleStates[flightActiveIndex] : null;
        const textColor = circleStates[activeCircleIndex] ? circleStates[activeCircleIndex].textColor : TEXT_COLOR;

        stageLetters.forEach(letter => {
            let extraAlpha = 1;
            if (originState) {
                const localX = letter.x - activeOriginLeft;
                const localY = letter.y - activeOriginTop;
                extraAlpha = 1 - circleEdgeFade(localX, localY, originState, true);
            }
            if (extraAlpha <= 0.01) return;
            drawFlightLetter(stageCtx, letter, 0, 0, extraAlpha, textColor);
        });
    }

    let circleAnimFrameId = null;
    function animateAllCircles() {
        updateCarousel();
        circleStates.forEach((state, idx) => {
            const isCentring = idx === activeCircleIndex;
            // Flying letters only replace the background text once THIS circle's paragraph
            // flight has actually launched (flightActiveIndex). Checking global stagePhase
            // alone isn't enough: while a previous circle's text is still falling away,
            // stagePhase is 'falling' even though the newly-clicked circle hasn't launched
            // yet — that mismatch used to blank its background text prematurely.
            const isFlying = idx === flightActiveIndex;
            // Centring/active circle always looks hovered (heading aligned). Otherwise, mirror
            // real hover state each frame so a circle reliably reverts to idle bouncing once
            // it stops being active (rather than staying stuck aligned).
            state.aligned = isCentring ? true : state.hovered;
            state.textFadeTarget = isFlying ? 0 : (isCentring || state.hovered ? 1 : 0);

            if (state.aligned) stepAligningLetters(state);
            else stepBouncingLetters(state);
            state.textOpacity += (state.textFadeTarget - state.textOpacity) * BG_TEXT_FADE_LERP;
            renderCircle(state, isFlying);
        });
        stepStageLetters();
        renderStage();
        circleAnimFrameId = requestAnimationFrame(animateAllCircles);
    }

    (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => {
        rebuildAllCircles();
        if (!circleAnimFrameId) animateAllCircles();
    });

    let circleResizeTimeoutId;
    window.addEventListener('resize', () => {
        clearTimeout(circleResizeTimeoutId);
        circleResizeTimeoutId = setTimeout(rebuildAllCircles, 150);
    });

});
