// ============================================
// MAIN.JS
// ============================================

document.addEventListener('DOMContentLoaded', () => {

    // ----------------------------------------
    // 1. MOBILE MENU TOGGLE
    // ----------------------------------------
    const menuToggle = document.querySelector('.menu-toggle');
    const navbar     = document.querySelector('.navbar');

    if (menuToggle && navbar) {
        menuToggle.addEventListener('click', () => {
            const expanded = navbar.classList.toggle('is-active');
            menuToggle.setAttribute('aria-expanded', expanded);
        });
        document.querySelectorAll('.navbar a').forEach(link => {
            link.addEventListener('click', () => {
                navbar.classList.remove('is-active');
                menuToggle.setAttribute('aria-expanded', 'false');
            });
        });
        document.addEventListener('click', e => {
            if (!navbar.contains(e.target) && !menuToggle.contains(e.target)) {
                navbar.classList.remove('is-active');
                menuToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }


    // ----------------------------------------
    // 2. CONTACT FORM
    // ----------------------------------------
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        const feedback      = contactForm.querySelector('.form-feedback');
        const validateEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

        contactForm.addEventListener('submit', e => {
            e.preventDefault();
            const f_name  = contactForm.querySelector('input[name="name"]');
            const f_email = contactForm.querySelector('input[name="email"]');
            const f_msg   = contactForm.querySelector('textarea[name="message"]');
            [f_name, f_email, f_msg].forEach(f => f.classList.remove('error'));
            feedback.className = 'form-feedback';
            feedback.textContent = '';

            let ok = true;
            if (!f_name.value.trim())                                     { f_name.classList.add('error');  ok = false; }
            if (!f_email.value.trim() || !validateEmail(f_email.value.trim())) { f_email.classList.add('error'); ok = false; }
            if (!f_msg.value.trim())                                      { f_msg.classList.add('error');   ok = false; }
            if (!ok) {
                feedback.textContent = 'Please fill out all fields correctly.';
                feedback.className = 'form-feedback error';
                return;
            }

            const btn = contactForm.querySelector('button[type="submit"]');
            btn.disabled = true;
            btn.textContent = 'Sending…';
            setTimeout(() => {
                feedback.textContent = "Message sent! I'll get back to you shortly.";
                feedback.className = 'form-feedback success';
                contactForm.reset();
                btn.disabled = false;
                btn.textContent = 'Send Message';
            }, 1000);
        });

        contactForm.querySelectorAll('input, textarea').forEach(f =>
            f.addEventListener('input', () => f.classList.remove('error'))
        );
    }


    // ----------------------------------------
    // 3. TYPEWRITER
    // ----------------------------------------
    const twEl     = document.getElementById('typewriter');
    const cursorEl = document.querySelector('.cursor');

    if (twEl) {
        const phrases = [
            'I do stuff.',
            'I code.',
            'I build.',
            'I learn.',
            'I code websites.',
            'I run businesses.',
            'I do graphics.',
            'I make games.',
        ];

        const rand = (a, b) => Math.random() * (b - a) + a;

        let phraseIndex = 0;
        let charIndex   = 0;
        let isDeleting  = false;

        function typeWriter() {
            const phrase = phrases[phraseIndex];
            const ch     = phrase.charAt(charIndex);

            if (cursorEl) cursorEl.classList.add('typing');

            if (!isDeleting) {
                // Add next character using charAt — same approach as the reference
                twEl.innerHTML += ch;
                charIndex++;

                if (charIndex === phrase.length) {
                    // Finished typing — pause, then switch to deleting
                    if (cursorEl) cursorEl.classList.remove('typing');
                    isDeleting = true;
                    setTimeout(typeWriter, rand(1400, 2400));
                    return;
                }

                let delay = rand(60, 140);
                if (Math.random() < 0.08) delay += rand(200, 500); // occasional hesitation
                setTimeout(typeWriter, delay);

            } else {
                // Delete one character by slicing innerHTML
                twEl.innerHTML = phrase.substring(0, charIndex - 1);
                charIndex--;

                if (charIndex === 0) {
                    // Finished deleting — move to next phrase
                    if (cursorEl) cursorEl.classList.remove('typing');
                    isDeleting  = false;
                    phraseIndex = (phraseIndex + 1) % phrases.length;
                    setTimeout(typeWriter, rand(300, 600));
                    return;
                }

                let delay = rand(40, 85);
                if (Math.random() < 0.05) delay += rand(150, 350); // occasional stumble
                setTimeout(typeWriter, delay);
            }
        }

        // Kick off after short initial delay
        setTimeout(typeWriter, 800);
    }


    // ----------------------------------------
    // 4. HERO ZAP GRID + HOVER / CLICK EFFECTS
    // ----------------------------------------
    const zapGrid     = document.getElementById('zapGrid');
    const glowCanvas  = document.getElementById('heroGlow');
    const heroMouse   = document.getElementById('heroMouse');
    const heroSection = document.querySelector('.hero-section');

    if (zapGrid && glowCanvas && heroMouse && heroSection) {

        const LETTERS      = ['Z', 'A', 'P'];
        const LETTER_GAP   = 0.05;
        const GROUP_GAP    = 0.15;
        const HOVER_RADIUS = 200;

        let spanData = [];
        let ctx      = null;
        let ripples  = [];
        let rafId    = null;
        let hoverPos = null;

        function resizeCanvas() {
            glowCanvas.width  = heroSection.offsetWidth;
            glowCanvas.height = heroSection.offsetHeight;
            ctx = glowCanvas.getContext('2d');
        }

        // Measure a string using the same font as .hero-zap span
        function measureSpan(text) {
            const el = document.createElement('span');
            el.textContent = text;
            // Position off-screen but still in DOM so font applies
            el.style.cssText = 'position:fixed;top:-9999px;left:-9999px;visibility:hidden;white-space:nowrap;';
            // Mirror font properties from .hero-zap span
            el.style.fontFamily = getComputedStyle(document.documentElement).getPropertyValue('--font-heading').trim() || "'Trajan Supreme',serif";
            el.style.fontSize   = 'clamp(5rem, 11vw, 9rem)';
            el.style.fontWeight = '700';
            el.style.fontStyle  = 'italic';
            el.style.lineHeight = '1';
            document.body.appendChild(el);
            const w = el.offsetWidth;
            const h = el.offsetHeight;
            document.body.removeChild(el);
            return { w, h };
        }

        function buildGrid() {
            zapGrid.querySelectorAll('span').forEach(s => s.remove());
            spanData = [];
            resizeCanvas();

            const W = heroSection.offsetWidth;
            const H = heroSection.offsetHeight;

            const { w: wW, h: rowH } = measureSpan('W');
            if (!wW || !rowH) return;

            // Font size from actual rendered height is more reliable
            // Use the W glyph offsetWidth as proxy for em unit
            // Actually measure font-size from a span directly
            const fszProbe = document.createElement('span');
            fszProbe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;visibility:hidden;font-family:\'Trajan Supreme\',serif;font-size:clamp(5rem,11vw,9rem);font-weight:700;font-style:italic;line-height:1;';
            document.body.appendChild(fszProbe);
            const fsz = parseFloat(getComputedStyle(fszProbe).fontSize);
            document.body.removeChild(fszProbe);

            const widths = {};
            LETTERS.forEach(l => { widths[l] = measureSpan(l).w; });

            const rows     = Math.ceil(H / rowH) + 1;
            const fragment = document.createDocumentFragment();

            for (let row = 0; row < rows; row++) {
                const y       = row * rowH;
                const offsetX = (row % 2 === 1) ? fsz * 0.6 : 0;
                let x = offsetX - fsz * 0.5;
                let li = 0;

                while (x < W + fsz) {
                    const letter = LETTERS[li % LETTERS.length];
                    const lw     = widths[letter];
                    const span   = document.createElement('span');
                    span.textContent = letter;
                    span.style.left  = x + 'px';
                    span.style.top   = y + 'px';
                    fragment.appendChild(span);
                    spanData.push({ el: span, cx: x + lw / 2, cy: y + rowH / 2 });
                    x += lw + (li % 3 === 2 ? fsz * GROUP_GAP : fsz * LETTER_GAP);
                    li++;
                }
            }

            zapGrid.appendChild(fragment);

            // Recalculate centres from real rendered rects
            const hr = heroSection.getBoundingClientRect();
            spanData.forEach(d => {
                const r = d.el.getBoundingClientRect();
                d.cx = r.left - hr.left + r.width  / 2;
                d.cy = r.top  - hr.top  + r.height / 2;
            });
        }

        function setLetterDefault(el) {
            el.style.color = 'transparent';
            el.style.setProperty('-webkit-text-stroke-color', 'rgba(41,41,41,0.22)');
        }

        function frame(now) {
            if (!ctx) return;
            const W = glowCanvas.width, H = glowCanvas.height;
            ctx.clearRect(0, 0, W, H);
            ripples = ripples.filter(r => now - r.t < r.dur);

            if (hoverPos) {
                const g = ctx.createRadialGradient(hoverPos.x, hoverPos.y, 0, hoverPos.x, hoverPos.y, HOVER_RADIUS);
                g.addColorStop(0,   'rgba(29,211,176,0.18)');
                g.addColorStop(0.5, 'rgba(29,211,176,0.07)');
                g.addColorStop(1,   'rgba(29,211,176,0)');
                ctx.fillStyle = g;
                ctx.fillRect(0, 0, W, H);
            }

            ripples.forEach(r => {
                const p  = (now - r.t) / r.dur;
                const e  = p < 0.5 ? 2*p*p : 1 - Math.pow(-2*p+2,2)/2;
                const op = Math.sin(p * Math.PI);
                const g  = ctx.createRadialGradient(r.x, r.y, 0, r.x, r.y, e * r.maxR);
                g.addColorStop(0,   `rgba(29,211,176,${(op*0.22).toFixed(3)})`);
                g.addColorStop(0.6, `rgba(29,211,176,${(op*0.09).toFixed(3)})`);
                g.addColorStop(1,   'rgba(29,211,176,0)');
                ctx.fillStyle = g;
                ctx.fillRect(0, 0, W, H);
            });

            spanData.forEach(({ el, cx, cy }) => {
                let fill = 0, stroke = 0;

                if (hoverPos) {
                    const d = Math.hypot(cx - hoverPos.x, cy - hoverPos.y);
                    if (d < HOVER_RADIUS) {
                        const t = 1 - d / HOVER_RADIUS;
                        fill   = Math.max(fill,   t * t * 0.15);
                        stroke = Math.max(stroke, t * 0.28);
                    }
                }

                ripples.forEach(r => {
                    const p   = (now - r.t) / r.dur;
                    const e   = p < 0.5 ? 2*p*p : 1 - Math.pow(-2*p+2,2)/2;
                    const beh = e * r.maxR - Math.hypot(cx - r.x, cy - r.y);
                    const bw  = r.maxR * 0.3;
                    if (beh > 0 && beh < bw) {
                        const s = (1 - beh/bw) * Math.sin(p * Math.PI);
                        fill   = Math.max(fill,   s * 0.25);
                        stroke = Math.max(stroke, s * 0.38);
                    }
                });

                if (fill > 0.002 || stroke > 0.002) {
                    el.style.color = `rgba(29,211,176,${fill.toFixed(3)})`;
                    el.style.setProperty('-webkit-text-stroke-color', `rgba(29,211,176,${(0.22+stroke).toFixed(3)})`);
                } else {
                    setLetterDefault(el);
                }
            });

            rafId = (ripples.length || hoverPos) ? requestAnimationFrame(frame) : null;
        }

        function startLoop() { if (!rafId) rafId = requestAnimationFrame(frame); }

        function stopGlow() {
            hoverPos = null;
            if (!ripples.length) {
                if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
                ctx && ctx.clearRect(0, 0, glowCanvas.width, glowCanvas.height);
                spanData.forEach(({ el }) => setLetterDefault(el));
            }
        }

        (document.fonts ? document.fonts.ready : Promise.resolve()).then(buildGrid);

        heroMouse.addEventListener('mousemove', e => {
            const r  = heroSection.getBoundingClientRect();
            hoverPos = { x: e.clientX - r.left, y: e.clientY - r.top };
            startLoop();
        });
        heroMouse.addEventListener('mouseleave', stopGlow);
        heroMouse.addEventListener('click', e => {
            const r = heroSection.getBoundingClientRect();
            ripples.push({ x: e.clientX - r.left, y: e.clientY - r.top, t: performance.now(), dur: 1400, maxR: Math.hypot(heroSection.offsetWidth, heroSection.offsetHeight) });
            startLoop();
        });

        let rto;
        window.addEventListener('resize', () => { clearTimeout(rto); rto = setTimeout(buildGrid, 150); });
    }


    // ----------------------------------------
    // 5. SCROLL ANIMATIONS
    // ----------------------------------------
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const obs = new IntersectionObserver((entries, o) => {
            entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('visible'); o.unobserve(en.target); } });
        }, { threshold: 0.15 });
        document.querySelectorAll('.section').forEach(s => obs.observe(s));
    } else {
        document.querySelectorAll('.section').forEach(s => s.classList.add('visible'));
    }

});