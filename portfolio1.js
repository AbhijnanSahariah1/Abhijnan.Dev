document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Hero Animations (Initial load fade-in) ---
    const heroText = document.querySelector('.hero-text');
    const profileArea = document.querySelector('.profile-area');

    setTimeout(() => {
        if(heroText) heroText.classList.add('animate-in');
        if(profileArea) profileArea.classList.add('animate-slide-in');
    }, 100);


    // --- 2. Mobile Menu Toggle (Updated for overlay structure) ---
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const closeBtn = document.querySelector('.close-btn');
    const mobileLinks = document.querySelectorAll('.mobile-link');
    
    const toggleMenu = () => {
        mobileMenu.classList.toggle('is-active');
        // Prevent background scrolling when menu is open
        document.body.style.overflow = mobileMenu.classList.contains('is-active') ? 'hidden' : 'auto';
    };

    if (menuToggle && mobileMenu && closeBtn) {
        menuToggle.addEventListener('click', toggleMenu);
        closeBtn.addEventListener('click', toggleMenu);
        
        // Close menu when a link is clicked
        mobileLinks.forEach(link => {
            link.addEventListener('click', toggleMenu);
        });
    }


    // --- 3. Smooth Scroll for Navigation ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            if (this.getAttribute('href').length > 1) { 
                e.preventDefault();
                const targetId = this.getAttribute('href').substring(1);
                document.getElementById(targetId).scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });


    // --- 4. Contact Form Validation and Submission ---
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');

    const validateEmail = (email) => {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    };

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;

            // Clear previous errors
            document.querySelectorAll('.error-message').forEach(el => el.textContent = '');

            let isValid = true;

            if (name.trim().length < 2) {
                document.getElementById('name-error').textContent = 'Please enter a valid name.';
                isValid = false;
            }

            if (!validateEmail(email)) {
                document.getElementById('email-error').textContent = 'Please enter a valid email address.';
                isValid = false;
            }

            if (message.trim().length < 10) {
                document.getElementById('message-error').textContent = 'Message must be at least 10 characters long.';
                isValid = false;
            }

            if (isValid) {
                // SUCCESS STATE: Replace with actual server submission in a real project
                formStatus.textContent = 'Message sent successfully! I will get back to you soon.';
                formStatus.style.color = '#00bcd4'; 
                contactForm.reset();
            } else {
                // ERROR STATE
                formStatus.textContent = 'Please correct the errors above.';
                formStatus.style.color = '#ff6e40'; 
            }
        });
    }


    // --- 5. Scroll Reveal Animation (Projects and Sections) ---
    const revealItems = document.querySelectorAll('.reveal-item');

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.2 // Trigger when 20% of item is visible
    };

    const scrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target); 
            }
        });
    }, observerOptions);

    revealItems.forEach(item => {
        scrollObserver.observe(item);
    });


    // --- 6. Dark Mode Toggle ---
    const toggleTheme = () => {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');

        const icon = isDarkMode ? 'moon' : 'sun';
        document.querySelectorAll('.theme-toggle i').forEach(i => {
            i.className = `fas fa-${icon}`;
        });
    };
    
    // Check local storage for theme preference
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
        document.querySelectorAll('.theme-toggle i').forEach(i => {
            i.className = 'fas fa-moon';
        });
    }
    
    document.querySelectorAll('.theme-toggle').forEach(toggleButton => {
        toggleButton.addEventListener('click', toggleTheme);
    });
    
    // --- 7. Active Navigation Highlighting on Scroll ---
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a');

    const highlightActiveLink = () => {
        let current = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120; // Offset for fixed header
            if (window.scrollY >= sectionTop) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });
    };

    highlightActiveLink();
    window.addEventListener('scroll', highlightActiveLink);


    // --- 8. Header Intersection Observer (Adds 'scrolled' class) ---
    const mainHeader = document.querySelector('.main-header');
    const heroSection = document.getElementById('hero');

    const headerObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                mainHeader.classList.add('scrolled');
            } else {
                mainHeader.classList.remove('scrolled');
            }
        });
    }, {
        root: null,
        threshold: 0.1 
    });

    if (heroSection) {
        headerObserver.observe(heroSection);
    }
});
