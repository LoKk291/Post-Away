const PIN = "19693101";

// State
let gestorData = []; // Array of months
let outputData = []; // Array of output characters
let qcData = {}; // Stores QC state for folders
let currentMonth = null; 
let currentDate = null; 
let currentFolderPath = null;
let currentTab = 'output'; // 'output' or 'months'
let returnTarget = 'dashboard'; // 'dashboard', 'dates', 'folders'

let images = [];
let currentImageIndex = 0;

// DOM Elements
const screens = {
    login: document.getElementById('login-screen'),
    dashboard: document.getElementById('dashboard-screen'),
    dates: document.getElementById('dates-screen'),
    folders: document.getElementById('folders-screen'),
    gallery: document.getElementById('gallery-screen')
};

function showScreen(screenName) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screens[screenName].classList.add('active');
}

// Login Logic
document.getElementById('btn-login').addEventListener('click', () => {
    const pinInput = document.getElementById('pin-input').value;
    if (pinInput === PIN) {
        showScreen('dashboard');
        loadDashboard();
    } else {
        const err = document.getElementById('pin-error');
        err.style.display = 'block';
        setTimeout(() => err.style.display = 'none', 3000);
    }
});

// Dashboard Tabs
document.getElementById('tab-output').addEventListener('click', (e) => {
    switchTab('output');
});
document.getElementById('tab-months').addEventListener('click', (e) => {
    switchTab('months');
});

function switchTab(tab) {
    currentTab = tab;
    const tabOutput = document.getElementById('tab-output');
    const tabMonths = document.getElementById('tab-months');
    const secOutput = document.getElementById('dashboard-output');
    const secMonths = document.getElementById('dashboard-months');

    if (tab === 'output') {
        tabOutput.style.color = 'white';
        tabOutput.style.borderBottom = '2px solid var(--primary-color)';
        tabMonths.style.color = 'var(--text-muted)';
        tabMonths.style.borderBottom = 'none';
        secOutput.style.display = 'block';
        secMonths.style.display = 'none';
    } else {
        tabMonths.style.color = 'white';
        tabMonths.style.borderBottom = '2px solid var(--primary-color)';
        tabOutput.style.color = 'var(--text-muted)';
        tabOutput.style.borderBottom = 'none';
        secMonths.style.display = 'block';
        secOutput.style.display = 'none';
    }
}

async function loadDashboard() {
    document.getElementById('no-dashboard-msg').style.display = 'none';
    
    // Fetch QC state first
    try {
        const qcRes = await fetch('/api/qc');
        qcData = await qcRes.json();
    } catch (e) {
        console.error("Error fetching QC state", e);
    }

    // Load Output
    const outputList = document.getElementById('output-list');
    outputList.className = 'list-container grid-view'; // Apply grid view
    outputList.innerHTML = '<i>Cargando output...</i>';
    try {
        const resOut = await fetch('/api/output-folders');
        const outData = await resOut.json();
        outputList.innerHTML = '';
        if (outData.error) {
            outputList.innerHTML = `<i>Error: ${outData.error}</i>`;
            outputList.className = 'list-container';
        } else if (outData.length === 0) {
            outputList.innerHTML = '<i>No hay personajes en el Output</i>';
            outputList.className = 'list-container';
        } else {
            outputData = outData;
            outputData.forEach(f => {
                const el = createFolderCard(f.name, f.path, () => {
                    returnTarget = 'dashboard';
                    openGallery(f.path, f.name);
                });
                outputList.appendChild(el);
            });
        }
    } catch (e) {
        outputList.innerHTML = '<i>Error al cargar Output</i>';
        outputList.className = 'list-container';
    }

    // Load Months
    const monthsList = document.getElementById('months-list');
    monthsList.innerHTML = '<i>Cargando meses...</i>';
    try {
        const resGestor = await fetch('/api/gestor');
        const gestorJson = await resGestor.json();
        monthsList.innerHTML = '';
        if (gestorJson.error) {
            monthsList.innerHTML = `<i>Error: ${gestorJson.error}</i>`;
        } else if (gestorJson.length === 0) {
            monthsList.innerHTML = '<i>No hay meses creados</i>';
        } else {
            gestorData = gestorJson;
            gestorData.forEach(month => {
                const el = document.createElement('div');
                el.className = 'folder-item';
                el.innerHTML = `📅 <span>${month.name}</span>`;
                el.addEventListener('click', () => openMonth(month));
                monthsList.appendChild(el);
            });
        }
    } catch (e) {
        monthsList.innerHTML = '<i>Error al cargar Gestor</i>';
    }
}

document.getElementById('btn-refresh-dashboard').addEventListener('click', loadDashboard);

