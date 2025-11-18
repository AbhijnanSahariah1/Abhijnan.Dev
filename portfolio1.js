/*
 * portfolio1.js
 * Functionality for Mobile Menu, Scroll Reveal, and Hero Text Animation
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. DOM Elements ---
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
    const closeBtn = mobileMenuOverlay.querySelector('.close-btn');
    const mobileLinks = mobileMenuOverlay.querySelectorAll('a');
    const sections = document.querySelectorAll('.section');
    
    // --- 2. Mobile Menu Logic ---
    const openMobileMenu = () => {
        mobileMenuOverlay.style.display = 'flex';
        document.body.style.overflow = 'hidden'; 
    };

    const closeMobileMenu = () => {
        mobileMenuOverlay.style.display = 'none';
        document.body.style.overflow = '';
    };

    if (menuToggle) menuToggle.addEventListener('click', openMobileMenu);
    if (closeBtn) closeBtn.addEventListener('click', closeMobileMenu);
    
    mobileLinks.forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });

    // --- 3. Scroll Reveal (Fade In) ---
    const observerOptions = {
        root: null, 
        rootMargin: '0px',
        threshold: 0.1 
    };

    const observerCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); 
            }
        });
    };

    const sectionObserver = new IntersectionObserver(observerCallback, observerOptions);

    sections.forEach(section => {
        sectionObserver.observe(section);
    });

    // --- 4. Hero Fade-In Animation (Subtle cascaded entry) ---
    const fadeElements = document.querySelectorAll('.fade-in');
    fadeElements.forEach((el, index) => {
        el.style.opacity = 0; 
        el.style.transform = 'translateY(10px)'; // Start slightly lower
        
        setTimeout(() => {
            el.style.transition = `opacity 0.8s ease-out, transform 0.8s ease-out`;
            el.style.opacity = 1;
            el.style.transform = 'translateY(0)';
        }, 500 + (index * 200)); 
    });
});
