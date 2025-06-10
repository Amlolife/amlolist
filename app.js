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
    //  NAVIGATION & UI FLOW
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
    
    document.body.addEventListener('click', e => {
         if (e.target.closest('[data-target]')) {
             const targetId = e.target.closest('[data-target]').dataset.target;
             showPage(targetId);
         }
    });

    // ===================================================================
    //  PROJECT MANAGEMENT
    // ===================================================================
    const projectsListContainer = document.getElementById('projects-list-container');
    const addProjectForm = document.getElementById('add-project-form');

    function getCurrentProject() {
        if (!appState.currentProjectId || !appState.projects) return null;
        return appState.projects.find(p => p.id === appState.currentProjectId);
    }
    
    if (addProjectForm) {
        addProjectForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const title = document.getElementById('project-title').value;
            const category = document.getElementById('project-category').value;
            const date = document.getElementById('project-date').value;

            const newProject = {
                id: `proj_${new Date().getTime()}`,
                category: category,
                title: title,
                date: date,
                imageUrl: `https://placehold.co/600x400/333/fff?text=${title.replace(/\s/g, '+')}`,
                shotLists: { main: [] }
            };

            appState.projects.push(newProject);
            appState.currentProjectId = newProject.id;
            saveState();
            renderAll();
            showPage('page-shot-list');
        });
    }

    function renderProjectsList() {
        if(!projectsListContainer) return;
        projectsListContainer.innerHTML = '';
        const projects = appState.projects || [];

        if(projects.length === 0){
             projectsListContainer.innerHTML = `<p class="text-gray-400 text-center col-span-2 py-8">No projects yet.</p>`;
        } else {
             const projectCardsHtml = projects.map((project, index) => {
                const isActive = project.id === appState.currentProjectId;
                return `
                    <div data-project-id="${project.id}" style="animation-delay: ${index * 60}ms" class="project-card animated-card bg-gray-800 rounded-xl overflow-hidden cursor-pointer ${isActive ? 'active-project' : ''}">
                        <img src="${project.imageUrl}" class="h-24 w-full object-cover pointer-events-none" alt="${project.title}">
                        <div class="p-3 pointer-events-none">
                            <p class="font-bold text-white truncate">${project.title}</p>
                            <p class="text-sm text-gray-400">${project.category}</p>
                        </div>
                    </div>
                `;
            }).join('');
            projectsListContainer.innerHTML = projectCardsHtml + `<div class="col-span-2"><button data-target="page-add-project" class="w-full flex items-center justify-center rounded-lg h-12 px-5 bg-purple-600 hover:bg-purple-500 text-white text-base font-bold">Create New Project</button></div>`;
        }
    }

    function handleProjectCardClick(event) {
        const card = event.target.closest('.project-card-clickable, .project-card');
        if (!card) return;
        
        appState.currentProjectId = card.dataset.projectId;
        saveState();
        renderAll();
        showPage('page-shot-list');
    }
    
    if(projectsListContainer) projectsListContainer.addEventListener('click', handleProjectCardClick);
    
    // ===================================================================
    //  DASHBOARD LOGIC
    // ===================================================================
    const dashboardContainer = document.getElementById('page-dashboard');

    function renderDashboard() {
        if (!dashboardContainer) return;
        const project = getCurrentProject();
        const today = new Date();
        
        let headerHtml = `
            <div class="p-6 flex justify-between items-center">
                <div>
                    <h1 class="text-3xl font-bold">Dashboard</h1>
                    <p class="text-gray-400">${today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                </div>
                <img src="https://images.unsplash.com/photo-1575936123452-b67c3203c357?q=80&w=2070&auto=format&fit=crop" class="w-12 h-12 rounded-full object-cover">
            </div>
        `;

        let activeProjectHtml = '';
        if (!project) {
            activeProjectHtml = `
                <div class="px-6">
                    <div class="bg-gray-800 p-4 rounded-lg text-center">
                        <p class="text-white font-semibold">No Active Project</p>
                        <p class="text-gray-400 text-sm mt-1 mb-3">Select a project to see your tasks.</p>
                        <button data-target="page-projects" class="bg-purple-600 text-white font-bold py-2 px-4 rounded-lg text-sm">View Projects</button>
                    </div>
                </div>`;
        } else {
            const shots = project.shotLists.main || [];
            const total = shots.length;
            const completed = shots.filter(s => s.checked).length;
            const percentage = total > 0 ? (completed / total) * 100 : 0;
            
            activeProjectHtml = `
                <div class="px-6">
                    <div class="bg-gray-800 p-4 rounded-xl">
                        <p class="text-gray-400 text-sm">Active Project</p>
                        <h2 class="text-2xl font-bold text-white mt-1">${project.title}</h2>
                        <div class="w-full bg-gray-700 rounded-full h-2.5 mt-4">
                            <div class="bg-purple-500 h-2.5 rounded-full" style="width: ${percentage}%"></div>
                        </div>
                        <div class="flex justify-between text-sm text-gray-400 mt-2">
                            <span>Progress</span>
                            <span>${completed}/${total} Tasks</span>
                        </div>
                        <button data-target="page-shot-list" class="w-full mt-4 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg">View Task List</button>
                    </div>
                </div>`;
        }
        
        dashboardContainer.innerHTML = headerHtml + activeProjectHtml;
    }
    
    // ===================================================================
    //  SHOT LIST PAGE LOGIC
    // ===================================================================
    const shotListContainer = document.getElementById('shot-list-container');
    const shotListHeader = document.getElementById('shot-list-header');

    function renderProjectShotList() {
        if (!shotListContainer || !shotListHeader) return;
        const project = getCurrentProject();

        if (!project) {
            shotListHeader.innerHTML = '';
            shotListContainer.innerHTML = `<p class="text-gray-400 text-center px-4 py-8">No active project selected.</p>`;
            return;
        }

        const projectDate = new Date((project.date || "2024-01-01") + 'T00:00:00');
        shotListHeader.innerHTML = `
             <div class="p-6">
                 <button class="nav-link mb-4" data-target="page-dashboard">
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
                </button>
                <h1 class="text-3xl font-bold">${project.title}</h1>
                <p class="text-gray-400">${projectDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            </div>
        `;

        const shots = project.shotLists.main || [];
        
        if (shots.length === 0) {
            shotListContainer.innerHTML = `<p class="text-gray-400 text-center px-4 py-8">No tasks yet. Tap the '+' to add one.</p>`;
        } else {
            shots.sort((a,b) => (a.time || "23:59").localeCompare(b.time || "23:59"));
            shotListContainer.innerHTML = shots.map((shot, index) => generateShotHTML(shot, index)).join('');
        }
    }
    
    function generateShotHTML(shot, index = 0) {
        const isComplete = shot.checked ? 'is-complete' : '';
        const icon = ICONS[shot.category] || ICONS.Default;
        const checkIcon = shot.checked ? ICONS.Check : '';
        return `
            <div data-text="${shot.text}" style="animation-delay: ${index * 60}ms" class="task-card animated-card flex items-center gap-4 bg-gray-800 p-4 rounded-lg border-l-4 border-gray-700 ${isComplete}">
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
        // Dark mode is default, light mode is the exception
        // This app is dark-themed, so we won't implement a light mode for now.
        if(darkModeToggle) darkModeToggle.checked = true;
    }
    
    if(darkModeToggle) {
        darkModeToggle.addEventListener('click', () => {
             darkModeToggle.checked = true; // Keep it on dark mode
             alert("Light mode coming soon!");
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
        if (getCurrentProject()) {
            showPage('page-dashboard');
        } else {
            showPage('page-projects');
        }
    }

    init();
});