// Gestor Hierarchy
function openMonth(month) {
    currentMonth = month;
    document.getElementById('dates-title').textContent = month.name;
    showScreen('dates');
    
    const listContainer = document.getElementById('dates-list');
    listContainer.innerHTML = '';
    
    if (!month.dates || month.dates.length === 0) {
        listContainer.innerHTML = '<i>No hay fechas en este mes</i>';
        return;
    }

    month.dates.forEach(date => {
        const el = document.createElement('div');
        el.className = 'folder-item';
        el.innerHTML = `📆 <span>${date.name}</span>`;
        el.addEventListener('click', () => openDate(date));
        listContainer.appendChild(el);
    });
}

document.querySelector('.btn-back-dashboard').addEventListener('click', () => {
    showScreen('dashboard');
});

async function openDate(date) {
    currentDate = date;
    document.getElementById('folders-title').textContent = date.name;
    showScreen('folders');
    
    const listContainer = document.getElementById('folders-list');
    listContainer.className = 'list-container grid-view';
    listContainer.innerHTML = '<i>Cargando carpetas...</i>';
    
    try {
        const qcRes = await fetch('/api/qc');
        qcData = await qcRes.json();
        
        const res = await fetch(`/api/folders?path=${encodeURIComponent(date.path)}`);
        const folders = await res.json();
        
        listContainer.innerHTML = '';
        if (folders.error) {
            listContainer.innerHTML = '<i>La fecha no se encontró en la PC.</i>';
            listContainer.className = 'list-container';
            return;
        }

        if (!Array.isArray(folders) || folders.length === 0) {
            listContainer.innerHTML = '<i>No hay posts en esta fecha</i>';
            listContainer.className = 'list-container';
            return;
        }

        folders.forEach(f => {
            const el = createFolderCard(f.name, f.path, () => {
                returnTarget = 'folders';
                openGallery(f.path, f.name);
            });
            listContainer.appendChild(el);
        });
    } catch (e) {
        console.error(e);
        listContainer.innerHTML = '<i>Error al cargar carpetas</i>';
        listContainer.className = 'list-container';
    }
}

// Helper to create character cards with QC toggle
function createFolderCard(folderName, folderPath, onClickHandler) {
    const el = document.createElement('div');
    el.className = 'folder-item';
    
    const isQcDone = qcData[folderName];
    
    el.innerHTML = `
        <div class="folder-icon">📁</div>
        <span>${folderName}</span>
        <button class="btn-qc-toggle ${isQcDone ? 'done' : ''}">
            ${isQcDone ? '✅ QC OK' : '❌ Sin QC'}
        </button>
    `;
    
    el.addEventListener('click', onClickHandler);
    
    const btnQc = el.querySelector('.btn-qc-toggle');
    btnQc.addEventListener('click', async (e) => {
        e.stopPropagation(); // Prevent opening gallery
        
        const isCurrentlyDone = btnQc.classList.contains('done');
        const newState = !isCurrentlyDone;
        
        // Optimistic UI update
        if (newState) {
            btnQc.classList.add('done');
            btnQc.textContent = '✅ QC OK';
        } else {
            btnQc.classList.remove('done');
            btnQc.textContent = '❌ Sin QC';
        }
        
        try {
            await fetch('/api/qc', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ folderName, isDone: newState })
            });
            qcData[folderName] = newState;
        } catch (err) {
            console.error("Error setting QC", err);
            alert("Error al guardar el estado QC");
        }
    });
    
    return el;
}

document.querySelector('.btn-back-dates').addEventListener('click', () => {
    showScreen('dates');
});

// Gallery Logic
async function openGallery(folderPath, folderName) {
    currentFolderPath = folderPath;
    document.getElementById('gallery-title').textContent = folderName;
    showScreen('gallery');
    
    // Set initial toggle button state
    const isNova = folderName.toLowerCase().includes('[nova]');
    const btnToggle = document.getElementById('btn-toggle-nova');
    btnToggle.textContent = isNova ? 'Nicky 🔀' : 'Nova 🔀';
    
    document.getElementById('image-container').innerHTML = '<div style="color:white">Cargando...</div>';
    document.getElementById('image-counter').textContent = "0/0";
    
    try {
        const res = await fetch(`/api/images?path=${encodeURIComponent(folderPath)}`);
        images = await res.json();
        
        if (images.length > 0) {
            currentImageIndex = 0;
            renderImage();
        } else {
            document.getElementById('image-container').innerHTML = '<div style="color:white">No hay imágenes</div>';
        }
    } catch (e) {
        console.error(e);
        document.getElementById('image-container').innerHTML = '<div style="color:white">Error</div>';
    }
}

