console.log("Post-Away Extension cargada en Patreon.");

let sse;

function setNativeValue(element, value) {
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
}

function connect() {
  sse = new EventSource('http://127.0.0.1:3333/events');
  
  sse.onopen = () => console.log("Post-Away: Conectado a la app de escritorio!");
  
  sse.onmessage = (e) => {
    try {
      const data = JSON.parse(e.data);
      console.log("Post-Away ha enviado datos:", data);
      
      // Auto-fill Title
      const titleSelectors = ['textarea[placeholder*="título" i]', 'textarea[placeholder*="title" i]', 'input[placeholder*="título" i]', '[data-tag="post-title"]', '.DraftEditor-root', '.public-DraftEditor-content'];
      for (const sel of titleSelectors) {
          const el = document.querySelector(sel);
          if (el) {
              // Note: If using Draft.js (Patreon occasionally does for bodies, sometimes titles), direct value manipulation is very brittle, 
              // but standard inputs/textareas respond well to setNativeValue.
              setNativeValue(el, data.title);
              break;
          }
      }

      // Auto-fill Tags
      const tagSelectors = ['input[placeholder*="etiquetas" i]', 'input[placeholder*="tags" i]', 'input[id*="tag"]'];
      for (const sel of tagSelectors) {
          const el = document.querySelector(sel);
          if (el) { 
              // Fill value
              setNativeValue(el, data.tags); 
              // React tag inputs require pressing Enter
              el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));
              break; 
          }
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

// Iniciar conexión al abrir la página de Patreon
connect();
