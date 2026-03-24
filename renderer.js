let currentSession = {
    lastFolder: null,
    donePosts: {}
};

document.addEventListener('DOMContentLoaded', async () => {
    currentSession = await window.electronAPI.getSession() || { lastFolder: null, donePosts: {} };
    if (!currentSession.donePosts) currentSession.donePosts = {};
    
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
    currentPathSpan.textContent = folderPath;
    
    postsGrid.innerHTML = '<div class="empty-state">Escaneando carpeta...</div>';
    
    const posts = await window.electronAPI.readFolder(folderPath);
    
    if (posts.length === 0) {
        postsGrid.innerHTML = '<div class="empty-state">No se encontraron subcarpetas para procesar.</div>';
        return;
    }

    postsGrid.innerHTML = '';
    
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
                    <input type="checkbox" style="display:none;" class="done-checkbox" ${isDone ? 'checked' : ''}>
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
                <div class="info-value title-value">${post.title}</div>
            </div>
            
            <div class="info-group">
                <div class="info-label">Tags Generados</div>
                <div class="info-value tags-value">${post.tags}</div>
            </div>

            <div class="card-actions">
                <button class="btn secondary-btn btn-compress">Crear .rar</button>
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

        const btnCompress = card.querySelector('.btn-compress');
        btnCompress.addEventListener('click', async () => {
            const originalText = btnCompress.textContent;
            btnCompress.textContent = "Comprimiendo...";
            btnCompress.disabled = true;

            const result = await window.electronAPI.compressFolder(post.path);
            
            if (result.success) {
                btnCompress.textContent = "¡Comprimido!";
                btnCompress.style.background = "var(--success-color)";
            } else {
                alert("Error al comprimir: " + result.error + "\\nAsegúrate de que WinRAR está instalado y accesible en C:\\\\Program Files\\\\WinRAR\\\\Rar.exe.");
                btnCompress.textContent = "Error";
            }

            setTimeout(() => {
                btnCompress.textContent = originalText;
                btnCompress.disabled = false;
                btnCompress.style.background = "";
            }, 3000);
        });

        postsGrid.appendChild(card);
    });
}
