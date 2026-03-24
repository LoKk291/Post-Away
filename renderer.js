let currentSession = {
    lastFolder: null,
    donePosts: {}
};
let currentCompressionRun = null;
let currentPosts = [];
let autoQueue = [];
let isAutoRunning = false;

document.addEventListener('DOMContentLoaded', async () => {
    currentSession = await window.electronAPI.getSession() || { lastFolder: null, donePosts: {} };
    if (!currentSession.donePosts) currentSession.donePosts = {};
    
    // Setup generic configs
    const globalDate = document.getElementById('global-date');
    const globalTime = document.getElementById('global-time');
    
    if (currentSession.globalDate) globalDate.value = currentSession.globalDate;
    if (currentSession.globalTime) globalTime.value = currentSession.globalTime;

    const saveSettings = async () => {
        currentSession.globalDate = globalDate.value;
        currentSession.globalTime = globalTime.value;
        await saveSession();
    };
    
    globalDate.addEventListener('change', saveSettings);
    globalTime.addEventListener('change', saveSettings);

    document.getElementById('btn-auto-all').addEventListener('click', () => {
        if (!currentPosts || currentPosts.length === 0) return alert('No hay posts cargados.');
        autoQueue = currentPosts.filter(p => !currentSession.donePosts[p.id]);
        if (autoQueue.length === 0) return alert('No hay posts pendientes.');
        
        isAutoRunning = true;
        window.electronAPI.openPatreon();
    });

    window.electronAPI.onAutoQueueReady(async () => {
        if (!isAutoRunning || autoQueue.length === 0) return;
        const post = autoQueue[0];
        await window.electronAPI.fillPatreon({ 
            title: post.title, 
            tags: post.tags,
            anime: post.anime,
            scheduleDate: globalDate.value,
            scheduleTime: globalTime.value
        });
    });

    window.electronAPI.onAutoQueueDone(() => {
        if (!isAutoRunning || autoQueue.length === 0) return;
        const post = autoQueue.shift();
        
        const checkbox = document.querySelector(`.done-checkbox[data-id="${post.id}"]`);
        if (checkbox && !checkbox.checked) checkbox.click();
        
        if (autoQueue.length > 0) {
            setTimeout(() => window.electronAPI.openPatreon(), 1500);
        } else {
            isAutoRunning = false;
            alert("¡Súper Automatización finalizada! Todas las publicaciones están subidas.");
        }
    });

    if (currentSession.lastFolder) {
        await loadFolderData(currentSession.lastFolder);
    }

    const btnSelect = document.getElementById('btn-select');
    btnSelect.addEventListener('click', async () => {
        const folder = await window.electronAPI.selectFolder();
        if (folder) {
            currentSession.lastFolder = folder;
            await saveSession();
            await loadFolderData(folder);
        }
    });
});

async function saveSession() {
    await window.electronAPI.saveSession(currentSession);
}

