let currentSession = {
    lastFolder: null,
    donePosts: {}
};
let currentCompressionRun = null;
let currentPosts = [];
let currentCardsElements = [];
let isCompressingBackground = false;

const twitterTexts = [
    { en: "I hope it fills me up 🥛🥛", es: "¡Espero que esto me llene...! 🥛🥛" },
    { en: "What a great pair of... 🍒🍒", es: "¡Qué gran par de...! 🍒🍒" },
    { en: "Would my throat hold up...? 🥵🥵", es: "¿Dará mi garganta para esto...? 🥵🥵" },
    { en: "They look really juicy 😛😛", es: "¡Se ven muy jugosos! 😛😛" },
    { en: "I'm ready to take it all in 💦💦", es: "Estoy lista para recibirlo todo 💦💦" },
    { en: "Do you like the view from here? 👀🍑", es: "¿Te gusta la vista por acá? 👀🍑" },
    { en: "It’s bigger than I thought 😲🔥", es: "Es más grande de lo que pensaba 😲🔥" },
    { en: "I can't stop thinking about... 🤤💖", es: "No puedo dejar de pensar en... 🤤💖" },
    { en: "Is it for me...? 🎁🙈", es: "¿Es para mí...? 🎁🙈" },
    { en: "It's getting so hot... 🌡️💦", es: "Se está calentando todo... 🌡️💦" },
    { en: "I want to feel it inside 🖤🔥", es: "Quiero sentirlo adentro 🖤🔥" },
    { en: "So soft and yet so firm ☁️✨", es: "Tan suave y a la vez firme ☁️✨" },
    { en: "It tastes even better than it looks 🍭🍓", es: "Sabe aún mejor de lo que se ve 🍭🍓" },
    { en: "I'm feeling so naughty today 😈🍒", es: "Me siento muy traviesa hoy 😈🍒" },
    { en: "Can I have a taste...? 👅💦", es: "¿Puedo probar un poquito...? 👅💦" },
    { en: "The perfect size for me 📏👌", es: "El tamaño perfecto para mí 📏👌" },
    { en: "I'm dripping for you 💧🤤", es: "Estoy goteando por ti 💧🤤" },
    { en: "I want to be filled up 🥛💧", es: "Quiero que me rellenes 🥛💧" },
    { en: "Look at these babies 🍼🍼", es: "Mira a estos bebés 🍼🍼" },
    { en: "Ready for your presence 👑💦", es: "Lista para tu presencia 👑💦" },
    { en: "I think it belongs here 📥🔥", es: "Creo que esto pertenece aquí 📥🔥" },
    { en: "So much for me to handle? 👐💥", es: "¿Demasiado para que lo maneje? 👐💥" },
    { en: "I love how it feels... 💓✨", es: "Me encanta cómo se siente... 💓✨" },
    { en: "Don't stop now... 🚫🛑", es: "No pares ahora... 🚫🛑" },
    { en: "I want to be your favorite toy 🧸💕", es: "Quiero ser tu juguete favorito 🧸💕" },
    { en: "It’s so thick... 😮📏", es: "Está tan grueso... 😮📏" },
    { en: "Give it to me 🖐️🔥", es: "Dámelo ya 🖐️🔥" },
    { en: "I'm your little secret 🤫💖", es: "Soy tu pequeño secreto 🤫💖" },
    { en: "My mouth is watering 🤤👄", es: "Se me hace agua la boca 🤤👄" },
    { en: "Can you make it splash? 💦🌊", es: "¿Puedes hacerlo salpicar? 💦🌊" },
    { en: "I'm all yours 🎀🗝️", es: "Soy toda tuya 🎀🗝️" },
    { en: "Let's get messy 🧁🥛", es: "Hagamos un desastre 🧁🥛" },
    { en: "I can take more 📈🔥", es: "Puedo aguantar más 📈🔥" },
    { en: "Do you like my posture? 🧘‍♀️🍑", es: "¿Te gusta mi postura? 🧘‍♀️🍑" },
    { en: "I'm waiting for the cream 🥛✨", es: "Estoy esperando la cremita 🥛✨" },
    { en: "Is it too deep for me? 🌊😰", es: "¿Será muy profundo para mí? 🌊😰" },
    { en: "I want to be your meal 🍽️😋", es: "Quiero ser tu comida 🍽️😋" },
    { en: "It fits perfectly 🧩📦", es: "Encaja perfectamente 🧩📦" },
    { en: "I'm ready for the explosion 💣💥", es: "Lista para la explosión 💣💥" },
    { en: "Keep me satisfied 🏆💖", es: "Manténme satisfecha 🏆💖" },
    { en: "I love the pressure 💎💪", es: "Amo la presión 💎💪" },
    { en: "Make me moan 🎵❤️", es: "Hazme gemir 🎵❤️" },
    { en: "So shiny and smooth ✨🍯", es: "Tan briloso y suave ✨🍯" },
    { en: "I want every drop 💧🥛", es: "Quiero cada gota 💧🥛" },
    { en: "Don't be shy with it 🙈💥", es: "No seas tímido con eso 🙈💥" },
    { en: "I'm your designated space 📍🔥", es: "Soy tu espacio designado 📍🔥" },
    { en: "Are you ready to fill me? 📥🍼", es: "¿Listo para rellenarme? 📥🍼" },
    { en: "I can't wait to feel it 🕛💦", es: "No puedo esperar a sentirlo 🕛💦" },
    { en: "It's so heavy... 🏋️‍♀️💋", es: "Pesa tanto... 🏋️‍♀️💋" },
    { en: "Thinking about the taste 👅💭", es: "Pensando en el sabor 👅💭" }
];

