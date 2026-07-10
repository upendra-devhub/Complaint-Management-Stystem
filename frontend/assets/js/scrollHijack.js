(function () {
    "use strict";

    function initScrollHijack() {
        var horizontalSection = document.querySelector(".horizontal-charts");
        var scrollContainer = document.querySelector(".page-content");

        if (!horizontalSection || !scrollContainer) return;

        scrollContainer.addEventListener("wheel", function (e) {
            // Get the bounding rect of the horizontal section relative to the scroll container
            var rect = horizontalSection.getBoundingClientRect();
            var containerRect = scrollContainer.getBoundingClientRect();

            // Check if the horizontal section is currently in view
            var sectionTop = rect.top - containerRect.top;
            var sectionBottom = rect.bottom - containerRect.top;
            var containerHeight = containerRect.height;

            // The section is "in view" when it's roughly centered/visible
            var isInView = sectionTop < containerHeight * 0.7 && sectionBottom > containerHeight * 0.3;

            if (!isInView) return;

            var maxScrollLeft = horizontalSection.scrollWidth - horizontalSection.clientWidth;

            // If there's nothing to scroll horizontally, don't hijack
            if (maxScrollLeft <= 5) return;

            var currentScroll = horizontalSection.scrollLeft;
            var scrollingDown = e.deltaY > 0;
            var scrollingUp = e.deltaY < 0;

            // If scrolling down and haven't reached the end of horizontal scroll
            if (scrollingDown && currentScroll < maxScrollLeft - 5) {
                e.preventDefault();
                horizontalSection.scrollBy({
                    left: e.deltaY * 2.5,
                    behavior: "smooth"
                });
                return;
            }

            // If scrolling up and haven't reached the start of horizontal scroll
            if (scrollingUp && currentScroll > 5) {
                e.preventDefault();
                horizontalSection.scrollBy({
                    left: e.deltaY * 2.5,
                    behavior: "smooth"
                });
                return;
            }

            // Otherwise, let normal vertical scroll happen
        }, { passive: false });
    }

    // Initialize after DOM is ready
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initScrollHijack);
    } else {
        initScrollHijack();
    }
})();
