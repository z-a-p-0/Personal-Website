// ============================================
// ABOUT.JS
// Circle heading letters: bounce freely (zero-gravity
// style) until the circle is hovered, then align into
// the heading text at the circle's centre.
// ============================================

document.addEventListener('DOMContentLoaded', () => {

    const aboutCircleElements = document.querySelectorAll('.about-circle');
    if (!aboutCircleElements.length) return;

    const CIRCLE_LETTER_COLOR_IDLE    = 'rgba(41, 41, 41, 0.55)';
    const CIRCLE_LETTER_COLOR_ALIGNED = '#1DD3B0';
    const LETTER_BOUNCE_SPEED_MIN     = 0.4;
    const LETTER_BOUNCE_SPEED_MAX     = 1.3;
    const LETTER_ROTATION_SPEED_MAX   = 0.03;
    const ALIGN_LERP_FACTOR           = 0.16;
    const ALIGN_ROTATION_LERP_FACTOR  = 0.2;
    const ALIGN_SNAP_DISTANCE         = 0.6;

    let circleStates = [];

    // ---- Build one circle's letter data from its heading + current size ----
    function buildCircleState(circleEl) {
        const canvasEl     = circleEl.querySelector('.about-circle-canvas');
        const headingText  = circleEl.dataset.heading || '';
        const rect         = circleEl.getBoundingClientRect();
        const dpr          = window.devicePixelRatio || 1;

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

        return { circleEl, canvasEl, ctx, circleRadius, centerX, centerY, letters, aligned: false };
    }

    function rebuildAllCircles() {
        circleStates = Array.from(aboutCircleElements).map(buildCircleState);
    }

    // ---- Hover handlers ----
    aboutCircleElements.forEach(circleEl => {
        circleEl.addEventListener('mouseenter', () => {
            const state = circleStates.find(s => s.circleEl === circleEl);
            if (state) state.aligned = true;
        });

        circleEl.addEventListener('mouseleave', () => {
            const state = circleStates.find(s => s.circleEl === circleEl);
            if (!state) return;
            state.aligned = false;
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

    function renderCircle(state) {
        const { ctx, canvasEl, letters, aligned } = state;
        const dpr = window.devicePixelRatio || 1;
        ctx.clearRect(0, 0, canvasEl.width / dpr, canvasEl.height / dpr);

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

    let circleAnimFrameId = null;
    function animateAllCircles() {
        circleStates.forEach(state => {
            if (state.aligned) stepAligningLetters(state);
            else stepBouncingLetters(state);
            renderCircle(state);
        });
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