function getRandomTwitterText() {
    return twitterTexts[Math.floor(Math.random() * twitterTexts.length)];
}





function updateGlobalRarStatus(elements) {
    const rarStatus = document.getElementById('rar-status');
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
        
        const btnCompressAll = document.getElementById('btn-compress-all');
        if (btnCompressAll) btnCompressAll.style.display = 'none';
    } else if (elements.length > 0) {
        rarStatus.style.background = 'rgba(234, 179, 8, 0.2)';
        rarStatus.style.color = '#fde047';
        rarStatus.style.borderColor = 'rgba(234, 179, 8, 0.5)';
        if (isCompressingBackground) {
            rarStatus.innerHTML = `⏳ Generando archivos .rar en segundo plano... (<span id="rar-count">${completed}</span>/<span id="rar-total">${elements.length}</span>)`;
        } else {
            rarStatus.innerHTML = `⏳ Archivos preparados para comprimir: (<span id="rar-count">${completed}</span>/<span id="rar-total">${elements.length}</span>)`;
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
    
    // Lock Screen Logic
    const lockScreen = document.getElementById('lock-screen');
    const mainApp = document.getElementById('main-app');
    const pinInput = document.getElementById('pin-input');
    const btnUnlock = document.getElementById('btn-unlock');
    const pinError = document.getElementById('pin-error');

    const checkPin = () => {
        if (pinInput.value === '19693101') {
            lockScreen.style.opacity = '0';
            setTimeout(() => {
                lockScreen.style.display = 'none';
                mainApp.style.display = 'block';
            }, 300);
        } else {
            pinError.style.display = 'block';
            pinInput.value = '';
            pinInput.focus();
            setTimeout(() => pinError.style.display = 'none', 3000);
        }
    };

    btnUnlock.addEventListener('click', checkPin);
    pinInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') checkPin();
    });
    
    // Setup generic configs
    const globalDate = document.getElementById('global-date');
    const globalTime = document.getElementById('global-time');
    const profileNova = document.getElementById('profile-nova');
    const profileNicky = document.getElementById('profile-nicky');
    const profileNovaLabel = document.getElementById('profile-nova-label');
    const profileNickyLabel = document.getElementById('profile-nicky-label');
    
    if (currentSession.globalDate) globalDate.value = currentSession.globalDate;
    if (currentSession.globalTime) globalTime.value = currentSession.globalTime;

    const updateProfileUI = () => {
        const isNova = currentSession.activeProfile === 'nova';
        profileNova.checked = isNova;
        profileNicky.checked = !isNova;
        profileNovaLabel.style.background = isNova ? 'rgba(244, 114, 182, 0.2)' : 'transparent';
        profileNickyLabel.style.background = !isNova ? 'rgba(96, 165, 250, 0.2)' : 'transparent';
    };
    if (!currentSession.activeProfile) currentSession.activeProfile = 'nicky';
    updateProfileUI();

    profileNova.addEventListener('change', async () => {
        currentSession.activeProfile = 'nova';
        updateProfileUI();
        await saveSession();
        if (currentPosts.length > 0) renderTwitterGrid(currentPosts);
    });
    profileNicky.addEventListener('change', async () => {
        currentSession.activeProfile = 'nicky';
        updateProfileUI();
        await saveSession();
        if (currentPosts.length > 0) renderTwitterGrid(currentPosts);
    });

    const saveSettings = async () => {
        currentSession.globalDate = globalDate.value;
        currentSession.globalTime = globalTime.value;
        await saveSession();
    };
    
    globalDate.addEventListener('change', saveSettings);
    globalTime.addEventListener('change', saveSettings);

    // Tab Switching Logic
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.tab;

            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            tabContents.forEach(content => {
                if (content.id === `dashboard-${target}`) {
                    content.classList.remove('hidden');
                } else {
                    content.classList.add('hidden');
                }
            });
        });
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

    document.getElementById('btn-compress-all').addEventListener('click', () => {
        if (!currentCardsElements || currentCardsElements.length === 0) return;
        
        isCompressingBackground = true;
        document.getElementById('btn-compress-all').disabled = true;
        document.getElementById('btn-compress-all').textContent = "📦 Comprimiendo archivos en segundo plano...";
        document.getElementById('btn-compress-all').style.cursor = "not-allowed";
        document.getElementById('btn-compress-all').style.opacity = "0.7";
        
        const thisRun = Symbol();
        currentCompressionRun = thisRun;
        
        updateGlobalRarStatus(currentCardsElements);
        startBackgroundCompression(currentCardsElements, thisRun);
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

    const btnOpenExplorer = document.getElementById('btn-open-explorer');
    btnOpenExplorer.addEventListener('click', async () => {
        if (currentSession.lastFolder) {
            await window.electronAPI.openFolder(currentSession.lastFolder);
        }
    });

    document.getElementById('btn-clear').addEventListener('click', async () => {
        if (!confirm('¿Estás seguro de que quieres limpiar toda la grilla de posts? Esto removerá la carpeta actual y reiniciará tu panel.')) return;
        
        currentSession.lastFolder = null;
        currentSession.donePosts = {};
        await saveSession();
        
        currentPosts = [];
        currentCardsElements = [];
        isCompressingBackground = false;
        currentCompressionRun = null;
        
        document.getElementById('btn-clear').style.display = 'none';
        const btnCompressAll = document.getElementById('btn-compress-all');
        if (btnCompressAll) btnCompressAll.style.display = 'none';
        document.getElementById('global-settings').classList.add('hidden');
        document.getElementById('path-indicator').classList.add('hidden');
        document.getElementById('app-tabs').classList.add('hidden');
        document.querySelectorAll('.grid-actions').forEach(el => el.style.display = 'none');
        document.getElementById('posts-grid').innerHTML = `
            <div class="empty-state">
                Selecciona una carpeta para comenzar a organizar tus posts.
            </div>
        `;
        document.getElementById('twitter-grid').innerHTML = `
            <div class="empty-state">
                No hay carpetas seleccionadas.
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
    document.getElementById('app-tabs').classList.remove('hidden');
    document.getElementById('global-settings').classList.remove('hidden');
    document.getElementById('btn-clear').style.display = 'block';
    document.querySelectorAll('.grid-actions').forEach(el => el.style.display = 'flex');
    currentPathSpan.textContent = folderPath;
    
    postsGrid.innerHTML = '<div class="empty-state">Escaneando carpeta...</div>';
    document.getElementById('twitter-grid').innerHTML = '<div class="empty-state">Cargando feed de X...</div>';
    
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
    
    isCompressingBackground = false;
    currentCompressionRun = null;
    
    const btnCompressAll = document.getElementById('btn-compress-all');
    if (btnCompressAll) {
        btnCompressAll.style.display = 'block';
        btnCompressAll.disabled = false;
        btnCompressAll.textContent = "📦 Iniciar Compresión de Todos los .rar";
        btnCompressAll.style.cursor = "pointer";
        btnCompressAll.style.opacity = "1";
    }
    
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
                    <textarea class="info-value title-value edit-area">${post.title}</textarea>
                    <button class="copy-btn copy-title" title="Copiar Título">
                        <svg viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
                    </button>
                </div>
            </div>
            
            <div class="info-group">
                <div class="info-label">Tags Generados</div>
                <div class="info-value-container">
                    <textarea class="info-value tags-value edit-area">${post.tags}</textarea>
                    <button class="copy-btn copy-tags" title="Copiar Tags">
                        <svg viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
                    </button>
                </div>
            </div>

            <div class="info-group">
                <div class="info-label">Categoría (Collection Override)</div>
                <div style="display:flex;gap:10px;margin-top:4px;">
                    <label style="display:flex;align-items:center;gap:5px;cursor:pointer;font-size:13px;color:#ccc;">
                        <input type="checkbox" class="category-cb" data-category="Videogames" style="accent-color:#8b5cf6;width:16px;height:16px;cursor:pointer;">
                        Videogames
                    </label>
                    <label style="display:flex;align-items:center;gap:5px;cursor:pointer;font-size:13px;color:#ccc;">
                        <input type="checkbox" class="category-cb" data-category="Animated Series" style="accent-color:#8b5cf6;width:16px;height:16px;cursor:pointer;">
                        Animated Series
                    </label>
                </div>
            </div>

            <div class="card-actions" style="flex-direction: column;">
                <button class="btn primary-btn btn-autofill" title="Autorellenar los datos en una pestaña abierta de Patreon.">Autorellenar en Patreon</button>
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
            const currentTitle = card.querySelector('.title-value').value;
            navigator.clipboard.writeText(currentTitle);
            btnCopyTitle.style.color = 'var(--success-color)';
            setTimeout(() => btnCopyTitle.style.color = '', 1500);
        });

        const btnCopyTags = card.querySelector('.copy-tags');
        btnCopyTags.addEventListener('click', () => {
            const currentTags = card.querySelector('.tags-value').value;
            navigator.clipboard.writeText(currentTags);
            btnCopyTags.style.color = 'var(--success-color)';
            setTimeout(() => btnCopyTags.style.color = '', 1500);
        });

        // Category checkbox logic (radio-style: only one at a time)
        const categoryCbs = card.querySelectorAll('.category-cb');
        categoryCbs.forEach(cb => {
            cb.addEventListener('change', () => {
                if (cb.checked) {
                    categoryCbs.forEach(other => { if (other !== cb) other.checked = false; });
                    post.categoryOverride = cb.dataset.category;
                } else {
                    post.categoryOverride = null;
                }
            });
        });

        // Extension Auto-Fill Event
        const btnAutofill = card.querySelector('.btn-autofill');
        btnAutofill.addEventListener('click', async () => {
            if (btnAutofill.disabled) return alert('Debes esperar a que el .rar asociado termine de generarse para subir a Patreon.');
            
            // Get current values from editable textareas
            const editedTitle = card.querySelector('.title-value').value;
            const editedBaseTags = card.querySelector('.tags-value').value;
            
            const btnOriginalText = btnAutofill.textContent;
            btnAutofill.textContent = "Enviando...";
            
            const scheduleDate = document.getElementById('global-date').value;
            const scheduleTime = document.getElementById('global-time').value;

            const rarPath = post.path + '.rar';
            await window.electronAPI.triggerAutoUpload(rarPath);

            const collection = post.categoryOverride || post.anime;
            const finalTags = post.categoryOverride ? editedBaseTags + ', ' + post.categoryOverride : editedBaseTags;

            const res = await window.electronAPI.fillPatreon({ 
                title: editedTitle, 
                tags: finalTags,
                anime: collection,
                scheduleDate,
                scheduleTime
            });
            
            if (res.receivers > 0) {
                const browserName = currentSession.activeProfile === 'nova' ? 'Opera' : 'Brave';
                btnAutofill.textContent = `¡Enviado a ${browserName}!`;
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

        // Auto-sizing textareas for Patreon Dashboard
        card.querySelectorAll('.edit-area').forEach(tx => {
            tx.style.height = 'auto';
            tx.style.height = (tx.scrollHeight) + 'px';
            tx.addEventListener('input', () => {
                tx.style.height = 'auto';
                tx.style.height = (tx.scrollHeight) + 'px';
            });
        });

        postsGrid.appendChild(card);
        cardsElements.push({ post, btnCompress, btnAutofill });
    });
    
    currentCardsElements = cardsElements;
    updateGlobalRarStatus(cardsElements);

    // Also render X Dashboard
    renderTwitterGrid(posts);
}

function generateHashtags(post) {
    const isNova = currentSession.activeProfile === 'nova';
    let base = isNova ? "#nsfw #r34 #rule34" : "#futanari #futanaricomunity #futanariart #futanariai #nsfw #r34 #rule34";
    
    // Helper to sanitize for hashtags (removes spaces, special chars, keeps Japanese characters)
    const clean = (str) => str ? str.replace(/[^a-zA-Z0-9\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]/g, "").trim() : "";
    
    const animeTag = clean(post.anime);
    const charTag = clean(post.character);
    const animeJpTag = clean(post.animeJP);
    const charJpTag = clean(post.characterJP);

    const extra = [animeTag, charTag, animeJpTag, charJpTag]
        .filter(t => t.length > 0)
        .map(t => "#" + t)
        .join(" ");

    return `${base} ${extra}`.trim();
}

function renderTwitterGrid(posts) {
    const twitterGrid = document.getElementById('twitter-grid');
    twitterGrid.innerHTML = '';

    // Create a shuffled pool of unique texts
    let textPool = [...twitterTexts].sort(() => Math.random() - 0.5);

    posts.forEach(post => {
        const card = document.createElement('div');
        card.className = 'post-card';
        
        // Pick a unique text, refill pool if empty
        if (textPool.length === 0) {
            textPool = [...twitterTexts].sort(() => Math.random() - 0.5);
        }
        const randomText = textPool.pop();
        const hashtags = generateHashtags(post);

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
                <div style="color: #1DA1F2;">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </div>
            </div>
            
            ${thumbnailHtml}
            
            <div class="info-group">
                <div class="info-label">Texto Sugerente (EN)</div>
                <div class="info-value-container">
                    <textarea class="info-value twitter-text edit-area edit-en" style="color: #60a5fa; border-left-color: #60a5fa;">${randomText.en}</textarea>
                    <button class="copy-btn btn-copy-en" title="Copiar Texto EN">
                        <svg viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
                    </button>
                </div>
            </div>
            
            <div class="info-group">
                <div class="info-label">Texto Sugerente (ES)</div>
                <div class="info-value-container">
                    <textarea class="info-value twitter-text edit-area edit-es">${randomText.es}</textarea>
                    <button class="copy-btn btn-copy-es" title="Copiar Texto ES">
                        <svg viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
                    </button>
                </div>
            </div>

            <div class="info-group">
                <div class="info-label">Tags Dinámicos (Perfil: ${currentSession.activeProfile})</div>
                <div class="info-value-container">
                    <textarea class="info-value tags-value edit-area edit-tags" style="font-size: 0.85rem;">${hashtags}</textarea>
                    <button class="copy-btn btn-copy-tags" title="Copiar Tags">
                        <svg viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
                    </button>
                </div>
            </div>

            <div class="card-actions" style="margin-top: 1rem;">
                <button class="btn primary-btn btn-copy-all" style="width: 100%; background: linear-gradient(135deg, #1DA1F2, #0d8bd9);">📋 Copiar Todo (EN + ES + Tags)</button>
            </div>
        `;

        const setupCopy = (selector, textareaSelector) => {
            const btn = card.querySelector(selector);
            btn.addEventListener('click', () => {
                const text = card.querySelector(textareaSelector).value;
                navigator.clipboard.writeText(text);
                const originalColor = btn.style.color;
                btn.style.color = 'var(--success-color)';
                setTimeout(() => btn.style.color = originalColor, 1000);
            });
        };

        setupCopy('.btn-copy-en', '.edit-en');
        setupCopy('.btn-copy-es', '.edit-es');
        setupCopy('.btn-copy-tags', '.edit-tags');

        const btnCopyAll = card.querySelector('.btn-copy-all');
        btnCopyAll.addEventListener('click', () => {
            const enText = card.querySelector('.edit-en').value;
            const esText = card.querySelector('.edit-es').value;
            const tagsText = card.querySelector('.edit-tags').value;
            
            // Text in english, text in spanish, 3 line breaks, tags
            const combinedText = `${enText}\n${esText}\n\n\n\n${tagsText}`;
            navigator.clipboard.writeText(combinedText);
            
            const originalText = btnCopyAll.textContent;
            const originalBg = btnCopyAll.style.background;
            btnCopyAll.textContent = '¡Copiado Todo!';
            btnCopyAll.style.background = 'var(--success-color)';
            setTimeout(() => {
                btnCopyAll.textContent = originalText;
                btnCopyAll.style.background = originalBg;
            }, 1500);
        });

        // Auto-sizing textareas
        card.querySelectorAll('textarea').forEach(tx => {
            tx.style.height = 'auto';
            tx.style.height = (tx.scrollHeight) + 'px';
            tx.addEventListener('input', () => {
                tx.style.height = 'auto';
                tx.style.height = (tx.scrollHeight) + 'px';
            });
        });

        twitterGrid.appendChild(card);
    });
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
