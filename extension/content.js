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

      // 2. Auto-fill Tags (Split comma, clean spaces, simulate Enter precisely)
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
                      await new Promise(r => setTimeout(r, 100)); // Wait for React to digest text
                      el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));
                      await new Promise(r => setTimeout(r, 200)); // Wait before next tag
                  }
              };
              fillTags();
              break; 
          }
      }

      // 3. Schedule Date Toggle and Filling
      if (data.scheduleDate || data.scheduleTime) {
          // Find switch button to enable schedule date precisely
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

          // Wait heavily for the DOM to render the new calendar inputs
          setTimeout(() => {
              const allVisibleInputs = Array.from(document.querySelectorAll('input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"])'));
              
              let dateInput = document.querySelector('input[id*="date" i], input[name*="date" i], input[aria-label*="date" i], input[placeholder*="DD" i], input[placeholder*="MM" i], input[placeholder*="AAAA" i], input[placeholder*="YYYY" i]');
              let timeInput = document.querySelector('input[type="time" i], input[id*="time" i], input[name*="time" i], input[aria-label*="time" i], input[placeholder*="HH" i], input[placeholder*=":" i]');

              // Fallback: Date/Time are usually the exact last two visible text inputs on the Patreon sidebar
              if (!dateInput && allVisibleInputs.length >= 2) {
                  dateInput = allVisibleInputs[allVisibleInputs.length - 2];
                  timeInput = allVisibleInputs[allVisibleInputs.length - 1];
              }

              if (dateInput && data.scheduleDate) {
                  const [y, m, d] = data.scheduleDate.split('-');
                  dateInput.focus();
                  
                  // Injecting multiple formats to bypass React masks
                  setNativeValue(dateInput, data.scheduleDate); // Try native YYYY-MM-DD
                  setTimeout(() => {
                      if (!dateInput.value.includes(y)) {
                          // Try DD/MM/YYYY text mask
                          setNativeValue(dateInput, `${d}/${m}/${y}`);
                          setTimeout(() => {
                              if (!dateInput.value.includes(y)) {
                                  // Try MM/DD/YYYY text mask
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
