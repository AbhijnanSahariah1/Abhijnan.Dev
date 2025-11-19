// portfolio1.js
// Handles mobile menu, fade-ins, and small hero animations

document.addEventListener('DOMContentLoaded', () => {
    // Grab what we need once
    const menuBtn = document.getElementById('menu-toggle');
    const overlay = document.getElementById('mobile-menu-overlay');
    const closeBtn = overlay?.querySelector('.close-btn');
    const navLinks = overlay?.querySelectorAll('a');
    const sections = document.querySelectorAll('.section');

    // Mobile menu handlers
    const openMenu = () => {
        if (!overlay) return;
        overlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    };

    const closeMenu = () => {
        if (!overlay) return;
        overlay.style.display = 'none';
        document.body.style.overflow = '';
    };

    // Toggle events
    menuBtn?.addEventListener('click', openMenu);
    closeBtn?.addEventListener('click', closeMenu);

    navLinks?.forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    // Simple intersection reveal
    const reveal = new IntersectionObserver((entries, obs) => {
        entries.forEach(item => {
            if (item.isIntersecting) {
                item.target.classList.add('visible');
                obs.unobserve(item.target);
            }
        });
    }, { threshold: 0.1 });

    sections.forEach(sec => reveal.observe(sec));

    // Soft fade-in for hero elements
    const fadeItems = document.querySelectorAll('.fade-in');

    fadeItems.forEach((el, i) => {
        el.style.opacity = 0;
        el.style.transform = 'translateY(10px)';

        setTimeout(() => {
            el.style.transition = 'opacity .8s ease-out, transform .8s ease-out';
            el.style.opacity = 1;
            el.style.transform = 'translateY(0)';
        }, 500 + i * 200);
    });
});
