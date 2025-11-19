document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Mobile Menu Toggle Logic ---
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
    const closeBtn = mobileMenuOverlay.querySelector('.close-btn');
    const mobileNavLinks = mobileMenuOverlay.querySelectorAll('a');

    /**
     * Toggles the visibility of the mobile menu overlay.
     */
    function toggleMenu() {
        // Toggle display style between 'none' and 'flex'
        const isHidden = mobileMenuOverlay.style.display === 'none' || mobileMenuOverlay.style.display === '';
        mobileMenuOverlay.style.display = isHidden ? 'flex' : 'none';
        
        // Prevent body scrolling when the menu is open
        document.body.style.overflow = isHidden ? 'hidden' : 'auto';
    }

    menuToggle.addEventListener('click', toggleMenu);
    closeBtn.addEventListener('click', toggleMenu);

    // Close menu when a link is clicked (mobile navigation)
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', toggleMenu);
    });

    // --- 2. Section Visibility on Scroll (Fade-in effect) ---
    // This provides the smooth, staggered loading of the expertise and project sections.
    const sections = document.querySelectorAll('.section');

    // Set up Intersection Observer options
    const observerOptions = {
        root: null, // relative to the viewport
        rootMargin: '0px',
        // Trigger when 20% of the section is visible
        threshold: 0.2 
    };

    /**
     * Callback function for the Intersection Observer.
     * Adds the 'visible' class to sections as they enter the viewport.
     */
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add the 'visible' class to start the CSS transition
                entry.target.classList.add('visible');
                // Stop observing once visible to optimize performance
                observer.unobserve(entry.target); 
            }
        });
    }, observerOptions);

    // Start observing all sections
    sections.forEach(section => {
        observer.observe(section);
    });
});
