// ============================================
// JAVASCRIPT CORE LOGIC FOR YOUR PORTFOLIO
// ============================================


document.addEventListener('DOMContentLoaded', () => {
    console.log("Site loaded! Starting interactivity scripts...");
    
    // --- 1. MOBILE MENU TOGGLE LOGIC ---
    const menuToggle = document.querySelector('.menu-toggle');
    const navbar = document.querySelector('.navbar');

    if (menuToggle && navbar) {
        menuToggle.addEventListener('click', () => {
            // Toggles the 'is-active' class, which CSS uses to show/hide the menu
            console.log("Menu toggle clicked - Toggling navigation visibility.");
            navbar.classList.toggle('is-active');

            // Optional: Change aria attributes for accessibility
            const isExpanded = navbar.classList.contains('is-active');
            menuToggle.setAttribute('aria-expanded', isExpanded);
        });
    }


    // --- 2. FORM VALIDATION LOGIC ---
    const contactForm = document.querySelector('.contact-form');

    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault(); 
            
            const emailInput = this.querySelector('input[type="email"]');
            const nameInput = this.querySelector('input[type="text"]');
            const messageTextarea = this.querySelector('textarea');

            // Basic Validation Check
            if (!nameInput.value || !emailInput.value || !messageTextarea.value) {
                alert("Please fill out all fields to send a message.");
                return; 
            }
            
            // Simulate successful submission (In a real app, you'd use fetch/AJAX here)
            console.log("Attempting to submit contact form...");

            // VISUAL FEEDBACK FOR USER: Clear the form and give success feedback
            alert("✅ Message Sent Successfully! I will get back to you shortly.");
            this.reset(); 
        });
    }


    // --- 3. SCROLL ANIMATIONS / STICKY HEADER LOGIC (Improvement Suggestion) ---

    /* Implementation using Intersection Observer for modern fade-in effects */
    const sections = document.querySelectorAll('section');
    const observerOptions = { root: null, threshold: 0.2 }; // Trigger when 20% of element is visible

    const sectionObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Adds a class that CSS can use to trigger an animation (e.g., fade-in)
                entry.target.classList.add('visible'); 
                observer.unobserve(entry.target); // Stop observing once it's animated in
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        // We will use CSS to style the 'not visible' state for these sections
        sectionObserver.observe(section);
    });

});