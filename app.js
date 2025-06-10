document.addEventListener('DOMContentLoaded', () => {
    console.log("Document loaded. App is starting.");

    // ===================================================================
    //  APP-WIDE STATE & SETUP
    // ===================================================================
    let appState = {};
    const pages = document.querySelectorAll('.page');
    const navLinks = document.querySelectorAll('.nav-link');

    const defaultState = {
        settings: { isDarkMode: true },
        projects: [{
            id: `proj_${new Date().getTime()}`,
            category: "Wedding",
            title: "Sarah & Alex",
            date: "2024-06-15",
            imageUrl: "https://images.unsplash.com/photo-1597158292833-2ab349342240?q=80&w=2070&auto=format&fit=crop",
            shotLists: {
                wedding: [
                    { text: 'Bride getting hair done', category: 'Getting Ready', checked: false },
                    { text: 'Bride getting makeup done', category: 'Getting Ready', checked: true },
                    { text: 'Exchange of vows', category: 'Ceremony', checked: false },
                ]
            }
        }],
        currentProjectId: null
    };

    // ===================================================================
    //  NAVIGATION
    // ===================================================================
    function showPage(targetId) {
        let pageExists = false;
        pages.forEach(page => {
            if (page.id === targetId) {
                page.classList.remove('hidden');
                pageExists = true;
            } else {
                page.classList.add('hidden');
            }
        });

        if (pageExists) {
             // Update active state for nav links
            navLinks.forEach(link => {
                link.classList.toggle('active', link.dataset.target === targetId);
            });
            window.scrollTo(0, 0);
        }
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const targetPageId = link.dataset.target;
            showPage(targetPageId);
        });
    });

    // ===================================================================
    //  PROJECT MANAGEMENT
    // ===================================================================
    const projectsListContainer = document.getElementById('projects-list-container');
    const addProjectButton = document.getElementById('add-project-button');

    function getCurrentProject() {
        if (!appState.currentProjectId) return null;
        return appState.projects.find(p => p.id === appState.currentProjectId);
    }

    function createNewProject() {
        const title = prompt("Enter project title:", "New Photoshoot");
        if (!title) return;
        const category = prompt("Enter project category:", "Event");
        if (!category) return;

        const newProject = {
            id: `proj_${new Date().getTime()}`,
            category: category,
            title: title,
            date: new Date().toISOString().split('T')[0],
            imageUrl: "https://images.unsplash.com/photo-1511285560921-506948335697?q=80&w=1887&auto=format&fit=crop",
            shotLists: { wedding: [] }
        };

        appState.projects.push(newProject);
        appState.currentProjectId = newProject.id;
        saveState();
        renderAll();
        showPage('page-dashboard');
    }

    function renderProjectsList() {
        if(!projectsListContainer) return;
        projectsListContainer.innerHTML = '';
        if(appState.projects.length === 0){
             projectsListContainer.innerHTML = `<p class="text-[#adadad] text-center px-4 py-8">No projects yet. Click below to create one.</p>`;
             return;
        }

        appState.projects.forEach(project => {
            const isActive = project.id === appState.currentProjectId;
            const activeClasses = isActive ? 'border-2 border-white' : 'border-2 border-transparent';
            const buttonText = isActive ? 'Active' : 'Select';
            const buttonClasses = isActive ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-500';

            projectsListContainer.innerHTML += `
                <div class="bg-[#363636] p-4 rounded-lg flex justify-between items-center ${activeClasses}">
                    <div>
                        <p class="text-white font-bold text-lg">${project.title}</p>
                        <p class="text-[#adadad] text-sm">${project.category} - ${project.date}</p>
                    </div>
                    <div class="flex gap-2">
                        <button data-project-id="${project.id}" class="select-project-btn text-white text-xs font-bold py-1 px-3 rounded-full ${buttonClasses}">${buttonText}</button>
                        <button data-project-id="${project.id}" class="delete-project-btn text-white text-xs font-bold py-1 px-3 rounded-full bg-red-800 hover:bg-red-700">Delete</button>
                    </div>
                </div>
            `;
        });
    }

    if(addProjectButton) addProjectButton.addEventListener('click', createNewProject);

    if(projectsListContainer) {
        projectsListContainer.addEventListener('click', e => {
            const selectBtn = e.target.closest('.select-project-btn');
            const deleteBtn = e.target.closest('.delete-project-btn');

            if(selectBtn) {
                appState.currentProjectId = selectBtn.dataset.projectId;
                saveState();
                renderAll();
                showPage('page-dashboard');
            }

            if(deleteBtn) {
                if(confirm('Are you sure you want to delete this project and all its data?')){
                    const projectId = deleteBtn.dataset.projectId;
                    appState.projects = appState.projects.filter(p => p.id !== projectId);
                    if(appState.currentProjectId === projectId){
                        appState.currentProjectId = appState.projects.length > 0 ? appState.projects[0].id : null;
                    }
                    saveState();
                    renderAll();
                }
            }
        });
    }


    // ===================================================================
    //  DASHBOARD LOGIC
    // ===================================================================
    const dashboardContent = document.getElementById('dashboard-content');

    function updateProgressBar() {
        const project = getCurrentProject();
        
        const progressBar = document.getElementById('progress-bar');
        const progressText = document.getElementById('progress-text');
        const progressCounts = document.getElementById('progress-counts');

        if (!project || !progressBar) { // Check if elements exist
             if(progressBar) progressBar.style.width = '0%';
             if(progressText) progressText.querySelector('p').textContent = '0% Complete';
             if(progressCounts) progressCounts.textContent = 'No project selected';
             return;
        };

        const shots = project.shotLists.wedding || [];
        const totalShots = shots.length;
        const completedShots = shots.filter(shot => shot.checked).length;
        const percentage = totalShots > 0 ? Math.round((completedShots / totalShots) * 100) : 0;
        
        progressBar.style.width = `${percentage}%`;
        progressText.querySelector('p').textContent = `${percentage}% Complete`;
        progressCounts.textContent = `${completedShots}/${totalShots} Shots`;
    }
    
    function renderDashboard() {
        const project = getCurrentProject();
        if (!project) {
            dashboardContent.innerHTML = `
                <div class="text-center p-10">
                    <p class="text-white text-lg">No Active Project</p>
                    <p class="text-[#adadad] mt-2">Go to the Projects page to create or select a project.</p>
                     <button id="dashboard-go-to-projects" class="mt-4 text-white bg-blue-600 hover:bg-blue-500 font-bold py-2 px-4 rounded-full">Go to Projects</button>
                </div>
            `;
        } else {
             dashboardContent.innerHTML = `
                <div class="flex flex-col gap-3 p-4">
                    <div id="progress-text" class="flex gap-6 justify-between"><p class="text-white text-base font-medium leading-normal">0% Complete</p></div>
                    <div class="rounded bg-[#4d4d4d]"><div id="progress-bar" class="h-2 rounded bg-white" style="width: 0%;"></div></div>
                    <p id="progress-counts" class="text-[#adadad] text-sm font-normal leading-normal">0/0 Shots</p>
                </div>
                <h2 class="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Current Project</h2>
                <div class="p-4">
                    <div id="current-project-card" class="flex items-stretch justify-between gap-4 rounded-xl bg-[#363636] p-4">
                        <div class="flex flex-col gap-1 flex-[2_2_0px]">
                            <p class="text-[#adadad] text-sm font-normal leading-normal">${project.category}</p>
                            <p class="text-white text-base font-bold leading-tight">${project.title}</p>
                            <p class="text-[#adadad] text-sm font-normal leading-normal">${project.date}</p>
                        </div>
                        <div class="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-xl flex-1" style='background-image: url("${project.imageUrl}");'></div>
                    </div>
                </div>
                <h2 class="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Shot Lists</h2>
                 <div data-target="page-wedding-day" class="flex items-center gap-4 px-4 min-h-14 justify-between cursor-pointer hover:bg-[#363636]">
                    <div class="flex items-center gap-4">
                        <div class="text-white flex items-center justify-center rounded-lg bg-[#363636] shrink-0 size-10"><svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256"><path d="M80,64a8,8,0,0,1,8-8H216a8,8,0,0,1,0,16H88A8,8,0,0,1,80,64Zm136,56H88a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16Zm0,64H88a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16ZM44,52A12,12,0,1,0,56,64,12,12,0,0,0,44,52Zm0,64a12,12,0,1,0,12,12A12,12,0,0,0,44,116Zm0,64a12,12,0,1,0,12,12A12,12,0,0,0,44,180Z"></path></svg></div>
                        <p class="text-white text-base font-normal leading-normal flex-1 truncate">Shot List</p>
                    </div>
                    <div class="shrink-0"><div class="text-white flex size-7 items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256"><path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z"></path></svg></div></div>
                </div>
            `;
            updateProgressBar();
        }
    }

    // Event Delegation for dynamically created buttons
    document.body.addEventListener('click', (event) => {
        if(event.target.id === 'dashboard-go-to-projects') {
            showPage('page-projects');
        }
    });

    // ===================================================================
    //  SETTINGS PAGE LOGIC
    // ===================================================================
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const resetDataButton = document.getElementById('reset-data-button');

    function applyTheme() {
        document.body.classList.toggle('light-mode', !appState.settings.isDarkMode);
        if(darkModeToggle) darkModeToggle.checked = appState.settings.isDarkMode;
    }
    
    if(darkModeToggle) {
        darkModeToggle.addEventListener('change', () => {
            appState.settings.isDarkMode = darkModeToggle.checked;
            applyTheme();
            saveState();
        });
    }

    if(resetDataButton) {
        resetDataButton.addEventListener('click', () => {
            if (confirm("ARE YOU SURE? This will delete all projects and settings permanently.")) {
                localStorage.removeItem('photographerAppState');
                location.reload();
            }
        });
    }
    
    // ===================================================================
    //  GENERAL SHOT LIST LOGIC
    // ===================================================================
    const weddingListContainer = document.getElementById('wedding-checklist-container');
    const addWeddingShotButton = document.getElementById('add-wedding-shot-button');
    const weddingListTitle = document.getElementById('wedding-list-title');

    function renderWeddingShots() {
        if (!weddingListContainer) return;
        const project = getCurrentProject();

        if (!project) {
            weddingListContainer.innerHTML = `<p class="text-[#adadad] text-center px-4 py-8">No active project selected.</p>`;
            if (weddingListTitle) weddingListTitle.textContent = "No Project";
            return;
        }

        if (weddingListTitle) weddingListTitle.textContent = `${project.title} - Shots`;
        const shots = project.shotLists.wedding || [];
        
        if (shots.length === 0) {
            weddingListContainer.innerHTML = `<p class="text-[#adadad] text-center px-4 py-8">No shots added yet. Click "Add Shot" to begin.</p>`;
        } else {
            const groupedByCategory = shots.reduce((acc, shot) => {
                const category = shot.category || 'Uncategorized';
                if (!acc[category]) acc[category] = [];
                acc[category].push(shot);
                return acc;
            }, {});

            let html = '';
            for (const category in groupedByCategory) {
                html += `<h3 class="text-white text-lg font-bold leading-tight tracking-[-0.015em] pt-4 pb-2">${category}</h3>`;
                groupedByCategory[category].forEach(shot => {
                    html += generateShotHTML(shot);
                });
            }
            weddingListContainer.innerHTML = html;
        }
        updateProgressBar();
    }
    
    function generateShotHTML(shot) {
        const uniqueId = `shot-${shot.text.replace(/[^a-zA-Z0-9]/g, '-')}`;
        return `
            <div class="flex items-center justify-between py-3 border-b border-gray-700">
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

    function handleAddItem() {
        const project = getCurrentProject();
        if (!project) {
            alert("Please select a project first!");
            return;
        }

        const shotText = prompt("Enter the name for the new shot:");
        if (!shotText || shotText.trim() === '') return;
        
        const category = prompt("Enter a category for this shot (e.g., Ceremony, Portraits):", "Custom");
        if (!category || category.trim() === '') return;
        
        project.shotLists.wedding.push({ text: shotText.trim(), category: category.trim(), checked: false });
        renderWeddingShots();
        saveState();
    }

    function handleItemInteraction(event) {
        const project = getCurrentProject();
        if(!project) return;

        const textFromCheckbox = event.target.dataset.text;
        if (event.target.type === 'checkbox') {
            const shot = project.shotLists.wedding.find(s => s.text === textFromCheckbox);
            if (shot) {
                shot.checked = event.target.checked;
                updateProgressBar();
                saveState();
            }
        }

        const deleteButton = event.target.closest('.delete-shot-button');
        if (deleteButton) {
            const shotTextToDelete = deleteButton.dataset.text;
            if (confirm(`Are you sure you want to delete the shot: "${shotTextToDelete}"?`)) {
                project.shotLists.wedding = project.shotLists.wedding.filter(s => s.text !== shotTextToDelete);
                renderWeddingShots();
                saveState();
            }
        }
    }
    
    if(addWeddingShotButton) addWeddingShotButton.addEventListener('click', handleAddItem);
    if(weddingListContainer) weddingListContainer.addEventListener('click', handleItemInteraction);

    // ===================================================================
    //  PERSISTENCE (SAVE/LOAD STATE)
    // ===================================================================
    function saveState() {
        localStorage.setItem('photographerAppState', JSON.stringify(appState));
        console.log("App state saved.");
    }
    
    function loadState() {
        const savedState = localStorage.getItem('photographerAppState');
        if (savedState) {
            appState = JSON.parse(savedState);
            console.log("App state loaded.");
        } else {
            // Use a deep copy to prevent mutation of the defaultState constant
            appState = JSON.parse(JSON.stringify(defaultState));
            console.log("No saved state, initialized with default.");
        }
    }

    // ===================================================================
    //  INITIAL APP LOAD & RENDER ALL
    // ===================================================================
    function validateCurrentProject() {
        if (!appState.projects) appState.projects = [];
        const projectExists = appState.projects.some(p => p.id === appState.currentProjectId);

        if (!appState.currentProjectId || !projectExists) {
            if (appState.projects.length > 0) {
                appState.currentProjectId = appState.projects[0].id;
                console.log("Current project was invalid or null, reset to the first available project.");
            } else {
                appState.currentProjectId = null;
                console.log("No projects exist, current project is null.");
            }
        }
    }
    
    function renderAll() {
        renderDashboard();
        renderProjectsList();
        renderWeddingShots();
    }

    function init() {
        loadState();
        validateCurrentProject();
        applyTheme();
        renderAll();
        showPage('page-dashboard');
    }

    init();
});
