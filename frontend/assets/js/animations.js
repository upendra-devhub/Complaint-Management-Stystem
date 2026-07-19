(function () {
    "use strict";
    
    function initAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -30px 0px'
        });

        document.querySelectorAll('.reveal').forEach((el) => {
            // Apply staggered delays for grid items if they share a parent
            if (el.parentElement) {
                const siblings = Array.from(el.parentElement.children).filter(child => child.classList.contains('reveal'));
                if (siblings.length > 1) {
                    const index = siblings.indexOf(el);
                    // Max delay of 800ms to prevent extreme delays on large grids
                    const delay = Math.min(index * 80, 800);
                    el.style.transitionDelay = `${delay}ms`;
                }
            }
            observer.observe(el);
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initAnimations);
    } else {
        initAnimations();
    }
    
    // Export so we can re-init when dynamically rendering lists
    window.CMS = window.CMS || {};
    window.CMS.animations = {
        init: initAnimations
    };
})();
