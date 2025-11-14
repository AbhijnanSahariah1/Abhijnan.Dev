document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Hero Animations (Initial load fade-in) ---
    const heroText = document.querySelector('.hero-text');
    const profileArea = document.querySelector('.profile-area');

    setTimeout(() => {
        heroText.classList.add('animate-in');
        profileArea.classList.add('animate-slide-in');
    }, 100);


    // --- 2. Mobile Menu Toggle ---
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const closeBtn = document.querySelector('.close-btn');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    const toggleMenu = () => {
        mobileMenu.classList.toggle('is-active');
        document.body.style.overflow = mobileMenu.classList.contains('is-active') ? 'hidden' : 'auto';
    };

    menuToggle.addEventListener('click', toggleMenu);
    closeBtn.addEventListener('click', toggleMenu);
    
    mobileLinks.forEach(link => {
        link.addEventListener('click', toggleMenu);
    });


    // --- 3. Smooth Scroll for Navigation ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            if (this.getAttribute('href').length > 1) { 
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);

                if (targetElement) {
                    const headerHeight = document.querySelector('.main-header').offsetHeight;
                    const offsetPosition = targetElement.offsetTop - headerHeight;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });


    // --- 4. Scroll Reveal Animations ---
    const revealElements = document.querySelectorAll('.reveal-item');

    const handleScrollReveal = () => {
        const triggerBottom = window.innerHeight * 0.8; 

        revealElements.forEach(el => {
            const elementTop = el.getBoundingClientRect().top;
            
            if (elementTop < triggerBottom) {
                // Remove existing classes first to ensure the new transition is applied correctly
                el.classList.remove('fade-in-up', 'slide-in-right'); 
                
                el.classList.add('animate-in');
            } 
        });
    };

    handleScrollReveal();
    window.addEventListener('scroll', handleScrollReveal);


    // --- 5. Form Validation ---
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');

    const validateForm = (event) => {
        event.preventDefault(); 

        let isValid = true;
        
        const validateInput = (input, errorElement, validationFn, errorMessage) => {
            const value = input.value.trim();
            const errorDiv = document.getElementById(errorElement);
            
            if (!validationFn(value)) {
                errorDiv.textContent = errorMessage;
                input.style.borderColor = '#ff6e40'; // Use accent color for error
                isValid = false;
            } else {
                errorDiv.textContent = '';
                input.style.borderColor = '#ddd'; 
            }
        };

        // Name Validation
        validateInput(
            document.getElementById('name'),
            'name-error',
            (val) => val.length >= 2,
            'Please enter a name (at least 2 characters).'
        );

        // Email Validation (basic regex check)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        validateInput(
            document.getElementById('email'),
            'email-error',
            (val) => emailRegex.test(val),
            'Please enter a valid email address.'
        );

        // Message Validation
        validateInput(
            document.getElementById('message'),
            'message-error',
            (val) => val.length >= 10,
            'Message is too short (min 10 characters).'
        );


        if (isValid) {
            formStatus.textContent = 'Message sent successfully! (Validation passed)';
            formStatus.style.color = '#00bcd4'; 
            contactForm.reset(); 
        } else {
            formStatus.textContent = 'Please fix the errors above.';
            formStatus.style.color = '#ff6e40';
        }
    };

    contactForm.addEventListener('submit', validateForm);


    // --- 6. Dark Mode Logic ---
    const toggleButton = document.querySelector('.theme-toggle');
    const body = document.body;

    const currentTheme = localStorage.getItem('theme');
    const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (currentTheme === 'dark' || (!currentTheme && systemPreference)) {
        body.classList.add('dark-mode');
        if (toggleButton) {
            toggleButton.querySelector('i').className = 'fas fa-moon';
        }
    } else {
        if (toggleButton) {
            toggleButton.querySelector('i').className = 'fas fa-sun';
        }
    }

    const toggleTheme = () => {
        const isDark = body.classList.toggle('dark-mode');
        
        if (isDark) {
            localStorage.setItem('theme', 'dark');
            toggleButton.querySelector('i').className = 'fas fa-moon';
        } else {
            localStorage.setItem('theme', 'light');
            toggleButton.querySelector('i').className = 'fas fa-sun';
        }
    };

    if (toggleButton) {
        toggleButton.addEventListener('click', toggleTheme);
    }
    
    // --- 7. Active Navigation Highlighting on Scroll ---
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a');

    const highlightActiveLink = () => {
        let current = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100; 
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


    // --- 8. Header Intersection Observer ---
    const mainHeader = document.querySelector('.main-header');
    const heroSection = document.getElementById('hero');

    const observer = new IntersectionObserver((entries) => {
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
        observer.observe(heroSection);
    }
});