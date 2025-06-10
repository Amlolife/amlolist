document.addEventListener('DOMContentLoaded', () => {
    // ===================================================================
    //  APP INITIALIZATION & STATE MANAGEMENT
    // ===================================================================
    let appState = {};
    const defaultState = {
        settings: { isDarkMode: true },
        projects: [],
        currentProjectId: null
    };

    const ICONS = {
        Check: `<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>`,
        Workout: `<svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>`,
        Work: `<svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 13.616V8a2 2 0 00-2-2h-5.384A6.002 6.002 0 0012 2.5a6.002 6.002 0 00-1.616 3.5H5a2 2 0 00-2 2v5.616a4 4 0 00-1.384 2.804A4 4 0 005 21.236V22h14v-.764a4 4 0 003.384-4.816A4 4 0 0021 13.616z"></path></svg>`,
        Food: `<svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 17h8m-8 0V5a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2z"></path></svg>`,
        Personal: `<svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`,
        Design: `<svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>`,
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
    //  CORE RENDERING ENGINE
    // ===================================================================
    const render = {
        dashboard: () => {
            const container = pageContainers.dashboard;
            if (!container) return;
            const project = getCurrentProject();
            const greeting = getGreeting();

            let headerHtml = `<div class="p-6"><p class="text-gray-400">${greeting}</p><h1 class="text-3xl font-bold">Dashboard</h1></div>`;
            
            let contentHtml = !project
                ? `<div class="px-6"><div class="bg-gray-800 p-4 rounded-lg text-center"><p class="text-white font-semibold">No Active Project</p><p class="text-gray-400 text-sm mt-1 mb-3">Select a project to see your tasks.</p><button data-target="page-projects" class="bg-purple-600 text-white font-bold py-2 px-4 rounded-lg text-sm">View Projects</button></div></div>`
                : (() => {
                    const shots = project.shotLists.main || [];
                    const total = shots.length;
                    const completed = shots.filter(s => s.checked).length;
                    const percentage = total > 0 ? (completed / total) * 100 : 0;
                    const incompleteTasks = shots.filter(s => !s.checked).sort((a,b) => (a.time || "23:59").localeCompare(b.time || "23:59")).slice(0, 3);
                    
                    return `<div class="px-6"><div class="bg-gray-800 p-6 rounded-2xl flex items-center gap-6"><div class="relative w-24 h-24"><svg class="w-full h-full -rotate-90" viewBox="0 0 36 36"><path class="text-gray-700" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" stroke-width="3"></path><path class="text-purple-500 transition-all duration-500 ease-in-out" stroke-dasharray="${percentage}, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"></path></svg><div class="absolute inset-0 flex flex-col items-center justify-center"><span class="text-2xl font-bold">${Math.round(percentage)}%</span><span class="text-xs text-gray-400">Done</span></div></div><div><p class="text-gray-400 text-sm">Active Project</p><h2 class="text-xl font-bold text-white mt-1">${project.title}</h2><p class="text-sm text-gray-400 mt-1">${completed} of ${total} tasks complete.</p></div></div></div><div class="px-6 mt-8"><h3 class="text-xl font-bold mb-4">Today's Priority</h3><div class="flex flex-col gap-3">${incompleteTasks.length > 0 ? incompleteTasks.map(generateShotHTML).join('') : '<p class="text-gray-500 text-center py-4">All tasks completed! 🎉</p>'}</div></div>`;
                })();
            
            container.innerHTML = headerHtml + contentHtml;
            animateList(container);
        },
        projects: () => {
            const container = pageContainers.projects;
            if (!container) return;
            const listContainer = container.querySelector('#projects-list-container');
            if(!listContainer) return;

            const projects = appState.projects || [];
            listContainer.innerHTML = projects.length === 0
                ? `<p class="text-gray-400 text-center col-span-2 py-8">No projects yet.</p>`
                : projects.map((project, index) => {
                    const isActive = project.id === appState.currentProjectId;
                    return `<div data-project-id="${project.id}" style="animation-delay: ${index * 60}ms" class="project-card animated-card bg-gray-800 rounded-xl overflow-hidden cursor-pointer ${isActive ? 'active-project' : ''}"><img src="${project.imageUrl}" class="h-24 w-full object-cover pointer-events-none" alt="${project.title}"><div class="p-3 pointer-events-none"><p class="font-bold text-white truncate">${project.title}</p><p class="text-sm text-gray-400">${project.category}</p></div></div>`;
                }).join('');
            animateList(listContainer);
        },
        shotList: () => {
            const container = pageContainers.shotList;
            if (!container) return;
            
            const project = getCurrentProject();
            if (!project) {
                container.innerHTML = `<div class="p-6"><h1 class="text-3xl font-bold">No Project</h1><p class="text-gray-400">Please select a project first.</p></div>`;
                return;
            }

            const projectDate = new Date((project.date || "2024-01-01") + 'T00:00:00');
            const shots = project.shotLists.main || [];
            shots.sort((a,b) => (a.time || "23:59").localeCompare(b.time || "23:59"));
            
            container.innerHTML = `
                <div class="p-6">
                    <button class="nav-link mb-4" data-target="page-dashboard"><svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg></button>
                    <h1 class="text-3xl font-bold">${project.title}</h1>
                    <p class="text-gray-400">${projectDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                </div>
                <div class="px-6 flex flex-col gap-4">
                    ${shots.length > 0 ? shots.map(generateShotHTML).join('') : `<p class="text-gray-400 text-center px-4 py-8">No tasks yet. Tap the '+' button to add one.</p>`}
                </div>
            `;
            animateList(container.querySelector('.flex-col'));
        },
        settings: () => {
            const container = pageContainers.settings;
            if(!container) return;
            const toggle = container.querySelector('#dark-mode-toggle');
            if(toggle) toggle.checked = appState.settings.isDarkMode;
        },
        addProjectForm: () => {
             const form = pageContainers.addProject.querySelector('form');
             if(form) form.reset();
        },
        addTaskForm: () => {
            const container = pageContainers.addShot.querySelector('#category-pills-container');
            if (!container) return;
            container.innerHTML = CATEGORIES.map(cat => `<button type="button" data-category="${cat}" class="category-pill bg-gray-700 text-gray-300 rounded-full px-4 py-1.5 text-sm">${cat}</button>`).join('');
            container.querySelector('.category-pill')?.classList.add('active');
            pageContainers.addShot.querySelector('form').reset();
        }
    };
    
    // ===================================================================
    //  EVENT LISTENERS
    // ===================================================================
    document.body.addEventListener('click', (e) => {
        const navLink = e.target.closest('[data-target]');
        if (navLink) {
            e.preventDefault();
            const targetId = navLink.dataset.target;
             if (targetId === 'page-shot-list' && !getCurrentProject()) {
                alert("Please select a project from the Projects page first.");
                showPage('page-projects');
                return;
            }
            showPage(targetId);
            return;
        }

        const projectCard = e.target.closest('.project-card');
        if (projectCard) {
            appState.currentProjectId = projectCard.dataset.projectId;
            saveState();
            renderAll();
            showPage('page-shot-list');
            return;
        }

        const taskCard = e.target.closest('.task-card');
        if (taskCard) {
            const taskId = taskCard.dataset.id;
            const project = getCurrentProject();
            const task = project?.shotLists?.main.find(t => t.id === taskId);
            
            if (e.target.closest('.task-checkbox-outer')) {
                 if (task) {
                    task.checked = !task.checked;
                    saveState();
                    renderAll();
                }
            } else {
                populateEditModal(task);
                document.getElementById('edit-task-modal').classList.remove('hidden');
            }
            return;
        }

        const pill = e.target.closest('.category-pill');
        if (pill) {
            const container = pill.parentElement;
            container.querySelectorAll('.category-pill').forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
        }
    });

    document.getElementById('add-project-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const newProject = {
            id: `proj_${new Date().getTime()}`,
            title: e.target.querySelector('#project-title').value,
            category: e.target.querySelector('#project-category').value,
            date: e.target.querySelector('#project-date').value,
            imageUrl: `https://placehold.co/600x400/333/fff?text=${e.target.querySelector('#project-title').value.replace(/\s/g, '+')}`,
            shotLists: { main: [] }
        };
        appState.projects.push(newProject);
        appState.currentProjectId = newProject.id;
        saveState();
        renderAll();
        showPage('page-shot-list');
    });

    document.getElementById('add-shot-form')?.addEventListener('submit', e => {
        e.preventDefault();
        const project = getCurrentProject();
        if(!project) return;
        
        const newTask = {
            id: `task_${new Date().getTime()}`,
            text: e.target.querySelector('#task-title').value,
            time: e.target.querySelector('#task-time').value,
            category: e.target.querySelector('.category-pill.active')?.dataset.category || 'Personal',
            checked: false
        };

        if (!project.shotLists.main) project.shotLists.main = [];
        project.shotLists.main.push(newTask);
        saveState();
        renderAll();
        showPage('page-shot-list');
    });

    document.getElementById('edit-task-form')?.addEventListener('submit', e => {
        e.preventDefault();
        const taskId = document.getElementById('edit-task-id').value;
        const project = getCurrentProject();
        const task = project?.shotLists.main.find(t => t.id === taskId);
        if (task) {
            task.text = document.getElementById('edit-task-title').value;
            task.time = document.getElementById('edit-task-time').value;
            task.category = document.querySelector('#edit-category-pills-container .active')?.dataset.category || 'Personal';
            saveState();
            renderAll();
        }
        document.getElementById('edit-task-modal').classList.add('hidden');
    });
    
    document.getElementById('cancel-edit-btn')?.addEventListener('click', () => {
         document.getElementById('edit-task-modal').classList.add('hidden');
    });
    
    document.getElementById('nav-add-button').addEventListener('click', () => {
        if (!getCurrentProject()) {
            alert("Please select a project before adding a task.");
            showPage('page-projects');
            return;
        }
        render.addTaskForm();
        showPage('page-add-shot');
    });

    document.getElementById('reset-data-button')?.addEventListener('click', () => {
        if (confirm("ARE YOU SURE? This will delete all projects and settings permanently.")) {
            localStorage.removeItem('photographerAppState');
            location.reload();
        }
    });

    // ===================================================================
    //  HELPERS & INITIALIZATION
    // ===================================================================
    const getGreeting = () => { const h=new Date().getHours(); return h<12?"Good morning":h<18?"Good afternoon":"Good evening"; };
    const saveState = () => localStorage.setItem('photographerAppState', JSON.stringify(appState));
    const loadState = () => {
        const saved = localStorage.getItem('photographerAppState');
        appState = saved ? JSON.parse(saved) : JSON.parse(JSON.stringify(defaultState));
        if (!appState.projects) appState.projects = [];
        const projectExists = appState.projects.some(p => p.id === appState.currentProjectId);
        if (!appState.currentProjectId || !projectExists) {
            appState.currentProjectId = appState.projects.length > 0 ? appState.projects[0].id : null;
        }
    };
    const getCurrentProject = () => appState.projects.find(p => p.id === appState.currentProjectId);
    const generateShotHTML = (shot, index = 0) => {
        const isComplete = shot.checked ? 'is-complete' : '';
        const icon = ICONS[shot.category] || ICONS['Personal'];
        const checkIcon = shot.checked ? ICONS.Check : '';
        return `<div data-id="${shot.id}" style="animation-delay: ${index * 60}ms" class="task-card animated-card flex items-center gap-4 bg-gray-800 p-4 rounded-lg border-l-4 border-gray-700 cursor-pointer ${isComplete}"><div class="task-checkbox-outer w-6 h-6 rounded-md border-2 border-gray-500 flex items-center justify-center shrink-0">${checkIcon}</div><div class="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center">${icon}</div><div class="flex-grow"><p class="task-title text-white font-semibold">${shot.text}</p></div><p class="text-sm text-gray-400">${shot.time || ""}</p></div>`;
    };
     const populateEditModal = (task) => {
        if(!task) return;
        const form = document.getElementById('edit-task-form');
        form.querySelector('#edit-task-id').value = task.id;
        form.querySelector('#edit-task-title').value = task.text;
        form.querySelector('#edit-task-time').value = task.time;
        const container = form.querySelector('#edit-category-pills-container');
        container.innerHTML = CATEGORIES.map(cat => `<button type="button" data-category="${cat}" class="category-pill bg-gray-700 text-gray-300 rounded-full px-4 py-1.5 text-sm">${cat}</button>`).join('');
        container.querySelectorAll('.category-pill').forEach(p => p.classList.remove('active'));
        const activePill = container.querySelector(`[data-category="${task.category}"]`);
        if (activePill) activePill.classList.add('active');
        else container.querySelector('.category-pill')?.classList.add('active');
    };

    function init() {
        loadState();
        Object.values(render).forEach(renderFunc => renderFunc());
        showPage(appState.currentProjectId ? 'page-dashboard' : 'page-projects');
    }

    init();
});
