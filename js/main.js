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
        const isValidEmailFormat = (emailValue) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue);

        contactFormElement.addEventListener('submit', submitEvent => {
            submitEvent.preventDefault();
            const nameInput    = contactFormElement.querySelector('input[name="name"]');
            const emailInput   = contactFormElement.querySelector('input[name="email"]');
            const messageInput = contactFormElement.querySelector('textarea[name="message"]');
            [nameInput, emailInput, messageInput].forEach(field => field.classList.remove('error'));
            feedbackDisplay.className = 'form-feedback';
            feedbackDisplay.textContent = '';

            let isFormValid = true;
            if (!nameInput.value.trim())                                                  { nameInput.classList.add('error');    isFormValid = false; }
            if (!emailInput.value.trim() || !isValidEmailFormat(emailInput.value.trim())) { emailInput.classList.add('error');   isFormValid = false; }
            if (!messageInput.value.trim())                                               { messageInput.classList.add('error'); isFormValid = false; }
            if (!isFormValid) {
                feedbackDisplay.textContent = 'Please fill out all fields correctly.';
                feedbackDisplay.className = 'form-feedback error';
                return;
            }

            const submitButton = contactFormElement.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.textContent = 'Sending…';
            setTimeout(() => {
                feedbackDisplay.textContent = "Message sent! I'll get back to you shortly.";
                feedbackDisplay.className = 'form-feedback success';
                contactFormElement.reset();
                submitButton.disabled = false;
                submitButton.textContent = 'Send Message';
            }, 1000);
        });

        contactFormElement.querySelectorAll('input, textarea').forEach(formField =>
            formField.addEventListener('input', () => formField.classList.remove('error'))
        );
    }


    // ----------------------------------------
    // 3. TYPEWRITER
    // ----------------------------------------
    const typewriterElement = document.getElementById('typewriter');
    const cursorElement     = document.querySelector('.cursor');

    if (typewriterElement) {
        const phraseList = [
            'I do stuff.',
            'I build software.',
            'I build websites.',
            'I run business.',
            'I do graphics.',
            'I make games.',
            'Medicine'
        ];

        const getRandomDelay = (minMs, maxMs) => Math.random() * (maxMs - minMs) + minMs;

        let currentPhraseIndex = 0;
        let currentCharIndex   = 0;
        let isDeletingMode     = false;

        function animateTypewriter() {
            const currentPhrase = phraseList[currentPhraseIndex];
            const currentChar   = currentPhrase.charAt(currentCharIndex);

            if (cursorElement) cursorElement.classList.add('typing');

            if (!isDeletingMode) {
                // Add next character using charAt — same approach as the reference
                typewriterElement.innerHTML += currentChar;
                currentCharIndex++;

                if (currentCharIndex === currentPhrase.length) {
                    // Finished typing — pause, then switch to deleting
                    if (cursorElement) cursorElement.classList.remove('typing');
                    isDeletingMode = true;
                    setTimeout(animateTypewriter, getRandomDelay(1400, 2000));
                    return;
                }

                let delayMs = getRandomDelay(60, 140);
                if (Math.random() < 0.08) delayMs += getRandomDelay(200, 500); // occasional hesitation
                setTimeout(animateTypewriter, delayMs);

            } else {
                // Delete one character by slicing innerHTML
                typewriterElement.innerHTML = currentPhrase.substring(0, currentCharIndex - 1);
                currentCharIndex--;

                if (currentCharIndex === 0) {
                    // Finished deleting — move to next phrase
                    if (cursorElement) cursorElement.classList.remove('typing');
                    isDeletingMode     = false;
                    currentPhraseIndex = (currentPhraseIndex + 1) % phraseList.length;
                    setTimeout(animateTypewriter, getRandomDelay(300, 600));
                    return;
                }

                let delayMs = getRandomDelay(40, 85);
                if (Math.random() < 0.05) delayMs += getRandomDelay(150, 350); // occasional stumble
                setTimeout(animateTypewriter, delayMs);
            }
        }

        // Kick off after short initial delay
        setTimeout(animateTypewriter, 800);
    }


    // ----------------------------------------
    // 4. HERO ZAP GRID + HOVER / CLICK EFFECTS
    // ----------------------------------------
    const zapGridContainer   = document.getElementById('zapGrid');
    const glowCanvasElement  = document.getElementById('heroGlow');
    const heroMouseTracker   = document.getElementById('heroMouse');
    const heroSectionElement = document.querySelector('.hero-section');

    if (zapGridContainer && glowCanvasElement && heroMouseTracker && heroSectionElement) {

        const GRID_LETTERS      = ['Z', 'A', 'P'];
        const LETTER_SPACING    = 0.02;
        const GROUP_SPACING     = 0.2;
        const HOVER_GLOW_RADIUS = 200;

        // Alpha decay: how much glow drains per millisecond when no active source drives a letter.
        const GLOW_DECAY_RATE_PER_MS = 0.005;
        // Epsilon threshold: alpha values at or below this are considered visually zero
        const DECAY_EPSILON = 0.0005;

        // Sentinel value stored in ripple.startTime to signal "not yet started".
        // The first animation frame that sees this replaces it with the real timestamp,
        // so the ripple always begins from frame 0 with no skipped progress.
        const RIPPLE_PENDING_START = -1;

        let letterSpanData     = [];
        let canvasContext      = null;
        let activeRipples      = [];
        let animationFrameId   = null;
        let currentHoverPos    = null;
        let lastFrameTimestamp = null; // used to compute delta-time for decay

        // Per-letter persistent glow state — decays smoothly between frames
        // Parallel arrays (same index as letterSpanData) for speed
        let letterDecayFill   = []; // current decayed fill alpha for each letter
        let letterDecayStroke = []; // current decayed stroke alpha for each letter

        // Returns true if ALL letters have decayed to at or below DECAY_EPSILON
        function isFullyDecayed() {
            return letterDecayFill.every(alpha => alpha <= DECAY_EPSILON) &&
                   letterDecayStroke.every(alpha => alpha <= DECAY_EPSILON);
        }

        function resizeGlowCanvas() {
            glowCanvasElement.width  = heroSectionElement.offsetWidth;
            glowCanvasElement.height = heroSectionElement.offsetHeight;
            canvasContext = glowCanvasElement.getContext('2d');
        }

        // Measure a string using the same font as .hero-zap span
        function measureLetterDimensions(textToMeasure) {
            const measureElement = document.createElement('span');
            measureElement.textContent = textToMeasure;
            // Position off-screen but still in DOM so font applies
            measureElement.style.cssText = 'position:fixed;top:-9999px;left:-9999px;visibility:hidden;white-space:nowrap;';
            // Mirror font properties from .hero-zap span
            measureElement.style.fontFamily = getComputedStyle(document.documentElement).getPropertyValue('--font-heading').trim() || "'Trajan Supreme',serif";
            measureElement.style.fontSize   = 'clamp(5rem, 11vw, 9rem)';
            measureElement.style.fontWeight = '700';
            measureElement.style.lineHeight = '1';
            document.body.appendChild(measureElement);
            const measuredWidth  = measureElement.offsetWidth;
            const measuredHeight = measureElement.offsetHeight;
            document.body.removeChild(measureElement);
            return { w: measuredWidth, h: measuredHeight };
        }

        function buildLetterGrid() {
            zapGridContainer.querySelectorAll('span').forEach(spanEl => spanEl.remove());
            letterSpanData    = [];
            letterDecayFill   = [];
            letterDecayStroke = [];
            resizeGlowCanvas();

            const sectionWidth  = heroSectionElement.offsetWidth;
            const sectionHeight = heroSectionElement.offsetHeight;

            const { w: measureCharWidth, h: rowHeight } = measureLetterDimensions('W');
            if (!measureCharWidth || !rowHeight) return;

            // Measure the computed font-size (used for spacing calculations)
            const fontSizeProbe = document.createElement('span');
            fontSizeProbe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;visibility:hidden;font-family:\'Trajan Supreme\',serif;font-size:clamp(5rem,11vw,9rem);font-weight:700;line-height:1;';
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

            // Recalculate centres from real rendered rects
            const heroRect = heroSectionElement.getBoundingClientRect();
            letterSpanData.forEach(spanDataPoint => {
                const spanRect = spanDataPoint.el.getBoundingClientRect();
                spanDataPoint.cx = spanRect.left - heroRect.left + spanRect.width  / 2;
                spanDataPoint.cy = spanRect.top  - heroRect.top  + spanRect.height / 2;
            });
        }

        function resetLetterToDefault(letterElement) {
            letterElement.style.color = 'transparent';
            letterElement.style.setProperty('-webkit-text-stroke-color', '#29292925');
        }

        function drawAnimationFrame(currentTimestamp) {
            if (!canvasContext) return;

            // Initialise any pending ripples — stamp their start time on the first frame
            // they're actually drawn, so rippleProgress always begins at 0 with no skipped frames
            activeRipples.forEach(ripple => {
                if (ripple.startTime === RIPPLE_PENDING_START) ripple.startTime = currentTimestamp;
            });

            // Delta-time in ms since last frame — used to advance the decay
            const deltaMs  = lastFrameTimestamp !== null ? currentTimestamp - lastFrameTimestamp : 0;
            lastFrameTimestamp = currentTimestamp;
            const decayStep = GLOW_DECAY_RATE_PER_MS * deltaMs;

            const canvasWidth  = glowCanvasElement.width;
            const canvasHeight = glowCanvasElement.height;
            canvasContext.clearRect(0, 0, canvasWidth, canvasHeight);
            activeRipples = activeRipples.filter(ripple => currentTimestamp - ripple.startTime < ripple.duration);

            // Draw hover canvas glow
            if (currentHoverPos) {
                const hoverGradient = canvasContext.createRadialGradient(currentHoverPos.x, currentHoverPos.y, 0, currentHoverPos.x, currentHoverPos.y, HOVER_GLOW_RADIUS);
                hoverGradient.addColorStop(0,   'rgba(29,211,176,0.3)');
                hoverGradient.addColorStop(0.3, 'rgba(29,211,176,0.07)');
                hoverGradient.addColorStop(1,   'rgba(29,211,176,0.0)');
                canvasContext.fillStyle = hoverGradient;
                canvasContext.fillRect(0, 0, canvasWidth, canvasHeight);
            }

            // Draw ripple canvas glows
            activeRipples.forEach(ripple => {
                const rippleProgress   = (currentTimestamp - ripple.startTime) / ripple.duration;
                const easeOutQuadratic = rippleProgress < 0.5 ? 2*rippleProgress*rippleProgress : 1 - Math.pow(-2*rippleProgress+2,2)/2;
                const oscillationAlpha = Math.sin(rippleProgress * Math.PI);
                const rippleGradient   = canvasContext.createRadialGradient(ripple.x, ripple.y, 0, ripple.x, ripple.y, easeOutQuadratic * ripple.maxRadius);
                rippleGradient.addColorStop(0,   `rgba(29,211,176,${(oscillationAlpha*0.22).toFixed(3)})`);
                rippleGradient.addColorStop(0.6, `rgba(29,211,176,${(oscillationAlpha*0.09).toFixed(3)})`);
                rippleGradient.addColorStop(1,   'rgba(29,211,176,0)');
                canvasContext.fillStyle = rippleGradient;
                canvasContext.fillRect(0, 0, canvasWidth, canvasHeight);
            });

            // Update each letter's glow:
            // 1. Compute the target alpha driven by hover/ripples this frame.
            // 2. If target > current decayed value → snap up immediately (responsive).
            // 3. If target < current decayed value → drain toward target by decayStep (smooth fade).
            letterSpanData.forEach(({ el: letterEl, cx: letterCenterX, cy: letterCenterY }, letterIdx) => {
                // --- compute this frame's driven target ---
                let targetFill   = 0;
                let targetStroke = 0;

                if (currentHoverPos) {
                    const distanceFromHover = Math.hypot(letterCenterX - currentHoverPos.x, letterCenterY - currentHoverPos.y);
                    if (distanceFromHover < HOVER_GLOW_RADIUS) {
                        const proximityRatio = 1 - distanceFromHover / HOVER_GLOW_RADIUS;
                        targetFill   = Math.max(targetFill,   proximityRatio * proximityRatio);
                        targetStroke = Math.max(targetStroke, proximityRatio * 1.5);
                    }
                }

                activeRipples.forEach(ripple => {
                    const rippleProgress     = (currentTimestamp - ripple.startTime) / ripple.duration;
                    const easeOutQuadratic   = rippleProgress < 0.5 ? 2*rippleProgress*rippleProgress : 1 - Math.pow(-2*rippleProgress+2,2)/2;
                    const rippleEdgePosition = easeOutQuadratic * ripple.maxRadius - Math.hypot(letterCenterX - ripple.x, letterCenterY - ripple.y);
                    const rippleWaveWidth    = ripple.maxRadius * 0.3;
                    if (rippleEdgePosition > 0 && rippleEdgePosition < rippleWaveWidth) {
                        const waveIntensity = (1 - rippleEdgePosition / rippleWaveWidth) * Math.sin(rippleProgress * Math.PI);
                        targetFill   = Math.max(targetFill,   waveIntensity);
                        targetStroke = Math.max(targetStroke, waveIntensity);
                    }
                });

                // --- apply snap-up / decay-down ---
                let currentFill   = letterDecayFill[letterIdx];
                let currentStroke = letterDecayStroke[letterIdx];

                if (targetFill > currentFill) {
                    currentFill = targetFill;                                        // snap up instantly
                } else {
                    currentFill = Math.max(targetFill, currentFill - decayStep);    // decay toward target
                }

                if (targetStroke > currentStroke) {
                    currentStroke = targetStroke;
                } else {
                    currentStroke = Math.max(targetStroke, currentStroke - decayStep);
                }

                // Hard-clamp to exactly 0 once below epsilon so no float remainder
                // leaks into the paint step and causes persistent teal on glyph tips
                currentFill   = currentFill   <= DECAY_EPSILON ? 0 : currentFill;
                currentStroke = currentStroke <= DECAY_EPSILON ? 0 : currentStroke;

                letterDecayFill[letterIdx]   = currentFill;
                letterDecayStroke[letterIdx] = currentStroke;

                // --- paint the letter ---
                if (currentFill > 0 || currentStroke > 0) {
                    letterEl.style.color = `rgba(29,211,176,${currentFill.toFixed(3)})`;
                    letterEl.style.setProperty('-webkit-text-stroke-color', `rgba(29,211,176,${(0.22 + currentStroke).toFixed(3)})`);
                } else {
                    resetLetterToDefault(letterEl);
                }
            });

            // Keep the loop alive while there are input sources OR letters haven't fully decayed
            const hasInputSource    = activeRipples.length > 0 || currentHoverPos !== null;
            const shouldKeepLooping = hasInputSource || !isFullyDecayed();

            if (shouldKeepLooping) {
                animationFrameId = requestAnimationFrame(drawAnimationFrame);
            } else {
                // Everything has fully decayed past epsilon — final hard cleanup
                animationFrameId   = null;
                lastFrameTimestamp = null;
                canvasContext.clearRect(0, 0, canvasWidth, canvasHeight);
                letterSpanData.forEach(({ el: letterEl }) => resetLetterToDefault(letterEl));
            }
        }

        function startAnimationLoop() {
            if (!animationFrameId) {
                lastFrameTimestamp = null; // reset so first frame delta is 0
                animationFrameId = requestAnimationFrame(drawAnimationFrame);
            }
        }

        function stopHoverGlow() {
            currentHoverPos = null;
            // If everything is already decayed, no need to keep the loop running
            if (isFullyDecayed()) {
                if (animationFrameId) { cancelAnimationFrame(animationFrameId); animationFrameId = null; }
                lastFrameTimestamp = null;
                canvasContext && canvasContext.clearRect(0, 0, glowCanvasElement.width, glowCanvasElement.height);
                letterSpanData.forEach(({ el: letterEl }) => resetLetterToDefault(letterEl));
                return;
            }
            // Otherwise let the loop keep running — it will decay naturally and stop itself
        }

        (document.fonts ? document.fonts.ready : Promise.resolve()).then(buildLetterGrid);

        // Grab the CTA button once for extended proximity detection
        const ctaButton        = heroSectionElement.querySelector('a.btn, button.btn, .hero-cta, a[href], button') || null;
        const BUTTON_EXTEND_PX = 10;

        heroMouseTracker.addEventListener('mousemove', moveEvent => {
            const heroRect  = heroSectionElement.getBoundingClientRect();
            let pointerX = moveEvent.clientX - heroRect.left;
            let pointerY = moveEvent.clientY - heroRect.top;

            if (ctaButton) {
                const buttonRect   = ctaButton.getBoundingClientRect();
                const buttonLeft   = buttonRect.left   - heroRect.left - BUTTON_EXTEND_PX;
                const buttonRight  = buttonRect.right  - heroRect.left + BUTTON_EXTEND_PX;
                const buttonTop    = buttonRect.top    - heroRect.top  - BUTTON_EXTEND_PX;
                const buttonBottom = buttonRect.bottom - heroRect.top  + BUTTON_EXTEND_PX;

                const isInExtendedButtonZone = pointerX >= buttonLeft  && pointerX <= buttonRight &&
                                               pointerY >= buttonTop   && pointerY <= buttonBottom;

                // Toggle the enlarged/recoloured state via CSS class
                ctaButton.classList.toggle('is-proximity-active', isInExtendedButtonZone);

                if (isInExtendedButtonZone) {
                    // Clamp glow position to the real button edge so letters around it stay lit
                    pointerX = Math.min(Math.max(pointerX, buttonLeft  + BUTTON_EXTEND_PX), buttonRight  - BUTTON_EXTEND_PX);
                    pointerY = Math.min(Math.max(pointerY, buttonTop   + BUTTON_EXTEND_PX), buttonBottom - BUTTON_EXTEND_PX);
                }
            }

            currentHoverPos = { x: pointerX, y: pointerY };
            startAnimationLoop();
        });
        // Remove proximity class when the cursor leaves the hero entirely
        heroMouseTracker.addEventListener('mouseleave', () => {
            if (ctaButton) ctaButton.classList.remove('is-proximity-active');
        });
        heroMouseTracker.addEventListener('mouseleave', stopHoverGlow);
        heroMouseTracker.addEventListener('click', clickEvent => {
            const heroRect = heroSectionElement.getBoundingClientRect();
            // startTime is set to RIPPLE_PENDING_START so the first animation frame
            // stamps the real timestamp — ripple always begins at progress 0
            activeRipples.push({
                x:         clickEvent.clientX - heroRect.left,
                y:         clickEvent.clientY - heroRect.top,
                startTime: RIPPLE_PENDING_START,
                duration:  1400,
                maxRadius: Math.hypot(heroSectionElement.offsetWidth, heroSectionElement.offsetHeight)
            });
            startAnimationLoop();
        });

        let resizeTimeoutId;
        window.addEventListener('resize', () => { clearTimeout(resizeTimeoutId); resizeTimeoutId = setTimeout(buildLetterGrid, 150); });
    }


    // ----------------------------------------
    // 5. BUTTON PROXIMITY HOVER + CLICK
    // ----------------------------------------
    // When the cursor is within BUTTON_PROXIMITY_PX of a button's border,
    // apply the same hover styles via a class, and forward clicks to the button.
    const BUTTON_PROXIMITY_PX = 10;

    // Returns true if the point (mouseX, mouseY) is within `margin` px of the button's border
    function isWithinButtonProximity(buttonRect, mouseX, mouseY, margin) {
        const expandedLeft   = buttonRect.left   - margin;
        const expandedRight  = buttonRect.right  + margin;
        const expandedTop    = buttonRect.top    - margin;
        const expandedBottom = buttonRect.bottom + margin;
        return mouseX >= expandedLeft && mouseX <= expandedRight &&
               mouseY >= expandedTop  && mouseY <= expandedBottom;
    }

    // Returns true if the point is actually inside the button (no proximity margin needed)
    function isInsideButton(buttonRect, mouseX, mouseY) {
        return mouseX >= buttonRect.left && mouseX <= buttonRect.right &&
               mouseY >= buttonRect.top  && mouseY <= buttonRect.bottom;
    }

    document.querySelectorAll('.button').forEach(buttonElement => {
        document.addEventListener('mousemove', proximityMoveEvent => {
            const buttonRect = buttonElement.getBoundingClientRect();
            const mouseX     = proximityMoveEvent.clientX;
            const mouseY     = proximityMoveEvent.clientY;

            // Only apply proximity class when outside the button but within the margin
            // (inside the button the native :hover already handles it)
            if (!isInsideButton(buttonRect, mouseX, mouseY) &&
                 isWithinButtonProximity(buttonRect, mouseX, mouseY, BUTTON_PROXIMITY_PX)) {
                buttonElement.classList.add('is-proximity-hovered');
            } else {
                buttonElement.classList.remove('is-proximity-hovered');
            }
        });

        document.addEventListener('click', proximityClickEvent => {
            const buttonRect = buttonElement.getBoundingClientRect();
            const mouseX     = proximityClickEvent.clientX;
            const mouseY     = proximityClickEvent.clientY;

            // Forward the click to the button if within proximity but not already inside it
            if (!isInsideButton(buttonRect, mouseX, mouseY) &&
                 isWithinButtonProximity(buttonRect, mouseX, mouseY, BUTTON_PROXIMITY_PX)) {
                buttonElement.click();
            }
        });
    });


    // ----------------------------------------
    // 6. SCROLL ANIMATIONS
    // ----------------------------------------
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const scrollObserver = new IntersectionObserver((visibleEntries, observerInstance) => {
            visibleEntries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observerInstance.unobserve(entry.target); } });
        }, { threshold: 0.15 });
        document.querySelectorAll('.section').forEach(sectionElement => scrollObserver.observe(sectionElement));
    } else {
        document.querySelectorAll('.section').forEach(sectionElement => sectionElement.classList.add('visible'));
    }

});