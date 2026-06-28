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

    const phraseList = [
        'I do stuff.',
        'I build software.',
        'I build websites.',
        'I run business.',
        'I do graphics.',
        'I make games.',
        'Medicine'
    ];

    let currentPhraseIndex = 0;
    let currentCharIndex   = 0;
    let isDeletingMode     = false;
    let typewriterTimeoutId = null;
    let typewriterFrozen   = false; // paused while chaos mode is active

    const getRandomDelay = (minMs, maxMs) => Math.random() * (maxMs - minMs) + minMs;

    function animateTypewriter() {
        if (typewriterFrozen) return;
        if (!typewriterElement) return;

        const currentPhrase = phraseList[currentPhraseIndex];
        const currentChar   = currentPhrase.charAt(currentCharIndex);

        if (cursorElement) cursorElement.classList.add('typing');

        if (!isDeletingMode) {
            typewriterElement.innerHTML += currentChar;
            currentCharIndex++;

            if (currentCharIndex === currentPhrase.length) {
                if (cursorElement) cursorElement.classList.remove('typing');
                isDeletingMode = true;
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
                isDeletingMode     = false;
                currentPhraseIndex = (currentPhraseIndex + 1) % phraseList.length;
                typewriterTimeoutId = setTimeout(animateTypewriter, getRandomDelay(300, 600));
                return;
            }

            let delayMs = getRandomDelay(40, 85);
            if (Math.random() < 0.05) delayMs += getRandomDelay(150, 350);
            typewriterTimeoutId = setTimeout(animateTypewriter, delayMs);
        }
    }

    if (typewriterElement) {
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

        const GLOW_DECAY_RATE_PER_MS = 0.005;
        const DECAY_EPSILON          = 0.0005;
        const RIPPLE_PENDING_START   = -1;

        let letterSpanData     = [];
        let canvasContext      = null;
        let activeRipples      = [];
        let animationFrameId   = null;
        let currentHoverPos    = null;
        let lastFrameTimestamp = null;

        let letterDecayFill   = [];
        let letterDecayStroke = [];

        function isFullyDecayed() {
            return letterDecayFill.every(alpha => alpha <= DECAY_EPSILON) &&
                   letterDecayStroke.every(alpha => alpha <= DECAY_EPSILON);
        }

        function resizeGlowCanvas() {
            glowCanvasElement.width  = heroSectionElement.offsetWidth;
            glowCanvasElement.height = heroSectionElement.offsetHeight;
            canvasContext = glowCanvasElement.getContext('2d');
        }

        function measureLetterDimensions(textToMeasure) {
            const measureElement = document.createElement('span');
            measureElement.textContent = textToMeasure;
            measureElement.style.cssText = 'position:fixed;top:-9999px;left:-9999px;visibility:hidden;white-space:nowrap;';
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

            activeRipples.forEach(ripple => {
                if (ripple.startTime === RIPPLE_PENDING_START) ripple.startTime = currentTimestamp;
            });

            const deltaMs  = lastFrameTimestamp !== null ? currentTimestamp - lastFrameTimestamp : 0;
            lastFrameTimestamp = currentTimestamp;
            const decayStep = GLOW_DECAY_RATE_PER_MS * deltaMs;

            const canvasWidth  = glowCanvasElement.width;
            const canvasHeight = glowCanvasElement.height;
            canvasContext.clearRect(0, 0, canvasWidth, canvasHeight);
            activeRipples = activeRipples.filter(ripple => currentTimestamp - ripple.startTime < ripple.duration);

            if (currentHoverPos) {
                const hoverGradient = canvasContext.createRadialGradient(currentHoverPos.x, currentHoverPos.y, 0, currentHoverPos.x, currentHoverPos.y, HOVER_GLOW_RADIUS);
                hoverGradient.addColorStop(0,   'rgba(29,211,176,0.3)');
                hoverGradient.addColorStop(0.3, 'rgba(29,211,176,0.07)');
                hoverGradient.addColorStop(1,   'rgba(29,211,176,0.0)');
                canvasContext.fillStyle = hoverGradient;
                canvasContext.fillRect(0, 0, canvasWidth, canvasHeight);
            }

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

            letterSpanData.forEach(({ el: letterEl, cx: letterCenterX, cy: letterCenterY }, letterIdx) => {
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

                let currentFill   = letterDecayFill[letterIdx];
                let currentStroke = letterDecayStroke[letterIdx];

                if (targetFill > currentFill) {
                    currentFill = targetFill;
                } else {
                    currentFill = Math.max(targetFill, currentFill - decayStep);
                }

                if (targetStroke > currentStroke) {
                    currentStroke = targetStroke;
                } else {
                    currentStroke = Math.max(targetStroke, currentStroke - decayStep);
                }

                currentFill   = currentFill   <= DECAY_EPSILON ? 0 : currentFill;
                currentStroke = currentStroke <= DECAY_EPSILON ? 0 : currentStroke;

                letterDecayFill[letterIdx]   = currentFill;
                letterDecayStroke[letterIdx] = currentStroke;

                if (currentFill > 0 || currentStroke > 0) {
                    letterEl.style.color = `rgba(29,211,176,${currentFill.toFixed(3)})`;
                    letterEl.style.setProperty('-webkit-text-stroke-color', `rgba(29,211,176,${(0.22 + currentStroke).toFixed(3)})`);
                } else {
                    resetLetterToDefault(letterEl);
                }
            });

            const hasInputSource    = activeRipples.length > 0 || currentHoverPos !== null;
            const shouldKeepLooping = hasInputSource || !isFullyDecayed();

            if (shouldKeepLooping) {
                animationFrameId = requestAnimationFrame(drawAnimationFrame);
            } else {
                animationFrameId   = null;
                lastFrameTimestamp = null;
                canvasContext.clearRect(0, 0, canvasWidth, canvasHeight);
                letterSpanData.forEach(({ el: letterEl }) => resetLetterToDefault(letterEl));
            }
        }

        function startAnimationLoop() {
            if (!animationFrameId) {
                lastFrameTimestamp = null;
                animationFrameId = requestAnimationFrame(drawAnimationFrame);
            }
        }

        function stopHoverGlow() {
            currentHoverPos = null;
            if (isFullyDecayed()) {
                if (animationFrameId) { cancelAnimationFrame(animationFrameId); animationFrameId = null; }
                lastFrameTimestamp = null;
                canvasContext && canvasContext.clearRect(0, 0, glowCanvasElement.width, glowCanvasElement.height);
                letterSpanData.forEach(({ el: letterEl }) => resetLetterToDefault(letterEl));
                return;
            }
        }

        (document.fonts ? document.fonts.ready : Promise.resolve()).then(buildLetterGrid);

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

                ctaButton.classList.toggle('is-proximity-active', isInExtendedButtonZone);

                if (isInExtendedButtonZone) {
                    pointerX = Math.min(Math.max(pointerX, buttonLeft  + BUTTON_EXTEND_PX), buttonRight  - BUTTON_EXTEND_PX);
                    pointerY = Math.min(Math.max(pointerY, buttonTop   + BUTTON_EXTEND_PX), buttonBottom - BUTTON_EXTEND_PX);
                }
            }

            currentHoverPos = { x: pointerX, y: pointerY };
            startAnimationLoop();
        });

        heroMouseTracker.addEventListener('mouseleave', () => {
            if (ctaButton) ctaButton.classList.remove('is-proximity-active');
        });
        heroMouseTracker.addEventListener('mouseleave', stopHoverGlow);
        heroMouseTracker.addEventListener('click', clickEvent => {
            const heroRect = heroSectionElement.getBoundingClientRect();
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

        function getCursorPositionRelativeToButton(mouseEvent) {
            const buttonRect = buttonEl.getBoundingClientRect();
            return {
                x: mouseEvent.clientX - buttonRect.left,
                y: mouseEvent.clientY - buttonRect.top
            };
        }

        function expandBlobFromPosition(mouseEvent) {
            const cursorPos = getCursorPositionRelativeToButton(mouseEvent);
            rippleBlobEl.style.top    = cursorPos.y + 'px';
            rippleBlobEl.style.left   = cursorPos.x + 'px';
            const fullSize = getButtonBlobFullSize(buttonEl);
            rippleBlobEl.style.width  = fullSize;
            rippleBlobEl.style.height = fullSize;
        }

        function contractBlobToPosition(mouseEvent) {
            const cursorPos = getCursorPositionRelativeToButton(mouseEvent);
            rippleBlobEl.style.top    = cursorPos.y + 'px';
            rippleBlobEl.style.left   = cursorPos.x + 'px';
            rippleBlobEl.style.width  = '0';
            rippleBlobEl.style.height = '0';
        }

        buttonEl.addEventListener('mouseenter', expandBlobFromPosition);
        buttonEl.addEventListener('mouseleave', contractBlobToPosition);
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


    // ----------------------------------------
    // 7. CHAOS MODE — PHYSICS TEXT EXPLOSION
    // ----------------------------------------
    const chaosToggleButton = document.getElementById('chaosToggleBtn');
    const physicsCanvas     = document.getElementById('physicsCanvas');
    const heroH1El          = document.getElementById('heroH1');
    const heroPEl           = document.getElementById('heroP');
    const viewWorkBtnEl     = document.getElementById('viewWorkBtn');
    const typewriterEl      = document.getElementById('typewriter');
    const heroSectionEl     = document.querySelector('.hero-section');

    if (!chaosToggleButton || !physicsCanvas || !window.Matter) return;

    // Matter.js module aliases
    const { Engine, Render: MatterRender, Runner, Bodies, Body, Composite, Events, Mouse, MouseConstraint, World } = Matter;

    let chaosActive      = false;
    let physicsEngine    = null;
    let physicsRunner    = null;
    let physicsMouseCon  = null;
    let physicsAnimId    = null;
    let physicsLetters   = []; // array of { body, char, fontSize, color, fontFamily, fontStyle, fontWeight, rotation }
    let physicsCtx       = null;
    let wallBodies       = [];

    // Snapshot of typewriter text at moment chaos is triggered
    let frozenTypewriterText = '';

    // ---- helpers ----

    // Collect all individual characters from a DOM element,
    // measuring each character's pixel position and style.
    function harvestCharactersFromElement(domEl, heroRect) {
        const harvested = [];
        if (!domEl || domEl.offsetParent === null) return harvested;

        const computedStyle = getComputedStyle(domEl);
        const fontSize      = parseFloat(computedStyle.fontSize);
        const fontFamily    = computedStyle.fontFamily;
        const fontStyle     = computedStyle.fontStyle;
        const fontWeight    = computedStyle.fontWeight;
        const color         = computedStyle.color;

        // We split the element's text into individual characters, wrap each in a
        // temporary <span>, measure its bounding rect, then remove the spans.
        const originalHTML = domEl.innerHTML;
        const textContent  = domEl.textContent;

        // Replace the element's contents with one <span> per character
        domEl.innerHTML = textContent.split('').map(ch =>
            ch === ' ' ? `<span style="white-space:pre"> </span>` : `<span>${ch}</span>`
        ).join('');

        domEl.querySelectorAll('span').forEach((charSpan, charIndex) => {
            const spanRect = charSpan.getBoundingClientRect();
            const centerX  = spanRect.left - heroRect.left + spanRect.width  / 2;
            const centerY  = spanRect.top  - heroRect.top  + spanRect.height / 2;
            const char     = textContent[charIndex];

            if (char && char !== ' ' && spanRect.width > 0) {
                harvested.push({
                    char,
                    centerX,
                    centerY,
                    width:      Math.max(spanRect.width,  4),
                    height:     Math.max(spanRect.height, 4),
                    fontSize,
                    fontFamily,
                    fontStyle,
                    fontWeight,
                    color
                });
            }
        });

        // Restore original content
        domEl.innerHTML = originalHTML;

        return harvested;
    }

    function buildWalls(sectionWidth, sectionHeight) {
        const wallThickness = 60;
        const floorBody  = Bodies.rectangle(sectionWidth / 2, sectionHeight + wallThickness / 2, sectionWidth * 3, wallThickness, { isStatic: true, label: 'floor'  });
        const leftBody   = Bodies.rectangle(-wallThickness / 2, sectionHeight / 2, wallThickness, sectionHeight * 3, { isStatic: true, label: 'left'   });
        const rightBody  = Bodies.rectangle(sectionWidth + wallThickness / 2, sectionHeight / 2, wallThickness, sectionHeight * 3, { isStatic: true, label: 'right'  });
        // No ceiling so letters fly up then fall back naturally
        return [floorBody, leftBody, rightBody];
    }

    function launchChaosMode() {
        if (chaosActive) return;
        chaosActive = true;

        // Freeze typewriter so text doesn't change mid-chaos
        typewriterFrozen    = true;
        frozenTypewriterText = typewriterEl ? typewriterEl.textContent : '';
        clearTimeout(typewriterTimeoutId);

        heroSectionEl.classList.add('chaos-active');

        const sectionRect   = heroSectionEl.getBoundingClientRect();
        const sectionWidth  = heroSectionEl.offsetWidth;
        const sectionHeight = heroSectionEl.offsetHeight;

        // Size the physics canvas to match the hero section
        physicsCanvas.width  = sectionWidth;
        physicsCanvas.height = sectionHeight;
        physicsCtx = physicsCanvas.getContext('2d');

        // Create Matter.js engine
        physicsEngine = Engine.create({ gravity: { y: 1.5 } });

        // Harvest characters before hiding DOM text
        const heroRect        = heroSectionEl.getBoundingClientRect();
        const h1Characters    = harvestCharactersFromElement(heroH1El, heroRect);
        const h2Characters    = harvestCharactersFromElement(
            document.querySelector('#heroText h2'), heroRect
        );
        const pCharacters     = harvestCharactersFromElement(heroPEl, heroRect);

        // Harvest the "View My Work" button text
        const btnTextEl = viewWorkBtnEl.querySelector('span') || viewWorkBtnEl;
        const btnCharacters = harvestCharactersFromElement(btnTextEl, heroRect);

        // Adjust button characters' colors to match button text styling
        const btnComputedColor = getComputedStyle(viewWorkBtnEl).color;
        btnCharacters.forEach(ch => { ch.color = btnComputedColor; });

        const allCharacterData = [...h1Characters, ...h2Characters, ...pCharacters, ...btnCharacters];

        // Build walls
        wallBodies = buildWalls(sectionWidth, sectionHeight);
        Composite.add(physicsEngine.world, wallBodies);

        // Create a physics body per character
        physicsLetters = allCharacterData.map(charData => {
            const body = Bodies.rectangle(
                charData.centerX,
                charData.centerY,
                charData.width  * 0.85, // slightly narrower for nicer collisions
                charData.height * 0.85,
                {
                    restitution: 0.45,  // bounciness
                    friction:    0.3,
                    density:     0.002,
                    label:       'letter'
                }
            );

            // Give each letter a small random initial velocity — slightly upward
            // with horizontal spread, as if they burst outward
            const randomVelocityX = (Math.random() - 0.5) * 14;
            const randomVelocityY = -(Math.random() * 8 + 3);
            Body.setVelocity(body, { x: randomVelocityX, y: randomVelocityY });
            Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.3);

            Composite.add(physicsEngine.world, body);

            return {
                body,
                char:       charData.char,
                fontSize:   charData.fontSize,
                fontFamily: charData.fontFamily,
                fontStyle:  charData.fontStyle,
                fontWeight: charData.fontWeight,
                color:      charData.color
            };
        });

        // Attach mouse constraint so user can drag/toss letters
        const matterMouse = Mouse.create(physicsCanvas);
        physicsMouseCon = MouseConstraint.create(physicsEngine, {
            mouse: matterMouse,
            constraint: {
                stiffness: 0.2,
                render: { visible: false }
            }
        });
        Composite.add(physicsEngine.world, physicsMouseCon);

        // Run the engine
        physicsRunner = Runner.create();
        Runner.run(physicsRunner, physicsEngine);

        // Draw loop
        function drawPhysicsFrame() {
            if (!chaosActive) return;
            physicsAnimId = requestAnimationFrame(drawPhysicsFrame);

            physicsCtx.clearRect(0, 0, sectionWidth, sectionHeight);

            physicsLetters.forEach(({ body, char, fontSize, fontFamily, fontStyle, fontWeight, color }) => {
                const pos   = body.position;
                const angle = body.angle;

                physicsCtx.save();
                physicsCtx.translate(pos.x, pos.y);
                physicsCtx.rotate(angle);

                physicsCtx.font        = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
                physicsCtx.fillStyle   = color;
                physicsCtx.textAlign   = 'center';
                physicsCtx.textBaseline = 'middle';
                // Soft text shadow to keep legibility against the ZAP background grid
                physicsCtx.shadowColor   = 'rgba(255,252,242,0.8)';
                physicsCtx.shadowBlur    = 8;
                physicsCtx.fillText(char, 0, 0);

                physicsCtx.restore();
            });
        }

        drawPhysicsFrame();
    }

    function tearDownChaosMode() {
        if (!chaosActive) return;
        chaosActive = false;

        // Stop draw loop
        cancelAnimationFrame(physicsAnimId);
        physicsAnimId = null;

        // Stop physics runner
        if (physicsRunner) { Runner.stop(physicsRunner); physicsRunner = null; }

        // Clear physics world
        if (physicsEngine) { World.clear(physicsEngine.world); Engine.clear(physicsEngine); physicsEngine = null; }

        physicsLetters  = [];
        wallBodies      = [];
        physicsMouseCon = null;

        // Clear the canvas
        if (physicsCtx) { physicsCtx.clearRect(0, 0, physicsCanvas.width, physicsCanvas.height); physicsCtx = null; }

        // Restore the hero section appearance
        heroSectionEl.classList.remove('chaos-active');

        // Re-run h1 and p animations so they feel like a fresh restore
        heroH1El.style.animation = 'none';
        heroPEl.style.animation  = 'none';

        // Trigger reflow so removing the animation class is registered before we re-add it
        void heroH1El.offsetWidth;
        void heroPEl.offsetWidth;

        heroH1El.style.opacity   = '0';
        heroPEl.style.opacity    = '0';
        heroH1El.style.animation = 'heroBounceIn 0.85s cubic-bezier(0.22, 1, 0.36, 1) 0.05s forwards';
        heroPEl.style.animation  = 'heroFadeFloatUp 0.7s ease-out 0.35s forwards';

        // Unfreeze typewriter
        typewriterFrozen = false;
        setTimeout(animateTypewriter, 400);
    }

    chaosToggleButton.addEventListener('click', () => {
        if (chaosActive) {
            tearDownChaosMode();
        } else {
            launchChaosMode();
        }
    });

    // Resize: rebuild walls if chaos is active
    window.addEventListener('resize', () => {
        if (!chaosActive || !physicsEngine) return;
        const newWidth  = heroSectionEl.offsetWidth;
        const newHeight = heroSectionEl.offsetHeight;

        // Remove old walls
        wallBodies.forEach(wall => Composite.remove(physicsEngine.world, wall));

        // Add new walls
        wallBodies = buildWalls(newWidth, newHeight);
        Composite.add(physicsEngine.world, wallBodies);

        physicsCanvas.width  = newWidth;
        physicsCanvas.height = newHeight;
    });

});