                    });\r
\r
                    searchResults.appendChild(item);\r
            }, 300);\r
        });\r
\r
        // Close search results when clicking outside\r
document.addEventListener('click', (e) => {\r
            if (!searchInput.contains(e.target) && 
                searchResults.style.display = 'none';\r
            }\r
     });\r
    }\r
});\r
\r
// ==========================================\r
// IMAGE VIEWER QC LOGIC\r
// 
let viewerState = {\r
    folderPath: null,\r
    images: [],\r
 selectedImagePath: null,\r
    deletedHistory: [],\r
    currentPage: 0,\r
    pageSize: 4,\r
    novaPath: 
    nickyPath: null\r
};\r
\r
async function openImageViewer(folderPath, folderName, originalNickyPath 
    viewerState.folderPath = folderPath;\r
    viewerState.selectedImagePath = null;\r
    document.getElementById('image-viewer-title').textContent = `QC: 
    \r
    // Aplicar la preferencia de tamaño de cuadrícula\r
    const savedSize = 
    viewerState.pageSize = parseInt(savedSize, 10);\r
    \r
    const grid = document.getElementById('image-viewer-grid');\r
    \r
        if (b.dataset.size === savedSize) {\r
   b.classList.add('active');\r
            b.style.background = 'rgba(59, 130, 246, 0.2)';\r
        } else {\r
            b.classList.remove('active');\r
            b.style.color = '#94a3b8';\r
        }\r
    });\r
    \r
  const btnNova = document.getElementById('btn-viewer-nova');\r
    btnNova.style.display = 'none';\r
    viewerState.nickyPath = originalNickyPath || folderPath;\r
    \r
    if 
        // Estamos viendo Nova, permitir volver a Nicky\r
        btnNova.style.display = 
        btnNova.textContent = 'Modo Nicky';\r
        btnNova.onclick = () => {\r
            const 
            openImageViewer(originalNickyPath, cleanName);\r
  };\r
    } else if (!folderName.includes('[Nova]')) {\r
        // Estamos viendo Nicky, buscar si hay 
        const novaPath = await window.electronAPI.getNovaFolderPath(folderPath, currentSession.baseOrgPath, 
        if (novaPath) {\r
            viewerState.novaPath = novaPath;\r
  btnNova.style.display = 'block';\r
            btnNova.textContent = 'Modo Nova';\r
            btnNova.onclick 
                openImageViewer(novaPath, folderName + " [Nova]", folderPath);\r
            };\r
      }\r
    }\r
    const btnViewerRename = document.getElementById('btn-viewer-rename');\r
    if 
        btnViewerRename.onclick = () => {\r
        };\r
    }\r
\r
    const 
    if (btnQcViewer) {\r
        let isQcDone = 
        if (isQcDone) {\r
            btnQcViewer.style.background = 'rgba(34, 197, 94, 0.2)';\r
    btnQcViewer.style.color = '#4ade80';\r
            btnQcViewer.style.borderColor = '#4ade80';\r
        } 
            btnQcViewer.innerHTML = '❌ Sin QC';\r
            btnQcViewer.style.background = 
            btnQcViewer.style.color = '#fff';\r
        }\r
\r
        btnQcViewer.onclick = async () 
            if (!currentSession.qcDone) currentSession.qcDone = {};\r
            let currentQc = 
            \r
            if (currentQc) {\r
                btnQcViewer.innerHTML = '❌ Sin QC';\r
                btnQcViewer.style.color = '#fff';\r
          btnQcViewer.style.borderColor = 'rgba(255,255,255,0.2)';\r
            } else {\r
                btnQcViewer.innerHTML = '✅ QC OK';\r
                btnQcViewer.style.color = '#4ade80';\r
              btnQcViewer.style.borderColor = '#4ade80';\r
            }\r
            await saveSession();\r
         \r
            // Actualizar botones de QC en la lista de fondo si existen\r
            const cards = 
            cards.forEach(card => {\r
                const nameEls = 
                let found = false;\r
                nameEls.forEach(el => {\r
                 if (el.textContent.trim().startsWith(folderName)) found = true;\r
                });\r
      if (found) {\r
                    const btnQc = card.querySelector('.btn-qc');\r
                    if 
                        const newQc = currentSession.qcDone[folderName];\r
                        if 
                            btnQc.innerHTML = '❌ Sin QC';\r
                            btnQc.style.color = '#fff';\r
                      btnQc.style.borderColor = 'rgba(255,255,255,0.2)';\r
                        } else {\r
                       btnQc.innerHTML = '✅ QC OK';\r
                            btnQc.style.background = 
                            btnQc.style.color = '#4ade80';\r
 btnQc.style.borderColor = '#4ade80';\r
                        }\r
                    }\r
            });\r
\r
            // Actualizar el contador del Gestor si estamos ah y la lista est 
            if (gestorState.outputCharacters) {\r
                renderGestorCharactersList();\r
      }\r
        };\r
    }\r
\r
    await loadViewerImages();\r
    \r
}\r
\r
async function loadViewerImages() 
    const grid = document.getElementById('image-viewer-grid');\r
    grid.innerHTML = '<div style="color: 
    \r
    const images = await 
    viewerState.images = images;\r
    \r
    // 
    const destacadasCount = images.filter(img => {\r
        const dotIndex = 
        const nameWithoutExt = dotIndex !== -1 ? img.name.substring(0, dotIndex) : 
        return /^[a-z]{1,2}$/i.test(nameWithoutExt);\r
    }).length;\r
    \r
    const 
    if (destacadasEl) {\r
    }\r
    \r
    grid.innerHTML = '';\r
    \r
    if 
        grid.innerHTML = '<div style="color: #94a3b8; grid-column: 1/-1; text-align: 
        document.getElementById('page-indicator').textContent = '0 
        return;\r
    }\r
    \r
    // Paginación\r
    const totalPages = Math.ceil(images.length 
    if (viewerState.currentPage >= totalPages) {\r
        viewerState.currentPage = 
    }\r
    \r
    const startIdx = viewerState.currentPage * 
    const endIdx = Math.min(startIdx + viewerState.pageSize, images.length);\r
  \r
    const pageImages = images.slice(startIdx, endIdx);\r
    \r
    pageImages.forEach(img => {\r
const card = document.createElement('div');\r
        card.className = 'viewer-image-card';\r
        if 
            card.classList.add('selected');\r
        }\r
 \r
        card.innerHTML = `\r
            <img src="file://${img.path.replace(/\\\\/g, '/')}" 
            <div class="viewer-image-name" title="Doble clic para 
            <button class="btn btn-destacar" style="margin-top: 5px; width: 100%; 
        `;\r
        \r
        const imgEl = 
        const nameEl = card.querySelector('.viewer-image-name');\r
        \r
 // Selección\r
        imgEl.onclick = () => {\r
            viewerState.selectedImagePath = img.path;\r
        };\r
        // Renombrado (Doble Clic)\r
        nameEl.ondblclick = (e) => {\r
            if (e.target.tagName 
            \r
            const currentName = 
            let isSubmitting = false;\r
            \r
            nameEl.innerHTML = `<input 
            const input = 
            input.focus();\r
            \r
            // Seleccionar solo el 
            const dotIndex = currentName.lastIndexOf('.');\r
            if (dotIndex > 
                input.setSelectionRange(0, dotIndex);\r
            }\r
            \r
            \r
       input.onblur = () => {\r
                if (isSubmitting) return; // No hacer nada si estamos esperando 
                // Restaurar si pierde el foco\r
                nameEl.textContent = 
            };\r
            \r
            input.onkeydown = async (e) => {\r
                    nameEl.textContent = currentName;\r
                } else if 
                    e.preventDefault(); // Evitar comportamientos por defecto del Enter\r
                  const newName = input.value.trim();\r
                    if (newName && newName !== currentName) 
                        isSubmitting = true;\r
                        input.disabled = true; // Deshabilitar 
                        \r
                        const 
                        if (result.success) 
                            await loadViewerImages(); // recargar\r
                        } else {\r
                     nameEl.textContent = currentName;\r
                            // Usar setTimeout para evitar 
setTimeout(() => alert("Error al renombrar: " + result.error), 10);\r
                        }\r
     } else {\r
                        nameEl.textContent = currentName;\r
                    }\r
   }\r
            };\r
        };\r
        \r
        const btnDestacar = 
        btnDestacar.onmouseover = () => btnDestacar.style.background = 
        btnDestacar.onmouseout = () => btnDestacar.style.background = 'rgba(234, 179, 8, 
        \r
        btnDestacar.onclick = async (e) => {\r
            e.stopPropagation();\r
  \r
            const dotIndex = img.name.lastIndexOf('.');\r
            const ext = dotIndex !== -1 ? 
            const alphabet = 'abcdefghijklmnopqrstuvwxyz';\r
            let 
            \r
            const currentNames = viewerState.images.map(i => 
            \r
            for (let i = 0; i < alphabet.length; i++) {\r
const testName = alphabet[i] + ext.toLowerCase();\r
                if (!currentNames.includes(testName)) {\r
               newName = alphabet[i] + ext;\r
                    break;\r
                }\r
            \r
            if (!newName) {\r
                let index = 26;\r
                while 
                    const char1 = alphabet[Math.floor(index / 26) - 1];\r
         const char2 = alphabet[index % 26];\r
                    const testName = char1 + char2 + 
                    if (!currentNames.includes(testName)) {\r
                        newName 
                    }\r
                    index++;\r
                }\r
}\r
            \r
            if (newName && newName !== img.name) {\r
                btnDestacar.disabled = 
                btnDestacar.textContent = 'Destacando...';\r
                const result = await 
                if (result.success) {\r
                } else {\r
                    setTimeout(() => alert("Error al 
                    btnDestacar.disabled = false;\r
                }\r
            }\r
        };\r
\r
        const 
        btnEliminar.onmouseover = () => 
        btnEliminar.onmouseout = () => 
        \r
        btnEliminar.onclick = async (e) => 
            e.stopPropagation();\r
            \r
            btnEliminar.disabled = true;\r
            \r
            const pathToDelete = img.path;\r
   const result = await window.electronAPI.deleteFileTrash(pathToDelete);\r
            \r
            if 
                const nickyImgPath = viewerState.nickyPath + 
                await window.electronAPI.deleteFileTrash(nickyImgPath);\r
\r
            if (result.success) {\r
                if (viewerState.selectedImagePath === pathToDelete) 
                    viewerState.selectedImagePath = null;\r
                }\r
                await 
            } else {\r
                setTimeout(() => alert("Error al borrar: " + 
                btnEliminar.disabled = false;\r
                btnEliminar.textContent = 
            }\r
        };\r
        \r
        grid.appendChild(card);\r
}\r
\r
// Eventos globales para el visor\r
document.addEventListener('DOMContentLoaded', () => {\r
    \r
    // Cerrar visor\r
        modal.style.display = 'none';\r
        // Se elimina la recarga de carpetas para mejorar el rendimiento\r
    \r
    // Paginación\r
    document.getElementById('btn-prev-page').onclick = () => {\r
        if 
            viewerState.currentPage--;\r
            loadViewerImages();\r
   }\r
    };\r
    \r
    document.getElementById('btn-next-page').onclick = () => {\r
        const 
        if (viewerState.currentPage < 
            viewerState.currentPage++;\r
            loadViewerImages();\r
        }\r
\r
    // Controles de tamaño de cuadrícula\r
    document.querySelectorAll('.btn-grid-size').forEach(btn 
        btn.onclick = async () => {\r
            document.querySelectorAll('.btn-grid-size').forEach(b => 
                b.classList.remove('active');\r
                b.style.background = 'transparent';\r
        b.style.color = '#94a3b8';\r
            });\r
            btn.classList.add('active');\r
            btn.style.color = '#60a5fa';\r
            \r
        const size = btn.dataset.size;\r
            viewerState.pageSize = parseInt(size, 10);\r
            const grid = 
            grid.className = `viewer-grid grid-cols-${size}`;\r
        \r
            // Guardar preferencia\r
            currentSession.qcGridSize = size;\r
            \r
            // Recargar imágenes para aplicar nueva paginación\r
 await loadViewerImages();\r
        };\r
    });\r
    \r
    // Atajos de teclado en el visor\r
        const modalEl = 
        if (!modalEl || modalEl.style.display === 'none') 
        \r
        // Ignorar si el usuario está escribiendo en un input\r
        if 
        \r
        // Cerrar con 
        if (e.key === 'Escape') {\r
            document.getElementById('btn-close-viewer').click();\r
          return;\r
        }\r
        \r
        // Borrar con Suprimir (Delete) o Retroceso (Backspace)\r
      if ((e.key === 'Delete' || e.key === 'Backspace') && viewerState.selectedImagePath) {\r
            const 
            const result = await 
            \r
            // Si estamos en modo Nova, borrar 
            if (result.success && viewerState.nickyPath && viewerState.folderPath !== 
                // Sacar solo el nombre del archivo\r
                const fileName = 
                const nickyImgPath = viewerState.nickyPath + 
                await window.electronAPI.deleteFileTrash(nickyImgPath);\r
\r
            if (result.success) {\r
                viewerState.selectedImagePath = null;\r
   await loadViewerImages();\r
            } else {\r
                alert("Error al borrar: " + 
            }\r
        }\r
        \r
        // Flechas para paginación\r
        if 
            document.getElementById('btn-prev-page').click();\r
        } else if 
            document.getElementById('btn-next-page').click();\r
        }\r
});\r
\r
// ==========================================\r
// BATCH AUTO UPLOAD LOGIC\r
// 
let autoUploadQueue = [];\r
let isAutoUploading = 
\r
document.addEventListener('DOMContentLoaded', () => {\r
    const btnAutoBatch = 
    if (btnAutoBatch) {\r
            if (isAutoUploading) {\r
                const 
                if (cancel) {\r
          isAutoUploading = false;\r
                    autoUploadQueue = [];\r
                }\r
                return;\r
   }\r
\r
            // Filtrar posts válidos (que tengan rar generado)\r
            const postsReady = 
            if (postsReady.length === 0) {\r
                return 
 }\r
\r
            const confirmBatch = confirm(`¿Iniciar subida automática de ${postsReady.length} posts a 
            if (!confirmBatch) 
\r
            autoUploadQueue = [...postsReady];\r
            isAutoUploading = true;\r
btnAutoBatch.innerHTML = '⏹️ Cancelar Subida Batch';\r
\r
            await processNextAutoUpload();\r
    }\r
});\r
\r
async function processNextAutoUpload() {\r
    if (!isAutoUploading) 
\r
    if (autoUploadQueue.length === 0) {\r
        isAutoUploading = false;\r
        const 
        if (btnAutoBatch) btnAutoBatch.innerHTML = '🚀 
        alert("¡Subida Automática terminada! Revisa las pestañas abiertas y presiona 
        return;\r
    }\r
\r
    const post = 
    \r
    // Abrir nueva pestaña\r
    await 
    \r
    // Esperar a que la página cargue y la 
    let waitTime = 6000;\r
    const chkSlow = 
    const numSlow = document.getElementById('num-slow-conn');\r
    if 
        waitTime = parseInt(numSlow.value) * 1000;\r
        if 
    }\r
    \r
    await new Promise(r => setTimeout(r, 
    \r
    if (!isAutoUploading) return; // user cancelled\r
\r
    // Construir payload igual 
    const globalDate = document.getElementById('global-date').value;\r
    const 
    \r
    const cardCheckbox = 
    if (!cardCheckbox) {\r
        // En caso 
        await processNextAutoUpload();\r
        return;\r
    }\r
    \r
 let card = cardCheckbox.closest('.post-card');\r
    if (!card) card = 
    \r
    const editedTitle = 
    const editedBaseTags = card.querySelector('.tags-value').value;\r
  \r
    const rarPath = post.path + '.rar';\r
    \r
    // Determine override\r
    let categoryOverride = 
    const categoryCbs = card.querySelectorAll('.category-cb');\r
    categoryCbs.forEach(cb => { if 
\r
    const collection = categoryOverride || 
    const finalTags = categoryOverride ? editedBaseTags + ', ' + categoryOverride : 
\r
    // Obtener link si existe, del DOM\r
    let currentLink = '';\r
    const linkEl = 
    if (linkEl) currentLink = linkEl.value;\r
    const 
\r
    const payload = {\r
        title: 
        tags: finalTags,\r
        anime: collection,\r
        scheduleDate: globalDate,\r
   scheduleTime: globalTime,\r
        rarPath: rarPath,\r