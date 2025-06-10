document.addEventListener('DOMContentLoaded', () => {
    console.log("Document loaded. App is starting.");

    // ===================================================================
    //  APP-WIDE STATE & SETUP
    // ===================================================================
    const appState = {
        settings: {
            isDarkMode: true,
        },
        currentProject: {
            category: "Wedding",
            title: "Sarah & Alex",
            date: "June 15, 2024",
            imageUrl: "https://images.unsplash.com/photo-1597158292833-2ab349342240?q=80&w=2070&auto=format&fit=crop"
        },
        weddingShots: [],
        familyShots: []
    };
    
    const pages = document.querySelectorAll('.page');
    const navLinks = document.querySelectorAll('[data-target]');

    // ===================================================================
    //  NAVIGATION
    // ===================================================================
    function showPage(targetId) {
        console.log(`Navigating to: ${targetId}`);
        pages.forEach(page => {
            page.classList.toggle('hidden', page.id !== targetId);
        });
        window.scrollTo(0, 0); // Scroll to top on page change
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const targetPageId = link.dataset.target;
            showPage(targetPageId);
        });
    });

    // ===================================================================
    //  DASHBOARD LOGIC
    // ===================================================================
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    const progressCounts = document.getElementById('progress-counts');
    const projectCard = document.getElementById('current-project-card');

    function updateProgressBar() {
        const shots = getWeddingShots();
        const totalShots = shots.length;
        const completedShots = shots.filter(shot => shot.checked).length;
        const percentage = totalShots > 0 ? Math.round((completedShots / totalShots) * 100) : 0;

        if(progressBar) progressBar.style.width = `${percentage}%`;
        if(progressText) progressText.querySelector('p').textContent = `${percentage}% Complete`;
        if(progressCounts) progressCounts.textContent = `${completedShots}/${totalShots} Shots`;
        console.log(`Progress updated: ${percentage}%`);
    }
    
    function renderDashboard() {
        const project = appState.currentProject;
        if(projectCard) {
            projectCard.innerHTML = `
                <div class="flex flex-col gap-1 flex-[2_2_0px]">
                    <p class="text-[#adadad] text-sm font-normal leading-normal">${project.category}</p>
                    <p class="text-white text-base font-bold leading-tight">${project.title}</p>
                    <p class="text-[#adadad] text-sm font-normal leading-normal">${project.date}</p>
                </div>
                <div class="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-xl flex-1" style='background-image: url("${project.imageUrl}");'></div>
            `;
        }
        updateProgressBar();
    }

    // ===================================================================
    //  SETTINGS PAGE LOGIC
    // ===================================================================
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const notificationsToggle = document.getElementById('notifications-toggle');

    function applyTheme() {
        if (!appState.settings.isDarkMode) {
            document.body.classList.add('light-mode');
            if(darkModeToggle) darkModeToggle.checked = false;
        } else {
            document.body.classList.remove('light-mode');
            if(darkModeToggle) darkModeToggle.checked = true;
        }
    }
    
    if(darkModeToggle) {
        darkModeToggle.addEventListener('change', () => {
            appState.settings.isDarkMode = darkModeToggle.checked;
            applyTheme();
            saveState();
        });
    }

    if(notificationsToggle) {
        notificationsToggle.addEventListener('change', () => {
            console.log("Notifications toggle clicked. This is a UI element only. State:", notificationsToggle.checked);
            alert("Notification settings would be handled by a server, this is a visual toggle only.");
        });
    }
    
    // ===================================================================
    //  WEDDING SHOT LIST LOGIC
    // ===================================================================
    const weddingListContainer = document.getElementById('wedding-checklist-container');
    const addWeddingShotButton = document.getElementById('add-wedding-shot-button');
    const defaultWeddingShots = [
        { text: 'Bride getting hair done', checked: false }, { text: 'Bride getting makeup done', checked: true }, { text: 'Bride putting on dress', checked: false },
        { text: 'Bride walking down the aisle', checked: false }, { text: 'Groom\'s reaction', checked: false }, { text: 'Exchange of vows', checked: false },
        { text: 'First dance', checked: false }, { text: 'Cutting the cake', checked: false }, { text: 'Speeches', checked: false }
    ];
    
    function getWeddingShots() {
        return appState.weddingShots;
    }

    function renderWeddingShots() {
        if (!weddingListContainer) return;
        const shots = getWeddingShots();
        
        if (shots.length === 0) {
            weddingListContainer.innerHTML = `<p class="text-[#adadad] text-center px-4 py-8">No shots added yet. Click "Add Shot" to begin.</p>`;
        } else {
            // Group shots by predefined categories or a "Custom" category
            const categories = { 'Getting Ready': [], 'Ceremony': [], 'Reception': [], 'Custom': [] };
            const defaultCategories = {
                'Getting Ready': ['Bride getting hair done', 'Bride getting makeup done', 'Bride putting on dress'],
                'Ceremony': ['Bride walking down the aisle', 'Groom\'s reaction', 'Exchange of vows'],
                'Reception': ['First dance', 'Cutting the cake', 'Speeches']
            };

            shots.forEach(shot => {
                let found = false;
                for (const cat in defaultCategories) {
                    if (defaultCategories[cat].includes(shot.text)) {
                        categories[cat].push(shot);
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    categories['Custom'].push(shot);
                }
            });

            let html = '';
            for (const category in categories) {
                if (categories[category].length > 0) {
                    html += `<h3 class="text-white text-lg font-bold leading-tight tracking-[-0.015em] pt-4 pb-2">${category}</h3>`;
                    categories[category].forEach(shot => {
                        html += generateShotHTML(shot, 'wedding');
                    });
                }
            }
            weddingListContainer.innerHTML = html;
        }
        updateProgressBar();
    }
    
    if(addWeddingShotButton) {
        addWeddingShotButton.addEventListener('click', () => handleAddItem('wedding'));
    }

    if (weddingListContainer) {
       weddingListContainer.addEventListener('click', (event) => handleItemInteraction(event, 'wedding'));
    }


    // ===================================================================
    //  FAMILY SHOT LIST LOGIC
    // ===================================================================
    const familyListContainer = document.getElementById('family-shot-list-container');
    const addFamilyShotButton = document.getElementById('add-family-shot-button');
    const defaultFamilyShots = [
        { text: "Bride & Groom with Bride's Parents", checked: false }, { text: "Bride & Groom with Groom's Parents", checked: false },
        { text: "Bride & Groom with Both Sets of Parents", checked: false }, { text: "Bride & Groom with Entire Family", checked: false }
    ];

    function getFamilyShots() {
        return appState.familyShots;
    }
    
    function renderFamilyShots() {
        if (!familyListContainer) return;
        const shots = getFamilyShots();
        if (shots.length === 0) {
            familyListContainer.innerHTML = `<p class="text-[#adadad] text-center px-4 py-8">No shots added yet. Click "Add Shot" to begin.</p>`;
        } else {
            familyListContainer.innerHTML = shots.map(shot => generateShotHTML(shot, 'family')).join('');
        }
    }
    
    if(addFamilyShotButton) {
        addFamilyShotButton.addEventListener('click', () => handleAddItem('family'));
    }
    
    if (familyListContainer) {
        familyListContainer.addEventListener('click', (event) => handleItemInteraction(event, 'family'));
    }

    // ===================================================================
    //  GENERAL LIST MANAGEMENT (REUSABLE FUNCTIONS)
    // ===================================================================

    function generateShotHTML(shot, type) {
        const uniqueId = `shot-${type}-${shot.text.replace(/[^a-zA-Z0-9]/g, '-')}`;
        if (type === 'wedding') {
            return `
                <div class="flex items-center justify-between py-3">
                    <label for="${uniqueId}" class="flex gap-x-3 items-center cursor-pointer flex-1">
                        <input id="${uniqueId}" type="checkbox" data-text="${shot.text}" ${shot.checked ? 'checked' : ''} class="h-5 w-5 rounded border-[#4d4d4d] border-2 bg-transparent text-black checked:bg-black checked:border-black checked:bg-[image:--checkbox-tick-svg] focus:ring-0 focus:ring-offset-0 focus:border-[#4d4d4d] focus:outline-none" />
                        <p class="text-white text-base font-normal leading-normal">${shot.text}</p>
                    </label>
                    <button class="delete-shot-button text-red-500 hover:text-red-400 ml-4" data-text="${shot.text}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256"><path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192Z"></path></svg>
                    </button>
                </div>
            `;
        }
        // 'family' type
        return `
            <div class="flex items-center gap-4 px-4 min-h-[72px] py-2 justify-between">
                <div class="flex items-center gap-4 overflow-hidden">
                    <div class="text-white flex items-center justify-center rounded-lg bg-[#363636] shrink-0 size-12">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256"><path d="M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128ZM40,72H216a8,8,0,0,0,0-16H40a8,8,0,0,0,0,16ZM216,184H40a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16Z"></path></svg>
                    </div>
                    <div class="flex flex-col justify-center overflow-hidden">
                        <p class="text-white text-base font-medium leading-normal truncate">${shot.text}</p>
                    </div>
                </div>
                <div class="shrink-0">
                    <button class="delete-shot-button text-red-500 hover:text-red-400" data-text="${shot.text}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256"><path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192Z"></path></svg>
                    </button>
                </div>
            </div>
        `;
    }

    function handleAddItem(type) {
        const shotText = prompt("Enter the name for the new shot:");
        if (shotText && shotText.trim() !== '') {
            const listKey = `${type}Shots`;
            appState[listKey].push({ text: shotText, checked: false });
            if(type === 'wedding') renderWeddingShots();
            if(type === 'family') renderFamilyShots();
            saveState();
        }
    }

    function handleItemInteraction(event, type) {
        const listKey = `${type}Shots`;
        const textFromCheckbox = event.target.dataset.text;

        // Handle Checkbox Change
        if (event.target.type === 'checkbox') {
            const shot = appState[listKey].find(s => s.text === textFromCheckbox);
            if (shot) {
                shot.checked = event.target.checked;
                updateProgressBar(); // Only wedding list affects progress bar
                saveState();
            }
        }

        // Handle Delete Button Click
        const deleteButton = event.target.closest('.delete-shot-button');
        if (deleteButton) {
            const shotTextToDelete = deleteButton.dataset.text;
            if (confirm(`Are you sure you want to delete the shot: "${shotTextToDelete}"?`)) {
                appState[listKey] = appState[listKey].filter(s => s.text !== shotTextToDelete);
                if(type === 'wedding') renderWeddingShots();
                if(type === 'family') renderFamilyShots();
                saveState();
            }
        }
    }

    // ===================================================================
    //  PERSISTENCE (SAVE/LOAD STATE)
    // ===================================================================
    function saveState() {
        localStorage.setItem('photographerAppState', JSON.stringify(appState));
        console.log("App state saved to Local Storage.");
    }
    
    function loadState() {
        const savedState = localStorage.getItem('photographerAppState');
        if (savedState) {
            const loaded = JSON.parse(savedState);
            // Use loaded state but ensure default arrays exist if they were empty
            appState.settings = loaded.settings || { isDarkMode: true };
            appState.currentProject = loaded.currentProject || { category: "Wedding", title: "New Project", date: "Today", imageUrl: ""};
            appState.weddingShots = loaded.weddingShots || defaultWeddingShots;
            appState.familyShots = loaded.familyShots || defaultFamilyShots;
            console.log("App state loaded from Local Storage.");
        } else {
             // First time load: populate with defaults
            appState.weddingShots = defaultWeddingShots;
            appState.familyShots = defaultFamilyShots;
        }
    }

    // ===================================================================
    //  INITIAL APP LOAD
    // ===================================================================
    function init() {
        loadState();
        applyTheme();
        renderDashboard();
        renderWeddingShots();
        renderFamilyShots();
    }

    init();
});
