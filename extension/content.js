console.log("Post-Away Extension cargada en Patreon.");

let lastUrl = location.href;
setInterval(() => {
    if (location.href !== lastUrl && !location.href.includes('/posts/new')) {
        window.close(); 
    }
}, 500); 

// Polling setup replaces EventSource for MV3 compatibility

function setNativeValue(element, value) {
  element.focus();
  const valueSetter = Object.getOwnPropertyDescriptor(element, 'value')?.set;
  const prototype = Object.getPrototypeOf(element);
  const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;
  
  if (valueSetter && valueSetter !== prototypeValueSetter) {
    prototypeValueSetter.call(element, value);
  } else if (valueSetter) {
    valueSetter.call(element, value);
  } else {
    element.value = value;
  }
  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
}

let isAutofilling = false;

function pollServer() {
  chrome.runtime.sendMessage({ type: 'poll' }, (response) => {
    if (chrome.runtime.lastError) {
      // Ignore background script not ready errors
      return;
    }
    
    if (response && response.payload && !isAutofilling) {
      const data = response.payload;
      console.log("Post-Away ha recibido datos:", data);
      isAutofilling = true;

      const runAutofill = async () => {
      try {
        for (let i = 0; i < 40; i++) { 
            const titleBox = document.querySelector('.public-DraftEditor-content, textarea[placeholder*="título" i], textarea[placeholder*="title" i], [data-tag="post-title"]');
            const hasCollectionBox = Array.from(document.querySelectorAll('label, div, span, h3, p, h4')).some(el => {
                if (el.children.length > 1) return false;
                const text = el.textContent?.trim().toLowerCase() || "";
                return text === "collection" || text === "colección" || text === "collections" || text === "colecciones" || 
                       text === "add to collection" || text === "añadir a colección" || text === "añadir a la colección" || text === "añadir a una colección";
            });
            if (titleBox && hasCollectionBox) break;
            await new Promise(r => setTimeout(r, 200));
        }
        await new Promise(r => setTimeout(r, 200)); 
        
        // 1. Auto-fill Title
        const titleSelectors = ['textarea[placeholder*="título" i]', 'textarea[placeholder*="title" i]', 'input[placeholder*="título" i]', '[data-tag="post-title"]', '.DraftEditor-root', '.public-DraftEditor-content'];
        for (const sel of titleSelectors) {
            const el = document.querySelector(sel);
            if (el) {
                setNativeValue(el, data.title);
                break;
            }
        }

        // 2. Auto-fill Tags
        const tagSelectors = [
            'input[placeholder*="tart typing" i]',
            'input[placeholder*="mpezar a escribir" i]',
            'input[id*="react-select"]',
            'input[aria-autocomplete="list"]',
            'input[placeholder*="etiquetas" i]', 
            'input[placeholder*="tags" i]', 
            'input[id*="tag"]'
        ];
        for (const sel of tagSelectors) {
            const el = document.querySelector(sel);
            if (el) { 
                const tagsArray = data.tags.split(',').map(t => t.trim()).filter(Boolean);
                for (const tag of tagsArray) {
                    setNativeValue(el, tag); 
                    await new Promise(r => setTimeout(r, 50));
                    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));
                    await new Promise(r => setTimeout(r, 100)); 
                }
                document.body.click();
                await new Promise(r => setTimeout(r, 200));
                break; 
            }
        }

        // 3. Collection Search & Auto-Select
        if (data.anime) {
            const searchAndSelectCollection = async (originalName) => {
                // Strategy 1: Search for adjacent labels like "Add to collection"
                const labels = Array.from(document.querySelectorAll('*')).filter(el => {
                    if (el.childElementCount > 3) return false; 
                    const text = el.textContent.trim().toLowerCase();
                    return text === "add to collection" || text === "añadir a colección";
                });
                
                for (const labelNode of labels) {
                    let parent = labelNode.parentElement;
                    for (let i = 0; i < 5; i++) { 
                        if (!parent) break;
                        const btn = parent.querySelector('button, [role="combobox"], [role="button"], select');
                        if (btn && btn !== labelNode && !btn.hasAttribute('href') && btn.tagName.toLowerCase() !== 'a') {
                            dropdownTrigger = btn;
                            break;
                        }
                        parent = parent.parentElement;
                    }
                    if (dropdownTrigger) break;
                }

                // Strategy 2: Aria labels
                if (!dropdownTrigger) {
                    dropdownTrigger = document.querySelector('button[aria-label*="collection" i], button[aria-label*="colecci" i], [role="combobox"][aria-label*="collection" i]');
                }

                // Strategy 3: General buttons with text
                if (!dropdownTrigger) {
                    const buttons = Array.from(document.querySelectorAll('button, [role="button"], [role="combobox"], div[role="button"]')).filter(el => {
                        if (el.hasAttribute('href') || el.tagName.toLowerCase() === 'a') return false;
                        const text = el.textContent.trim().toLowerCase();
                        if (text.length > 30) return false; 
                        return text === "collection" || text === "collections" || text === "colección" || text === "colecciones";
                    });
                    if (buttons.length > 0) dropdownTrigger = buttons[0];
                }

                if (dropdownTrigger) {
                    if (dropdownTrigger.tagName.toLowerCase() === 'select') {
                        const options = Array.from(dropdownTrigger.options);
                        // perform partial search on options
                        let foundOpt = null;
                        let search = originalName.toLowerCase();
                        while (search.length > 4) {
                            foundOpt = options.find(o => o.text.toLowerCase().includes(search));
                            if (foundOpt) break;
                            search = search.slice(0, -1);
                        }
                        if (foundOpt) {
                            dropdownTrigger.value = foundOpt.value;
                            dropdownTrigger.dispatchEvent(new Event('change', {bubbles:true}));
                            console.log("Post-Away: Colección seleccionada vía <select> nativo.");
                        }
                        return; // Done
                    } else {
                        dropdownTrigger.click();
                        await new Promise(r => setTimeout(r, 400)); 
                    }
                } else {
                    console.warn("Post-Away: No se detectó el botón de colecciones. Ignorando silenciosamente.");
                    return; 
                }

                let listContainer = document.body;
                const popovers = Array.from(document.querySelectorAll('[role="dialog"], [role="listbox"], [role="menu"], [data-radix-popper-content-wrapper]')).filter(el => el.offsetParent !== null);
                if (popovers.length > 0) {
                    listContainer = popovers[popovers.length - 1];
                }

                let collectionInput = listContainer.querySelector('input[type="text"], input[type="search"]');

                const performSearch = async (container) => {
                    let foundMatch = null;
                    let currentSearch = originalName.toLowerCase();
                    let lastScroll = -1;
                    let scrollAttemptsWithoutProgress = 0;
                    
                    while (!foundMatch && scrollAttemptsWithoutProgress < 15) {
                        const allCandidates = Array.from(container.querySelectorAll('label, li, [role="option"], [role="menuitem"], [role="checkbox"], button')).filter(el => {
                            if (!el.offsetParent) return false; 
                            const isLabelWithCheckbox = el.tagName.toLowerCase() === 'label' && el.querySelector('input[type="checkbox"], svg');
                            const isOption = el.getAttribute('role') === 'option' || el.getAttribute('role') === 'menuitem' || el.getAttribute('role') === 'checkbox' || el.tagName.toLowerCase() === 'li' || el.tagName.toLowerCase() === 'button';
                            if (!isLabelWithCheckbox && !isOption) return false;
                            const text = el.textContent.trim().toLowerCase();
                            if (text.startsWith("create ") || text.startsWith("crear ") || text.includes('+ create') || text.includes('añadir "') || text.includes('add "') || text.includes("guardar") || text.includes("save") || text === "collection" || text === "colección") return false;
                            return true;
                        });

                        let tempSearch = currentSearch;
                        const minSearchLen = Math.max(5, Math.floor(originalName.length * 0.3));
                        while (tempSearch.length > minSearchLen) { 
                            foundMatch = allCandidates.find(el => el.textContent.trim().toLowerCase().includes(tempSearch));
                            if (foundMatch) break;
                            tempSearch = tempSearch.slice(0, -1);
                        }

                        if (foundMatch) break;

                        if (container.scrollTop === lastScroll && lastScroll !== -1) {
                            scrollAttemptsWithoutProgress++;
                            await new Promise(r => setTimeout(r, 200));
                        } else {
                            scrollAttemptsWithoutProgress = 0;
                        }

                        lastScroll = container.scrollTop;
                        container.scrollTop += 300;
                        await new Promise(r => setTimeout(r, 100)); 
                    }
                    
                    if (foundMatch) {
                        const cb = foundMatch.querySelector('input[type="checkbox"]');
                        const isChecked = cb ? cb.checked : (foundMatch.getAttribute('aria-selected') === 'true' || foundMatch.getAttribute('aria-checked') === 'true');
                        if (!isChecked) foundMatch.click();
                        
                        await new Promise(r => setTimeout(r, 200));

                        // Find any "Save", "Apply", or "Done" button in the container
                        const saveButtons = Array.from(container.querySelectorAll('button')).filter(b => {
                            if (!b.offsetParent) return false;
                            const bt = b.textContent.trim().toLowerCase();
                            return bt === "save" || bt === "guardar" || bt === "apply" || bt === "aplicar" || bt === "done" || bt === "listo";
                        });
                        
                        if (saveButtons.length > 0) {
                            saveButtons[saveButtons.length - 1].click();
                        } else {
                            setTimeout(() => document.body.click(), 100);
                        }
                    } else {
                        document.body.click();
                        console.warn(`Post-Away: No se encontró la colección "${originalName}".`);
                    }
                };

                if (collectionInput) {
                    setNativeValue(collectionInput, originalName);
                    await new Promise(r => setTimeout(r, 600)); 
                    await performSearch(listContainer);
                } else {
                    await performSearch(listContainer);
                }
            };
            await searchAndSelectCollection(data.anime);
        }

        // 3.5 Sell this post
        try {
            const sellLabels = Array.from(document.querySelectorAll('form label, div label, span, p, h3, h4')).filter(el => {
                const text = el.textContent?.trim().toLowerCase() || "";
                return text === "sell this post" || text === "vender esta publicación" || text === "vender esta publicacion";
            });
            
            if (sellLabels.length > 0) {
                const label = sellLabels[0];
                const container = label.closest('label') || label.parentElement;
                
                // Intentar encontrar el checkbox de input
                let cb = container.querySelector('input[type="checkbox"]');
                if (!cb) cb = container.parentElement.querySelector('input[type="checkbox"]');
                
                // Verificar tambien roles si no hay input (Patreon a veces usa divs con role="checkbox")
                let pseudoCb = container.querySelector('[role="checkbox"]');
                if (!pseudoCb) pseudoCb = container.parentElement.querySelector('[role="checkbox"]');

                if (cb && !cb.checked) {
                    cb.click();
                } else if (pseudoCb && pseudoCb.getAttribute('aria-checked') === 'false') {
                    pseudoCb.click();
                } else if (!cb && !pseudoCb) {
                    label.click(); // Fallback si no hallamos checkbox físico
                }

                await new Promise(r => setTimeout(r, 600));

                // Buscar el input de precio. Por lo general tiene placeholder "Set a price" o "precio"
                const allVisibleInputsAfterSell = Array.from(document.querySelectorAll('input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"])'));
                let priceInput = allVisibleInputsAfterSell.find(i => {
                    const ph = (i.placeholder || '').toLowerCase();
                    return ph.includes('price') || ph.includes('precio') || ph.includes('set a');
                });
                
                if (priceInput) {
                    setNativeValue(priceInput, "5");
                    // Trigger events just in case
                    priceInput.dispatchEvent(new Event('input', { bubbles: true }));
                    priceInput.dispatchEvent(new Event('change', { bubbles: true }));
                    priceInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));
                    await new Promise(r => setTimeout(r, 300));
                    document.body.click();
                    await new Promise(r => setTimeout(r, 200));
                }
            }
        } catch(err) {
            console.error("Post-Away: Error setting Sell this post", err);
        }

        // 4. Schedule Date Toggle and Filling
        if (data.scheduleDate || data.scheduleTime) {
            const labels = Array.from(document.querySelectorAll('*')).filter(el => {
                const text = el.textContent?.trim().toLowerCase() || "";
                return text === "set publish date" || text.includes("programar") || text.includes("fecha de publicaci");
            });
            
            let switchBtn = null;
            for (const label of labels) {
                switchBtn = label.parentElement.querySelector('button[role="switch"]') || 
                            label.closest('label')?.querySelector('button') || 
                            label.parentElement.parentElement.querySelector('button[role="switch"]');
                if (switchBtn) break;
            }

            if (switchBtn && switchBtn.getAttribute('aria-checked') === 'false') {
                switchBtn.click();
            }

            (async () => {
                await new Promise(r => setTimeout(r, 600));

                const getInputs = () => {
                    const allVisibleInputs = Array.from(document.querySelectorAll('input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"])')).filter(el => {
                        const rect = el.getBoundingClientRect();
                        return rect.width > 0 && rect.height > 0 && el.offsetParent !== null;
                    });

                    let dInput = null;
                    let tInput = null;

                    const dateInputs = allVisibleInputs.filter(inp => {
                        const id = (inp.id || "").toLowerCase();
                        const name = (inp.name || "").toLowerCase();
                        const aria = (inp.getAttribute('aria-label') || "").toLowerCase();
                        const ph = (inp.getAttribute('placeholder') || "").toLowerCase();
                        return id.includes('date') || name.includes('date') || aria.includes('date') || ph.includes('dd') || ph.includes('aaaa') || ph.includes('yyyy') || ph.includes('mm') || inp.type === 'date';
                    });

                    const timeInputs = allVisibleInputs.filter(inp => {
                        const id = (inp.id || "").toLowerCase();
                        const name = (inp.name || "").toLowerCase();
                        const aria = (inp.getAttribute('aria-label') || "").toLowerCase();
                        const ph = (inp.getAttribute('placeholder') || "").toLowerCase();
                        return inp.type === 'time' || id.includes('time') || name.includes('time') || aria.includes('time') || ph.includes('hh') || ph.includes(':');
                    });

                    if (dateInputs.length > 0) dInput = dateInputs[dateInputs.length - 1];
                    if (timeInputs.length > 0) tInput = timeInputs[timeInputs.length - 1];

                    if (!dInput || !tInput) {
                        const unknownInputs = allVisibleInputs.filter(inp => {
                            const ph = (inp.getAttribute('placeholder') || "").toLowerCase();
                            const val = (inp.value || "").toLowerCase();
                            const id = (inp.id || "").toLowerCase();
                            return !ph.includes('price') && !ph.includes('precio') && !ph.includes('title') && !ph.includes('título') && !ph.includes('tag') && !ph.includes('etiqueta');
                        });
                        
                        if (unknownInputs.length >= 2) {
                            if (!dInput) dInput = unknownInputs[unknownInputs.length - 2];
                            if (!tInput) tInput = unknownInputs[unknownInputs.length - 1];
                        }
                    }

                    if (dInput && !tInput) {
                        const idx = allVisibleInputs.indexOf(dInput);
                        if (idx !== -1 && idx + 1 < allVisibleInputs.length) {
                            tInput = allVisibleInputs[idx + 1];
                        }
                    }

                    return { dInput, tInput };
                };

                let { dInput, tInput } = getInputs();

                if (dInput && data.scheduleDate) {
                    const [y, m, d] = data.scheduleDate.split('-');
                    dInput.focus();
                    
                    setNativeValue(dInput, data.scheduleDate); 
                    await new Promise(r => setTimeout(r, 150));
                    
                    if (!dInput.value.includes(y)) {
                        setNativeValue(dInput, `${d}/${m}/${y}`);
                        await new Promise(r => setTimeout(r, 150));
                        if (!dInput.value.includes(y)) {
                            setNativeValue(dInput, `${m}/${d}/${y}`);
                            await new Promise(r => setTimeout(r, 150));
                        }
                    }
                    dInput.blur();
                    await new Promise(r => setTimeout(r, 400));
                }
                
                const inputsAfterDate = getInputs();
                tInput = inputsAfterDate.tInput || tInput;

                if (tInput && data.scheduleTime) {
                    for (let attempt = 0; attempt < 3; attempt++) {
                        tInput.focus();
                        tInput.click();
                        await new Promise(r => setTimeout(r, 50));
                        
                        setNativeValue(tInput, data.scheduleTime);
                        tInput.dispatchEvent(new Event('input', { bubbles: true }));
                        tInput.dispatchEvent(new Event('change', { bubbles: true }));
                        
                        const digits = data.scheduleTime.replace(':', '');
                        for (const digit of digits) {
                            tInput.dispatchEvent(new KeyboardEvent('keydown', { key: digit, bubbles: true }));
                            await new Promise(r => setTimeout(r, 15));
                        }
                        
                        await new Promise(r => setTimeout(r, 150));

                        if (tInput.type !== "time") {
                            const [h, m] = data.scheduleTime.split(':');
                            let ampm = 'AM';
                            let hInt = parseInt(h, 10);
                            if (hInt >= 12) {
                                ampm = 'PM';
                                if (hInt > 12) hInt -= 12;
                            }
                            if (hInt === 0) hInt = 12;
                            const hStr = hInt.toString().padStart(2, '0');
                            const time12h = `${hStr}:${m} ${ampm}`;

                            if ((!tInput.value.includes(h) && !tInput.value.includes(hStr)) || tInput.value === '') {
                                setNativeValue(tInput, time12h);
                                tInput.dispatchEvent(new Event('input', { bubbles: true }));
                                tInput.dispatchEvent(new Event('change', { bubbles: true }));
                            }
                        }
                        
                        await new Promise(r => setTimeout(r, 50));
                        tInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));
                        tInput.blur();
                        
                        await new Promise(r => setTimeout(r, 300));
                        
                        const [h] = data.scheduleTime.split(':');
                        if (tInput.value.includes(h) || tInput.value === data.scheduleTime) {
                            break;
                        }
                    }
                }
            })();
        }

        // 5. Silent Programmatic Upload via CDP (Gallery & Attachment)
        const uploadFiles = async () => {
            // A. Subir Galería de Imágenes
            if (data.imagePaths && data.imagePaths.length > 0) {
                console.log(`Post-Away: Iniciando subida de ${data.imagePaths.length} imágenes para la galería...`);
                await new Promise(resolve => {
                    chrome.runtime.sendMessage({ type: 'upload', files: data.imagePaths, isGallery: true }, (response) => {
                        if (chrome.runtime.lastError) {
                            console.error("Post-Away: Error subiendo imágenes", chrome.runtime.lastError);
                        } else if (response && response.success) {
                            console.log("Post-Away: Imágenes cargadas exitosamente.");
                        } else {
                            console.error("Post-Away: Fallo subiendo imágenes", response ? response.error : "Unknown error");
                        }
                        resolve();
                    });
                });
                
                // Esperar a que Patreon empiece a procesar las imágenes antes de inyectar el .rar
                await new Promise(r => setTimeout(r, 2000));
            }

            // B. Subir Archivo Adjunto (.rar)
            if (data.rarPath) {
                console.log(`Post-Away: Iniciando subida del archivo adjunto ${data.rarPath}...`);
                await new Promise(resolve => {
                    chrome.runtime.sendMessage({ type: 'upload', files: [data.rarPath], isAttachment: true }, (response) => {
                        if (chrome.runtime.lastError) {
                            console.error("Post-Away: Error subiendo .rar", chrome.runtime.lastError);
                        } else if (response && response.success) {
                            console.log("Post-Away: Archivo .rar cargado exitosamente.");
                        } else {
                            console.error("Post-Away: Fallo subiendo .rar", response ? response.error : "Unknown error");
                        }
                        resolve();
                    });
                });
            }
            
            const waitForUploadsToFinish = async () => {
                console.log("Post-Away: Esperando a que comiencen las subidas en la red (5 segundos)...");
                await new Promise(r => setTimeout(r, 5000));
                
                let checkInterval = 1000;
                let maxWaitTime = 10 * 60 * 1000; // 10 minutos max
                let elapsed = 0;
                
                return new Promise((resolve) => {
                    const check = () => {
                        elapsed += checkInterval;
                        
                        const progressBars = document.querySelectorAll('[role="progressbar"], progress, svg > circle[stroke-dasharray]');
                        const uploadingTexts = Array.from(document.querySelectorAll('span, div, p, label')).filter(el => {
                            if (el.children.length > 1) return false;
                            const txt = (el.textContent || '').trim().toLowerCase();
                            return txt === 'uploading...' || txt === 'uploading' || 
                                   txt === 'subiendo...' || txt === 'subiendo' || 
                                   txt === 'procesando...' || txt === 'procesando' || 
                                   txt === 'processing...' || txt === 'processing' ||
                                   txt === 'saving...' || txt === 'guardando...' ||
                                   /^\d+\s*\%$/.test(txt);
                        });
                        
                        const isUploading = progressBars.length > 0 || uploadingTexts.length > 0;
                        
                        if (!isUploading) {
                            setTimeout(() => {
                                const pb2 = document.querySelectorAll('[role="progressbar"], progress, svg > circle[stroke-dasharray]');
                                const ut2 = Array.from(document.querySelectorAll('span, div, p, label')).filter(el => {
                                    if (el.children.length > 1) return false;
                                    const txt = (el.textContent || '').trim().toLowerCase();
                                    return txt === 'uploading...' || txt === 'uploading' || 
                                           txt === 'subiendo...' || txt === 'subiendo' || 
                                           txt === 'procesando...' || txt === 'procesando' || 
                                           txt === 'processing...' || txt === 'processing' ||
                                           txt === 'saving...' || txt === 'guardando...' ||
                                           /^\d+\s*\%$/.test(txt);
                                });
                                if (pb2.length === 0 && ut2.length === 0) {
                                    console.log("Post-Away: Subida de archivos terminada.");
                                    resolve();
                                } else {
                                    setTimeout(check, checkInterval);
                                }
                            }, 3000);
                        } else if (elapsed >= maxWaitTime) {
                            console.log("Post-Away: Tiempo máximo de espera alcanzado.");
                            resolve();
                        } else {
                            console.log("Post-Away: Subida en progreso... (" + progressBars.length + " barras, " + uploadingTexts.length + " textos)");
                            setTimeout(check, checkInterval);
                        }
                    };
                    check();
                });
            };

            await waitForUploadsToFinish();
            
            // Notify the backend that the batch step is complete
            try {
                await fetch('http://127.0.0.1:3030/upload-complete', { method: 'POST' });
            } catch(e) {
                console.error("Post-Away: Error notificando completado al backend", e);
            }

            // Notify the user
            if (!data.isBatch || data.isLastBatchItem) {
                alert("¡Post-Away: Todas las cargas (imágenes y .rar) han finalizado correctamente en Patreon! Ya puedes publicar.");
            }
        };

        await uploadFiles();

        // ... end of runAutofill
        isAutofilling = false;
        if (data.isBatch) {
            clearInterval(pollInterval);
        }
      } catch(err) {
        console.error("Error auto-rellenando:", err);
        isAutofilling = false;
      }
    };
    
    runAutofill();
    }
  });
}

let pollInterval = setInterval(pollServer, 1500);
