console.log("Post-Away Extension cargada en Patreon.");

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
    try {
      const data = JSON.parse(e.data);
      console.log("Post-Away ha enviado datos:", data);
      
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
              const fillTags = async () => {
                  const tagsArray = data.tags.split(',').map(t => t.trim()).filter(Boolean);
                  for (const tag of tagsArray) {
                      setNativeValue(el, tag); 
                      await new Promise(r => setTimeout(r, 100));
                      el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));
                      await new Promise(r => setTimeout(r, 200)); 
                  }
              };
              fillTags();
              break; 
          }
      }

      // 3. Collection Search & Auto-Select
      if (data.anime) {
          const searchAndSelectCollection = async (originalName) => {
              // Buscar botón o label de Add to collection
              let labelNode = Array.from(document.querySelectorAll('label, div, span, h3, p')).find(el => {
                  const text = el.textContent.trim().toLowerCase();
                  return text === "add to collection" || text === "añadir a la colección" || text === "añadir a colección";
              });

              let dropdownTrigger = null;
              if (labelNode) {
                  dropdownTrigger = labelNode.parentElement.querySelector('button, [role="combobox"], [role="button"]') || 
                                    labelNode.parentElement.parentElement.querySelector('button, [role="combobox"], [role="button"]');
              }
              
              if (!dropdownTrigger) {
                  const selects = Array.from(document.querySelectorAll('button, div[role="button"]')).filter(el => el.textContent?.trim() === "Select");
                  if (selects.length > 0) dropdownTrigger = selects[selects.length - 1]; 
              }

              if (dropdownTrigger) {
                  dropdownTrigger.click();
                  await new Promise(r => setTimeout(r, 500)); 
              }

              let colInput = document.querySelector('div[role="listbox"] input, ul[role="listbox"] input, input[aria-controls], .react-select__input input, input[type="text"]:focus');
              let currentSearch = originalName;

              while (currentSearch.length > 2) { 
                  if (colInput) {
                      colInput.focus();
                      setNativeValue(colInput, currentSearch);
                      await new Promise(r => setTimeout(r, 400)); 
                  }
                  
                  // Analizar las opciones súper genérico pero seguro
                  const allCandidates = Array.from(document.querySelectorAll('label, li, [role="option"], [role="menuitem"]'));
                  
                  const options = allCandidates.filter(el => {
                      if (!el.offsetParent) return false; 
                      
                      // Confirmar si es checkeable
                      const isLabelWithCheckbox = el.tagName.toLowerCase() === 'label' && el.querySelector('input[type="checkbox"], svg');
                      const isOption = el.getAttribute('role') === 'option' || el.getAttribute('role') === 'menuitem' || el.tagName.toLowerCase() === 'li';
                      
                      if (!isLabelWithCheckbox && !isOption) return false;

                      const text = el.textContent.trim().toLowerCase();
                      const searchLower = currentSearch.toLowerCase();
                      return text.includes(searchLower) && 
                             !text.startsWith("create ") && !text.startsWith("crear ") &&
                             !text.includes('añadir "') && !text.includes('add "') &&
                             !text.includes('+ create');
                  });

                  if (options.length > 0) {
                      const opt = options[0];
                      const cb = opt.querySelector('input[type="checkbox"]');
                      const isChecked = cb ? cb.checked : (opt.getAttribute('aria-selected') === 'true' || opt.getAttribute('aria-checked') === 'true');
                      
                      if (!isChecked) {
                          opt.click();
                      }
                      
                      // Cerrar dropdown haciendo click en el body
                      setTimeout(() => document.body.click(), 200);
                      return; 
                  }
                  
                  currentSearch = currentSearch.slice(0, -1);
              }
              
              document.body.click();
              console.warn(`Post-Away: No se encontró la colección "${originalName}".`);
          };
          searchAndSelectCollection(data.anime);
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
          }, 800);
      }
      
    } catch(err) {
      console.error("Error auto-rellenando:", err);
    }
  };

  sse.onerror = (e) => {
    sse.close();
    setTimeout(connect, 3000); 
  };
}

connect();
