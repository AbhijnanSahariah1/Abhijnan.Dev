// portfolio1.js
// basic menu + section reveal + small hero fade stuff

document.addEventListener("DOMContentLoaded", () => {
    const menuBtn = document.querySelector("#menu-toggle");
    const overlay = document.querySelector("#mobile-menu-overlay");
    const closeBtn = overlay ? overlay.querySelector(".close-btn") : null;
    const links = overlay ? overlay.querySelectorAll("a") : [];
    const allSections = document.querySelectorAll(".section");

    // just show the menu
    const showMenu = () => {
        if (!overlay) return;
        overlay.style.display = "flex";
        document.body.style.overflow = "hidden";
    };

    // hide menu
    const hideMenu = () => {
        if (!overlay) return;
        overlay.style.display = "none";
        document.body.style.overflow = "";
    };

    // events
    if (menuBtn) {
        menuBtn.addEventListener("click", showMenu);
    }
    if (closeBtn) {
        closeBtn.addEventListener("click", hideMenu);
    }

    links.forEach(l => {
        l.addEventListener("click", hideMenu);
    });

    // reveal on scroll
    const watcher = new IntersectionObserver((items, obs) => {
        items.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                obs.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12
    });

    allSections.forEach(sec => watcher.observe(sec));

    // small fade-in on hero bits
    const fadeStuff = document.querySelectorAll(".fade-in");

    fadeStuff.forEach((el, index) => {
        el.style.opacity = 0;
        el.style.transform = "translateY(12px)";

        setTimeout(() => {
            el.style.transition = "opacity .7s ease-out, transform .7s ease-out";
            el.style.opacity = 1;
            el.style.transform = "translateY(0)";
        }, 400 + index * 180);
    });
});
