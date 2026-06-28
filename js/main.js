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
        document.querySelectorAll('.navbar a').forEach(navLink => {
            navLink.addEventListener('click', () => {
                navbarElement.classList.remove('is-active');
                menuToggleButton.setAttribute('aria-expanded', 'false');
            });
        });
        document.addEventListener('click', clickEvent => {
            if (!navbarElement.contains(clickEvent.target) && !menuToggleButton.contains(clickEvent.target)) {
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
        const isValidEmailFormat = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

        contactFormElement.addEventListener('submit', submitEvent => {
            submitEvent.preventDefault();
            const nameInput    = contactFormElement.querySelector('input[name="name"]');
            const emailInput   = contactFormElement.querySelector('input[name="email"]');
            const messageInput = contactFormElement.querySelector('textarea[name="message"]');
            [nameInput, emailInput, messageInput].forEach(f => f.classList.remove('error'));
            feedbackDisplay.className   = 'form-feedback';
            feedbackDisplay.textContent = '';

            let isFormValid = true;
            if (!nameInput.value.trim())                                                   { nameInput.classList.add('error');    isFormValid = false; }
            if (!emailInput.value.trim() || !isValidEmailFormat(emailInput.value.trim()))  { emailInput.classList.add('error');   isFormValid = false; }
            if (!messageInput.value.trim())                                                { messageInput.classList.add('error'); isFormValid = false; }
            if (!isFormValid) {
                feedbackDisplay.textContent = 'Please fill out all fields correctly.';
                feedbackDisplay.className   = 'form-feedback error';
                return;
            }

            const submitButton = contactFormElement.querySelector('button[type="submit"]');
            submitButton.disabled    = true;
            submitButton.textContent = 'Sending…';
            setTimeout(() => {
                feedbackDisplay.textContent = "Message sent! I'll get back to you shortly.";
                feedbackDisplay.className   = 'form-feedback success';
                contactFormElement.reset();
                submitButton.disabled    = false;
                submitButton.textContent = 'Send Message';
            }, 1000);
        });

        contactFormElement.querySelectorAll('input, textarea').forEach(f =>
            f.addEventListener('input', () => f.classList.remove('error'))
        );
    }


    // ----------------------------------------
    // 3. TYPEWRITER
    // ----------------------------------------
    const typewriterElement = document.getElementById('typewriter');
    const cursorElement     = document.querySelector('.cursor');

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

    const getRandomDelay = (minMs, maxMs) => Math.random() * (maxMs - minMs) + minMs;

    function animateTypewriter() {
        if (typewriterFrozen || !typewriterElement) return;

        const currentPhrase = phraseList[currentPhraseIndex];
        if (cursorElement) cursorElement.classList.add('typing');

        if (!isDeletingMode) {
            typewriterElement.innerHTML += currentPhrase.charAt(currentCharIndex);
            currentCharIndex++;

            if (currentCharIndex === currentPhrase.length) {
                if (cursorElement) cursorElement.classList.remove('typing');
                isDeletingMode      = true;
                typewriterTimeoutId = setTimeout(animateTypewriter, getRandomDelay(1400, 2000));
                return;
            }

            let delayMs = getRandomDelay(60, 140);
            if (Math.random() < 0.08) delayMs += getRandomDelay(200, 500);
            typewriterTimeoutId = setTimeout(animateTypewriter, delayMs);

        } else {
            typewriterElement.innerHTML = currentPhrase.substring(0, currentCharIndex - 1);
            currentCharIndex--;

            if (currentCharIndex === 0) {
                if (cursorElement) cursorElement.classList.remove('typing');
                isDeletingMode      = false;
                currentPhraseIndex  = (currentPhraseIndex + 1) % phraseList.length;
                typewriterTimeoutId = setTimeout(animateTypewriter, getRandomDelay(300, 600));
                return;
            }

            let delayMs = getRandomDelay(40, 85);
            if (Math.random() < 0.05) delayMs += getRandomDelay(150, 350);
            typewriterTimeoutId = setTimeout(animateTypewriter, delayMs);
        }
    }

    if (typewriterElement) setTimeout(animateTypewriter, 800);


    // ----------------------------------------
    // 3b. H1 WAVE ANIMATION
    // Splits "Hello World, I'm ZAP!" into per-letter spans,
    // then triggers a staggered bounce-up wave on each one.
    // ----------------------------------------
    const heroH1El = document.getElementById('heroH1');

    const H1_TEXT                  = "Hello World, I'm ZAP!";
    const H1_LETTER_DELAY_MS       = 40;   // stagger between each letter
    const H1_WAVE_START_DELAY_MS   = 200;  // initial delay before wave starts

    function buildH1LetterSpans() {
        heroH1El.innerHTML = '';
        H1_TEXT.split('').forEach(char => {
            const letterSpan = document.createElement('span');
            letterSpan.classList.add('h1-letter');
            letterSpan.textContent = char === ' ' ? '\u00A0' : char; // non-breaking space for gaps
            heroH1El.appendChild(letterSpan);
        });
    }

    function triggerH1WaveAnimation() {
        const letterSpans = heroH1El.querySelectorAll('.h1-letter');
        letterSpans.forEach((span, index) => {
            // Reset state for re-plays (after chaos restore)
            span.classList.remove('wave-animate');
            span.style.opacity   = '0';
            span.style.animation = 'none';
            // Force reflow so removing the class is registered
            void span.offsetWidth;
            span.style.animation = '';

            const delayMs = H1_WAVE_START_DELAY_MS + index * H1_LETTER_DELAY_MS;
            setTimeout(() => {
                span.classList.add('wave-animate');
                span.style.animationDelay = '0ms'; // delay handled by setTimeout
            }, delayMs);
        });
    }

    if (heroH1El && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        buildH1LetterSpans();
        triggerH1WaveAnimation();
    } else if (heroH1El) {
        // Reduced motion: just show the text immediately
        heroH1El.textContent = H1_TEXT;
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
        let zapGlowAnimFrameId = null; // RENAMED — distinct from physics anim frame ID
        let currentHoverPos    = null;
        let lastFrameTimestamp = null;

        let letterDecayFill   = [];
        let letterDecayStroke = [];

        function isFullyDecayed() {
            return letterDecayFill.every(a => a <= DECAY_EPSILON) &&
                   letterDecayStroke.every(a => a <= DECAY_EPSILON);
        }

        function resizeGlowCanvas() {
            glowCanvasElement.width  = heroSectionElement.offsetWidth;
            glowCanvasElement.height = heroSectionElement.offsetHeight;
            canvasContext = glowCanvasElement.getContext('2d');
        }

        function measureLetterDimensions(textToMeasure) {
            const el = document.createElement('span');
            el.textContent = textToMeasure;
            el.style.cssText     = 'position:fixed;top:-9999px;left:-9999px;visibility:hidden;white-space:nowrap;';
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

            const { w: measureCharWidth, h: rowHeight } = measureLetterDimensions('W');
            if (!measureCharWidth || !rowHeight) return;

            const fontSizeProbe = document.createElement('span');
            fontSizeProbe.style.cssText = "position:fixed;top:-9999px;left:-9999px;visibility:hidden;font-family:'Trajan Supreme',serif;font-size:clamp(5rem,11vw,9rem);font-weight:700;line-height:1;";
            document.body.appendChild(fontSizeProbe);
            const calculatedFontSize = parseFloat(getComputedStyle(fontSizeProbe).fontSize);
            document.body.removeChild(fontSizeProbe);

            const letterWidths = {};
            GRID_LETTERS.forEach(letter => { letterWidths[letter] = measureLetterDimensions(letter).w; });

            const totalRows        = Math.ceil(sectionHeight / rowHeight) + 1;
            const documentFragment = document.createDocumentFragment();

            for (let rowIndex = 0; rowIndex < totalRows; rowIndex++) {
                const yPosition  = rowIndex * rowHeight;
                const rowOffsetX = (rowIndex % 2 === 1) ? calculatedFontSize * 0.6 : 0;
                let xPosition    = rowOffsetX - calculatedFontSize * 0.5;
                let letterIndex  = 0;

                while (xPosition < sectionWidth + calculatedFontSize) {
                    const currentLetter     = GRID_LETTERS[letterIndex % GRID_LETTERS.length];
                    const letterWidth       = letterWidths[currentLetter];
                    const letterSpanElement = document.createElement('span');
                    letterSpanElement.textContent = currentLetter;
                    letterSpanElement.style.left  = xPosition + 'px';
                    letterSpanElement.style.top   = yPosition + 'px';
                    documentFragment.appendChild(letterSpanElement);
                    letterSpanData.push({ el: letterSpanElement, cx: xPosition + letterWidth / 2, cy: yPosition + rowHeight / 2 });
                    letterDecayFill.push(0);
                    letterDecayStroke.push(0);
                    xPosition += letterWidth + (letterIndex % 3 === 2 ? calculatedFontSize * GROUP_SPACING : calculatedFontSize * LETTER_SPACING);
                    letterIndex++;
                }
            }

            zapGridContainer.appendChild(documentFragment);

            const heroRect = heroSectionElement.getBoundingClientRect();
            letterSpanData.forEach(spanDataPoint => {
                const spanRect   = spanDataPoint.el.getBoundingClientRect();
                spanDataPoint.cx = spanRect.left - heroRect.left + spanRect.width  / 2;
                spanDataPoint.cy = spanRect.top  - heroRect.top  + spanRect.height / 2;
            });
        }

        function resetLetterToDefault(letterElement) {
            letterElement.style.color = 'transparent';
            letterElement.style.setProperty('-webkit-text-stroke-color', '#29292925');
        }

        function drawGlowFrame(currentTimestamp) {
            if (!canvasContext) return;

            activeRipples.forEach(ripple => {
                if (ripple.startTime === RIPPLE_PENDING_START) ripple.startTime = currentTimestamp;
            });

            const deltaMs       = lastFrameTimestamp !== null ? currentTimestamp - lastFrameTimestamp : 0;
            lastFrameTimestamp  = currentTimestamp;
            const decayStep     = GLOW_DECAY_RATE_PER_MS * deltaMs;
            const canvasWidth   = glowCanvasElement.width;
            const canvasHeight  = glowCanvasElement.height;

            canvasContext.clearRect(0, 0, canvasWidth, canvasHeight);
            activeRipples = activeRipples.filter(r => currentTimestamp - r.startTime < r.duration);

            if (currentHoverPos) {
                const hg = canvasContext.createRadialGradient(currentHoverPos.x, currentHoverPos.y, 0, currentHoverPos.x, currentHoverPos.y, HOVER_GLOW_RADIUS);
                hg.addColorStop(0,   'rgba(29,211,176,0.3)');
                hg.addColorStop(0.3, 'rgba(29,211,176,0.07)');
                hg.addColorStop(1,   'rgba(29,211,176,0.0)');
                canvasContext.fillStyle = hg;
                canvasContext.fillRect(0, 0, canvasWidth, canvasHeight);
            }

            activeRipples.forEach(ripple => {
                const rippleProgress   = (currentTimestamp - ripple.startTime) / ripple.duration;
                const easeOutQuad      = rippleProgress < 0.5 ? 2*rippleProgress*rippleProgress : 1 - Math.pow(-2*rippleProgress+2,2)/2;
                const oscillationAlpha = Math.sin(rippleProgress * Math.PI);
                const rg               = canvasContext.createRadialGradient(ripple.x, ripple.y, 0, ripple.x, ripple.y, easeOutQuad * ripple.maxRadius);
                rg.addColorStop(0,   `rgba(29,211,176,${(oscillationAlpha*0.22).toFixed(3)})`);
                rg.addColorStop(0.6, `rgba(29,211,176,${(oscillationAlpha*0.09).toFixed(3)})`);
                rg.addColorStop(1,   'rgba(29,211,176,0)');
                canvasContext.fillStyle = rg;
                canvasContext.fillRect(0, 0, canvasWidth, canvasHeight);
            });

            letterSpanData.forEach(({ el, cx, cy }, idx) => {
                let targetFill   = 0;
                let targetStroke = 0;

                if (currentHoverPos) {
                    const dist = Math.hypot(cx - currentHoverPos.x, cy - currentHoverPos.y);
                    if (dist < HOVER_GLOW_RADIUS) {
                        const ratio  = 1 - dist / HOVER_GLOW_RADIUS;
                        targetFill   = Math.max(targetFill,   ratio * ratio);
                        targetStroke = Math.max(targetStroke, ratio * 1.5);
                    }
                }

                activeRipples.forEach(ripple => {
                    const rp       = (currentTimestamp - ripple.startTime) / ripple.duration;
                    const eOQ      = rp < 0.5 ? 2*rp*rp : 1 - Math.pow(-2*rp+2,2)/2;
                    const edge     = eOQ * ripple.maxRadius - Math.hypot(cx - ripple.x, cy - ripple.y);
                    const rWidth   = ripple.maxRadius * 0.3;
                    if (edge > 0 && edge < rWidth) {
                        const intensity  = (1 - edge / rWidth) * Math.sin(rp * Math.PI);
                        targetFill   = Math.max(targetFill,   intensity);
                        targetStroke = Math.max(targetStroke, intensity);
                    }
                });

                let fill   = letterDecayFill[idx];
                let stroke = letterDecayStroke[idx];

                fill   = targetFill   > fill   ? targetFill   : Math.max(targetFill,   fill   - decayStep);
                stroke = targetStroke > stroke ? targetStroke : Math.max(targetStroke, stroke - decayStep);
                fill   = fill   <= DECAY_EPSILON ? 0 : fill;
                stroke = stroke <= DECAY_EPSILON ? 0 : stroke;

                letterDecayFill[idx]   = fill;
                letterDecayStroke[idx] = stroke;

                if (fill > 0 || stroke > 0) {
                    el.style.color = `rgba(29,211,176,${fill.toFixed(3)})`;
                    el.style.setProperty('-webkit-text-stroke-color', `rgba(29,211,176,${(0.22 + stroke).toFixed(3)})`);
                } else {
                    resetLetterToDefault(el);
                }
            });

            const hasInput      = activeRipples.length > 0 || currentHoverPos !== null;
            const keepLooping   = hasInput || !isFullyDecayed();

            if (keepLooping) {
                zapGlowAnimFrameId = requestAnimationFrame(drawGlowFrame);
            } else {
                zapGlowAnimFrameId = null;
                lastFrameTimestamp = null;
                canvasContext.clearRect(0, 0, canvasWidth, canvasHeight);
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
                canvasContext && canvasContext.clearRect(0, 0, glowCanvasElement.width, glowCanvasElement.height);
                letterSpanData.forEach(({ el }) => resetLetterToDefault(el));
            }
            // else: let the loop keep running so it decays naturally to epsilon
        }

        (document.fonts ? document.fonts.ready : Promise.resolve()).then(buildLetterGrid);

        // Expose the live arrays so chaos mode can read them
        window._zapGridGetState = () => ({ letterSpanData, letterDecayFill, letterDecayStroke });

        const ctaButton        = heroSectionElement.querySelector('#viewWorkBtn') || null;
        const BUTTON_EXTEND_PX = 10;

        heroMouseTracker.addEventListener('mousemove', moveEvent => {
            const heroRect = heroSectionElement.getBoundingClientRect();
            let pointerX   = moveEvent.clientX - heroRect.left;
            let pointerY   = moveEvent.clientY - heroRect.top;

            if (ctaButton) {
                const br           = ctaButton.getBoundingClientRect();
                const buttonLeft   = br.left   - heroRect.left - BUTTON_EXTEND_PX;
                const buttonRight  = br.right  - heroRect.left + BUTTON_EXTEND_PX;
                const buttonTop    = br.top    - heroRect.top  - BUTTON_EXTEND_PX;
                const buttonBottom = br.bottom - heroRect.top  + BUTTON_EXTEND_PX;
                const inZone       = pointerX >= buttonLeft && pointerX <= buttonRight &&
                                     pointerY >= buttonTop  && pointerY <= buttonBottom;
                ctaButton.classList.toggle('is-proximity-active', inZone);
                if (inZone) {
                    pointerX = Math.min(Math.max(pointerX, buttonLeft  + BUTTON_EXTEND_PX), buttonRight  - BUTTON_EXTEND_PX);
                    pointerY = Math.min(Math.max(pointerY, buttonTop   + BUTTON_EXTEND_PX), buttonBottom - BUTTON_EXTEND_PX);
                }
            }

            currentHoverPos = { x: pointerX, y: pointerY };
            startGlowLoop();
        });

        heroMouseTracker.addEventListener('mouseleave', () => {
            if (ctaButton) ctaButton.classList.remove('is-proximity-active');
            stopHoverGlow();
        });

        heroMouseTracker.addEventListener('click', clickEvent => {
            const heroRect = heroSectionElement.getBoundingClientRect();
            activeRipples.push({
                x:         clickEvent.clientX - heroRect.left,
                y:         clickEvent.clientY - heroRect.top,
                startTime: RIPPLE_PENDING_START,
                duration:  1400,
                maxRadius: Math.hypot(heroSectionElement.offsetWidth, heroSectionElement.offsetHeight)
            });
            startGlowLoop();
        });

        let resizeTimeoutId;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeoutId);
            resizeTimeoutId = setTimeout(buildLetterGrid, 150);
        });
    }


    // ----------------------------------------
    // 5. PRIMARY BUTTON POSITION-AWARE RIPPLE
    // ----------------------------------------
    function getButtonBlobFullSize(buttonEl) {
        return Math.max(buttonEl.offsetWidth, buttonEl.offsetHeight) * 2.5 + 'px';
    }

    document.querySelectorAll('.button-primary').forEach(buttonEl => {
        if (!buttonEl.querySelector('span')) {
            buttonEl.innerHTML = `<span>${buttonEl.innerHTML}</span>`;
        }

        const rippleBlobEl = document.createElement('span');
        rippleBlobEl.classList.add('button-ripple-blob');
        rippleBlobEl.style.width  = '0';
        rippleBlobEl.style.height = '0';
        buttonEl.appendChild(rippleBlobEl);

        const getRelativeCursorPos = e => {
            const r = buttonEl.getBoundingClientRect();
            return { x: e.clientX - r.left, y: e.clientY - r.top };
        };

        buttonEl.addEventListener('mouseenter', e => {
            const p = getRelativeCursorPos(e);
            rippleBlobEl.style.top    = p.y + 'px';
            rippleBlobEl.style.left   = p.x + 'px';
            const sz = getButtonBlobFullSize(buttonEl);
            rippleBlobEl.style.width  = sz;
            rippleBlobEl.style.height = sz;
        });

        buttonEl.addEventListener('mouseleave', e => {
            const p = getRelativeCursorPos(e);
            rippleBlobEl.style.top    = p.y + 'px';
            rippleBlobEl.style.left   = p.x + 'px';
            rippleBlobEl.style.width  = '0';
            rippleBlobEl.style.height = '0';
        });
    });


    // ----------------------------------------
    // 6. SCROLL ANIMATIONS
    // ----------------------------------------
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const scrollObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
            });
        }, { threshold: 0.15 });
        document.querySelectorAll('.section').forEach(el => scrollObserver.observe(el));
    } else {
        document.querySelectorAll('.section').forEach(el => el.classList.add('visible'));
    }


    // ----------------------------------------
    // 7. CHAOS MODE — PHYSICS TEXT EXPLOSION
    // ----------------------------------------
    const chaosToggleButton = document.getElementById('chaosToggleBtn');
    const physicsCanvas     = document.getElementById('physicsCanvas');
    const heroPEl           = document.getElementById('heroP');
    const viewWorkBtnEl     = document.getElementById('viewWorkBtn');
    const typewriterEl      = document.getElementById('typewriter');
    const heroSectionEl     = document.querySelector('.hero-section');
    const gravitySliderEl   = document.getElementById('gravitySlider');

    if (!chaosToggleButton || !physicsCanvas || !window.Matter) return;

    const { Engine, Runner, Bodies, Body, Composite, Mouse, MouseConstraint, World } = Matter;

    // Gravity: slider 0–3 maps to these presets
    const GRAVITY_PRESETS = [
        { value: 0    }, // 0 = zero gravity
        { value: 0.27 }, // 1 = moon
        { value: 1.5  }, // 2 = earth (default)
        { value: 3.7  }  // 3 = jupiter
    ];

    // Micro-sleep damping thresholds
    const SLEEP_SPEED_THRESHOLD    = 0.4;
    const SLEEP_ANGULAR_THRESHOLD  = 0.015;
    const SLEEP_CONSECUTIVE_FRAMES = 8;

    // 20% chance any given background ZAP letter will drop in chaos mode
    const ZAP_DROP_CHANCE = 0.2;

    let chaosActive       = false;
    let physicsEngine     = null;
    let physicsRunner     = null;
    let physicsMouseCon   = null;
    let physicsAnimFrameId = null; // separate from zapGlowAnimFrameId above
    let physicsLetters    = [];    // { body, char, fontSize, color, fontFamily, fontStyle, fontWeight, sleepFrames }
    let physicsZapLetters = [];    // { body, char, fontSize, fontFamily, fillColor, strokeColor, domSpan, sleepFrames }
    let physicsCtx        = null;
    let wallBodies        = [];
    let currentGravityY   = 1.5;


    // ---- Gravity slider ----

    function getGravityFromSliderValue(val) {
        const lower  = Math.min(Math.floor(val), GRAVITY_PRESETS.length - 2);
        const upper  = lower + 1;
        const frac   = val - lower;
        return GRAVITY_PRESETS[lower].value + (GRAVITY_PRESETS[upper].value - GRAVITY_PRESETS[lower].value) * frac;
    }

    if (gravitySliderEl) {
        gravitySliderEl.addEventListener('input', () => {
            currentGravityY = getGravityFromSliderValue(parseFloat(gravitySliderEl.value));
            if (physicsEngine) physicsEngine.gravity.y = currentGravityY;
        });
    }


    // ---- Character harvesting ----
    // Measures each character's on-screen position using temporary per-character spans,
    // then restores the element's original HTML.

    function harvestCharactersFromElement(domEl, heroRect) {
        const harvested = [];
        if (!domEl) return harvested;

        const cs         = getComputedStyle(domEl);
        const fontSize   = parseFloat(cs.fontSize);
        const fontFamily = cs.fontFamily;
        const fontStyle  = cs.fontStyle;
        const fontWeight = cs.fontWeight;
        const color      = cs.color;

        const originalHTML  = domEl.innerHTML;
        const textContent   = domEl.textContent;

        domEl.innerHTML = textContent.split('').map(ch =>
            ch === ' ' ? `<span style="white-space:pre"> </span>` : `<span>${ch}</span>`
        ).join('');

        domEl.querySelectorAll('span').forEach((charSpan, i) => {
            const sr    = charSpan.getBoundingClientRect();
            const char  = textContent[i];
            if (char && char !== ' ' && sr.width > 0) {
                harvested.push({
                    char,
                    centerX:    sr.left - heroRect.left + sr.width  / 2,
                    centerY:    sr.top  - heroRect.top  + sr.height / 2,
                    width:      Math.max(sr.width,  4),
                    height:     Math.max(sr.height, 4),
                    fontSize, fontFamily, fontStyle, fontWeight, color
                });
            }
        });

        domEl.innerHTML = originalHTML;
        return harvested;
    }

    // Specialised harvest for the h1 letter-spans (they are already split into spans by
    // the wave animation builder, so we read those directly instead of re-splitting)
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
            const char = span.textContent.replace('\u00A0', ' ');
            if (char !== ' ' && sr.width > 0) {
                harvested.push({
                    char,
                    centerX:    sr.left - heroRect.left + sr.width  / 2,
                    centerY:    sr.top  - heroRect.top  + sr.height / 2,
                    width:      Math.max(sr.width,  4),
                    height:     Math.max(sr.height, 4),
                    fontSize, fontFamily, fontStyle, fontWeight, color
                });
            }
        });
        return harvested;
    }


    // ---- Wall building ----

    function buildWalls(w, h) {
        const t = 60;
        return [
            Bodies.rectangle(w / 2,     h + t / 2, w * 3, t,     { isStatic: true }),
            Bodies.rectangle(-t / 2,    h / 2,     t,     h * 3, { isStatic: true }),
            Bodies.rectangle(w + t / 2, h / 2,     t,     h * 3, { isStatic: true })
        ];
    }


    // ---- Physics body factory ----

    function makeLetterBody(cx, cy, w, h) {
        return Bodies.rectangle(cx, cy, w * 0.85, h * 0.85, {
            restitution: 0.45,
            friction:    0.3,
            density:     0.002
        });
    }


    // ---- Micro-sleep damping ----

    function applyMicroSleepDamping(letterObj) {
        if (currentGravityY < 0.05) return; // allow free float in zero gravity
        const speed   = Math.hypot(letterObj.body.velocity.x, letterObj.body.velocity.y);
        const angular = Math.abs(letterObj.body.angularVelocity);

        if (speed < SLEEP_SPEED_THRESHOLD && angular < SLEEP_ANGULAR_THRESHOLD) {
            letterObj.sleepFrames = (letterObj.sleepFrames || 0) + 1;
        } else {
            letterObj.sleepFrames = 0;
        }

        if (letterObj.sleepFrames >= SLEEP_CONSECUTIVE_FRAMES) {
            Body.setVelocity(letterObj.body, { x: 0, y: 0 });
            Body.setAngularVelocity(letterObj.body, 0);
        }
    }


    // ---- Chaos launch ----

    function launchChaosMode() {
        if (chaosActive) return;
        chaosActive = true;

        typewriterFrozen = true;
        clearTimeout(typewriterTimeoutId);

        heroSectionEl.classList.add('chaos-active');
        chaosToggleButton.textContent = '✕';

        // Reset gravity to Earth default
        currentGravityY = 1.5;
        if (gravitySliderEl) gravitySliderEl.value = '2';

        const sectionWidth  = heroSectionEl.offsetWidth;
        const sectionHeight = heroSectionEl.offsetHeight;

        physicsCanvas.width  = sectionWidth;
        physicsCanvas.height = sectionHeight;
        physicsCtx = physicsCanvas.getContext('2d');

        physicsEngine = Engine.create({ gravity: { y: currentGravityY } });

        const heroRect = heroSectionEl.getBoundingClientRect();

        // Harvest h1 via its pre-built letter spans
        const h1Characters = harvestH1Characters(heroH1El, heroRect);

        // Harvest h2 (typewriter line)
        const h2El          = document.querySelector('#heroText h2');
        const h2Characters  = harvestCharactersFromElement(h2El, heroRect);

        // Harvest paragraph — we need its actual rendered content rect so chaos letters
        // respect the same max-width:700px centred constraint.
        // We measure individual chars which gives us exact positions automatically.
        const pCharacters   = harvestCharactersFromElement(heroPEl, heroRect);

        // Harvest "View My Work" button text
        const btnSpanEl     = viewWorkBtnEl ? (viewWorkBtnEl.querySelector('span') || viewWorkBtnEl) : null;
        const btnCharacters = btnSpanEl ? harvestCharactersFromElement(btnSpanEl, heroRect) : [];
        if (viewWorkBtnEl) {
            const btnColor = getComputedStyle(viewWorkBtnEl).color;
            btnCharacters.forEach(ch => { ch.color = btnColor; });
        }

        const allTextCharData = [...h1Characters, ...h2Characters, ...pCharacters, ...btnCharacters];

        // Walls
        wallBodies = buildWalls(sectionWidth, sectionHeight);
        Composite.add(physicsEngine.world, wallBodies);

        // Physics bodies for text characters
        physicsLetters = allTextCharData.map(charData => {
            const body = makeLetterBody(charData.centerX, charData.centerY, charData.width, charData.height);
            Body.setVelocity(body, { x: (Math.random() - 0.5) * 14, y: -(Math.random() * 8 + 3) });
            Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.3);
            Composite.add(physicsEngine.world, body);
            return {
                body,
                char:        charData.char,
                fontSize:    charData.fontSize,
                fontFamily:  charData.fontFamily,
                fontStyle:   charData.fontStyle,
                fontWeight:  charData.fontWeight,
                color:       charData.color,
                sleepFrames: 0
            };
        });

        // ---- Background ZAP letters: 5% random chance each one drops ----
        physicsZapLetters = [];

        if (window._zapGridGetState) {
            const { letterSpanData } = window._zapGridGetState();

            letterSpanData.forEach(spanData => {
                // ~5% chance this ZAP letter joins the physics world
                if (Math.random() > ZAP_DROP_CHANCE) return;

                // Assign a random teal shade (transparency varies: 0.3 to 1.0 fill)
                const randomFillAlpha   = 0.3 + Math.random() * 0.7;
                const randomStrokeAlpha = 0.22 + Math.random() * 0.5;
                const frozenFillColor   = `rgba(29,211,176,${randomFillAlpha.toFixed(3)})`;
                const frozenStrokeColor = `rgba(29,211,176,${randomStrokeAlpha.toFixed(3)})`;

                const spanRect = spanData.el.getBoundingClientRect();
                const centerX  = spanRect.left - heroRect.left + spanRect.width  / 2;
                const centerY  = spanRect.top  - heroRect.top  + spanRect.height / 2;

                const cs         = getComputedStyle(spanData.el);
                const fontSize   = parseFloat(cs.fontSize);
                const fontFamily = cs.fontFamily;

                const body = makeLetterBody(centerX, centerY, spanRect.width, spanRect.height);
                Body.setVelocity(body, { x: (Math.random() - 0.5) * 2, y: -(Math.random() * 2 + 0.5) });
                Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.1);
                Composite.add(physicsEngine.world, body);

                spanData.el.style.visibility = 'hidden';

                physicsZapLetters.push({
                    body,
                    char:        spanData.el.textContent,
                    fontSize,
                    fontFamily,
                    fillColor:   frozenFillColor,
                    strokeColor: frozenStrokeColor,
                    domSpan:     spanData.el,
                    sleepFrames: 0
                });
            });
        }

        // Mouse drag constraint
        const matterMouse = Mouse.create(physicsCanvas);
        physicsMouseCon = MouseConstraint.create(physicsEngine, {
            mouse: matterMouse,
            constraint: { stiffness: 0.2, render: { visible: false } }
        });
        Composite.add(physicsEngine.world, physicsMouseCon);

        physicsRunner = Runner.create();
        Runner.run(physicsRunner, physicsEngine);

        // Draw loop
        function drawPhysicsFrame() {
            if (!chaosActive) return;
            physicsAnimFrameId = requestAnimationFrame(drawPhysicsFrame);

            physicsCtx.clearRect(0, 0, sectionWidth, sectionHeight);

            [...physicsLetters, ...physicsZapLetters].forEach(applyMicroSleepDamping);

            // Regular text characters
            physicsLetters.forEach(({ body, char, fontSize, fontFamily, fontStyle, fontWeight, color }) => {
                physicsCtx.save();
                physicsCtx.translate(body.position.x, body.position.y);
                physicsCtx.rotate(body.angle);
                physicsCtx.font          = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
                physicsCtx.fillStyle     = color;
                physicsCtx.textAlign     = 'center';
                physicsCtx.textBaseline  = 'middle';
                physicsCtx.shadowColor   = 'rgba(255,252,242,0.8)';
                physicsCtx.shadowBlur    = 8;
                physicsCtx.fillText(char, 0, 0);
                physicsCtx.restore();
            });

            // Teal ZAP background characters
            physicsZapLetters.forEach(({ body, char, fontSize, fontFamily, fillColor, strokeColor }) => {
                physicsCtx.save();
                physicsCtx.translate(body.position.x, body.position.y);
                physicsCtx.rotate(body.angle);
                physicsCtx.font          = `italic 700 ${fontSize}px ${fontFamily}`;
                physicsCtx.fillStyle     = fillColor;
                physicsCtx.strokeStyle   = strokeColor;
                physicsCtx.lineWidth     = 1.5;
                physicsCtx.textAlign     = 'center';
                physicsCtx.textBaseline  = 'middle';
                physicsCtx.shadowColor   = 'rgba(29,211,176,0.3)';
                physicsCtx.shadowBlur    = 10;
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

        if (physicsRunner)  { Runner.stop(physicsRunner);  physicsRunner  = null; }
        if (physicsEngine)  { World.clear(physicsEngine.world); Engine.clear(physicsEngine); physicsEngine = null; }

        // Unhide any ZAP spans we hid
        physicsZapLetters.forEach(({ domSpan }) => { if (domSpan) domSpan.style.visibility = ''; });

        physicsLetters    = [];
        physicsZapLetters = [];
        wallBodies        = [];
        physicsMouseCon   = null;

        if (physicsCtx) {
            physicsCtx.clearRect(0, 0, physicsCanvas.width, physicsCanvas.height);
            physicsCtx = null;
        }

        heroSectionEl.classList.remove('chaos-active');
        chaosToggleButton.textContent = '💥';

        // Replay h1 wave animation
        if (heroH1El && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            triggerH1WaveAnimation();
        }

        // Replay paragraph fade-up
        heroPEl.style.animation = 'none';
        void heroPEl.offsetWidth;
        heroPEl.style.opacity   = '0';
        heroPEl.style.animation = 'heroFadeFloatUp 0.7s ease-out 0.35s forwards';

        // Restart typewriter cleanly
        if (typewriterEl) typewriterEl.innerHTML = '';
        currentCharIndex    = 0;
        isDeletingMode      = false;
        typewriterFrozen    = false;
        clearTimeout(typewriterTimeoutId);
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