async function loadFolderData(folderPath) {
    const pathIndicator = document.getElementById('path-indicator');
    const currentPathSpan = document.getElementById('current-path');
    const postsGrid = document.getElementById('posts-grid');
    
    pathIndicator.classList.remove('hidden');
    document.getElementById('global-settings').classList.remove('hidden');
    currentPathSpan.textContent = folderPath;
    
    postsGrid.innerHTML = '<div class="empty-state">Escaneando carpeta...</div>';
    
    const posts = await window.electronAPI.readFolder(folderPath);
    
    if (posts.length === 0) {
        postsGrid.innerHTML = '<div class="empty-state">No se encontraron subcarpetas para procesar.</div>';
        return;
    }

    postsGrid.innerHTML = '';
    const cardsElements = [];
    currentPosts = posts;

    // Calculate stats
    let totalImages = 0;
    posts.forEach(p => totalImages += p.imagesCount);
    document.getElementById('stat-posts').textContent = posts.length;
    document.getElementById('stat-images').textContent = totalImages;
    
    // Set a new unique run token
    const thisRun = Symbol();
    currentCompressionRun = thisRun;
    
    posts.forEach(post => {
        const card = document.createElement('div');
        card.className = 'post-card';
        if (currentSession.donePosts[post.id]) {
            card.classList.add('done');
        }

        const isDone = !!currentSession.donePosts[post.id];

        let thumbnailHtml = `<div class="thumbnail-container">
            <span class="no-thumbnail">No hay imágenes</span>
        </div>`;
        
        if (post.thumbnail) {
            thumbnailHtml = `<div class="thumbnail-container">
                <img src="${post.thumbnail}" class="thumbnail" alt="Thumbnail">
            </div>`;
        }

        card.innerHTML = `
            <div class="card-header">
                <div class="folder-name">${post.folderName}</div>
                <label class="checkbox-wrapper">
                    <input type="checkbox" style="display:none;" class="done-checkbox" data-id="${post.id}" ${isDone ? 'checked' : ''}>
                    <div class="custom-checkbox">
                        <svg viewBox="0 0 24 24" class="checkmark-svg">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </div>
                </label>
            </div>
            
            ${thumbnailHtml}
            
            <div class="info-group">
                <div class="info-label">Título para Patreon</div>
                <div class="info-value-container">
                    <div class="info-value title-value">${post.title}</div>
                    <button class="copy-btn copy-title" title="Copiar Título">
                        <svg viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
                    </button>
                </div>
            </div>
            
            <div class="info-group">
                <div class="info-label">Tags Generados</div>
                <div class="info-value-container">
                    <div class="info-value tags-value">${post.tags}</div>
                    <button class="copy-btn copy-tags" title="Copiar Tags">
                        <svg viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
                    </button>
                </div>
            </div>

            <div class="card-actions" style="flex-direction: column;">
                <button class="btn primary-btn btn-autofill" title="Autorellenar los datos en una pestaña abierta de Patreon usando la extensión de Brave.">Autorellenar en Patreon</button>
                <button class="btn secondary-btn btn-compress">Pendiente de Compresión...</button>
            </div>
        `;

        const checkbox = card.querySelector('.done-checkbox');
        checkbox.addEventListener('change', async (e) => {
            if (e.target.checked) {
                card.classList.add('done');
                currentSession.donePosts[post.id] = true;
            } else {
                card.classList.remove('done');
                delete currentSession.donePosts[post.id];
            }
            await saveSession();
        });
        
        const btnCopyTitle = card.querySelector('.copy-title');
        btnCopyTitle.addEventListener('click', () => {
            navigator.clipboard.writeText(post.title);
            btnCopyTitle.style.color = 'var(--success-color)';
            setTimeout(() => btnCopyTitle.style.color = '', 1500);
        });

        const btnCopyTags = card.querySelector('.copy-tags');
        btnCopyTags.addEventListener('click', () => {
            navigator.clipboard.writeText(post.tags);
            btnCopyTags.style.color = 'var(--success-color)';
            setTimeout(() => btnCopyTags.style.color = '', 1500);
        });

        // Extension Auto-Fill Event
        const btnAutofill = card.querySelector('.btn-autofill');
        btnAutofill.addEventListener('click', async () => {
            const originalText = btnAutofill.textContent;
            btnAutofill.textContent = "Enviando...";
            
            const scheduleDate = document.getElementById('global-date').value;
            const scheduleTime = document.getElementById('global-time').value;

            const res = await window.electronAPI.fillPatreon({ 
                title: post.title, 
                tags: post.tags,
                anime: post.anime,
                scheduleDate,
                scheduleTime
            });
            
            if (res.receivers > 0) {
                btnAutofill.textContent = "¡Enviado a Brave!";
                btnAutofill.style.background = "var(--success-color)";
            } else {
                btnAutofill.textContent = "No hay extensión conectada";
                btnAutofill.style.background = "#eab308";
            }
            
            setTimeout(() => {
                btnAutofill.textContent = originalText;
                btnAutofill.style.background = "";
            }, 3000);
        });

        const btnCompress = card.querySelector('.btn-compress');
        btnCompress.addEventListener('click', async () => {
            btnCompress.textContent = "Comprimiendo manualmente...";
            btnCompress.disabled = true;

            const result = await window.electronAPI.compressFolder(post.path);
            
            if (result.success) {
                btnCompress.textContent = "¡Comprimido!";
                btnCompress.style.background = "var(--success-color)";
            } else {
                alert("Error al comprimir: " + result.error);
                btnCompress.textContent = "Reintentar";
                btnCompress.disabled = false;
            }
        });

        postsGrid.appendChild(card);
        cardsElements.push({ post, btnCompress });
    });
    
    startBackgroundCompression(cardsElements, thisRun);
}

async function startBackgroundCompression(elements, runToken) {
    for (const item of elements) {
        if (currentCompressionRun !== runToken) return;
        
        const { post, btnCompress } = item;
        
        if (btnCompress.disabled || btnCompress.textContent === "¡Comprimido!" || btnCompress.textContent === "¡Comprimido en 2do plano!") continue;

        btnCompress.textContent = "Generando .rar autom. ...";
        btnCompress.disabled = true;

        const result = await window.electronAPI.compressFolder(post.path);
        
        if (currentCompressionRun !== runToken) return;

        if (result.success) {
            btnCompress.textContent = "¡Comprimido en 2do plano!";
            btnCompress.disabled = true;
            btnCompress.style.background = "var(--success-color)";
            btnCompress.style.opacity = "0.7";
        } else {
            console.error("Error comprimiendo", post.path, result.error);
            btnCompress.textContent = "Reintentar comprimir";
            btnCompress.disabled = false;
        }
    }
}
