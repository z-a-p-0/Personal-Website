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

        // Close menu when a nav link is clicked
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navbar.classList.remove('is-active');
                menuToggle.setAttribute('aria-expanded', 'false');
            });
        });

        // Close menu when clicking outside
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

            // Clear previous error states
            [nameInput, emailInput, messageInput].forEach(f => f.classList.remove('error'));
            feedback.className = 'form-feedback';
            feedback.textContent = '';

            let valid = true;

            if (!nameInput.value.trim()) {
                nameInput.classList.add('error');
                valid = false;
            }

            if (!emailInput.value.trim() || !validateEmail(emailInput.value.trim())) {
                emailInput.classList.add('error');
                valid = false;
            }

            if (!messageInput.value.trim()) {
                messageInput.classList.add('error');
                valid = false;
            }

            if (!valid) {
                showFeedback('Please fill out all fields correctly.', 'error');
                return;
            }

            // Success — swap button state while "sending"
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending…';

            // Simulate async submission (replace with fetch() in production)
            setTimeout(() => {
                showFeedback('Message sent! I\'ll get back to you shortly.', 'success');
                contactForm.reset();
                submitBtn.disabled = false;
                submitBtn.textContent = 'Send Message';
            }, 1000);
        });

        // Clear error highlight on input
        contactForm.querySelectorAll('input, textarea').forEach(field => {
            field.addEventListener('input', () => clearFieldError(field));
        });
    }


    // ----------------------------------------
    // 3. SCROLL ANIMATION (Intersection Observer)
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
        // Immediately show all sections if reduced motion is preferred
        document.querySelectorAll('.section').forEach(s => s.classList.add('visible'));
    }

});