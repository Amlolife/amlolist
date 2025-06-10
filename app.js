document.addEventListener('DOMContentLoaded', () => {
    console.log("Document loaded. App is starting.");

// ===================================================================
    //  APP INITIALIZATION & STATE MANAGEMENT
    //  STATE & SETUP
// ===================================================================
let appState = {};
const defaultState = {
@@ -35,6 +37,7 @@ document.addEventListener('DOMContentLoaded', () => {
dashboard: () => {
const container = pageContainers.dashboard;
if (!container) return;
            
const project = getCurrentProject();
const greeting = getGreeting();

@@ -58,86 +61,70 @@ document.addEventListener('DOMContentLoaded', () => {
projects: () => {
const container = pageContainers.projects;
if (!container) return;
            const listContainer = container.querySelector('#projects-list-container');
            if(!listContainer) return;

            
const projects = appState.projects || [];
            listContainer.innerHTML = projects.length === 0
            let listHtml = projects.length === 0
? `<p class="text-gray-400 text-center col-span-2 py-8">No projects yet.</p>`
: projects.map((project, index) => {
const isActive = project.id === appState.currentProjectId;
return `<div data-project-id="${project.id}" style="animation-delay: ${index * 60}ms" class="project-card animated-card bg-gray-800 rounded-xl overflow-hidden cursor-pointer ${isActive ? 'active-project' : ''}"><img src="${project.imageUrl}" class="h-24 w-full object-cover pointer-events-none" alt="${project.title}"><div class="p-3 pointer-events-none"><p class="font-bold text-white truncate">${project.title}</p><p class="text-sm text-gray-400">${project.category}</p></div></div>`;
}).join('');
            animateList(listContainer);
            
            container.innerHTML = `<div class="p-6"><h1 class="text-3xl font-bold">Projects</h1><p class="text-gray-400">Select a project to view its schedule</p></div><div id="projects-list-container" class="px-6 grid grid-cols-2 gap-4">${listHtml}</div><div class="p-6"><button data-target="page-add-project" class="w-full flex items-center justify-center rounded-lg h-12 px-5 bg-purple-600 hover:bg-purple-500 text-white text-base font-bold">Create New Project</button></div>`;
            animateList(container.querySelector('.grid'));
},
shotList: () => {
const container = pageContainers.shotList;
if (!container) return;

const project = getCurrentProject();
            if (!project) {
                container.innerHTML = `<div class="p-6"><h1 class="text-3xl font-bold">No Project</h1><p class="text-gray-400">Please select a project first.</p></div>`;
                return;
            }
            let headerHtml = '', listHtml = '';

            const projectDate = new Date((project.date || "2024-01-01") + 'T00:00:00');
            const shots = project.shotLists.main || [];
            shots.sort((a,b) => (a.time || "23:59").localeCompare(b.time || "23:59"));
            if (!project) {
                listHtml = `<p class="text-gray-400 text-center px-4 py-8">No active project selected.</p>`;
            } else {
                const projectDate = new Date((project.date || "2024-01-01") + 'T00:00:00');
                headerHtml = `<div class="p-6"><button class="nav-link mb-4 -ml-2 p-2" data-target="page-dashboard"><svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg></button><h1 class="text-3xl font-bold">${project.title}</h1><p class="text-gray-400">${projectDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p></div>`;

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
                const shots = project.shotLists.main || [];
                if (shots.length === 0) {
                    listHtml = `<p class="text-gray-400 text-center px-4 py-8">No tasks yet. Tap the '+' button to add one.</p>`;
                } else {
                    shots.sort((a,b) => (a.time || "23:59").localeCompare(b.time || "23:59"));
                    listHtml = shots.map((shot, index) => generateShotHTML(shot, index)).join('');
                }
            }
            container.innerHTML = `<div id="shot-list-header">${headerHtml}</div><div class="px-6 flex flex-col gap-4">${listHtml}</div>`;
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
    

    function renderAllPages() {
        Object.values(render).forEach(renderFunc => renderFunc());
    }

// ===================================================================
    //  EVENT LISTENERS
    //  EVENT LISTENERS (DELEGATED FROM BODY)
// ===================================================================
document.body.addEventListener('click', (e) => {
const navLink = e.target.closest('[data-target]');
if (navLink) {
e.preventDefault();
const targetId = navLink.dataset.target;
             if (targetId === 'page-shot-list' && !getCurrentProject()) {
                alert("Please select a project from the Projects page first.");
                showPage('page-projects');
            if (targetId === 'page-shot-list' && !getCurrentProject()) {
                alert("Please select a project first.");
                showPage('projects');
return;
}
            showPage(targetId);
            showPage(targetId.replace('page-', ''));
return;
}

const projectCard = e.target.closest('.project-card');
if (projectCard) {
appState.currentProjectId = projectCard.dataset.projectId;
saveState();
            renderAll();
            showPage('page-shot-list');
            showPage('shotList');
return;
}

@@ -151,23 +138,16 @@ document.addEventListener('DOMContentLoaded', () => {
if (task) {
task.checked = !task.checked;
saveState();
                    renderAll();
                    render.shotList();
                    render.dashboard(); // update dashboard too
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
@@ -181,8 +161,7 @@ document.addEventListener('DOMContentLoaded', () => {
appState.projects.push(newProject);
appState.currentProjectId = newProject.id;
saveState();
        renderAll();
        showPage('page-shot-list');
        showPage('shotList');
});

document.getElementById('add-shot-form')?.addEventListener('submit', e => {
@@ -201,8 +180,7 @@ document.addEventListener('DOMContentLoaded', () => {
if (!project.shotLists.main) project.shotLists.main = [];
project.shotLists.main.push(newTask);
saveState();
        renderAll();
        showPage('page-shot-list');
        showPage('shotList');
});

document.getElementById('edit-task-form')?.addEventListener('submit', e => {
@@ -215,54 +193,41 @@ document.addEventListener('DOMContentLoaded', () => {
task.time = document.getElementById('edit-task-time').value;
task.category = document.querySelector('#edit-category-pills-container .active')?.dataset.category || 'Personal';
saveState();
            renderAll();
            render.shotList();
            render.dashboard();
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
    //  HELPER FUNCTIONS
// ===================================================================
    const getCurrentProject = () => appState.projects.find(p => p.id === appState.currentProjectId);
const getGreeting = () => { const h=new Date().getHours(); return h<12?"Good morning":h<18?"Good afternoon":"Good evening"; };
const saveState = () => localStorage.setItem('photographerAppState', JSON.stringify(appState));
    const loadState = () => {
        const saved = localStorage.getItem('photographerAppState');
        appState = saved ? JSON.parse(saved) : JSON.parse(JSON.stringify(defaultState));
    
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
    };
    const getCurrentProject = () => appState.projects.find(p => p.id === appState.currentProjectId);
    const generateShotHTML = (shot, index = 0) => {
    }

    function generateShotHTML(shot, index = 0) {
const isComplete = shot.checked ? 'is-complete' : '';
        const icon = ICONS[shot.category] || ICONS['Personal'];
        const icon = ICONS[shot.category] || ICONS.Personal;
const checkIcon = shot.checked ? ICONS.Check : '';
return `<div data-id="${shot.id}" style="animation-delay: ${index * 60}ms" class="task-card animated-card flex items-center gap-4 bg-gray-800 p-4 rounded-lg border-l-4 border-gray-700 cursor-pointer ${isComplete}"><div class="task-checkbox-outer w-6 h-6 rounded-md border-2 border-gray-500 flex items-center justify-center shrink-0">${checkIcon}</div><div class="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center">${icon}</div><div class="flex-grow"><p class="task-title text-white font-semibold">${shot.text}</p></div><p class="text-sm text-gray-400">${shot.time || ""}</p></div>`;
    };
     const populateEditModal = (task) => {
    }

    function populateEditModal(task) {
if(!task) return;
const form = document.getElementById('edit-task-form');
form.querySelector('#edit-task-id').value = task.id;
@@ -274,12 +239,40 @@ document.addEventListener('DOMContentLoaded', () => {
const activePill = container.querySelector(`[data-category="${task.category}"]`);
if (activePill) activePill.classList.add('active');
else container.querySelector('.category-pill')?.classList.add('active');
    };
    }

    // ===================================================================
    //  INITIALIZATION
    // ===================================================================
function init() {
loadState();
        Object.values(render).forEach(renderFunc => renderFunc());
        showPage(appState.currentProjectId ? 'page-dashboard' : 'page-projects');
        renderAllPages(); // Render all pages once on startup
        
        // Setup initial page view
        showPage(appState.currentProjectId ? 'dashboard' : 'projects');

        // Setup event listeners that rely on initial render
        document.getElementById('nav-add-button').addEventListener('click', () => {
            if (!getCurrentProject()) {
                alert("Please select a project before adding a task.");
                showPage('projects');
                return;
            }
            pageContainers.addShot.querySelector('form').reset();
            const pillsContainer = pageContainers.addShot.querySelector('#category-pills-container');
            pillsContainer.innerHTML = CATEGORIES.map(cat => `<button type="button" data-category="${cat}" class="category-pill bg-gray-700 text-gray-300 rounded-full px-4 py-1.5 text-sm">${cat}</button>`).join('');
            pillsContainer.querySelector('.category-pill')?.classList.add('active');
            showPage('addShot');
        });
        document.getElementById('cancel-edit-btn')?.addEventListener('click', () => {
             document.getElementById('edit-task-modal').classList.add('hidden');
        });
        document.getElementById('reset-data-button')?.addEventListener('click', () => {
            if (confirm("ARE YOU SURE? This will delete all projects and settings permanently.")) {
                localStorage.removeItem('photographerAppState');
                location.reload();
            }
        });
}

init();
