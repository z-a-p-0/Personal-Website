// ============================================
// ABOUT.JS
// Circle heading letters: bounce freely (zero-gravity
// style) until the circle is hovered, then align into
// the heading text at the circle's centre. Hovering also
// fades the circle's full text in behind the letters, wrapped
// small within the circle. Clicking a circle flies those exact
// background letters out into the space below the grid to spell
// out the full text at readable size; clicking a different circle
// poofs the current text away first, then flies the new one out.
// The heading letters keep bouncing/aligning the whole time.
// ============================================

document.addEventListener('DOMContentLoaded', () => {

    const aboutCircleElements = document.querySelectorAll('.about-circle');
    if (!aboutCircleElements.length) return;

    const aboutStageEl  = document.getElementById('aboutStage');
    const aboutOutputEl = document.getElementById('aboutTextOutput');
    const stageCanvasEl = document.getElementById('aboutStageCanvas');
    const stageCtx      = stageCanvasEl ? stageCanvasEl.getContext('2d') : null;

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

    const FLIGHT_LERP_FACTOR      = 0.1;
    const FLIGHT_SNAP_DISTANCE    = 0.6;
    const FLIGHT_MAX_DELAY_FRAMES = 40;
    const POOF_DURATION_MS        = 500;
    const PARAGRAPH_FONT_SIZE     = 24;
    const PARAGRAPH_LINE_HEIGHT   = 40;
    const PARAGRAPH_MAX_WIDTH     = 760;

    let circleStates = [];

    let stageLetters       = [];
    let stagePhase         = 'idle'; // 'idle' | 'flying' | 'resting' | 'poofing'
    let activeCircleIndex  = null;
    let pendingCircleIndex = null;
    let activeOriginLeft   = 0;
    let activeOriginTop    = 0;
    let stageFrame         = 0;

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
        const rect          = circleEl.getBoundingClientRect();
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
            textOpacity: 0, textFadeTarget: 0
        };
    }

    function rebuildAllCircles() {
        circleStates = Array.from(aboutCircleElements).map(buildCircleState);
        sizeStageCanvas();
        if (stagePhase !== 'idle') relayoutStageLetters();
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

    function renderCircle(state, isActive) {
        const { ctx, canvasEl, letters, aligned, bgTextLayout, bgFontSize } = state;
        const dpr = window.devicePixelRatio || 1;
        ctx.clearRect(0, 0, canvasEl.width / dpr, canvasEl.height / dpr);

        if (isActive) {
            // The circle's own text has been replaced by the flying letters below;
            // draw them here too (behind the heading) while they're still near this circle.
            stageLetters.forEach(letter => drawFlightLetter(ctx, letter, activeOriginLeft, activeOriginTop));
        } else if (state.textOpacity > 0.01) {
            ctx.save();
            ctx.globalAlpha = state.textOpacity * BG_TEXT_ALPHA_MAX;
            ctx.font = `500 ${bgFontSize}px 'Poppins', sans-serif`;
            ctx.fillStyle = TEXT_COLOR;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            bgTextLayout.forEach(p => ctx.fillText(p.char, p.x, p.y));
            ctx.restore();
        }

        letters.forEach(letter => {
            ctx.save();
            ctx.translate(letter.x, letter.y);
            ctx.rotate(letter.rotation);
            ctx.font = `700 ${letter.fontSize}px 'Poppins', sans-serif`;
            ctx.fillStyle = aligned ? CIRCLE_LETTER_COLOR_ALIGNED : CIRCLE_LETTER_COLOR_IDLE;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(letter.char, 0, 0);
            ctx.restore();
        });
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

    function startFlight(idx) {
        const state = circleStates[idx];
        if (!state) return;

        activeCircleIndex = idx;

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
            return {
                char: t.char,
                x: origin ? activeOriginLeft + origin.x : fallbackX,
                y: origin ? activeOriginTop + origin.y : fallbackY,
                rotation: 0,
                targetX: t.x,
                targetY: t.y,
                fontSize: state.bgFontSize,
                alpha: startAlpha,
                delayFrames: Math.random() * FLIGHT_MAX_DELAY_FRAMES,
                spawnFrame: stageFrame
            };
        });
        stagePhase = 'flying';
    }

    function startPoof() {
        const now = performance.now();
        stageLetters.forEach(letter => {
            letter.poofStart = now;
            letter.origX = letter.x;
            letter.origY = letter.y;
            letter.driftX = (Math.random() - 0.5) * 90;
            letter.driftY = -40 - Math.random() * 60;
        });
        stagePhase = 'poofing';
    }

    function onCircleClick(idx) {
        if (stagePhase === 'flying' || stagePhase === 'resting') {
            pendingCircleIndex = (activeCircleIndex === idx) ? null : idx;
            startPoof();
            return;
        }
        if (stagePhase === 'poofing') {
            pendingCircleIndex = (activeCircleIndex === idx) ? null : idx;
            return;
        }
        startFlight(idx); // idle
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

        } else if (stagePhase === 'poofing') {
            const now = performance.now();
            let allDone = true;
            stageLetters.forEach(letter => {
                const t = Math.min(1, (now - letter.poofStart) / POOF_DURATION_MS);
                if (t < 1) allDone = false;
                letter.poofT = t;
                letter.x = letter.origX + letter.driftX * t;
                letter.y = letter.origY + letter.driftY * t;
            });

            if (allDone) {
                stageLetters = [];
                activeCircleIndex = null;
                if (pendingCircleIndex !== null) {
                    const next = pendingCircleIndex;
                    pendingCircleIndex = null;
                    startFlight(next);
                } else {
                    stagePhase = 'idle';
                }
            }
        }
    }

    // Draws one flight/resting/poofing letter. `offsetX/offsetY` convert stage-space
    // coordinates into a target canvas's local space (0,0 for the stage canvas itself;
    // the active circle's own on-screen offset when drawn on that circle's canvas).
    function drawFlightLetter(ctx, letter, offsetX, offsetY) {
        let alpha = letter.alpha;
        let scale = 1;
        if (stagePhase === 'poofing' && letter.poofT !== undefined) {
            alpha = 1 - letter.poofT;
            scale = 1 + letter.poofT * 1.6;
        }
        ctx.save();
        ctx.translate(letter.x - offsetX, letter.y - offsetY);
        ctx.rotate(letter.rotation || 0);
        ctx.scale(scale, scale);
        ctx.globalAlpha = alpha;
        ctx.font = `500 ${letter.fontSize}px 'Poppins', sans-serif`;
        ctx.fillStyle = TEXT_COLOR;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(letter.char, 0, 0);
        ctx.restore();
    }

    function renderStage() {
        if (!stageCtx || !aboutStageEl) return;
        const rect = aboutStageEl.getBoundingClientRect();
        stageCtx.clearRect(0, 0, rect.width, rect.height);
        stageLetters.forEach(letter => drawFlightLetter(stageCtx, letter, 0, 0));
    }

    let circleAnimFrameId = null;
    function animateAllCircles() {
        circleStates.forEach((state, idx) => {
            const isActive = idx === activeCircleIndex;
            // Active circle always looks hovered (heading aligned) but shows no background text.
            // Otherwise, mirror real hover state each frame so a circle reliably reverts to
            // idle bouncing once it stops being active (rather than staying stuck aligned).
            state.aligned = isActive ? true : state.hovered;
            state.textFadeTarget = isActive ? 0 : (state.hovered ? 1 : 0);

            if (state.aligned) stepAligningLetters(state);
            else stepBouncingLetters(state);
            state.textOpacity += (state.textFadeTarget - state.textOpacity) * BG_TEXT_FADE_LERP;
            renderCircle(state, isActive);
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
