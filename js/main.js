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
    const H1_TEXT  = "Hello World, I'm Zayan!";
    const H1_BREAK_AFTER_TEXT = "Hello World,";

    function buildH1LetterSpans() {
        heroH1El.innerHTML = '';
        let charactersTypedSoFar = '';
        H1_TEXT.split('').forEach(char => {
            const letterSpan = document.createElement('span');
            letterSpan.classList.add('h1-letter');
            letterSpan.textContent = char === ' ' ? '\u00A0' : char;
            heroH1El.appendChild(letterSpan);

            charactersTypedSoFar += char;
            if (charactersTypedSoFar === H1_BREAK_AFTER_TEXT) {
                const lineBreakSpan = document.createElement('span');
                lineBreakSpan.classList.add('forced-line-break');
                heroH1El.appendChild(lineBreakSpan);
            }
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
    const gravityNotchEls   = document.querySelectorAll('.gravity-notch-label'); // 4 circle buttons
    const debugToggleButton = document.getElementById('debugToggleBtn');
    const debugPanelEl      = document.getElementById('debugPanel');

    if (!chaosToggleButton || !physicsCanvas || !window.Matter) return;

    const { Engine, Runner, Bodies, Body, Composite, Mouse, MouseConstraint, World, Events } = Matter;

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
    let draggedBody        = null; // body currently held by the mouse constraint, if any

    const DEFAULT_GRAVITY_SLIDER_VALUE = 2; // Earth

    // Live-tunable physics knobs, exposed via the debug panel. Read fresh into
    // new letter bodies at launch and pushed onto existing bodies on slider input.
    const DEFAULT_PHYSICS_PARAMS = Object.freeze({
        frictionAir:         0,     // linear air resistance
        friction:            0,     // surface friction on collision
        restitution:         0.6,   // bounciness
        angularFriction:     0.008, // per-tick angular damping, all letters
        angularFrictionDrag: 0.04   // per-tick angular damping while a letter is held
    });
    const physicsParams = { ...DEFAULT_PHYSICS_PARAMS };


    // ---- Gravity slider & notch highlights ----
    // Shared by the vertical preset slider, the notch buttons, and the debug
    // panel's gravity slider so all three stay in sync — whichever one the
    // user moves is authoritative and pushes its value onto the other.
    function setGravityFromSliderValue(sliderVal) {
        currentGravityY = getGravityFromSliderValue(sliderVal);
        if (gravitySliderEl) gravitySliderEl.value = sliderVal;
        if (debugGravityEl) debugGravityEl.value = sliderVal;
        updateGravityNotchHighlight(sliderVal);
        updateSliderBubble(debugGravityEl, debugGravityValueEl, 2);
        if (physicsEngine) physicsEngine.gravity.y = currentGravityY;
    }

    gravityNotchEls.forEach(notchEl => {
        notchEl.addEventListener('click', () => {
            setGravityFromSliderValue(parseInt(notchEl.dataset.index, 10));
        });
    });

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
            setGravityFromSliderValue(parseFloat(gravitySliderEl.value));
        });
    }


    // ---- Debug panel ----
    const debugGravityEl                  = document.getElementById('debugGravity');
    const debugGravityValueEl             = document.getElementById('debugGravityValue');
    const debugAirResistanceEl            = document.getElementById('debugAirResistance');
    const debugAirResistanceValueEl       = document.getElementById('debugAirResistanceValue');
    const debugFrictionEl                 = document.getElementById('debugFriction');
    const debugFrictionValueEl            = document.getElementById('debugFrictionValue');
    const debugRestitutionEl              = document.getElementById('debugRestitution');
    const debugRestitutionValueEl         = document.getElementById('debugRestitutionValue');
    const debugAngularFrictionEl          = document.getElementById('debugAngularFriction');
    const debugAngularFrictionValueEl     = document.getElementById('debugAngularFrictionValue');
    const debugAngularFrictionDragEl      = document.getElementById('debugAngularFrictionDrag');
    const debugAngularFrictionDragValueEl = document.getElementById('debugAngularFrictionDragValue');
    const debugCloseButton                = document.getElementById('debugCloseBtn');
    const debugResetPhysicsButton         = document.getElementById('debugResetPhysicsBtn');
    const debugResetLettersButton         = document.getElementById('debugResetLettersBtn');

    // Positions the floating numeric readout above the slider's thumb.
    function updateSliderBubble(inputEl, outputEl, decimals) {
        if (!inputEl || !outputEl) return;
        const min     = parseFloat(inputEl.min);
        const max     = parseFloat(inputEl.max);
        const val     = parseFloat(inputEl.value);
        const percent = (val - min) / (max - min) * 100;
        outputEl.textContent = val.toFixed(decimals);
        outputEl.style.left  = `${percent}%`;
    }

    updateSliderBubble(debugGravityEl, debugGravityValueEl, 2);

    if (debugGravityEl) {
        debugGravityEl.addEventListener('input', () => {
            setGravityFromSliderValue(parseFloat(debugGravityEl.value));
        });
    }

    function setDebugPanelOpen(isOpen) {
        if (!debugPanelEl) return;
        debugPanelEl.classList.toggle('is-open', isOpen);
        debugPanelEl.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
        if (debugToggleButton) debugToggleButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    }

    if (debugToggleButton && debugPanelEl) {
        debugToggleButton.addEventListener('click', () => {
            setDebugPanelOpen(!debugPanelEl.classList.contains('is-open'));
        });
    }
    if (debugCloseButton) {
        debugCloseButton.addEventListener('click', () => setDebugPanelOpen(false));
    }

    // Sliders that map straight onto a physicsParams key. frictionAir/friction/
    // restitution also need pushing onto already-spawned bodies since Matter
    // reads those properties live off each body every tick.
    const DEBUG_SLIDER_CONFIGS = [
        { input: debugAirResistanceEl,       output: debugAirResistanceValueEl,       decimals: 3, param: 'frictionAir',        liveBodyProp: true  },
        { input: debugFrictionEl,            output: debugFrictionValueEl,            decimals: 2, param: 'friction',           liveBodyProp: true  },
        { input: debugRestitutionEl,         output: debugRestitutionValueEl,         decimals: 2, param: 'restitution',        liveBodyProp: true  },
        { input: debugAngularFrictionEl,     output: debugAngularFrictionValueEl,     decimals: 3, param: 'angularFriction',    liveBodyProp: false },
        { input: debugAngularFrictionDragEl, output: debugAngularFrictionDragValueEl, decimals: 3, param: 'angularFrictionDrag', liveBodyProp: false }
    ];

    function applyDebugSlider(cfg, val) {
        physicsParams[cfg.param] = val;
        cfg.input.value = val;
        updateSliderBubble(cfg.input, cfg.output, cfg.decimals);
        if (cfg.liveBodyProp) {
            [...physicsLetters, ...physicsZapLetters].forEach(obj => { obj.body[cfg.param] = val; });
        }
    }

    DEBUG_SLIDER_CONFIGS.forEach(cfg => {
        if (!cfg.input) return;
        updateSliderBubble(cfg.input, cfg.output, cfg.decimals);
        cfg.input.addEventListener('input', () => applyDebugSlider(cfg, parseFloat(cfg.input.value)));
    });

    if (debugResetPhysicsButton) {
        debugResetPhysicsButton.addEventListener('click', () => {
            setGravityFromSliderValue(DEFAULT_GRAVITY_SLIDER_VALUE);
            DEBUG_SLIDER_CONFIGS.forEach(cfg => {
                if (cfg.input) applyDebugSlider(cfg, DEFAULT_PHYSICS_PARAMS[cfg.param]);
            });
        });
    }

    if (debugResetLettersButton) {
        debugResetLettersButton.addEventListener('click', () => {
            [...physicsLetters, ...physicsZapLetters].forEach(obj => {
                Body.setPosition(obj.body, { x: obj.origX, y: obj.origY });
                Body.setAngle(obj.body, 0);
                Body.setVelocity(obj.body, { x: 0, y: 0 });
                Body.setAngularVelocity(obj.body, 0);
                obj.sleepFrames = 0;
            });
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

        // Space spans must NOT force white-space:pre — that disables the
        // browser's ability to break a line at that space, collapsing the
        // whole paragraph onto one line and breaking wrap-based positioning.
        // Leaving white-space at its inherited 'normal' value lets each space
        // remain a valid wrap point, so multi-line paragraphs harvest with
        // correct per-line character positions.
        domEl.innerHTML = text.split('').map(ch =>
            ch === ' ' ? `<span> </span>` : `<span>${ch}</span>`
        ).join('');

        domEl.querySelectorAll('span').forEach((span, i) => {
            const sr   = span.getBoundingClientRect();
            const char = text[i];
            if (char && char !== ' ' && sr.width > 0) {
                harvested.push({
                    char,
                    centerX: sr.left - heroRect.left + sr.width  / 2,
                    centerY: sr.top  - heroRect.top  + sr.height / 2,
                    width:   sr.width,
                    height:  sr.height,
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
                    width:   sr.width,
                    height:  sr.height,
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
                    width:   charWidth,
                    height:  lineHeight,
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
    // Bounciness/friction/air-resistance are read live from physicsParams (tunable
    // via the debug panel) so a slider drag also applies to already-spawned letters.
    // Angular damping isn't a native Matter property — it's applied manually per
    // tick in the engine's 'beforeUpdate' handler so it can stay independent of
    // frictionAir and spike while a letter is being dragged.

    function makeLetterBody(cx, cy, w, h) {
        return Bodies.rectangle(cx, cy, w * 0.85, h * 0.85, {
            restitution:    physicsParams.restitution,
            friction:       physicsParams.friction,
            frictionStatic: 0,
            frictionAir:    physicsParams.frictionAir,
            density:        0.1
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
        chaosToggleButton.textContent = 'X';

        // Reset gravity to Earth
        setGravityFromSliderValue(2);

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
            return { body, char: c.char, fontSize: c.fontSize, fontFamily: c.fontFamily, fontStyle: c.fontStyle, fontWeight: c.fontWeight, color: c.color, sleepFrames: 0, origX: c.centerX, origY: c.centerY };
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

                physicsZapLetters.push({ body, char: spanData.el.textContent, fontSize, fontFamily, fillColor, strokeColor, domSpan: spanData.el, sleepFrames: 0, origX: cx, origY: cy });
            });
        }

        // Mouse drag
        const matterMouse = Mouse.create(physicsCanvas);
        physicsMouseCon = MouseConstraint.create(physicsEngine, {
            mouse: matterMouse,
            constraint: { stiffness: 0.2, render: { visible: false } }
        });
        Composite.add(physicsEngine.world, physicsMouseCon);

        draggedBody = null;
        Events.on(physicsMouseCon, 'startdrag', e => { draggedBody = e.body; });
        Events.on(physicsMouseCon, 'enddrag',   () => { draggedBody = null; });

        // Angular friction — not a native Matter property, so it's damped
        // manually every tick. Letters currently held by the mouse get a
        // stronger angular friction so a flung drag doesn't send them spinning.
        Events.on(physicsEngine, 'beforeUpdate', () => {
            [...physicsLetters, ...physicsZapLetters].forEach(obj => {
                const damping = obj.body === draggedBody ? physicsParams.angularFrictionDrag : physicsParams.angularFriction;
                if (damping > 0) Body.setAngularVelocity(obj.body, obj.body.angularVelocity * (1 - damping));
            });
        });

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
        draggedBody = null;

        if (physicsCtx) {
            physicsCtx.clearRect(0, 0, physicsCanvas.width, physicsCanvas.height);
            physicsCtx = null;
        }

        heroSectionEl.classList.remove('chaos-active');
        chaosToggleButton.textContent = '💥';

        setDebugPanelOpen(false);

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


    // ----------------------------------------
    // 8. ABOUT CONVEYOR
    // Bouncing-letter circles (same idle physics as about.html's carousel)
    // sliding along a diagonal belt that loops forever and never pauses on
    // hover. Hovering still aligns a circle's letters into its heading, same
    // as about.html. Clicking uses the anchor's own href — no JS needed there.
    // ----------------------------------------
    const aboutConveyorEl   = document.getElementById('aboutConveyor');
    const conveyorCircleEls = aboutConveyorEl ? aboutConveyorEl.querySelectorAll('.about-conveyor-circle') : [];

    if (aboutConveyorEl && conveyorCircleEls.length) {

        const conveyorReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        const CONVEYOR_LETTER_COLOR_IDLE     = 'rgba(41, 41, 41, 0.55)';
        const CONVEYOR_LETTER_BOUNCE_MIN     = 0.4;
        const CONVEYOR_LETTER_BOUNCE_MAX     = 1.3;
        const CONVEYOR_LETTER_ROTATION_MAX   = 0.03;
        const CONVEYOR_ALIGN_LERP            = 0.16;
        const CONVEYOR_ALIGN_ROTATION_LERP   = 0.2;
        const CONVEYOR_ALIGN_SNAP_DISTANCE   = 0.6;

        // Belt direction (shallow top-right to bottom-left) and speed in px/frame
        const BELT_ANGLE  = 5 * Math.PI / 180;
        const BELT_DIR_X  = -Math.cos(BELT_ANGLE);
        const BELT_DIR_Y  = Math.sin(BELT_ANGLE);
        const BELT_SPEED  = 0.55;

        let conveyorStates     = [];
        let beltProgress       = 0;
        let beltSpacing        = 0;
        let beltTravelLength   = 0;
        let beltOriginX        = 0;
        let beltOriginY        = 0;

        function buildConveyorCircleState(circleEl) {
            const canvasEl    = circleEl.querySelector('.about-conveyor-canvas');
            const headingText = circleEl.dataset.heading || '';
            const color       = circleEl.dataset.color || CONVEYOR_LETTER_COLOR_IDLE;
            circleEl.style.setProperty('--circle-accent', color);

            const rect = { width: circleEl.offsetWidth, height: circleEl.offsetHeight };
            const dpr  = window.devicePixelRatio || 1;
            canvasEl.width  = rect.width  * dpr;
            canvasEl.height = rect.height * dpr;
            canvasEl.style.width  = rect.width  + 'px';
            canvasEl.style.height = rect.height + 'px';
            const ctx = canvasEl.getContext('2d');
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            const circleRadius = rect.width / 2;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            let fontSize = circleRadius * 0.34;
            const maxTextWidth = circleRadius * 1.7;
            ctx.font = `700 ${fontSize}px 'Poppins', sans-serif`;
            while (ctx.measureText(headingText).width > maxTextWidth && fontSize > 10) {
                fontSize -= 1;
                ctx.font = `700 ${fontSize}px 'Poppins', sans-serif`;
            }

            const chars       = headingText.split('');
            const charWidths  = chars.map(ch => ctx.measureText(ch).width);
            const totalWidth  = charWidths.reduce((sum, w) => sum + w, 0);
            const startX      = centerX - totalWidth / 2;

            const letters = [];
            let cumulativeWidth = 0;
            chars.forEach((ch, i) => {
                const letterWidth = charWidths[i];
                const targetX = startX + cumulativeWidth + letterWidth / 2;
                cumulativeWidth += letterWidth;
                if (ch === ' ') return;

                const letterRadius = fontSize * 0.32;
                const spawnAngle   = Math.random() * Math.PI * 2;
                const spawnRadius  = Math.random() * (circleRadius - letterRadius);
                const moveAngle    = Math.random() * Math.PI * 2;
                const speed        = CONVEYOR_LETTER_BOUNCE_MIN + Math.random() * (CONVEYOR_LETTER_BOUNCE_MAX - CONVEYOR_LETTER_BOUNCE_MIN);

                letters.push({
                    char: ch,
                    x: centerX + Math.cos(spawnAngle) * spawnRadius,
                    y: centerY + Math.sin(spawnAngle) * spawnRadius,
                    vx: Math.cos(moveAngle) * speed,
                    vy: Math.sin(moveAngle) * speed,
                    rotation: Math.random() * Math.PI * 2,
                    rotationSpeed: (Math.random() - 0.5) * CONVEYOR_LETTER_ROTATION_MAX,
                    letterRadius, fontSize, targetX, targetY: centerY
                });
            });

            return { circleEl, canvasEl, ctx, circleRadius, centerX, centerY, letters, aligned: false, hovered: false, color };
        }

        function sizeBelt() {
            const containerRect = aboutConveyorEl.getBoundingClientRect();
            const diameter = conveyorStates.length ? conveyorStates[0].circleRadius * 2 : 0;
            const count = conveyorStates.length || 1;
            // Angle is shallow, so the belt's travel is mostly horizontal —
            // enough length to cross the full width plus one circle either side.
            beltTravelLength = containerRect.width + diameter * 2;
            // Spacing MUST divide the travel length evenly so the modulo wrap lands
            // a circle exactly where the last one wrapped off — otherwise there's a
            // gap (or overlap) once per loop instead of a seamless belt.
            beltSpacing = beltTravelLength / count;
            beltOriginX = containerRect.width + diameter;
            // Centre the shallow line's total vertical drift within the container
            // so it starts high-right and ends low-left without clipping early.
            const verticalDrift = beltTravelLength * BELT_DIR_Y;
            beltOriginY = containerRect.height / 2 - diameter / 2 - verticalDrift / 2;
        }

        function rebuildConveyorCircles() {
            conveyorStates = Array.from(conveyorCircleEls).map(buildConveyorCircleState);
            sizeBelt();
        }

        function stepBouncingLetters(state) {
            const { letters, circleRadius, centerX, centerY } = state;
            letters.forEach(letter => {
                letter.x += letter.vx;
                letter.y += letter.vy;
                letter.rotation += letter.rotationSpeed;

                const dx = letter.x - centerX;
                const dy = letter.y - centerY;
                const dist = Math.hypot(dx, dy);
                const maxDist = circleRadius - letter.letterRadius;
                if (dist > maxDist) {
                    const nx = dx / dist, ny = dy / dist;
                    letter.x = centerX + nx * maxDist;
                    letter.y = centerY + ny * maxDist;
                    const dot = letter.vx * nx + letter.vy * ny;
                    letter.vx -= 2 * dot * nx;
                    letter.vy -= 2 * dot * ny;
                }
            });

            for (let i = 0; i < letters.length; i++) {
                for (let j = i + 1; j < letters.length; j++) {
                    const a = letters[i], b = letters[j];
                    const dx = b.x - a.x, dy = b.y - a.y;
                    const dist = Math.hypot(dx, dy);
                    const minDist = a.letterRadius + b.letterRadius;
                    if (dist > 0 && dist < minDist) {
                        const nx = dx / dist, ny = dy / dist;
                        const overlap = (minDist - dist) / 2;
                        a.x -= nx * overlap; a.y -= ny * overlap;
                        b.x += nx * overlap; b.y += ny * overlap;
                        const relVx = b.vx - a.vx, relVy = b.vy - a.vy;
                        const relDot = relVx * nx + relVy * ny;
                        if (relDot < 0) {
                            a.vx += relDot * nx; a.vy += relDot * ny;
                            b.vx -= relDot * nx; b.vy -= relDot * ny;
                        }
                    }
                }
            }
        }

        function stepAligningLetters(state) {
            state.letters.forEach(letter => {
                letter.x += (letter.targetX - letter.x) * CONVEYOR_ALIGN_LERP;
                letter.y += (letter.targetY - letter.y) * CONVEYOR_ALIGN_LERP;

                let rotDelta = (0 - letter.rotation) % (Math.PI * 2);
                if (rotDelta > Math.PI)  rotDelta -= Math.PI * 2;
                if (rotDelta < -Math.PI) rotDelta += Math.PI * 2;
                letter.rotation += rotDelta * CONVEYOR_ALIGN_ROTATION_LERP;

                const distToTarget = Math.hypot(letter.targetX - letter.x, letter.targetY - letter.y);
                if (distToTarget < CONVEYOR_ALIGN_SNAP_DISTANCE) {
                    letter.x = letter.targetX;
                    letter.y = letter.targetY;
                    letter.rotation = 0;
                }
            });
        }

        function renderConveyorCircle(state) {
            const { ctx, canvasEl, letters, aligned } = state;
            const dpr = window.devicePixelRatio || 1;
            ctx.clearRect(0, 0, canvasEl.width / dpr, canvasEl.height / dpr);
            letters.forEach(letter => {
                ctx.save();
                ctx.translate(letter.x, letter.y);
                ctx.rotate(letter.rotation);
                ctx.font = `700 ${letter.fontSize}px 'Poppins', sans-serif`;
                ctx.fillStyle = aligned ? state.color : CONVEYOR_LETTER_COLOR_IDLE;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(letter.char, 0, 0);
                ctx.restore();
            });
        }

        conveyorCircleEls.forEach(circleEl => {
            circleEl.addEventListener('mouseenter', () => {
                const state = conveyorStates.find(s => s.circleEl === circleEl);
                if (state) state.hovered = true;
            });
            circleEl.addEventListener('mouseleave', () => {
                const state = conveyorStates.find(s => s.circleEl === circleEl);
                if (!state) return;
                state.hovered = false;
                state.letters.forEach(letter => {
                    const angle = Math.random() * Math.PI * 2;
                    const speed = CONVEYOR_LETTER_BOUNCE_MIN + Math.random() * (CONVEYOR_LETTER_BOUNCE_MAX - CONVEYOR_LETTER_BOUNCE_MIN);
                    letter.vx = Math.cos(angle) * speed;
                    letter.vy = Math.sin(angle) * speed;
                    letter.rotationSpeed = (Math.random() - 0.5) * CONVEYOR_LETTER_ROTATION_MAX;
                });
            });
        });

        // Belt movement is intentionally independent of hover — unlike the about.html
        // carousel, this teaser never pauses.
        function updateBeltPositions() {
            if (!conveyorReducedMotion) beltProgress = (beltProgress + BELT_SPEED) % beltTravelLength;
            conveyorStates.forEach((state, i) => {
                const t = (beltProgress + i * beltSpacing) % beltTravelLength;
                const x = beltOriginX + t * BELT_DIR_X;
                const y = beltOriginY + t * BELT_DIR_Y;
                state.circleEl.style.transform = `translate(${x}px, ${y}px)`;
            });
        }

        let conveyorAnimFrameId = null;
        function animateConveyor() {
            conveyorStates.forEach(state => {
                state.aligned = state.hovered;
                if (state.aligned) stepAligningLetters(state);
                else stepBouncingLetters(state);
                renderConveyorCircle(state);
            });
            updateBeltPositions();
            conveyorAnimFrameId = requestAnimationFrame(animateConveyor);
        }

        (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => {
            rebuildConveyorCircles();
            if (!conveyorAnimFrameId) animateConveyor();
        });

        let conveyorResizeTid;
        window.addEventListener('resize', () => {
            clearTimeout(conveyorResizeTid);
            conveyorResizeTid = setTimeout(rebuildConveyorCircles, 150);
        });
    }


    // ----------------------------------------
    // 9. PROJECT DECK
    // ----------------------------------------
    // Three cards fan out (left/center/right), the rest sit in the pack behind.
    // Riffle via the prev/next buttons, clicking a side card, swiping across
    // the deck, or arrow keys while focus is inside it. CSS slot transforms
    // do the actual flying; JS only swaps slot classes.
    const projectDeckEl = document.getElementById('projectDeck');
    if (projectDeckEl && projectDeckEl.querySelector('.deck-card')) {
        initProjectDeck(projectDeckEl);
    }

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

        // Click a side card to slide it into the centre slot. A drag that ends
        // on a card must not count as a click, hence the suppress flag.
        let suppressCardClick = false;
        deckCards.forEach((card, i) => {
            card.addEventListener('click', e => {
                if (suppressCardClick || e.target.closest('a, button')) return;
                const pos = posOf(posInOrder[i], deckStart);
                if (pos === 0) advanceDeck(-1);
                else if (pos === 2) advanceDeck(1);
            });
        });

        // Swipe / drag across the deck to riffle three at a time
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
            // Clear after the click event this pointerup produces has fired
            setTimeout(() => { suppressCardClick = false; }, 0);
        });
        deckEl.addEventListener('pointercancel', () => { swipeStartX = null; });

        deckEl.addEventListener('keydown', e => {
            if (e.key === 'ArrowRight') { e.preventDefault(); advanceDeck(1); }
            if (e.key === 'ArrowLeft')  { e.preventDefault(); advanceDeck(-1); }
        });

        renderDeck(null, 0);
    }

});