function renderImage() {
    const container = document.getElementById('image-container');
    if (images.length === 0) {
        container.innerHTML = '<div style="color:white">No hay imágenes</div>';
        document.getElementById('image-counter').textContent = "0/0";
        return;
    }
    
    const imgData = images[currentImageIndex];
    container.innerHTML = `<img id="current-image" src="/api/image?path=${encodeURIComponent(imgData.path)}" alt="${imgData.name}">`;
    document.getElementById('image-counter').textContent = `${currentImageIndex + 1} / ${images.length}`;
}

document.getElementById('btn-conservar-img').addEventListener('click', () => {
    if (currentImageIndex < images.length - 1) {
        currentImageIndex++;
        renderImage();
    } else {
        alert("Última imagen alcanzada.");
    }
});

document.getElementById('btn-destacar-img').addEventListener('click', async () => {
    if (images.length === 0) return;
    const imgData = images[currentImageIndex];
    const btn = document.getElementById('btn-destacar-img');
    btn.disabled = true;
    btn.textContent = '...';
    
    const dotIndex = imgData.name.lastIndexOf('.');
    const ext = dotIndex !== -1 ? imgData.name.substring(dotIndex) : '';
    const alphabet = 'abcdefghijklmnopqrstuvwxyz';
    let newName = null;
    const currentNames = images.map(i => i.name.toLowerCase());
    
    for (let i = 0; i < alphabet.length; i++) {
        const testName = alphabet[i] + ext.toLowerCase();
        if (!currentNames.includes(testName)) {
            newName = alphabet[i] + ext;
            break;
        }
    }
    if (!newName) {
        let index = 26;
        while (!newName && index < 1000) {
            const char1 = alphabet[Math.floor(index / 26) - 1];
            const char2 = alphabet[index % 26];
            const testName = char1 + char2 + ext.toLowerCase();
            if (!currentNames.includes(testName)) {
                newName = char1 + char2 + ext;
            }
            index++;
        }
    }
    
    if (newName && newName !== imgData.name) {
        try {
            const res = await fetch('/api/rename', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ oldPath: imgData.path, newName })
            });
            const result = await res.json();
            if (result.success) {
                // Refrescar galería entera
                await openGallery(currentFolderPath, document.getElementById('gallery-title').textContent);
            } else {
                alert("Error al destacar: " + result.error);
            }
        } catch(e) {
            alert("Error de red");
        }
    } else {
        alert("Ya está destacada o error al nombrar.");
    }
    btn.disabled = false;
    btn.innerHTML = '⭐ Destacar';
});

document.getElementById('btn-toggle-nova').addEventListener('click', async () => {
    if (!currentFolderPath) return;
    const btn = document.getElementById('btn-toggle-nova');
    btn.disabled = true;
    try {
        const res = await fetch(`/api/toggle-nicky-nova?path=${encodeURIComponent(currentFolderPath)}`);
        const data = await res.json();
        if (data.counterpartPath) {
            // Find base name without [Nova] or [Nicky] to append the correct one
            const currentTitle = document.getElementById('gallery-title').textContent;
            let cleanTitle = currentTitle.replace(/\s*-\s*\[Nicky\].*$/i, '').replace(/\s*-\s*\[Nova\].*$/i, '');
            const newTitle = cleanTitle + (data.isTargetNova ? ' - [Nova]' : ' - [Nicky]');
            openGallery(data.counterpartPath, newTitle);
        } else {
            alert(`No se encontró carpeta equivalente para este personaje.`);
        }
    } catch(e) {
        console.error(e);
        alert("Error al buscar versión.");
    }
    btn.disabled = false;
});

document.getElementById('btn-delete-img').addEventListener('click', async () => {
    if (images.length === 0) return;
    
    const imgData = images[currentImageIndex];
    if (confirm(`¿Eliminar ${imgData.name}?`)) {
        try {
            const res = await fetch('/api/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ path: imgData.path })
            });
            const result = await res.json();
            
            if (result.success) {
                // Remove from array
                images.splice(currentImageIndex, 1);
                // Adjust index if we deleted the last image
                if (currentImageIndex >= images.length) {
                    currentImageIndex = Math.max(0, images.length - 1);
                }
                renderImage();
            } else {
                alert("Error al eliminar: " + result.error);
            }
        } catch (e) {
            console.error(e);
            alert("Error de red");
        }
    }
});

document.querySelector('.btn-back-gallery').addEventListener('click', () => {
    if (returnTarget === 'dashboard') {
        showScreen('dashboard');
    } else if (returnTarget === 'folders') {
        showScreen('folders');
    }
});
