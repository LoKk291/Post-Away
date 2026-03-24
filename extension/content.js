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
  sse = new EventSource('http://127.0.0.1:3333/events');
  
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
                        while (tempSearch.length > 2) { 
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

            setTimeout(() => {
                const allVisibleInputs = Array.from(document.querySelectorAll('input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"])'));
                
                let dateInput = document.querySelector('input[id*="date" i], input[name*="date" i], input[aria-label*="date" i], input[placeholder*="DD" i], input[placeholder*="MM" i], input[placeholder*="AAAA" i], input[placeholder*="YYYY" i]');
                let timeInput = document.querySelector('input[type="time" i], input[id*="time" i], input[name*="time" i], input[aria-label*="time" i], input[placeholder*="HH" i], input[placeholder*=":" i]');

                if (!dateInput && allVisibleInputs.length >= 2) {
                    dateInput = allVisibleInputs[allVisibleInputs.length - 2];
                    timeInput = allVisibleInputs[allVisibleInputs.length - 1];
                }

                if (dateInput && data.scheduleDate) {
                    const [y, m, d] = data.scheduleDate.split('-');
                    dateInput.focus();
                    
                    setNativeValue(dateInput, data.scheduleDate); 
                    setTimeout(() => {
                        if (!dateInput.value.includes(y)) {
                            setNativeValue(dateInput, `${d}/${m}/${y}`);
                            setTimeout(() => {
                                if (!dateInput.value.includes(y)) {
                                    setNativeValue(dateInput, `${m}/${d}/${y}`);
                                }
                            }, 50);
                        }
                    }, 50);
                }
                
                if (timeInput && data.scheduleTime) {
                    timeInput.focus();
                    setNativeValue(timeInput, data.scheduleTime);
                }
            }, 600); 
        }

        // 5. Autoclick Attachments Menu to load OS Upload Dialog!
        const runFileUploadOverlay = (elementToClick) => {
            const overlay = document.createElement('div');
            overlay.style.position = 'fixed';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.width = '100vw';
            overlay.style.height = '100vh';
            overlay.style.backgroundColor = 'transparent';
            overlay.style.zIndex = '999999';
            overlay.style.cursor = 'pointer';
            
            document.body.appendChild(overlay);

            const performUpload = (e) => {
                e.preventDefault();
                e.stopPropagation();
                document.body.removeChild(overlay);
                
                if (elementToClick.tagName.toLowerCase() === 'input' && elementToClick.type === 'file') {
                    elementToClick.click();
                } else {
                    elementToClick.click();
                    ['pointerdown', 'mousedown', 'mouseup', 'pointerup', 'click'].forEach(eventType => {
                        elementToClick.dispatchEvent(new MouseEvent(eventType, { bubbles: true, cancelable: true, view: window, buttons: 1 }));
                    });
                }
            };
            overlay.addEventListener('click', performUpload);

            const x = Math.floor(window.screenX + (window.outerWidth / 2));
            const y = Math.floor(window.screenY + (window.outerHeight / 2));
            fetch(`http://127.0.0.1:3333/trigger-macro?x=${x}&y=${y}`, { method: 'POST' }).catch(() => {});
        };

        const attemptAttachmentClick = () => {
            let candidates = Array.from(document.querySelectorAll('button, div[role="button"], [role="menuitem"], span, a, p'));
            for (const c of candidates) {
                const t = c.textContent.trim().toLowerCase();
                if (t === 'attachment' || t === 'attachments' || t === 'adjunto' || t === 'adjuntos' || t.includes('upload attachment')) {
                    const btn = c.closest('button') || c.closest('[role="button"]') || c.closest('a') || c.closest('div') || c;
                    runFileUploadOverlay(btn);
                    return true;
                }
            }
            
            const fileInputs = Array.from(document.querySelectorAll('input[type="file"]'));
            const genericInput = fileInputs.find(i => (!i.accept || !i.accept.includes('image')));
            if (genericInput) {
                runFileUploadOverlay(genericInput);
                return true;
            }
            return false;
        };

        let attachAttempts = 0;
        const attachInterval = setInterval(() => {
            attachAttempts++;
            if (attemptAttachmentClick() || attachAttempts > 20) {
                clearInterval(attachInterval);
            }
        }, 500); // 1.2s limit after everything is natively populated

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
