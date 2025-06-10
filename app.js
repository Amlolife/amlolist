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
// Inside app.js, within the DOMContentLoaded listener

// --- Wedding Day Shot List Logic ---
const weddingCheckboxes = document.querySelectorAll('#page-wedding-day input[type="checkbox"]');
const weddingShotListName = 'weddingShots';

// Load saved checkbox states
function loadWeddingShots() {
    const savedShots = JSON.parse(localStorage.getItem(weddingShotListName)) || {};
    weddingCheckboxes.forEach(checkbox => {
        const id = checkbox.nextElementSibling.textContent; // Use text as a unique ID
        if (savedShots[id]) {
            checkbox.checked = true;
        }
    });
}

// Save checkbox states when changed
function saveWeddingShots() {
    const shotStates = {};
    weddingCheckboxes.forEach(checkbox => {
        const id = checkbox.nextElementSibling.textContent;
        shotStates[id] = checkbox.checked;
    });
    localStorage.setItem(weddingShotListName, JSON.stringify(shotStates));
}

weddingCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', saveWeddingShots);
});


// --- Family & Group Portraits Logic ---
const addShotButton = document.querySelector('#page-family-portraits button');
const shotListContainer = document.querySelector('#page-family-portraits h3').nextElementSibling;
const familyShotListName = 'familyShots';

// Function to render a single shot item
function renderFamilyShot(shot) {
    // This function will create the HTML for a new shot item
    // and append it to the shotListContainer.
    // (Detailed implementation would build the div structure from your design)
}

// Load and render existing family shots
function loadFamilyShots() {
    const savedShots = JSON.parse(localStorage.getItem(familyShotListName)) || [
        // Default shots can go here
    ];
    shotListContainer.innerHTML = ''; // Clear existing list
    savedShots.forEach(renderFamilyShot);
}

addShotButton.addEventListener('click', () => {
    const shotName = prompt("Enter shot name:", "Bride & Groom with Entire Wedding Party");
    if (shotName) {
        const newShot = { name: shotName, description: shotName };
        const savedShots = JSON.parse(localStorage.getItem(familyShotListName)) || [];
        savedShots.push(newShot);
        localStorage.setItem(familyShotListName, JSON.stringify(savedShots));
        renderFamilyShot(newShot); // Add to the view instantly
    }
});


// Initial Load
loadWeddingShots();
loadFamilyShots();
    // Set initial page
    showPage('page-dashboard'); 
});
