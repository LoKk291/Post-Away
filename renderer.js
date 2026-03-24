let currentSession = {
    lastFolder: null,
    donePosts: {}
};
let currentCompressionRun = null;
let currentPosts = [];
let autoQueue = [];
let isAutoRunning = false;
let totalAutoQueueSize = 0;
let ignoreNextDone = false;

function highlightActivePost(postId) {
    document.querySelectorAll('.post-card').forEach(c => c.classList.remove('active-upload'));
    if (postId) {
        const cb = document.querySelector(`.done-checkbox[data-id="${postId}"]`);
        if (cb) {
            const card = cb.closest('.post-card');
            card.classList.add('active-upload');
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
}

function updateAutoProgressUI() {
    const progressBlock = document.getElementById('auto-progress');
    const nameEl = document.getElementById('auto-current-name');
    const indexEl = document.getElementById('auto-current-index');
    
    if (isAutoRunning && autoQueue.length > 0) {
        progressBlock.style.display = 'block';
        nameEl.textContent = autoQueue[0].folderName;
        indexEl.textContent = totalAutoQueueSize - autoQueue.length + 1;
    } else {
        progressBlock.style.display = 'none';
        highlightActivePost(null);
    }
}

function updateGlobalRarStatus(elements) {
    const rarStatus = document.getElementById('rar-status');
    const btnAutoAll = document.getElementById('btn-auto-all');
    if (!rarStatus) return;
    let completed = 0;
    for (const item of elements) {
        if (item.btnCompress.textContent.includes("Comprimido")) {
            completed++;
            if (item.btnAutofill) {
                item.btnAutofill.disabled = false;
                item.btnAutofill.style.opacity = '1';
                item.btnAutofill.title = "Autorellenar en Patreon Web";
            }
        } else {
            if (item.btnAutofill) {
                item.btnAutofill.disabled = true;
                item.btnAutofill.style.opacity = '0.5';
                item.btnAutofill.title = "Deshabilitado hasta que el .rar termine";
            }
        }
    }
    
    if (completed >= elements.length && elements.length > 0) {
        rarStatus.style.background = 'rgba(16, 185, 129, 0.2)';
        rarStatus.style.color = '#6ee7b7';
        rarStatus.style.borderColor = 'rgba(16, 185, 129, 0.5)';
        rarStatus.innerHTML = `✅ ¡Todos los .rar están listos! (${completed}/${elements.length})`;
        if (btnAutoAll) {
            btnAutoAll.disabled = false;
            btnAutoAll.style.opacity = '1';
            btnAutoAll.style.cursor = 'pointer';
        }
    } else if (elements.length > 0) {
        rarStatus.style.background = 'rgba(234, 179, 8, 0.2)';
        rarStatus.style.color = '#fde047';
        rarStatus.style.borderColor = 'rgba(234, 179, 8, 0.5)';
        rarStatus.innerHTML = `⏳ Generando archivos .rar en segundo plano... (<span id="rar-count">${completed}</span>/<span id="rar-total">${elements.length}</span>)`;
        if (btnAutoAll) {
            btnAutoAll.disabled = true;
            btnAutoAll.style.opacity = '0.5';
            btnAutoAll.style.cursor = 'not-allowed';
        }
    } else {
        rarStatus.innerHTML = "";
        rarStatus.style.background = "transparent";
        rarStatus.style.border = "none";
    }
}

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
        
        if (document.getElementById('btn-auto-all').disabled) return alert('Por favor espera a que todos los .rar se terminen de generar.');
        totalAutoQueueSize = autoQueue.length;
        isAutoRunning = true;
        
        document.getElementById('auto-total').textContent = totalAutoQueueSize;
        updateAutoProgressUI();
        highlightActivePost(autoQueue[0].id);
        
        window.electronAPI.openPatreon();
    });

    document.getElementById('btn-auto-skip').addEventListener('click', () => {
        if (!isAutoRunning || autoQueue.length === 0) return;
        ignoreNextDone = true;
        autoQueue.shift();
        
        if (autoQueue.length > 0) {
            updateAutoProgressUI();
            highlightActivePost(autoQueue[0].id);
            window.electronAPI.openPatreon();
        } else {
            isAutoRunning = false;
            updateAutoProgressUI();
            alert("¡Haz saltado el último post. Automatización finalizada!");
        }
    });

    document.getElementById('btn-auto-stop').addEventListener('click', () => {
        isAutoRunning = false;
        autoQueue = [];
        updateAutoProgressUI();
    });

    document.getElementById('btn-toggle-all').addEventListener('click', () => {
        const checkboxes = Array.from(document.querySelectorAll('.done-checkbox'));
        if (checkboxes.length === 0) return;
        const checkedCount = checkboxes.filter(cb => cb.checked).length;
        const targetState = checkedCount < checkboxes.length / 2;
        checkboxes.forEach(cb => {
            if (cb.checked !== targetState) cb.click();
        });
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
        if (ignoreNextDone) {
            ignoreNextDone = false;
            return;
        }
        if (!isAutoRunning || autoQueue.length === 0) return;
        const post = autoQueue.shift();
        
        const checkbox = document.querySelector(`.done-checkbox[data-id="${post.id}"]`);
        if (checkbox && !checkbox.checked) checkbox.click();
        
        if (autoQueue.length > 0) {
            updateAutoProgressUI();
            highlightActivePost(autoQueue[0].id);
            setTimeout(() => window.electronAPI.openPatreon(), 100);
        } else {
            isAutoRunning = false;
            updateAutoProgressUI();
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

    document.getElementById('btn-clear').addEventListener('click', async () => {
        if (!confirm('¿Estás seguro de que quieres limpiar toda la grilla de posts? Esto removerá la carpeta actual y reiniciará tu panel.')) return;
        
        currentSession.lastFolder = null;
        currentSession.donePosts = {};
        await saveSession();
        
        currentPosts = [];
        autoQueue = [];
        isAutoRunning = false;
        
        document.getElementById('btn-clear').style.display = 'none';
        document.getElementById('global-settings').classList.add('hidden');
        document.getElementById('path-indicator').classList.add('hidden');
        document.querySelector('.grid-actions').style.display = 'none';
        document.getElementById('posts-grid').innerHTML = `
            <div class="empty-state">
                Selecciona una carpeta para comenzar a organizar tus posts.
            </div>
        `;
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
    document.getElementById('btn-clear').style.display = 'block';
    document.querySelector('.grid-actions').style.display = 'flex';
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
            if (btnAutofill.disabled) return alert('Debes esperar a que el .rar asociado termine de generarse para subir a Patreon.');
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
                updateGlobalRarStatus(cardsElements);
            } else {
                alert("Error al comprimir: " + result.error);
                btnCompress.textContent = "Reintentar";
                btnCompress.disabled = false;
            }
        });

        postsGrid.appendChild(card);
        cardsElements.push({ post, btnCompress, btnAutofill });
    });
    
    updateGlobalRarStatus(cardsElements);
    startBackgroundCompression(cardsElements, thisRun);
}

async function startBackgroundCompression(elements, runToken) {
    for (const item of elements) {
        if (currentCompressionRun !== runToken) return;
        
        const { post, btnCompress } = item;
        
        if (btnCompress.disabled || btnCompress.textContent.includes("Comprimido")) continue;

        btnCompress.textContent = "Generando .rar autom. ...";
        btnCompress.disabled = true;

        const result = await window.electronAPI.compressFolder(post.path);
        
        if (currentCompressionRun !== runToken) return;

        if (result.success) {
            btnCompress.textContent = "¡Comprimido en 2do plano!";
            btnCompress.disabled = true;
            btnCompress.style.background = "var(--success-color)";
            btnCompress.style.opacity = "0.7";
            updateGlobalRarStatus(elements);
        } else {
            console.error("Error comprimiendo", post.path, result.error);
            btnCompress.textContent = "Reintentar comprimir";
            btnCompress.disabled = false;
        }
    }
}
