document.addEventListener('DOMContentLoaded', () => {
    console.log("Document loaded. App is starting.");

    // ===================================================================
    //  STATE & SETUP
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
                main: [
                    { text: 'Wake up Buddy', category: 'Personal', checked: true, time: '07:00' },
                    { text: 'Morning Run', category: 'Workout', checked: false, time: '08:00' },
                    { text: 'Shrink project kick off', category: 'Work', checked: false, time: '10:00' },
                ]
            }
        }],
        currentProjectId: null
    };

    const ICONS = {
        Check: `<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>`,
        Workout: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>`,
        Work: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.616V8a2 2 0 00-2-2h-5.384A6.002 6.002 0 0012 2.5a6.002 6.002 0 00-1.616 3.5H5a2 2 0 00-2 2v5.616a4 4 0 00-1.384 2.804A4 4 0 005 21.236V22h14v-.764a4 4 0 003.384-4.816A4 4 0 0021 13.616z"></path></svg>`,
        Food: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m-8 0V5a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2z"></path></svg>`,
        Personal: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`,
        Design: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>`,
        Default: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>`
    };

    const CATEGORIES = ['Food', 'Workout', 'Work', 'Design', 'Personal'];

    // ===================================================================
    //  NAVIGATION
    // ===================================================================
    function showPage(targetId) {
        let pageExists = false;
        pages.forEach(page => {
            const isTarget = page.id === targetId;
            page.classList.toggle('hidden', !isTarget);
            if (isTarget) pageExists = true;
        });

        if (pageExists) {
            navLinks.forEach(link => {
                link.classList.toggle('active', link.dataset.target === targetId);
            });
            window.scrollTo(0, 0);
        }
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const targetId = link.dataset.target;
            if (targetId === 'page-shot-list' && !getCurrentProject()) {
                alert("Please select a project from the Projects page first.");
                showPage('page-projects');
                return;
            }
            showPage(targetId);
        });
    });
    
    document.getElementById('nav-add-button').addEventListener('click', () => {
        if (!getCurrentProject()) {
            alert("Please select a project before adding a task.");
            showPage('page-projects');
            return;
        }
        renderAddTaskForm();
        showPage('page-add-shot');
    });

    // ===================================================================
    //  PROJECT MANAGEMENT
    // ===================================================================
    const projectsListContainer = document.getElementById('projects-list-container');
    const addProjectButton = document.getElementById('add-project-button');

    function getCurrentProject() {
        if (!appState.currentProjectId || !appState.projects) return null;
        return appState.projects.find(p => p.id === appState.currentProjectId);
    }

    function createNewProject() {
        const title = prompt("Enter project title:", "New Photoshoot");
        if (!title) return;
        
        const newProject = {
            id: `proj_${new Date().getTime()}`,
            category: "General",
            title: title,
            date: new Date().toISOString().split('T')[0],
            imageUrl: `https://placehold.co/600x400/333/fff?text=${title.replace(/\s/g, '+')}`,
            shotLists: { 
                main: [{
                    text: `Welcome to '${title}'!`,
                    category: 'Personal',
                    checked: false,
                    time: '09:00'
                }] 
            }
        };

        appState.projects.push(newProject);
        appState.currentProjectId = newProject.id;
        saveState();
        renderAll();
        showPage('page-shot-list');
    }

    function renderProjectsList() {
        if(!projectsListContainer) return;
        projectsListContainer.innerHTML = '';
        if(!appState.projects || appState.projects.length === 0){
             projectsListContainer.innerHTML = `<p class="text-gray-400 text-center px-4 py-8">No projects yet. Click below to create one.</p>`;
             return;
        }

        appState.projects.forEach(project => {
            const isActive = project.id === appState.currentProjectId;
            const activeClasses = isActive ? 'border-purple-600' : 'border-gray-700';
            
            projectsListContainer.innerHTML += `
                <div data-project-id="${project.id}" class="project-card-clickable bg-[#222] p-4 rounded-lg flex justify-between items-center cursor-pointer border-2 ${activeClasses}">
                    <div>
                        <p class="text-white font-bold text-lg pointer-events-none">${project.title}</p>
                        <p class="text-gray-400 text-sm pointer-events-none">${project.category} - ${project.date}</p>
                    </div>
                    <button data-project-id="${project.id}" class="delete-project-btn text-red-500 hover:text-red-400">
                         <svg class="w-6 h-6 pointer-events-none" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>
                    </button>
                </div>
            `;
        });
    }

    if(addProjectButton) addProjectButton.addEventListener('click', createNewProject);

    function handleProjectCardClick(event) {
        const card = event.target.closest('.project-card-clickable');
        if (!card) return;

        const projectId = card.dataset.projectId;

        if (event.target.closest('.delete-project-btn')) {
            event.stopPropagation();
            if(confirm('Are you sure you want to delete this project and all its data?')){
                appState.projects = appState.projects.filter(p => p.id !== projectId);
                if(appState.currentProjectId === projectId){
                    appState.currentProjectId = appState.projects.length > 0 ? appState.projects[0].id : null;
                }
                saveState();
                renderAll();
            }
            return;
        }

        appState.currentProjectId = projectId;
        saveState();
        renderAll();
        showPage('page-shot-list');
    }
    
    if(projectsListContainer) {
        projectsListContainer.addEventListener('click', handleProjectCardClick);
    }
    
    // ===================================================================
    //  DASHBOARD LOGIC
    // ===================================================================
    const dashboardContainer = document.getElementById('page-dashboard');

    function renderDashboard() {
        if (!dashboardContainer) return;
        const project = getCurrentProject();
        const today = new Date();
        
        let headerHtml = `
            <div class="p-6">
                <h1 class="text-3xl font-bold">Today's schedule</h1>
                <p class="text-gray-400">${today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            </div>
        `;

        let tasksHtml = '';
        if (!project) {
            tasksHtml = `<div class="px-6"><p class="text-gray-400 text-center py-8">No active project. Select one from the Projects page.</p></div>`;
        } else {
            const tasks = (project.shotLists.main || []).slice(0, 4);
            if (tasks.length === 0) {
                 tasksHtml = `<div class="px-6"><p class="text-gray-400 py-4">No tasks for ${project.title} today.</p></div>`;
            } else {
                tasksHtml = `<div class="px-6 flex flex-col gap-4">${tasks.map(generateShotHTML).join('')}</div>`;
            }
        }

        let projectsHtml = `
            <div class="px-6 mt-6">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-2xl font-bold">Ongoing Projects</h2>
                    <button data-target="page-projects" class="nav-link text-purple-400 text-sm">View All</button>
                </div>
                <div id="dashboard-projects-list" class="flex flex-col gap-3">
                    ${(appState.projects || []).map(p => {
                        const isActive = p.id === appState.currentProjectId;
                        return `
                        <div data-project-id="${p.id}" class="project-card-clickable flex items-center justify-between bg-[#222] p-3 rounded-lg cursor-pointer">
                            <p class="font-semibold pointer-events-none">${p.title}</p>
                            <span class="text-xs ${isActive ? 'text-purple-400' : 'text-gray-500'} pointer-events-none">${isActive ? 'Active' : ''}</span>
                        </div>
                        `
                    }).join('')}
                </div>
            </div>`;

        dashboardContainer.innerHTML = headerHtml + tasksHtml + projectsHtml;
    }
    
    if(dashboardContainer) {
        dashboardContainer.addEventListener('click', handleProjectCardClick);
    }

    // ===================================================================
    //  SHOT LIST PAGE LOGIC
    // ===================================================================
    const shotListContainer = document.getElementById('shot-list-container');
    const scheduleDay = document.getElementById('schedule-day');
    const scheduleDate = document.getElementById('schedule-date');

    function renderProjectShotList() {
        if (!shotListContainer) return;
        const project = getCurrentProject();

        if (!project) {
            shotListContainer.innerHTML = `<p class="text-gray-400 text-center px-4 py-8">No active project selected.</p>`;
            if (scheduleDay) scheduleDay.textContent = "No Project";
            if (scheduleDate) scheduleDate.textContent = "Please select a project";
            return;
        }

        const projectDate = new Date((project.date || "2024-01-01") + 'T00:00:00');
        if (scheduleDay) scheduleDay.textContent = project.title;
        if (scheduleDate) scheduleDate.textContent = projectDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

        const shots = project.shotLists.main || [];
        
        if (shots.length === 0) {
            shotListContainer.innerHTML = `<p class="text-gray-400 text-center px-4 py-8">No tasks yet. Tap the '+' to add one.</p>`;
        } else {
            shots.sort((a,b) => (a.time || "23:59").localeCompare(b.time || "23:59"));
            shotListContainer.innerHTML = shots.map(generateShotHTML).join('');
        }
    }
    
    function generateShotHTML(shot) {
        const isComplete = shot.checked ? 'is-complete' : '';
        const icon = ICONS[shot.category] || ICONS.Default;
        const checkIcon = shot.checked ? ICONS.Check : '';
        return `
            <div data-text="${shot.text}" class="task-card flex items-center gap-4 bg-[#222] p-4 rounded-lg border-l-4 border-gray-700 ${isComplete}">
                 <div class="task-checkbox w-6 h-6 rounded-md border-2 border-gray-500 flex items-center justify-center shrink-0 cursor-pointer">
                    ${checkIcon}
                 </div>
                 <div class="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center">${icon}</div>
                 <div class="flex-grow">
                     <p class="task-title text-white font-semibold">${shot.text}</p>
                 </div>
                 <p class="text-sm text-gray-400">${shot.time || ""}</p>
            </div>
        `;
    }

    if(shotListContainer) {
        shotListContainer.addEventListener('click', e => {
            const card = e.target.closest('.task-card');
            if (card) {
                const project = getCurrentProject();
                if(!project || !project.shotLists.main) return;
                
                const shotText = card.dataset.text;
                const shot = project.shotLists.main.find(s => s.text === shotText);
                if (shot) {
                    shot.checked = !shot.checked;
                    renderProjectShotList();
                    saveState();
                }
            }
        });
    }

    // ===================================================================
    //  ADD SHOT FORM LOGIC
    // ===================================================================
    const addShotForm = document.getElementById('add-shot-form');
    const categoryPillsContainer = document.getElementById('category-pills-container');

    function renderAddTaskForm() {
        if (!categoryPillsContainer) return;
        categoryPillsContainer.innerHTML = CATEGORIES.map(cat => `
            <button type="button" data-category="${cat}" class="category-pill bg-gray-700 text-gray-300 rounded-full px-4 py-1.5 text-sm">${cat}</button>
        `).join('');
        
        categoryPillsContainer.querySelector('.category-pill')?.classList.add('active');
        addShotForm.reset();
    }
    
    if (categoryPillsContainer) {
        categoryPillsContainer.addEventListener('click', e => {
            if (e.target.classList.contains('category-pill')) {
                categoryPillsContainer.querySelectorAll('.category-pill').forEach(p => p.classList.remove('active'));
                e.target.classList.add('active');
            }
        });
    }

    if (addShotForm) {
        addShotForm.addEventListener('submit', e => {
            e.preventDefault();
            const project = getCurrentProject();
            if(!project) {
                alert("Please select a project before adding a task.");
                return;
            }
            
            const title = document.getElementById('task-title').value;
            const time = document.getElementById('task-time').value;
            const activePill = categoryPillsContainer.querySelector('.category-pill.active');
            const category = activePill ? activePill.dataset.category : 'Default';

            if (!project.shotLists.main) project.shotLists.main = [];
            project.shotLists.main.push({ text: title, time: time, category: category, checked: false });

            saveState();
            renderAll();
            showPage('page-shot-list');
        });
    }

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
    //  PERSISTENCE & INITIALIZATION
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
            appState = JSON.parse(JSON.stringify(defaultState));
            console.log("No saved state, initialized with default.");
        }
        
        if (!appState.projects) appState.projects = [];
        const projectExists = appState.projects.some(p => p.id === appState.currentProjectId);

        if (!appState.currentProjectId || !projectExists) {
            appState.currentProjectId = appState.projects.length > 0 ? appState.projects[0].id : null;
        }
    }

    // ===================================================================
    //  INITIAL APP LOAD & RENDER ALL
    // ===================================================================
    function renderAll() {
        renderDashboard();
        renderProjectsList();
        renderProjectShotList();
    }

    function init() {
        loadState();
        applyTheme();
        renderAll();
        showPage('page-dashboard');
    }

    init();
});
