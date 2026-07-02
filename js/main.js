// ============================================
// MAIN.JS
// ============================================

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
    // 2. CONTACT FORM
    // ----------------------------------------
    const contactFormElement = document.querySelector('.contact-form');
    if (contactFormElement) {
        const feedbackDisplay    = contactFormElement.querySelector('.form-feedback');
        const isValidEmail       = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

        contactFormElement.addEventListener('submit', e => {
            e.preventDefault();
            const nameInput    = contactFormElement.querySelector('input[name="name"]');
            const emailInput   = contactFormElement.querySelector('input[name="email"]');
            const messageInput = contactFormElement.querySelector('textarea[name="message"]');
            [nameInput, emailInput, messageInput].forEach(f => f.classList.remove('error'));
            feedbackDisplay.className = 'form-feedback';
            feedbackDisplay.textContent = '';

            let valid = true;
            if (!nameInput.value.trim())                                        { nameInput.classList.add('error');    valid = false; }
            if (!emailInput.value.trim() || !isValidEmail(emailInput.value))    { emailInput.classList.add('error');   valid = false; }
            if (!messageInput.value.trim())                                     { messageInput.classList.add('error'); valid = false; }
            if (!valid) {
                feedbackDisplay.textContent = 'Please fill out all fields correctly.';
                feedbackDisplay.className   = 'form-feedback error';
                return;
            }

            const btn = contactFormElement.querySelector('button[type="submit"]');
            btn.disabled = true; btn.textContent = 'Sending…';
            setTimeout(() => {
                feedbackDisplay.textContent = "Message sent! I'll get back to you shortly.";
                feedbackDisplay.className   = 'form-feedback success';
                contactFormElement.reset();
                btn.disabled = false; btn.textContent = 'Send Message';
            }, 1000);
        });

        contactFormElement.querySelectorAll('input, textarea').forEach(f =>
            f.addEventListener('input', () => f.classList.remove('error'))
        );
    }


    // ----------------------------------------
    // 3. TYPEWRITER
    // ----------------------------------------
    // IMPORTANT: typewriterElement must always point at the live DOM node.
    // We use getElementById each time we need it to avoid stale references
    // after chaos mode harvests the h2's innerHTML and restores it.
    // The #typewriter span's id is preserved through the restore, but the
    // element reference itself may differ from the one captured at boot.
    // Using a getter ensures we always work on the live node.
    const getTypewriterEl = () => document.getElementById('typewriter');
    const getCursorEl     = () => document.querySelector('.cursor');

    const phraseList = [
        'I do stuff.',
        'I build software.',
        'I build websites.',
        'I run business.',
        'I do graphics.',
        'I make games.',
        'Medicine'
    ];

    let currentPhraseIndex  = 0;
    let currentCharIndex    = 0;
    let isDeletingMode      = false;
    let typewriterTimeoutId = null;
    let typewriterFrozen    = false;

    const getRandomDelay = (min, max) => Math.random() * (max - min) + min;

    function animateTypewriter() {
        if (typewriterFrozen) return;

        // Always resolve the live DOM node — not a cached reference
        const twEl     = getTypewriterEl();
        const cursorEl = getCursorEl();
        if (!twEl) return;

        const currentPhrase = phraseList[currentPhraseIndex];
        if (cursorEl) cursorEl.classList.add('typing');

        if (!isDeletingMode) {
            twEl.textContent += currentPhrase.charAt(currentCharIndex);
            currentCharIndex++;

            if (currentCharIndex === currentPhrase.length) {
                if (cursorEl) cursorEl.classList.remove('typing');
                isDeletingMode      = true;
                typewriterTimeoutId = setTimeout(animateTypewriter, getRandomDelay(1400, 2000));
                return;
            }
            let delay = getRandomDelay(60, 140);
            if (Math.random() < 0.08) delay += getRandomDelay(200, 500);
            typewriterTimeoutId = setTimeout(animateTypewriter, delay);

        } else {
            twEl.textContent = currentPhrase.substring(0, currentCharIndex - 1);
            currentCharIndex--;

            if (currentCharIndex === 0) {
                if (cursorEl) cursorEl.classList.remove('typing');
                isDeletingMode      = false;
                currentPhraseIndex  = (currentPhraseIndex + 1) % phraseList.length;
                typewriterTimeoutId = setTimeout(animateTypewriter, getRandomDelay(300, 600));
                return;
            }
            let delay = getRandomDelay(40, 85);
            if (Math.random() < 0.05) delay += getRandomDelay(150, 350);
            typewriterTimeoutId = setTimeout(animateTypewriter, delay);
        }
    }

    setTimeout(animateTypewriter, 800);


    // ----------------------------------------
    // 3b. H1 LETTER-WAVE ANIMATION
    // ----------------------------------------
    const heroH1El = document.getElementById('heroH1');
    const H1_TEXT  = "Hello World, I'm ZAP!";

    function buildH1LetterSpans() {
        heroH1El.innerHTML = '';
        H1_TEXT.split('').forEach(char => {
            const span = document.createElement('span');
            span.classList.add('h1-letter');
            span.textContent = char === ' ' ? '\u00A0' : char;
            heroH1El.appendChild(span);
        });
    }

    function triggerH1WaveAnimation() {
        heroH1El.querySelectorAll('.h1-letter').forEach((span, i) => {
            span.classList.remove('wave-animate');
            span.style.opacity   = '0';
            span.style.animation = 'none';
            void span.offsetWidth;
            span.style.animation = '';
            setTimeout(() => span.classList.add('wave-animate'), 200 + i * 40);
        });
    }

    if (heroH1El) {
        if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            buildH1LetterSpans();
            triggerH1WaveAnimation();
        } else {
            heroH1El.textContent = H1_TEXT;
        }
    }


    // ----------------------------------------
    // 4. HERO ZAP GRID + HOVER / CLICK EFFECTS
    // ----------------------------------------
    const zapGridContainer   = document.getElementById('zapGrid');
    const glowCanvasElement  = document.getElementById('heroGlow');
    const heroMouseTracker   = document.getElementById('heroMouse');
    const heroSectionElement = document.querySelector('.hero-section');

    if (zapGridContainer && glowCanvasElement && heroMouseTracker && heroSectionElement) {

        const GRID_LETTERS           = ['Z', 'A', 'P'];
        const LETTER_SPACING         = 0.02;
        const GROUP_SPACING          = 0.2;
        const HOVER_GLOW_RADIUS      = 200;
        const GLOW_DECAY_RATE_PER_MS = 0.005;
        const DECAY_EPSILON          = 0.0005;
        const RIPPLE_PENDING_START   = -1;

        let letterSpanData     = [];
        let canvasContext      = null;
        let activeRipples      = [];
        let zapGlowAnimFrameId = null;
        let currentHoverPos    = null;
        let lastFrameTimestamp = null;
        let letterDecayFill    = [];
        let letterDecayStroke  = [];

        const isFullyDecayed = () =>
            letterDecayFill.every(a => a <= DECAY_EPSILON) &&
            letterDecayStroke.every(a => a <= DECAY_EPSILON);

        function resizeGlowCanvas() {
            glowCanvasElement.width  = heroSectionElement.offsetWidth;
            glowCanvasElement.height = heroSectionElement.offsetHeight;
            canvasContext = glowCanvasElement.getContext('2d');
        }

        function measureLetterDimensions(text) {
            const el = document.createElement('span');
            el.textContent    = text;
            el.style.cssText  = 'position:fixed;top:-9999px;left:-9999px;visibility:hidden;white-space:nowrap;';
            el.style.fontFamily  = getComputedStyle(document.documentElement).getPropertyValue('--font-heading').trim() || "'Trajan Supreme',serif";
            el.style.fontSize    = 'clamp(5rem, 11vw, 9rem)';
            el.style.fontWeight  = '700';
            el.style.lineHeight  = '1';
            document.body.appendChild(el);
            const dims = { w: el.offsetWidth, h: el.offsetHeight };
            document.body.removeChild(el);
            return dims;
        }

        function buildLetterGrid() {
            zapGridContainer.querySelectorAll('span').forEach(s => s.remove());
            letterSpanData    = [];
            letterDecayFill   = [];
            letterDecayStroke = [];
            resizeGlowCanvas();

            const sectionWidth  = heroSectionElement.offsetWidth;
            const sectionHeight = heroSectionElement.offsetHeight;
            const { h: rowHeight } = measureLetterDimensions('W');
            if (!rowHeight) return;

            const probe = document.createElement('span');
            probe.style.cssText = "position:fixed;top:-9999px;left:-9999px;visibility:hidden;font-family:'Trajan Supreme',serif;font-size:clamp(5rem,11vw,9rem);font-weight:700;line-height:1;";
            document.body.appendChild(probe);
            const calculatedFontSize = parseFloat(getComputedStyle(probe).fontSize);
            document.body.removeChild(probe);

            const letterWidths = {};
            GRID_LETTERS.forEach(l => { letterWidths[l] = measureLetterDimensions(l).w; });

            const totalRows = Math.ceil(sectionHeight / rowHeight) + 1;
            const frag      = document.createDocumentFragment();

            for (let row = 0; row < totalRows; row++) {
                const yPos      = row * rowHeight;
                const rowOffset = (row % 2 === 1) ? calculatedFontSize * 0.6 : 0;
                let xPos        = rowOffset - calculatedFontSize * 0.5;
                let li          = 0;
                while (xPos < sectionWidth + calculatedFontSize) {
                    const letter = GRID_LETTERS[li % GRID_LETTERS.length];
                    const lw     = letterWidths[letter];
                    const span   = document.createElement('span');
                    span.textContent = letter;
                    span.style.left  = xPos + 'px';
                    span.style.top   = yPos + 'px';
                    frag.appendChild(span);
                    letterSpanData.push({ el: span, cx: xPos + lw / 2, cy: yPos + rowHeight / 2 });
                    letterDecayFill.push(0);
                    letterDecayStroke.push(0);
                    xPos += lw + (li % 3 === 2 ? calculatedFontSize * GROUP_SPACING : calculatedFontSize * LETTER_SPACING);
                    li++;
                }
            }

            zapGridContainer.appendChild(frag);

            const hr = heroSectionElement.getBoundingClientRect();
            letterSpanData.forEach(pt => {
                const sr = pt.el.getBoundingClientRect();
                pt.cx = sr.left - hr.left + sr.width  / 2;
                pt.cy = sr.top  - hr.top  + sr.height / 2;
            });
        }

        function resetLetterToDefault(el) {
            el.style.color = 'transparent';
            el.style.setProperty('-webkit-text-stroke-color', '#29292925');
        }

        function drawGlowFrame(ts) {
            if (!canvasContext) return;

            activeRipples.forEach(r => { if (r.startTime === RIPPLE_PENDING_START) r.startTime = ts; });

            const delta  = lastFrameTimestamp !== null ? ts - lastFrameTimestamp : 0;
            lastFrameTimestamp = ts;
            const decay  = GLOW_DECAY_RATE_PER_MS * delta;
            const cw     = glowCanvasElement.width;
            const ch     = glowCanvasElement.height;

            canvasContext.clearRect(0, 0, cw, ch);
            activeRipples = activeRipples.filter(r => ts - r.startTime < r.duration);

            if (currentHoverPos) {
                const hg = canvasContext.createRadialGradient(currentHoverPos.x, currentHoverPos.y, 0, currentHoverPos.x, currentHoverPos.y, HOVER_GLOW_RADIUS);
                hg.addColorStop(0,   'rgba(29,211,176,0.3)');
                hg.addColorStop(0.3, 'rgba(29,211,176,0.07)');
                hg.addColorStop(1,   'rgba(29,211,176,0.0)');
                canvasContext.fillStyle = hg;
                canvasContext.fillRect(0, 0, cw, ch);
            }

            activeRipples.forEach(r => {
                const rp    = (ts - r.startTime) / r.duration;
                const eOQ   = rp < 0.5 ? 2*rp*rp : 1 - Math.pow(-2*rp+2,2)/2;
                const alpha = Math.sin(rp * Math.PI);
                const rg    = canvasContext.createRadialGradient(r.x, r.y, 0, r.x, r.y, eOQ * r.maxRadius);
                rg.addColorStop(0,   `rgba(29,211,176,${(alpha*0.22).toFixed(3)})`);
                rg.addColorStop(0.6, `rgba(29,211,176,${(alpha*0.09).toFixed(3)})`);
                rg.addColorStop(1,   'rgba(29,211,176,0)');
                canvasContext.fillStyle = rg;
                canvasContext.fillRect(0, 0, cw, ch);
            });

            letterSpanData.forEach(({ el, cx, cy }, idx) => {
                let tf = 0, ts2 = 0;

                if (currentHoverPos) {
                    const d = Math.hypot(cx - currentHoverPos.x, cy - currentHoverPos.y);
                    if (d < HOVER_GLOW_RADIUS) {
                        const r = 1 - d / HOVER_GLOW_RADIUS;
                        tf  = Math.max(tf,  r * r);
                        ts2 = Math.max(ts2, r * 1.5);
                    }
                }

                activeRipples.forEach(r => {
                    const rp   = (ts - r.startTime) / r.duration;
                    const eOQ  = rp < 0.5 ? 2*rp*rp : 1 - Math.pow(-2*rp+2,2)/2;
                    const edge = eOQ * r.maxRadius - Math.hypot(cx - r.x, cy - r.y);
                    const rw   = r.maxRadius * 0.3;
                    if (edge > 0 && edge < rw) {
                        const intensity = (1 - edge / rw) * Math.sin(rp * Math.PI);
                        tf  = Math.max(tf,  intensity);
                        ts2 = Math.max(ts2, intensity);
                    }
                });

                let f = letterDecayFill[idx];
                let s = letterDecayStroke[idx];
                f = tf  > f ? tf  : Math.max(tf,  f - decay);
                s = ts2 > s ? ts2 : Math.max(ts2, s - decay);
                f = f <= DECAY_EPSILON ? 0 : f;
                s = s <= DECAY_EPSILON ? 0 : s;
                letterDecayFill[idx]   = f;
                letterDecayStroke[idx] = s;

                if (f > 0 || s > 0) {
                    el.style.color = `rgba(29,211,176,${f.toFixed(3)})`;
                    el.style.setProperty('-webkit-text-stroke-color', `rgba(29,211,176,${(0.22 + s).toFixed(3)})`);
                } else {
                    resetLetterToDefault(el);
                }
            });

            const keepLooping = activeRipples.length > 0 || currentHoverPos !== null || !isFullyDecayed();
            if (keepLooping) {
                zapGlowAnimFrameId = requestAnimationFrame(drawGlowFrame);
            } else {
                zapGlowAnimFrameId = null;
                lastFrameTimestamp = null;
                canvasContext.clearRect(0, 0, cw, ch);
                letterSpanData.forEach(({ el }) => resetLetterToDefault(el));
            }
        }

        function startGlowLoop() {
            if (!zapGlowAnimFrameId) {
                lastFrameTimestamp = null;
                zapGlowAnimFrameId = requestAnimationFrame(drawGlowFrame);
            }
        }

        function stopHoverGlow() {
            currentHoverPos = null;
            if (isFullyDecayed()) {
                if (zapGlowAnimFrameId) { cancelAnimationFrame(zapGlowAnimFrameId); zapGlowAnimFrameId = null; }
                lastFrameTimestamp = null;
                if (canvasContext) canvasContext.clearRect(0, 0, glowCanvasElement.width, glowCanvasElement.height);
                letterSpanData.forEach(({ el }) => resetLetterToDefault(el));
            }
        }

        (document.fonts ? document.fonts.ready : Promise.resolve()).then(buildLetterGrid);

        window._zapGridGetState = () => ({ letterSpanData, letterDecayFill, letterDecayStroke });

        const ctaButton  = document.getElementById('viewWorkBtn');
        const EXTEND_PX  = 10;

        heroMouseTracker.addEventListener('mousemove', e => {
            const hr   = heroSectionElement.getBoundingClientRect();
            let px = e.clientX - hr.left;
            let py = e.clientY - hr.top;

            if (ctaButton) {
                const br  = ctaButton.getBoundingClientRect();
                const bL  = br.left   - hr.left - EXTEND_PX;
                const bR  = br.right  - hr.left + EXTEND_PX;
                const bT  = br.top    - hr.top  - EXTEND_PX;
                const bB  = br.bottom - hr.top  + EXTEND_PX;
                const inZ = px >= bL && px <= bR && py >= bT && py <= bB;
                ctaButton.classList.toggle('is-proximity-active', inZ);
                if (inZ) {
                    px = Math.min(Math.max(px, bL + EXTEND_PX), bR - EXTEND_PX);
                    py = Math.min(Math.max(py, bT + EXTEND_PX), bB - EXTEND_PX);
                }
            }
            currentHoverPos = { x: px, y: py };
            startGlowLoop();
        });

        heroMouseTracker.addEventListener('mouseleave', () => {
            if (ctaButton) ctaButton.classList.remove('is-proximity-active');
            stopHoverGlow();
        });

        heroMouseTracker.addEventListener('click', e => {
            const hr = heroSectionElement.getBoundingClientRect();
            activeRipples.push({
                x: e.clientX - hr.left,
                y: e.clientY - hr.top,
                startTime: RIPPLE_PENDING_START,
                duration:  1400,
                maxRadius: Math.hypot(heroSectionElement.offsetWidth, heroSectionElement.offsetHeight)
            });
            startGlowLoop();
        });

        let resizeTid;
        window.addEventListener('resize', () => { clearTimeout(resizeTid); resizeTid = setTimeout(buildLetterGrid, 150); });
    }


    // ----------------------------------------
    // 5. PRIMARY BUTTON RIPPLE BLOB
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
    // 6. SCROLL ANIMATIONS
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
    // 7. CHAOS MODE
    // ----------------------------------------
    const chaosToggleButton = document.getElementById('chaosToggleBtn');
    const physicsCanvas     = document.getElementById('physicsCanvas');
    const heroPEl           = document.getElementById('heroP');
    const heroH2El          = document.getElementById('heroH2');
    const viewWorkBtnEl     = document.getElementById('viewWorkBtn');
    const heroSectionEl     = document.querySelector('.hero-section');
    const gravitySliderEl   = document.getElementById('gravitySlider');
    const gravityNotchEls   = document.querySelectorAll('.gravity-notch-label'); // 4 circle labels

    if (!chaosToggleButton || !physicsCanvas || !window.Matter) return;

    const { Engine, Runner, Bodies, Body, Composite, Mouse, MouseConstraint, World } = Matter;

    // Gravity presets — actual acceleration m/s² values (scaled for Matter.js feel)
    // Slider 0→3 maps index 0→3: zero | moon | earth | jupiter
    const GRAVITY_PRESETS = [
        { label: '0',  matterY: 0     },  // 0 m/s² — zero gravity
        { label: 'Moon', matterY: 0.27  },  // 1.6 m/s² — moon  (scaled ~0.27 in Matter)
        { label: 'Earth', matterY: 1.0   },  // 9.8 m/s² — earth (Matter default = 1.0)
        { label: 'Jupiter',  matterY: 2.53  }   // 24.8 m/s² — jupiter (scaled ~2.53)
    ];

    const SLEEP_SPEED_THRESHOLD    = 0.35;
    const SLEEP_ANGULAR_THRESHOLD  = 0.01;
    const SLEEP_CONSECUTIVE_FRAMES = 10;
    const ZAP_DROP_CHANCE          = 0.2;

    let chaosActive        = false;
    let physicsEngine      = null;
    let physicsRunner      = null;
    let physicsMouseCon    = null;
    let physicsAnimFrameId = null;
    let physicsLetters     = [];
    let physicsZapLetters  = [];
    let physicsCtx         = null;
    let wallBodies         = [];
    let currentGravityY    = GRAVITY_PRESETS[2].matterY; // earth default


    // ---- Gravity slider & notch highlights ----

    function updateGravityNotchHighlight(sliderVal) {
        const nearest = Math.round(sliderVal);
        gravityNotchEls.forEach(el => {
            // data-index counts from top (Jupiter=3) to bottom (zero=0)
            el.classList.toggle('is-active', parseInt(el.dataset.index) === nearest);
        });
    }

    function getGravityFromSliderValue(val) {
        const lower = Math.min(Math.floor(val), GRAVITY_PRESETS.length - 2);
        const frac  = val - lower;
        return GRAVITY_PRESETS[lower].matterY + (GRAVITY_PRESETS[lower + 1].matterY - GRAVITY_PRESETS[lower].matterY) * frac;
    }

    if (gravitySliderEl) {
        gravitySliderEl.addEventListener('input', () => {
            const val    = parseFloat(gravitySliderEl.value);
            currentGravityY = getGravityFromSliderValue(val);
            updateGravityNotchHighlight(val);
            if (physicsEngine) physicsEngine.gravity.y = currentGravityY;
        });
    }


    // ---- Character harvest helpers ----

    // Harvest individual characters from a DOM element by temporarily wrapping
    // each character in a span, measuring the span's bounding rect, then
    // restoring the original HTML. Safe as long as the element isn't #heroH2
    // (which contains the live typewriter span — handled separately).
    function harvestCharactersFromElement(domEl, heroRect) {
        const harvested = [];
        if (!domEl) return harvested;

        const cs         = getComputedStyle(domEl);
        const fontSize   = parseFloat(cs.fontSize);
        const fontFamily = cs.fontFamily;
        const fontStyle  = cs.fontStyle;
        const fontWeight = cs.fontWeight;
        const color      = cs.color;
        const origHTML   = domEl.innerHTML;
        const text       = domEl.textContent;

        domEl.innerHTML = text.split('').map(ch =>
            ch === ' ' ? `<span style="white-space:pre"> </span>` : `<span>${ch}</span>`
        ).join('');

        domEl.querySelectorAll('span').forEach((span, i) => {
            const sr   = span.getBoundingClientRect();
            const char = text[i];
            if (char && char !== ' ' && sr.width > 0) {
                harvested.push({
                    char,
                    centerX: sr.left - heroRect.left + sr.width  / 2,
                    centerY: sr.top  - heroRect.top  + sr.height / 2,
                    width:   Math.max(sr.width,  4),
                    height:  Math.max(sr.height, 4),
                    fontSize, fontFamily, fontStyle, fontWeight, color
                });
            }
        });

        domEl.innerHTML = origHTML;
        return harvested;
    }

    // Harvest h1 directly from its pre-built .h1-letter spans (no DOM mutation needed)
    function harvestH1Characters(h1El, heroRect) {
        const harvested = [];
        if (!h1El) return harvested;
        const cs         = getComputedStyle(h1El);
        const fontSize   = parseFloat(cs.fontSize);
        const fontFamily = cs.fontFamily;
        const fontStyle  = cs.fontStyle;
        const fontWeight = cs.fontWeight;
        const color      = cs.color;

        h1El.querySelectorAll('.h1-letter').forEach(span => {
            const sr   = span.getBoundingClientRect();
            const char = span.textContent.replace('\u00A0', '');
            if (char && sr.width > 0) {
                harvested.push({
                    char,
                    centerX: sr.left - heroRect.left + sr.width  / 2,
                    centerY: sr.top  - heroRect.top  + sr.height / 2,
                    width:   Math.max(sr.width,  4),
                    height:  Math.max(sr.height, 4),
                    fontSize, fontFamily, fontStyle, fontWeight, color
                });
            }
        });
        return harvested;
    }

    // Harvest the typewriter span's current text WITHOUT touching the DOM.
    // We create off-screen temporary measurement spans for each character,
    // positioned at the same location as the real typewriter span.
    function harvestTypewriterCharacters(heroRect) {
        const harvested = [];
        const twEl = getTypewriterEl();
        if (!twEl || !twEl.textContent) return harvested;

        const text  = twEl.textContent;
        const sr    = twEl.getBoundingClientRect();
        if (!sr.width) return harvested;

        const cs         = getComputedStyle(twEl);
        const fontSize   = parseFloat(cs.fontSize);
        const fontFamily = cs.fontFamily;
        const fontStyle  = cs.fontStyle;
        const fontWeight = cs.fontWeight;
        const color      = cs.color;

        // Build a temp off-screen container that mirrors the h2's inline context
        // so that character measurement is accurate.
        const measureContainer = document.createElement('span');
        measureContainer.style.cssText = `position:fixed;top:-9999px;left:-9999px;visibility:hidden;
            font-family:${fontFamily};font-size:${fontSize}px;font-style:${fontStyle};
            font-weight:${fontWeight};white-space:nowrap;`;
        document.body.appendChild(measureContainer);

        // Build one span per char, measure cumulative offset to find each char's position
        let cumulativeWidth = 0;
        const charWidths = text.split('').map(ch => {
            const s = document.createElement('span');
            s.textContent = ch === ' ' ? '\u00A0' : ch;
            measureContainer.appendChild(s);
            const w = s.getBoundingClientRect().width;
            return w;
        });
        document.body.removeChild(measureContainer);

        // The typewriter span starts at sr.left and text is left-aligned within it.
        // Calculate each character's center x from cumulative widths.
        const lineHeight = sr.height;
        const startX     = sr.left - heroRect.left;
        const centerY    = sr.top  - heroRect.top + lineHeight / 2;

        charWidths.forEach((charWidth, i) => {
            const char = text[i];
            if (char && char !== ' ' && charWidth > 0) {
                harvested.push({
                    char,
                    centerX: startX + cumulativeWidth + charWidth / 2,
                    centerY,
                    width:   Math.max(charWidth, 4),
                    height:  Math.max(lineHeight, 4),
                    fontSize, fontFamily, fontStyle, fontWeight, color
                });
            }
            cumulativeWidth += charWidth;
        });

        return harvested;
    }


    // ---- Walls ----

    function buildWalls(w, h) {
        const t = 60;
        return [
            // Floor
            Bodies.rectangle(w / 2,     h + t / 2, w * 3, t,     { isStatic: true, friction: 0.3,  restitution: 0.4, frictionAir: 0 }),
            // Left wall
            Bodies.rectangle(-t / 2,    h / 2,     t,     h * 3, { isStatic: true, friction: 0.3,  restitution: 0.4, frictionAir: 0 }),
            // Right wall
            Bodies.rectangle(w + t / 2, h / 2,     t,     h * 3, { isStatic: true, friction: 0.3,  restitution: 0.4, frictionAir: 0 }),
            // Ceiling — prevents letters flying out the top
            Bodies.rectangle(w / 2,     -t / 2,    w * 3, t,     { isStatic: true, friction: 0.3,  restitution: 0.4, frictionAir: 0 })
        ];
    }


    // ---- Physics body factory ----
    // frictionAir: 0   → no air resistance (velocity preserved unless gravity/collision)
    // friction: 0      → no surface friction
    // frictionStatic: 0
    // inertia: Infinity → no angular change on collision (keeps rotation from collisions)
    //   Actually we want some rotation so we'll keep inertia default but set frictionAir=0

    function makeLetterBody(cx, cy, w, h) {
        return Bodies.rectangle(cx, cy, w * 0.85, h * 0.85, {
            restitution:    0.6,
            friction:       0,
            frictionStatic: 0,
            frictionAir:    0,   // no air resistance — velocity constant except gravity
            density:        0.002
        });
    }


    // ---- Micro-sleep damping ----
    // Zeros velocities on bodies that have been nearly still for several consecutive frames.
    // Skipped in zero gravity so letters float freely.

    function applyMicroSleepDamping(obj) {
        if (currentGravityY < 0.02) { obj.sleepFrames = 0; return; }
        const speed   = Math.hypot(obj.body.velocity.x, obj.body.velocity.y);
        const angular = Math.abs(obj.body.angularVelocity);
        if (speed < SLEEP_SPEED_THRESHOLD && angular < SLEEP_ANGULAR_THRESHOLD) {
            obj.sleepFrames = (obj.sleepFrames || 0) + 1;
        } else {
            obj.sleepFrames = 0;
        }
        if (obj.sleepFrames >= SLEEP_CONSECUTIVE_FRAMES) {
            Body.setVelocity(obj.body, { x: 0, y: 0 });
            Body.setAngularVelocity(obj.body, 0);
        }
    }


    // ---- Chaos launch ----

    function launchChaosMode() {
        if (chaosActive) return;
        chaosActive = true;

        // Freeze typewriter before any DOM changes
        typewriterFrozen = true;
        clearTimeout(typewriterTimeoutId);

        heroSectionEl.classList.add('chaos-active');
        chaosToggleButton.textContent = '✕';

        // Reset gravity to Earth
        currentGravityY = GRAVITY_PRESETS[2].matterY;
        if (gravitySliderEl) gravitySliderEl.value = '2';
        updateGravityNotchHighlight(2);

        const sectionWidth  = heroSectionEl.offsetWidth;
        const sectionHeight = heroSectionEl.offsetHeight;

        physicsCanvas.width  = sectionWidth;
        physicsCanvas.height = sectionHeight;
        physicsCtx = physicsCanvas.getContext('2d');

        physicsEngine = Engine.create({ gravity: { y: currentGravityY } });

        const heroRect = heroSectionEl.getBoundingClientRect();

        // --- Harvest text characters ---
        // h1: read from pre-built .h1-letter spans (no DOM mutation)
        const h1Chars  = harvestH1Characters(heroH1El, heroRect);

        // h2: harvest typewriter text WITHOUT touching the h2 DOM tree
        //     (preserves the #typewriter and .cursor element references)
        const twChars  = harvestTypewriterCharacters(heroRect);

        // p: standard harvest (safe — doesn't contain live interactive children)
        const pChars   = harvestCharactersFromElement(heroPEl, heroRect);

        // button: harvest text span (safe)
        const btnSpanEl    = viewWorkBtnEl ? (viewWorkBtnEl.querySelector('span') || viewWorkBtnEl) : null;
        const btnChars     = btnSpanEl ? harvestCharactersFromElement(btnSpanEl, heroRect) : [];
        if (viewWorkBtnEl) {
            const btnColor = getComputedStyle(viewWorkBtnEl).color;
            btnChars.forEach(ch => { ch.color = btnColor; });
        }

        const allTextChars = [...h1Chars, ...twChars, ...pChars, ...btnChars];

        // Walls (including ceiling)
        wallBodies = buildWalls(sectionWidth, sectionHeight);
        Composite.add(physicsEngine.world, wallBodies);

        // Text physics bodies
        physicsLetters = allTextChars.map(c => {
            const body = makeLetterBody(c.centerX, c.centerY, c.width, c.height);
            Body.setVelocity(body, { x: (Math.random() - 0.5) * 14, y: -(Math.random() * 8 + 3) });
            Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.3);
            Composite.add(physicsEngine.world, body);
            return { body, char: c.char, fontSize: c.fontSize, fontFamily: c.fontFamily, fontStyle: c.fontStyle, fontWeight: c.fontWeight, color: c.color, sleepFrames: 0 };
        });

        // ZAP background letters — 20% random chance, random teal shade
        physicsZapLetters = [];
        if (window._zapGridGetState) {
            const { letterSpanData } = window._zapGridGetState();
            letterSpanData.forEach(spanData => {
                if (Math.random() > ZAP_DROP_CHANCE) return;

                const fillAlpha   = 0.3 + Math.random() * 0.7;
                const strokeAlpha = 0.22 + Math.random() * 0.5;
                const fillColor   = `rgba(29,211,176,${fillAlpha.toFixed(3)})`;
                const strokeColor = `rgba(29,211,176,${strokeAlpha.toFixed(3)})`;

                const sr       = spanData.el.getBoundingClientRect();
                const cx       = sr.left - heroRect.left + sr.width  / 2;
                const cy       = sr.top  - heroRect.top  + sr.height / 2;
                const cs       = getComputedStyle(spanData.el);
                const fontSize = parseFloat(cs.fontSize);
                const fontFamily = cs.fontFamily;

                const body = makeLetterBody(cx, cy, sr.width, sr.height);
                Body.setVelocity(body, { x: (Math.random() - 0.5) * 2, y: -(Math.random() * 2 + 0.5) });
                Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.1);
                Composite.add(physicsEngine.world, body);

                spanData.el.style.visibility = 'hidden';

                physicsZapLetters.push({ body, char: spanData.el.textContent, fontSize, fontFamily, fillColor, strokeColor, domSpan: spanData.el, sleepFrames: 0 });
            });
        }

        // Mouse drag
        const matterMouse = Mouse.create(physicsCanvas);
        physicsMouseCon = MouseConstraint.create(physicsEngine, {
            mouse: matterMouse,
            constraint: { stiffness: 0.2, render: { visible: false } }
        });
        Composite.add(physicsEngine.world, physicsMouseCon);

        physicsRunner = Runner.create();
        Runner.run(physicsRunner, physicsEngine);

        function drawPhysicsFrame() {
            if (!chaosActive) return;
            physicsAnimFrameId = requestAnimationFrame(drawPhysicsFrame);
            physicsCtx.clearRect(0, 0, sectionWidth, sectionHeight);

            [...physicsLetters, ...physicsZapLetters].forEach(applyMicroSleepDamping);

            physicsLetters.forEach(({ body, char, fontSize, fontFamily, fontStyle, fontWeight, color }) => {
                physicsCtx.save();
                physicsCtx.translate(body.position.x, body.position.y);
                physicsCtx.rotate(body.angle);
                physicsCtx.font         = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
                physicsCtx.fillStyle    = color;
                physicsCtx.textAlign    = 'center';
                physicsCtx.textBaseline = 'middle';
                physicsCtx.shadowColor  = 'rgba(255,252,242,0.8)';
                physicsCtx.shadowBlur   = 8;
                physicsCtx.fillText(char, 0, 0);
                physicsCtx.restore();
            });

            physicsZapLetters.forEach(({ body, char, fontSize, fontFamily, fillColor, strokeColor }) => {
                physicsCtx.save();
                physicsCtx.translate(body.position.x, body.position.y);
                physicsCtx.rotate(body.angle);
                physicsCtx.font         = `italic 700 ${fontSize}px ${fontFamily}`;
                physicsCtx.fillStyle    = fillColor;
                physicsCtx.strokeStyle  = strokeColor;
                physicsCtx.lineWidth    = 1.5;
                physicsCtx.textAlign    = 'center';
                physicsCtx.textBaseline = 'middle';
                physicsCtx.shadowColor  = 'rgba(29,211,176,0.3)';
                physicsCtx.shadowBlur   = 10;
                physicsCtx.fillText(char, 0, 0);
                physicsCtx.strokeText(char, 0, 0);
                physicsCtx.restore();
            });
        }

        drawPhysicsFrame();
    }


    // ---- Chaos teardown ----

    function tearDownChaosMode() {
        if (!chaosActive) return;
        chaosActive = false;

        cancelAnimationFrame(physicsAnimFrameId);
        physicsAnimFrameId = null;

        if (physicsRunner) { Runner.stop(physicsRunner); physicsRunner = null; }
        if (physicsEngine) { World.clear(physicsEngine.world); Engine.clear(physicsEngine); physicsEngine = null; }

        physicsZapLetters.forEach(({ domSpan }) => { if (domSpan) domSpan.style.visibility = ''; });
        physicsLetters = []; physicsZapLetters = []; wallBodies = []; physicsMouseCon = null;

        if (physicsCtx) {
            physicsCtx.clearRect(0, 0, physicsCanvas.width, physicsCanvas.height);
            physicsCtx = null;
        }

        heroSectionEl.classList.remove('chaos-active');
        chaosToggleButton.textContent = '💥';

        // Replay h1 wave
        if (heroH1El && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            triggerH1WaveAnimation();
        }

        // Replay p animation
        heroPEl.style.animation = 'none';
        void heroPEl.offsetWidth;
        heroPEl.style.opacity   = '0';
        heroPEl.style.animation = 'heroFadeFloatUp 0.7s ease-out 0.35s forwards';

        // Restart typewriter — unfreeze LAST, after all DOM state is clean
        // Use getElementById to get the guaranteed-live node
        const twEl = getTypewriterEl();
        if (twEl) twEl.textContent = '';
        currentCharIndex    = 0;
        isDeletingMode      = false;
        clearTimeout(typewriterTimeoutId);
        typewriterFrozen    = false; // unfreeze only after clearing
        typewriterTimeoutId = setTimeout(animateTypewriter, 500);
    }


    // ---- Toggle ----
    chaosToggleButton.addEventListener('click', () => {
        if (chaosActive) { tearDownChaosMode(); } else { launchChaosMode(); }
    });


    // ---- Resize ----
    window.addEventListener('resize', () => {
        if (!chaosActive || !physicsEngine) return;
        const w = heroSectionEl.offsetWidth;
        const h = heroSectionEl.offsetHeight;
        wallBodies.forEach(wall => Composite.remove(physicsEngine.world, wall));
        wallBodies = buildWalls(w, h);
        Composite.add(physicsEngine.world, wallBodies);
        physicsCanvas.width  = w;
        physicsCanvas.height = h;
    });

});