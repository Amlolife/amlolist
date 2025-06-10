// This event listener ensures that the code runs only after the entire
// HTML document has been loaded and parsed.
document.addEventListener('DOMContentLoaded', () => {
    console.log("Document loaded. App is starting.");

    // ===================================================================
    // 1. NAVIGATION LOGIC
    // ===================================================================
    const navLinks = document.querySelectorAll('[data-target]');
    const pages = document.querySelectorAll('.page');

    function showPage(targetId) {
        console.log(`Navigating to: ${targetId}`);
        pages.forEach(page => {
            if (page.id === targetId) {
                page.classList.remove('hidden');
            } else {
                page.classList.add('hidden');
            }
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault(); // Stop the link from trying to refresh the page
            const targetPageId = link.dataset.target; // Use dataset for cleaner access
            showPage(targetPageId);
        });
    });

    // ===================================================================
    // 2. WEDDING DAY CHECKLIST INTERACTIVITY
    // ===================================================================
    const weddingChecklist = document.querySelector('#wedding-checklist');
    const weddingStorageKey = 'weddingChecklistState';

    // Save the state of all checkboxes to Local Storage
    function saveWeddingChecklistState() {
        const checkboxes = weddingChecklist.querySelectorAll('input[type="checkbox"]');
        const state = {};
        checkboxes.forEach(checkbox => {
            // Use the checkbox's adjacent text as a unique key
            const key = checkbox.nextElementSibling.textContent;
            state[key] = checkbox.checked;
        });
        localStorage.setItem(weddingStorageKey, JSON.stringify(state));
        console.log("Wedding checklist state saved.");
    }

    // Load the state from Local Storage and apply it to the checkboxes
    function loadWeddingChecklistState() {
        const state = JSON.parse(localStorage.getItem(weddingStorageKey));
        if (!state) {
            console.log("No saved wedding checklist state found.");
            return;
        }
        const checkboxes = weddingChecklist.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            const key = checkbox.nextElementSibling.textContent;
            if (state[key] !== undefined) {
                checkbox.checked = state[key];
            }
        });
        console.log("Wedding checklist state loaded.");
    }

    // Add a single event listener to the parent container for efficiency
    if (weddingChecklist) {
        weddingChecklist.addEventListener('change', (event) => {
            if (event.target.type === 'checkbox') {
                saveWeddingChecklistState();
            }
        });
    }

    // ===================================================================
    // 3. FAMILY & GROUP PORTRAIT LIST INTERACTIVITY
    // ===================================================================
    const familyListContainer = document.querySelector('#family-shot-list-container');
    const addFamilyShotButton = document.querySelector('#add-family-shot-button');
    const familyListStorageKey = 'familyShotList';
    
    // Default list if nothing is saved in local storage
    const defaultFamilyShots = [
        { name: "Bride & Groom with Bride's Parents", description: "Bride & Groom with Bride's Parents" },
        { name: "Bride & Groom with Groom's Parents", description: "Bride & Groom with Groom's Parents" },
        { name: "Bride & Groom with Both Sets of Parents", description: "Bride & Groom with Both Sets of Parents" },
        { name: "Bride & Groom with Entire Family", description: "Bride & Groom with Entire Family" },
    ];

    // Function to get the list from storage or use the default
    function getFamilyShots() {
        const saved = localStorage.getItem(familyListStorageKey);
        return saved ? JSON.parse(saved) : defaultFamilyShots;
    }
    
    // Function to save the list to storage
    function saveFamilyShots(shots) {
        localStorage.setItem(familyListStorageKey, JSON.stringify(shots));
    }
    
    // Renders the entire list of shots to the DOM
    function renderFamilyShots() {
        if (!familyListContainer) return;

        const shots = getFamilyShots();
        familyListContainer.innerHTML = ''; // Clear the list before rendering

        if (shots.length === 0) {
            familyListContainer.innerHTML = `<p class="text-[#adadad] text-center px-4 py-8">No shots added yet. Click "Add Shot" to begin.</p>`;
        } else {
            shots.forEach(shot => {
                const shotElementHTML = `
                <div class="flex items-center gap-4 bg-[#1a1a1a] px-4 min-h-[72px] py-2 justify-between">
                    <div class="flex items-center gap-4 overflow-hidden">
                        <div class="text-white flex items-center justify-center rounded-lg bg-[#363636] shrink-0 size-12">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256"><path d="M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128ZM40,72H216a8,8,0,0,0,0-16H40a8,8,0,0,0,0,16ZM216,184H40a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16Z"></path></svg>
                        </div>
                        <div class="flex flex-col justify-center overflow-hidden">
                            <p class="text-white text-base font-medium leading-normal truncate">${shot.name}</p>
                            <p class="text-[#adadad] text-sm font-normal leading-normal truncate">${shot.description}</p>
                        </div>
                    </div>
                    <div class="shrink-0">
                        <button class="delete-shot-button text-red-500 hover:text-red-400" data-shot-name="${shot.name}">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256"><path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192Z"></path></svg>
                        </button>
                    </div>
                </div>
                `;
                familyListContainer.insertAdjacentHTML('beforeend', shotElementHTML);
            });
        }
    }

    // Event listener for the "Add Shot" button
    if (addFamilyShotButton) {
        addFamilyShotButton.addEventListener('click', () => {
            const shotName = prompt("Enter the name for the new shot:");
            if (shotName && shotName.trim() !== '') {
                const shots = getFamilyShots();
                shots.push({ name: shotName, description: shotName });
                saveFamilyShots(shots);
                renderFamilyShots();
            }
        });
    }
    
    // Event listener for deleting shots (using event delegation)
    if (familyListContainer) {
        familyListContainer.addEventListener('click', (event) => {
            const deleteButton = event.target.closest('.delete-shot-button');
            if (deleteButton) {
                const shotNameToDelete = deleteButton.dataset.shotName;
                if (confirm(`Are you sure you want to delete the shot: "${shotNameToDelete}"?`)) {
                    let shots = getFamilyShots();
                    shots = shots.filter(shot => shot.name !== shotNameToDelete);
                    saveFamilyShots(shots);
                    renderFamilyShots();
                }
            }
        });
    }

    // ===================================================================
    // 4. INITIAL APP LOAD
    // ===================================================================
    loadWeddingChecklistState();
    renderFamilyShots();
});
