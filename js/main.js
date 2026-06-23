// ============================================
// MAIN.JS — Portfolio Interactivity
// ============================================

document.addEventListener('DOMContentLoaded', () => {

    // ----------------------------------------
    // 1. MOBILE MENU TOGGLE
    // ----------------------------------------
    const menuToggle = document.querySelector('.menu-toggle');
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelectorAll('.navbar a');

    if (menuToggle && navbar) {
        menuToggle.addEventListener('click', () => {
            const isExpanded = navbar.classList.toggle('is-active');
            menuToggle.setAttribute('aria-expanded', isExpanded);
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navbar.classList.remove('is-active');
                menuToggle.setAttribute('aria-expanded', 'false');
            });
        });

        document.addEventListener('click', (e) => {
            if (!navbar.contains(e.target) && !menuToggle.contains(e.target)) {
                navbar.classList.remove('is-active');
                menuToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }


    // ----------------------------------------
    // 2. CONTACT FORM VALIDATION
    // ----------------------------------------
    const contactForm = document.querySelector('.contact-form');

    if (contactForm) {
        const feedback = contactForm.querySelector('.form-feedback');

        function showFeedback(message, type) {
            feedback.textContent = message;
            feedback.className = `form-feedback ${type}`;
        }

        function clearFieldError(field) {
            field.classList.remove('error');
        }

        function validateEmail(email) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        }

        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const nameInput    = contactForm.querySelector('input[name="name"]');
            const emailInput   = contactForm.querySelector('input[name="email"]');
            const messageInput = contactForm.querySelector('textarea[name="message"]');

            [nameInput, emailInput, messageInput].forEach(f => f.classList.remove('error'));
            feedback.className = 'form-feedback';
            feedback.textContent = '';

            let valid = true;

            if (!nameInput.value.trim()) { nameInput.classList.add('error'); valid = false; }
            if (!emailInput.value.trim() || !validateEmail(emailInput.value.trim())) { emailInput.classList.add('error'); valid = false; }
            if (!messageInput.value.trim()) { messageInput.classList.add('error'); valid = false; }

            if (!valid) { showFeedback('Please fill out all fields correctly.', 'error'); return; }

            const submitBtn = contactForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending…';

            setTimeout(() => {
                showFeedback("Message sent! I'll get back to you shortly.", 'success');
                contactForm.reset();
                submitBtn.disabled = false;
                submitBtn.textContent = 'Send Message';
            }, 1000);
        });

        contactForm.querySelectorAll('input, textarea').forEach(field => {
            field.addEventListener('input', () => clearFieldError(field));
        });
    }


    // ----------------------------------------
    // 3. HERO BACKGROUND ZAP GRID
    // ----------------------------------------
    const zapGrid    = document.getElementById('zapGrid');
    const glowCanvas = document.getElementById('heroGlow');
    const heroMouse  = document.getElementById('heroMouse');
    const heroSection = document.querySelector('.hero-section');

    const letters    = ['Z', 'A', 'P']
    const LETTER_GAP = 0.05;
    const GROUP_GAP  = 0.15;
    const HOVER_RADIUS = 200;

    let spanData = [];
    let glowCtx  = null;

    // Active ripples: [{ ox, oy, startTime, duration }]
    let ripples = [];
    let rafId   = null;

    // Current hover position (null when not hovering)
    let hoverPos = null;

    function initCanvas() {
        const w = heroSection.offsetWidth;
        const h = heroSection.offsetHeight;
        glowCanvas.width  = w;
        glowCanvas.height = h;
        glowCtx = glowCanvas.getContext('2d');
    }

    function fillZapGrid() {
        if (!zapGrid || !heroSection) return;
        zapGrid.querySelectorAll('span').forEach(s => s.remove());
        spanData = [];

        const gridW = heroSection.offsetWidth;
        const gridH = heroSection.offsetHeight;

        initCanvas();

        const probe = document.createElement('span');
        probe.textContent = 'W';
        probe.style.visibility = 'hidden';
        zapGrid.appendChild(probe);
        const fontSize = parseFloat(getComputedStyle(probe).fontSize);
        const itemH    = probe.offsetHeight;
        zapGrid.removeChild(probe);

        if (!fontSize || !itemH) return;

        const letterWidths = {};
        letters.forEach(l => {
            const p = document.createElement('span');
            p.textContent = l;
            p.style.visibility = 'hidden';
            zapGrid.appendChild(p);
            letterWidths[l] = p.offsetWidth;
            zapGrid.removeChild(p);
        });

        const rows = Math.ceil(gridH / itemH) + 1;
        const fragment = document.createDocumentFragment();

        for (let row = 0; row < rows; row++) {
            const y = row * itemH;
            const offsetX = (row % 2 === 1) ? fontSize * 0.6 : 0;
            let x = offsetX - fontSize * 0.5;
            let li = 0;

            while (x < gridW + fontSize) {
                const letter = letters[li % letters.length];
                const lw = letterWidths[letter];

                const span = document.createElement('span');
                span.textContent = letter;
                span.style.left = x + 'px';
                span.style.top  = y + 'px';
                fragment.appendChild(span);

                spanData.push({ el: span, cx: x + lw / 2, cy: y + itemH / 2 });

                const gap = (li % 3 === 2) ? fontSize * GROUP_GAP : fontSize * LETTER_GAP;
                x += lw + gap;
                li++;
            }
        }

        zapGrid.appendChild(fragment);
    }

    // Diagonal of hero — max possible ripple radius
    function maxRadius() {
        return Math.hypot(heroSection.offsetWidth, heroSection.offsetHeight);
    }

    function renderFrame(now) {
        if (!glowCtx) return;

        const cw = glowCanvas.width;
        const ch = glowCanvas.height;
        glowCtx.clearRect(0, 0, cw, ch);

        // Remove finished ripples
        ripples = ripples.filter(r => (now - r.startTime) < r.duration);

        // --- Draw canvas layers ---

        // 1. Hover glow
        if (hoverPos) {
            const hg = glowCtx.createRadialGradient(hoverPos.x, hoverPos.y, 0, hoverPos.x, hoverPos.y, HOVER_RADIUS);
            hg.addColorStop(0,   '#1DD3B030');
            hg.addColorStop(0.5, '#1DD3B012');
            hg.addColorStop(1,   '#1DD3B000');
            glowCtx.fillStyle = hg;
            glowCtx.fillRect(0, 0, cw, ch);
        }

        // 2. Ripple glows
        ripples.forEach(r => {
            const elapsed  = now - r.startTime;
            const progress = elapsed / r.duration;           // 0 → 1
            const eased    = progress < 0.5
                ? 2 * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 2) / 2;   // ease-in-out-quad

            const radius  = eased * r.maxR;
            const opacity = Math.sin(progress * Math.PI);    // rises then fades

            const rg = glowCtx.createRadialGradient(r.ox, r.oy, 0, r.ox, r.oy, radius);
            rg.addColorStop(0,    `rgba(29,211,176,${(opacity * 0.22).toFixed(3)})`);
            rg.addColorStop(0.55, `rgba(29,211,176,${(opacity * 0.10).toFixed(3)})`);
            rg.addColorStop(1,    'rgba(29,211,176,0)');
            glowCtx.fillStyle = rg;
            glowCtx.fillRect(0, 0, cw, ch);
        });

        // --- Drive letter colours ---
        spanData.forEach(({ el, cx, cy }) => {
            let fillAlpha   = 0;
            let strokeAlpha = 0.22;

            // Hover contribution
            if (hoverPos) {
                const dist = Math.hypot(cx - hoverPos.x, cy - hoverPos.y);
                if (dist < HOVER_RADIUS) {
                    const t = 1 - dist / HOVER_RADIUS;
                    fillAlpha   = Math.max(fillAlpha,   t * t * 0.15);
                    strokeAlpha = Math.max(strokeAlpha, 0.22 + t * 0.28);
                }
            }

            // Ripple contributions
            ripples.forEach(r => {
                const elapsed  = now - r.startTime;
                const progress = elapsed / r.duration;
                const eased    = progress < 0.5
                    ? 2 * progress * progress
                    : 1 - Math.pow(-2 * progress + 2, 2) / 2;

                const waveFront = eased * r.maxR;
                const dist      = Math.hypot(cx - r.ox, cy - r.oy);

                // Wave band: letters light up as the front passes over them
                const bandWidth = r.maxR * 0.3;
                const behind    = waveFront - dist;         // positive once front has passed
                if (behind > 0 && behind < bandWidth) {
                    const tBand    = 1 - behind / bandWidth; // 1 at front, 0 at tail
                    const envelope = Math.sin(progress * Math.PI);
                    const strength = tBand * envelope;
                    fillAlpha   = Math.max(fillAlpha,   strength * 0.25);
                    strokeAlpha = Math.max(strokeAlpha, 0.22 + strength * 0.38);
                }
            });

            if (fillAlpha > 0.001) {
                el.style.color = `rgba(29,211,176,${fillAlpha.toFixed(3)})`;
                el.style.webkitTextStrokeColor = `rgba(29,211,176,${strokeAlpha.toFixed(3)})`;
            } else {
                el.style.color = '';
                el.style.webkitTextStrokeColor = '';
            }
        });

        if (ripples.length > 0 || hoverPos) {
            rafId = requestAnimationFrame(renderFrame);
        } else {
            rafId = null;
        }
    }

    function startLoop() {
        if (!rafId) rafId = requestAnimationFrame(renderFrame);
    }

    function clearGlow() {
        hoverPos = null;
        if (ripples.length === 0) {
            if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
            if (glowCtx) glowCtx.clearRect(0, 0, glowCanvas.width, glowCanvas.height);
            spanData.forEach(({ el }) => { el.style.color = ''; el.style.webkitTextStrokeColor = ''; });
        }
    }

    fillZapGrid();

    if (heroMouse) {
        heroMouse.addEventListener('mousemove', (e) => {
            const rect = heroSection.getBoundingClientRect();
            hoverPos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
            startLoop();
        });

        heroMouse.addEventListener('mouseleave', clearGlow);

        heroMouse.addEventListener('click', (e) => {
            const rect = heroSection.getBoundingClientRect();
            const ox = e.clientX - rect.left;
            const oy = e.clientY - rect.top;
            ripples.push({
                ox,
                oy,
                startTime: performance.now(),
                duration:  1400,
                maxR:      maxRadius()
            });
            startLoop();
        });
    }

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(fillZapGrid, 150);
    });


    // ----------------------------------------
    // 4. SCROLL ANIMATION (Intersection Observer)
    // ----------------------------------------
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion) {
        const sections = document.querySelectorAll('.section');

        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    obs.unobserve(entry.target);
                }
            });
        }, { root: null, threshold: 0.15 });

        sections.forEach(section => observer.observe(section));
    } else {
        document.querySelectorAll('.section').forEach(s => s.classList.add('visible'));
    }

});