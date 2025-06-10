// app.js

document.addEventListener('DOMContentLoaded', () => {

    const pages = document.querySelectorAll('.page');
    const navLinks = document.querySelectorAll('[data-target]');

    // Function to switch pages
    function showPage(targetId) {
        pages.forEach(page => {
            if (page.id === targetId) {
                page.classList.remove('hidden');
            } else {
                page.classList.add('hidden');
            }
        });
    }

    // Add click listeners to all navigation elements
    navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent default link behavior
            const target = link.getAttribute('data-target');
            showPage(target);
        });
    });

    // Set initial page
    showPage('page-dashboard'); 
});
