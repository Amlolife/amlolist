document.addEventListener('DOMContentLoaded', () => {
    console.log("Document loaded. App is starting.");

    // ===================================================================
    //  STATE & SETUP
    // ===================================================================
    let appState = {};
    const defaultState = {
        settings: { isDarkMode: true },
        projects: [],
        currentProjectId: null
    };

    const ICONS = {
        Check: '<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>',
        Workout: '<svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>',
        Work: '<svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 13.616V8a2 2 0 00-2-2h-5.384A6.002 6.002 0 0012 2.5a6.002 6.002 0 00-1.616 3.5H5a2 2 0 00-2 2v5.616a4 4 0 00-1.384 2.804A4 4 0 005 21.236V22h14v-.764a4 4 0 003.384-4.816A4 4 0 0021 13.616z"></path></svg>',
        Food: '<svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 17h8m-8 0V5a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2z"></path></svg>',
        Personal: '<svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>',
        Design: '<svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>',
    };
    const CATEGORIES = ['Work', 'Workout', 'Food', 'Design', 'Personal'];
    
    const pageContainers = {
        dashboard: document.getElementById('page-dashboard'),
        projects: document.getElementById('page-projects'),
        addProject: document.getElementById('page-add-project'),
        shotList: document.getElementById('page-shot-list'),
        addShot: document.getElementById('page-add-shot'),
        settings: document.getElementById('page-settings'),
    };
    
    // ===================================================================
    //  PAGE NAVIGATION (MISSING FUNCTION)
    // ===================================================================
    function showPage(pageName) {
        // Hide all pages
        Object.values(pageContainers).forEach(page => {
            if (page) page.classList.add('hidden');
        });
        
        // Show requested page
        const pageElement = pageContainers[pageName];
        if (pageElement) {
            pageElement.classList.remove('hidden');
            
            // Re-render page if needed
            if (render[pageName]) {
                render[pageName]();
            }
        }
    }

    // ===================================================================
    //  CORE RENDERING ENGINE (FIXED JSX SYNTAX)
    // ===================================================================
    const render = {
        dashboard: () => {
            const container = pageContainers.dashboard;
            if (!container) return;
            
            const project = getCurrentProject();
            const greeting = getGreeting();

            let headerHtml = `<div class="p-6"><p class="text-gray-400">${greeting}</p><h1 class="text-3xl font-bold">Dashboard</h1></div>`;
            
            let contentHtml = '';
            if (!project) {
                contentHtml = `
                    <div class="px-6">
                        <div class="bg-gray-800 p-4 rounded-lg text-center">
                            <p class="text-white font-semibold">No Active Project</p>
                            <p class="text-gray-400 text-sm mt-1 mb-3">Select a project to see your tasks.</p>
                            <button data-target="page-projects" class="bg-purple-600 text-white font-bold py-2 px-4 rounded-lg text-sm">View Projects</button>
                        </div>
                    </div>
                `;
            } else {
                const shots = project.shotLists.main || [];
                const total = shots.length;
                const completed = shots.filter(s => s.checked).length;
                const percentage = total > 0 ? (completed / total) * 100 : 0;
                const incompleteTasks = shots.filter(s => !s.checked).sort((a,b) => (a.time || "23:59").localeCompare(b.time || "23:59")).slice(0, 3);
                
                const tasksHtml = incompleteTasks.length > 0 
                    ? incompleteTasks.map(shot => generateShotHTML(shot)).join('')
                    : '<p class="text-gray-500 text-center py-4">All tasks completed! 🎉</p>';
                
                contentHtml = `
                    <div class="px-6">
                        <div class="bg-gray-800 p-6 rounded-2xl flex items-center gap-6">
                            <div class="relative w-24 h-24">
                                <svg class="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                    <path class="text-gray-700" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" stroke-width="3"></path>
                                    <path class="text-purple-500 transition-all duration-500 ease-in-out" stroke-dasharray="${percentage}, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"></path>
                                </svg>
                                <div class="absolute inset-0 flex flex-col items-center justify-center">
                                    <span class="text-2xl font-bold">${Math.round(percentage)}%</span>
                                    <span class="text-xs text-gray-400">Done</span>
                                </div>
                            </div>
                            <div>
                                <p class="text-gray-400 text-sm">Active Project</p>
                                <h2 class="text-xl font-bold text-white mt-1">${project.title}</h2>
                                <p class="text-sm text-gray-400 mt-1">${completed} of ${total} tasks complete.</p>
                            </div>
                        </div>
                    </div>
                    <div class="px-6 mt-8">
                        <h3 class="text-xl font-bold mb-4">Today's Priority</h3>
                        <div class="flex flex-col gap-3">
                            ${tasksHtml}
                        </div>
                    </div>
                `;
            }
            
            container.innerHTML = headerHtml + contentHtml;
        },
        projects: () => {
            const container = pageContainers.projects;
            if (!container) return;
            
            const projects = appState.projects || [];
            let listHtml = '';
            if (projects.length === 0) {
                listHtml = '<p class="text-gray-400 text-center col-span-2 py-8">No projects yet.</p>';
            } else {
                listHtml = projects.map(project => {
                    const isActive = project.id === appState.currentProjectId;
                    return `
                        <div data-project-id="${project.id}" class="project-card bg-gray-800 rounded-xl overflow-hidden cursor-pointer ${isActive ? 'active-project' : ''}">
                            <img src="${project.imageUrl}" class="h-24 w-full object-cover pointer-events-none" alt="${project.title}">
                            <div class="p-3 pointer-events-none">
                                <p class="font-bold text-white truncate">${project.title}</p>
                                <p class="text-sm text-gray-400">${project.category}</p>
                            </div>
                        </div>
                    `;
                }).join('');
            }
            
            container.innerHTML = `
                <div class="p-6">
                    <h1 class="text-3xl font-bold">Projects</h1>
                    <p class="text-gray-400">Select a project to view its schedule</p>
                </div>
                <div id="projects-list-container" class="px-6 grid grid-cols-2 gap-4">
                    ${listHtml}
                </div>
                <div class="p-6">
                    <button data-target="page-add-project" class="w-full flex items-center justify-center rounded-lg h-12 px-5 bg-purple-600 hover:bg-purple-500 text-white text-base font-bold">Create New Project</button>
                </div>
            `;
        },
        shotList: () => {
            const container = pageContainers.shotList;
            if (!container) return;
            
            const project = getCurrentProject();
            let headerHtml = '';
            let listHtml = '';

            if (!project) {
                listHtml = '<p class="text-gray-400 text-center px-4 py-8">No active project selected.</p>';
            } else {
                const projectDate = new Date((project.date || "2024-01-01") + 'T00:00:00');
                headerHtml = `
                    <div class="p-6">
                        <button class="nav-link mb-4 -ml-2 p-2" data-target="page-dashboard">
                            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                            </svg>
                        </button>
                        <h1 class="text-3xl font-bold">${project.title}</h1>
                        <p class="text-gray-400">${projectDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                    </div>
                `;
            
                const shots = project.shotLists.main || [];
                if (shots.length === 0) {
                    listHtml = '<p class="text-gray-400 text-center px-4 py-8">No tasks yet. Tap the \'+\' button to add one.</p>';
                } else {
                    shots.sort((a,b) => (a.time || "23:59").localeCompare(b.time || "23:59"));
                    listHtml = shots.map(shot => generateShotHTML(shot)).join('');
                }
            }
            container.innerHTML = `
                <div id="shot-list-header">
                    ${headerHtml}
                </div>
                <div class="px-6 flex flex-col gap-4">
                    ${listHtml}
                </div>
            `;
        },
    };

    function renderAllPages() {
        Object.values(render).forEach(renderFunc => renderFunc());
    }

    // ===================================================================
    //  EVENT LISTENERS (FIXED AND OPTIMIZED)
    // ===================================================================
    document.body.addEventListener('click', (e) => {
        // Navigation buttons
        if (e.target.matches('[data-target]') || e.target.closest('[data-target]')) {
            const navLink = e.target.closest('[data-target]');
            const targetId = navLink.dataset.target;
            
            if (targetId === 'page-shot-list' && !getCurrentProject()) {
                alert("Please select a project first.");
                showPage('projects');
                return;
            }
            
            showPage(targetId.replace('page-', ''));
            return;
        }

        // Project selection
        if (e.target.closest('.project-card')) {
            const projectCard = e.target.closest('.project-card');
            appState.currentProjectId = projectCard.dataset.projectId;
            saveState();
            showPage('shotList');
            return;
        }

        // Task completion toggle
        if (e.target.closest('.task-checkbox-outer')) {
            const taskCard = e.target.closest('.task-card');
            const taskId = taskCard.dataset.id;
            const project = getCurrentProject();
            const task = project?.shotLists?.main.find(t => t.id === taskId);
            
            if (task) {
                task.checked = !task.checked;
                saveState();
                render.shotList();
                render.dashboard();
            }
            return;
        }

        // Task editing
        if (e.target.closest('.task-card')) {
            const taskCard = e.target.closest('.task-card');
            const taskId = taskCard.dataset.id;
            const project = getCurrentProject();
            const task = project?.shotLists?.main.find(t => t.id === taskId);
            
            if (task) {
                populateEditModal(task);
                document.getElementById('edit-task-modal').classList.remove('hidden');
            }
            return;
        }

        // Category selection
        if (e.target.closest('.category-pill')) {
            const pill = e.target.closest('.category-pill');
            const container = pill.closest('#category-pills-container, #edit-category-pills-container');
            
            container.querySelectorAll('.category-pill').forEach(p => {
                p.classList.remove('active');
            });
            
            pill.classList.add('active');
            return;
        }
    });
    
    // Form submissions
    document.getElementById('add-project-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('project-title').value;
        const newProject = {
            id: `proj_${new Date().getTime()}`,
            title: title,
            category: document.getElementById('project-category').value,
            date: document.getElementById('project-date').value,
            imageUrl: `https://placehold.co/600x400/333/fff?text=${encodeURIComponent(title)}`,
            shotLists: { main: [] }
        };
        
        appState.projects.push(newProject);
        appState.currentProjectId = newProject.id;
        saveState();
        showPage('shotList');
    });

    document.getElementById('add-shot-form')?.addEventListener('submit', e => {
        e.preventDefault();
        const project = getCurrentProject();
        if(!project) return;
        
        const activePill = document.querySelector('#category-pills-container .active');
        const newTask = {
            id: `task_${new Date().getTime()}`,
            text: document.getElementById('task-title').value,
            time: document.getElementById('task-time').value,
            category: activePill ? activePill.dataset.category : 'Personal',
            checked: false
        };

        if (!project.shotLists.main) project.shotLists.main = [];
        project.shotLists.main.push(newTask);
        saveState();
        showPage('shotList');
    });

    document.getElementById('edit-task-form')?.addEventListener('submit', e => {
        e.preventDefault();
        const taskId = document.getElementById('edit-task-id').value;
        const project = getCurrentProject();
        const task = project?.shotLists.main.find(t => t.id === taskId);
        
        if (task) {
            const activePill = document.querySelector('#edit-category-pills-container .active');
            task.text = document.getElementById('edit-task-title').value;
            task.time = document.getElementById('edit-task-time').value;
            task.category = activePill ? activePill.dataset.category : 'Personal';
            
            saveState();
            render.shotList();
            render.dashboard();
        }
        
        document.getElementById('edit-task-modal').classList.add('hidden');
    });

    // ===================================================================
    //  HELPER FUNCTIONS
    // ===================================================================
    const getCurrentProject = () => appState.projects.find(p => p.id === appState.currentProjectId);
    const getGreeting = () => { 
        const h = new Date().getHours(); 
        return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening"; 
    };
    const saveState = () => localStorage.setItem('photographerAppState', JSON.stringify(appState));
    
    function loadState() {
        const savedState = localStorage.getItem('photographerAppState');
        if (savedState) {
            appState = JSON.parse(savedState);
        } else {
            appState = JSON.parse(JSON.stringify(defaultState));
        }
        
        if (!appState.projects) appState.projects = [];
        const projectExists = appState.projects.some(p => p.id === appState.currentProjectId);
        if (!appState.currentProjectId || !projectExists) {
            appState.currentProjectId = appState.projects.length > 0 ? appState.projects[0].id : null;
        }
    }

    function generateShotHTML(shot) {
        const isComplete = shot.checked ? 'is-complete' : '';
        const icon = ICONS[shot.category] || ICONS.Personal;
        const checkIcon = shot.checked ? ICONS.Check : '';
        
        return `
            <div data-id="${shot.id}" class="task-card flex items-center gap-4 bg-gray-800 p-4 rounded-lg border-l-4 border-gray-700 cursor-pointer ${isComplete}">
                <div class="task-checkbox-outer w-6 h-6 rounded-md border-2 border-gray-500 flex items-center justify-center shrink-0">
                    ${checkIcon}
                </div>
                <div class="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center">
                    ${icon}
                </div>
                <div class="flex-grow">
                    <p class="task-title text-white font-semibold">${shot.text}</p>
                </div>
                <p class="text-sm text-gray-400">${shot.time || ""}</p>
            </div>
        `;
    }

    function populateEditModal(task) {
        if(!task) return;
        document.getElementById('edit-task-id').value = task.id;
        document.getElementById('edit-task-title').value = task.text;
        document.getElementById('edit-task-time').value = task.time;
        
        const container = document.getElementById('edit-category-pills-container');
        container.innerHTML = CATEGORIES.map(cat => `
            <button type="button" data-category="${cat}" class="category-pill bg-gray-700 text-gray-300 rounded-full px-4 py-1.5 text-sm ${task.category === cat ? 'active' : ''}">
                ${cat}
            </button>
        `).join('');
    }

    // ===================================================================
    //  INITIALIZATION (FIXED EVENT LISTENERS)
    // ===================================================================
    function init() {
        loadState();
        renderAllPages();
        showPage(appState.currentProjectId ? 'dashboard' : 'projects');

        // Add button handler
        document.getElementById('nav-add-button').addEventListener('click', () => {
            if (!getCurrentProject()) {
                alert("Please select a project before adding a task.");
                showPage('projects');
                return;
            }
            
            document.getElementById('add-shot-form').reset();
            const pillsContainer = document.getElementById('category-pills-container');
            pillsContainer.innerHTML = CATEGORIES.map(cat => `
                <button type="button" data-category="${cat}" class="category-pill bg-gray-700 text-gray-300 rounded-full px-4 py-1.5 text-sm ${cat === 'Personal' ? 'active' : ''}">
                    ${cat}
                </button>
            `).join('');
            
            showPage('addShot');
        });

        // Modal cancel button
        document.getElementById('cancel-edit-btn').addEventListener('click', () => {
            document.getElementById('edit-task-modal').classList.add('hidden');
        });

        // Data reset
        document.getElementById('reset-data-button').addEventListener('click', () => {
            if (confirm("ARE YOU SURE? This will delete all projects and settings permanently.")) {
                localStorage.removeItem('photographerAppState');
                location.reload();
            }
        });
    }

    init();
});
