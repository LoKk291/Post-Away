console.log("Post-Away Extension cargada en Patreon.");

let lastUrl = location.href;
setInterval(() => {
    if (location.href !== lastUrl && !location.href.includes('/posts/new')) {
        window.close(); 
    }
}, 500); 

let sse;

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

function connect() {
  sse = new EventSource('http://127.0.0.1:3030/events');
  
  sse.onopen = () => console.log("Post-Away: Conectado a la app de escritorio!");
  
  sse.onmessage = (e) => {
    const data = JSON.parse(e.data);
    console.log("Post-Away ha recibido datos:", data);

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
                let dropdownTrigger = document.querySelector('button[aria-label*="collection" i], button[aria-label*="colecci" i], [role="combobox"][aria-label*="collection" i]');
                
                if (!dropdownTrigger) {
                    const labels = Array.from(document.querySelectorAll('label, div, span, h3, p, h4')).filter(el => {
                        if (el.children.length > 1) return false;
                        const text = el.textContent.trim().toLowerCase();
                        return text === "collection" || text === "colección" || text === "collections" || text === "colecciones" || 
                               text === "add to collection" || text === "añadir a colección" || text === "añadir a la colección" || text === "añadir a una colección";
                    });
                    for (const labelNode of labels) {
                        dropdownTrigger = labelNode.parentElement.querySelector('button, [role="combobox"], [role="button"]') || 
                                          labelNode.parentElement.parentElement.querySelector('button, [role="combobox"], [role="button"]') ||
                                          labelNode.parentElement.parentElement.parentElement.querySelector('button, [role="combobox"], [role="button"]');
                        if (dropdownTrigger) break;
                    }
                }

                if (dropdownTrigger) {
                    dropdownTrigger.click();
                    await new Promise(r => setTimeout(r, 400)); 
                } else {
                    console.warn("Post-Away: No se detectó el botón de colecciones. Ignorando silenciosamente.");
                    return; 
                }

                let listContainer = null;
                const popovers = Array.from(document.querySelectorAll('[role="dialog"], [role="listbox"], [role="menu"]')).filter(el => el.offsetParent !== null);
                if (popovers.length > 0) {
                    listContainer = popovers[popovers.length - 1];
                }

                if (!listContainer) {
                    document.body.click();
                    return;
                }

                let collectionInput = listContainer.querySelector('input[type="text"], input[type="search"]');

                const performSearch = async (container) => {
                    let foundMatch = null;
                    let currentSearch = originalName.toLowerCase();
                    let lastScroll = -1;
                    let scrollAttemptsWithoutProgress = 0;
                    
                    while (!foundMatch && scrollAttemptsWithoutProgress < 15) {
                        const allCandidates = Array.from(container.querySelectorAll('label, li, [role="option"], [role="menuitem"]')).filter(el => {
                            if (!el.offsetParent) return false; 
                            const isLabelWithCheckbox = el.tagName.toLowerCase() === 'label' && el.querySelector('input[type="checkbox"], svg');
                            const isOption = el.getAttribute('role') === 'option' || el.getAttribute('role') === 'menuitem' || el.tagName.toLowerCase() === 'li';
                            if (!isLabelWithCheckbox && !isOption) return false;
                            const text = el.textContent.trim().toLowerCase();
                            if (text.startsWith("create ") || text.startsWith("crear ") || text.includes('+ create') || text.includes('añadir "') || text.includes('add "')) return false;
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
                        setTimeout(() => document.body.click(), 100);
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

        // 5. Autoclick Attachments Menu to load OS Upload Dialog!
        let attachmentTriggered = false;
        
        const triggerAttachmentUpload = (elementToClick) => {
            if (attachmentTriggered) return;
            attachmentTriggered = true;

            // Create a transparent overlay to catch the OS-level mouse click
            const overlay = document.createElement('div');
            overlay.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:999999;cursor:pointer;background:transparent;';
            document.body.appendChild(overlay);

            // When PS clicks the overlay, it counts as a real user gesture → Chrome allows the file dialog
            overlay.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
                
                // Trigger the actual element click inside this real user gesture context
                if (elementToClick.tagName.toLowerCase() === 'input' && elementToClick.type === 'file') {
                    elementToClick.click();
                } else {
                    ['pointerdown', 'mousedown', 'mouseup', 'pointerup', 'click'].forEach(eventType => {
                        elementToClick.dispatchEvent(new MouseEvent(eventType, { bubbles: true, cancelable: true, view: window, buttons: 1 }));
                    });
                }
            });

            // Safety: remove overlay after 10 seconds if PS click never arrives
            setTimeout(() => { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }, 10000);

            // Calculate screen center and tell the desktop app to click there
            const x = Math.floor(window.screenX + (window.outerWidth / 2));
            const y = Math.floor(window.screenY + (window.outerHeight / 2));
            fetch(`http://127.0.0.1:3030/trigger-macro?x=${x}&y=${y}`, { method: 'POST' }).catch(() => {});
        };

        const findAttachmentTarget = () => {
            // First: look for the "Attachment" button
            const candidates = Array.from(document.querySelectorAll('button, div[role="button"], [role="menuitem"], span, a, p'));
            for (const c of candidates) {
                const t = c.textContent.trim().toLowerCase();
                if (t === 'attachment' || t === 'attachments' || t === 'adjunto' || t === 'adjuntos' || t.includes('upload attachment')) {
                    return c.closest('button') || c.closest('[role="button"]') || c.closest('a') || c.closest('div') || c;
                }
            }
            // Fallback: look for a generic file input
            const fileInputs = Array.from(document.querySelectorAll('input[type="file"]'));
            const genericInput = fileInputs.find(i => (!i.accept || !i.accept.includes('image')));
            return genericInput || null;
        };

        let attachAttempts = 0;
        const attachInterval = setInterval(() => {
            attachAttempts++;
            const target = findAttachmentTarget();
            if (target || attachAttempts > 20) {
                clearInterval(attachInterval);
                if (target) triggerAttachmentUpload(target);
            }
        }, 500);

      } catch(err) {
        console.error("Error auto-rellenando:", err);
      }
    };
    
    runAutofill();
  };

  sse.onerror = (e) => {
    sse.close();
    setTimeout(connect, 3000); 
  };
}

connect();
