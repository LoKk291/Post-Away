console.log("Post-Away: Script de automatización de X (Twitter) cargado.");

let isAutofilling = false;

function shouldPoll() {
    if (document.visibilityState === 'visible' && document.hasFocus()) return true;
    return false;
}

function pollServer() {
    if (isAutofilling || !shouldPoll()) return;

    chrome.runtime.sendMessage({ type: 'poll-twitter' }, (response) => {
        if (chrome.runtime.lastError) return;

        if (response && response.payload && !isAutofilling) {
            const data = response.payload;
            console.log("Post-Away: Datos recibidos para X:", data);
            isAutofilling = true;
            runTwitterAutofill(data);
        }
    });
}

setInterval(pollServer, 1000);

async function runTwitterAutofill(data) {
    try {
        console.log("Post-Away: Iniciando preparación del post en X...");
        showStatusToast("Post-Away v1.2: Preparando post en X...");

        // 1. Dirigirse y esperar al área de post en X
        let editor = null;
        for (let i = 0; i < 40; i++) {
            editor = document.querySelector('div[data-testid="tweetTextarea_0"]');
            if (editor) break;

            // Si el editor no está presente, intentar clickear el botón general de "Post" en la barra lateral
            if (i === 4 || i === 10) {
                const sideNavBtn = document.querySelector('a[data-testid="SideNav_NewTweet_Button"]') ||
                                   document.querySelector('button[data-testid="SideNav_NewTweet_Button"]') ||
                                   document.querySelector('a[aria-label*="Post" i]') ||
                                   document.querySelector('a[aria-label*="Postear" i]');
                if (sideNavBtn) {
                    sideNavBtn.click();
                }
            }
            await new Promise(r => setTimeout(r, 250));
        }

        if (!editor) {
            console.error("Post-Away: No se encontró el área de composición en X.");
            showStatusToast("Post-Away: No se encontró el editor de post en X", true);
            isAutofilling = false;
            return;
        }

        // 2. Cargar el texto correspondiente del post
        console.log("Post-Away: Insertando texto del post...");
        editor.focus();
        await new Promise(r => setTimeout(r, 150));

        // Seleccionar todo para reemplazar texto previo si hubiera
        document.execCommand('selectAll', false, null);

        let inserted = false;
        try {
            const dt = new DataTransfer();
            dt.setData('text/plain', data.text);
            const pasteEvt = new ClipboardEvent('paste', {
                clipboardData: dt,
                bubbles: true,
                cancelable: true
            });
            editor.dispatchEvent(pasteEvt);
            await new Promise(r => setTimeout(r, 150));
            if (editor.textContent && editor.textContent.trim().length > 0) {
                inserted = true;
            }
        } catch (e) {
            console.warn("Post-Away: Intento de paste event falló, recurriendo a execCommand:", e);
        }

        if (!inserted) {
            document.execCommand('selectAll', false, null);
            document.execCommand('insertText', false, data.text);
            editor.dispatchEvent(new Event('input', { bubbles: true }));
            editor.dispatchEvent(new Event('change', { bubbles: true }));
        }

        await new Promise(r => setTimeout(r, 400));

        // 3. Cargar las imágenes correspondientes con marca de agua (hasta 4)
        if (data.imagePaths && data.imagePaths.length > 0) {
            console.log("Post-Away: Subiendo imágenes con marca de agua:", data.imagePaths);
            await new Promise((resolve) => {
                chrome.runtime.sendMessage({
                    type: 'upload',
                    isTwitter: true,
                    files: data.imagePaths
                }, (res) => {
                    if (chrome.runtime.lastError) {
                        console.error("Post-Away: Error al subir imágenes a X:", chrome.runtime.lastError);
                    } else if (res && res.success) {
                        console.log("Post-Away: Imágenes enviadas exitosamente al selector de archivos.");
                    } else {
                        console.error("Post-Away: Respuesta fallida al subir imágenes:", res ? res.error : "Unknown");
                    }
                    resolve();
                });
            });

            // Dar tiempo a X para procesar y mostrar los previews de las imágenes
            await new Promise(r => setTimeout(r, 2200));
        }

        // 4. Dirigirse al botón Schedule de X
        console.log("Post-Away: Buscando botón Schedule...");
        let scheduleBtn = null;
        for (let i = 0; i < 25; i++) {
            scheduleBtn = document.querySelector('[data-testid="scheduleOption"]') ||
                          document.querySelector('button[aria-label*="Schedule" i]') ||
                          document.querySelector('button[aria-label*="Programar" i]');
            if (scheduleBtn) break;
            await new Promise(r => setTimeout(r, 200));
        }

        if (!scheduleBtn) {
            console.error("Post-Away: Botón Schedule no encontrado.");
            isAutofilling = false;
            return;
        }

        scheduleBtn.click();
        console.log("Post-Away: Clic en Schedule. Esperando diálogo modal...");

        // 5. Esperar al modal de Schedule
        let dialog = null;
        for (let i = 0; i < 35; i++) {
            const dialogs = document.querySelectorAll('div[role="dialog"]');
            for (const d of dialogs) {
                if (d.querySelectorAll('select').length >= 4) {
                    dialog = d;
                    break;
                }
            }
            if (dialog) break;
            await new Promise(r => setTimeout(r, 200));
        }

        if (!dialog) {
            console.error("Post-Away: Diálogo de programación no encontrado.");
            isAutofilling = false;
            return;
        }

        // 6. Configurar la fecha y hora correspondientes elegidas en el programa
        console.log("Post-Away: Asignando fecha y hora en los dropdowns...");
        await configureScheduleModal(dialog, data.scheduleDate, data.scheduleTime);

        console.log("Post-Away: Acciones automáticas completadas. Deteniendo secuencia para confirmación manual.");
        isAutofilling = false;

    } catch (err) {
        console.error("Post-Away: Error durante runTwitterAutofill:", err);
        showStatusToast("Post-Away Error: " + err.message, true);
        isAutofilling = false;
    }
}

function showStatusToast(message, isError = false) {
    try {
        let toast = document.getElementById('postaway-status-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'postaway-status-toast';
            toast.style.position = 'fixed';
            toast.style.bottom = '24px';
            toast.style.right = '24px';
            toast.style.zIndex = '999999';
            toast.style.color = '#ffffff';
            toast.style.padding = '12px 22px';
            toast.style.borderRadius = '9999px';
            toast.style.fontSize = '14px';
            toast.style.fontWeight = '700';
            toast.style.boxShadow = '0 6px 20px rgba(0,0,0,0.5)';
            toast.style.transition = 'all 0.3s ease';
            toast.style.pointerEvents = 'none';
            toast.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
            document.body.appendChild(toast);
        }
        toast.style.backgroundColor = isError ? '#e0245e' : '#1d9bf0';
        toast.textContent = message;
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
        setTimeout(() => {
            if (toast) {
                toast.style.opacity = '0';
                toast.style.transform = 'translateY(10px)';
            }
        }, 5000);
    } catch (e) {
        console.warn("Post-Away: Error mostrando toast:", e);
    }
}

async function configureScheduleModal(dialog, scheduleDate, scheduleTime) {
    // 1. Parsear Fecha de forma robusta (YYYY-MM-DD o DD/MM/YYYY)
    let targetYear, targetMonth, targetDay;
    if (scheduleDate) {
        let parts;
        if (scheduleDate.includes('-')) {
            parts = scheduleDate.split('-');
        } else if (scheduleDate.includes('/')) {
            parts = scheduleDate.split('/');
        } else {
            parts = [scheduleDate];
        }

        if (parts.length === 3) {
            if (parts[0].length === 4) {
                // Formato YYYY-MM-DD o YYYY/MM/DD
                targetYear = parseInt(parts[0], 10);
                targetMonth = parseInt(parts[1], 10); // 1 a 12
                targetDay = parseInt(parts[2], 10);   // 1 a 31
            } else {
                // Formato DD-MM-YYYY o DD/MM/YYYY
                targetDay = parseInt(parts[0], 10);
                targetMonth = parseInt(parts[1], 10); // 1 a 12
                targetYear = parseInt(parts[2], 10);
            }
        }
    }

    if (!targetYear || !targetMonth || !targetDay) {
        const now = new Date();
        targetYear = now.getFullYear();
        targetMonth = now.getMonth() + 1;
        targetDay = now.getDate();
    }

    // 2. Parsear Hora de forma robusta (24hs o 12hs con AM/PM)
    let h24 = 12, targetMin = 0;
    if (scheduleTime) {
        const cleanTime = String(scheduleTime).toLowerCase().trim();
        const isPM = cleanTime.includes('pm');
        const isAM = cleanTime.includes('am');
        const numPart = cleanTime.replace(/[a-z]/g, '').trim();
        const timeParts = numPart.split(':');

        let rawHour = parseInt(timeParts[0], 10);
        targetMin = timeParts.length > 1 ? parseInt(timeParts[1], 10) : 0;

        if (isNaN(rawHour)) rawHour = 12;
        if (isNaN(targetMin)) targetMin = 0;

        if (isPM && rawHour < 12) {
            h24 = rawHour + 12;
        } else if (isAM && rawHour === 12) {
            h24 = 0;
        } else {
            h24 = rawHour;
        }
    }

    const targetAmPm = h24 >= 12 ? 'PM' : 'AM';
    const targetHour12 = h24 % 12 || 12;

    const displayMonthName = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'][targetMonth - 1];
    showStatusToast(`Post-Away v1.2: Programando para ${targetDay} de ${displayMonthName} de ${targetYear} a las ${String(h24).padStart(2, '0')}:${String(targetMin).padStart(2, '0')}...`);

    console.log(`Post-Away: Fecha objetivo -> Año=${targetYear}, Mes=${targetMonth} (${displayMonthName}), Día=${targetDay} | Hora objetivo: 24h=${h24}, 12h=${targetHour12} ${targetAmPm}, Min=${targetMin}`);

    const selects = Array.from(dialog.querySelectorAll('select'));
    console.log("Post-Away: Total selects encontrados en diálogo de X:", selects.length);

    const monthNamesEn = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
    const monthNamesEs = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

    let monthSelect = null;
    let daySelect = null;
    let yearSelect = null;
    let hourSelect = null;
    let minSelect = null;
    let ampmSelect = null;

    // Clasificación determinista e infalible por contenido exclusivo de las opciones
    for (const s of selects) {
        const opts = Array.from(s.options);
        const texts = opts.map(o => (o.text || '').trim().toLowerCase());
        const values = opts.map(o => (o.value || '').trim().toLowerCase());
        const count = opts.length;

        // 1. Selector AM/PM (exactamente 2 opciones: AM y PM)
        if (count === 2 && (texts.includes('am') || texts.includes('pm') || values.includes('am') || values.includes('pm'))) {
            ampmSelect = s;
            continue;
        }

        // 2. Selector de Año: contiene opciones con números de 4 dígitos (ej: 2025, 2026...)
        if (texts.some(t => /^20\d\d$/.test(t)) || values.some(v => /^20\d\d$/.test(v))) {
            yearSelect = s;
            continue;
        }

        // 3. Selector de Mes: contiene nombres de meses en inglés o español, o 12 opciones con texto
        if (texts.some(t => monthNamesEn.includes(t) || monthNamesEs.includes(t)) ||
            (count === 12 && texts.some(t => /[a-z]/i.test(t)))) {
            monthSelect = s;
            continue;
        }

        // 4. Selector de Minuto: tiene 60 opciones, o contiene números mayores a 31
        if (count === 60 || texts.some(t => {
            const n = parseInt(t, 10);
            return !isNaN(n) && n > 31 && n <= 59;
        })) {
            minSelect = s;
            continue;
        }

        // 5. Selector de Hora: tiene 24 opciones (0..23) o 12 opciones numéricas sin texto de mes
        if (count === 24 || (count === 12 && texts.every(t => /^\d+$/.test(t)))) {
            hourSelect = s;
            continue;
        }

        // 6. Selector de Día: 28 a 31 opciones numéricas
        if (count >= 28 && count <= 31 && texts.every(t => /^\d+$/.test(t))) {
            daySelect = s;
            continue;
        }
    }

    // Fallback de seguridad posicional estándar de la UI de X
    if (!monthSelect && selects.length >= 1) monthSelect = selects[0];
    if (!daySelect && selects.length >= 2) daySelect = selects[1];
    if (!yearSelect && selects.length >= 3) yearSelect = selects[2];
    if (!hourSelect && selects.length >= 4) hourSelect = selects[3];
    if (!minSelect && selects.length >= 5) minSelect = selects[4];
    if (!ampmSelect && selects.length >= 6) ampmSelect = selects[5];

    console.log("Post-Away: Clasificación de dropdowns:", {
        mes: !!monthSelect,
        dia: !!daySelect,
        anio: !!yearSelect,
        hora: !!hourSelect,
        min: !!minSelect,
        ampm: !!ampmSelect
    });

    function setSelect(selectEl, matcher) {
        if (!selectEl) return false;
        for (let i = 0; i < selectEl.options.length; i++) {
            const opt = selectEl.options[i];
            if (matcher(opt, i)) {
                selectEl.selectedIndex = i;
                const nativeSetter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value')?.set;
                if (nativeSetter) {
                    nativeSetter.call(selectEl, opt.value);
                } else {
                    selectEl.value = opt.value;
                }
                selectEl.dispatchEvent(new Event('input', { bubbles: true }));
                selectEl.dispatchEvent(new Event('change', { bubbles: true }));
                return true;
            }
        }
        return false;
    }

    // 1. Asignar Mes
    if (monthSelect) {
        const nameEn = monthNamesEn[targetMonth - 1]; // ej: "september"
        const nameEs = monthNamesEs[targetMonth - 1]; // ej: "septiembre"

        const ok = setSelect(monthSelect, (opt, idx) => {
            const t = opt.text.trim().toLowerCase();
            const v = opt.value.trim().toLowerCase();

            // Prioridad A: Coincidencia de nombre exacto
            if (t === nameEn || t === nameEs || v === nameEn || v === nameEs) return true;
            if (t.includes(nameEn) || t.includes(nameEs)) return true;
            // Prioridad B: Por índice exacto si el selector tiene los 12 meses ordenados
            if (monthSelect.options.length === 12 && idx === (targetMonth - 1)) return true;
            return false;
        });
        console.log(`Post-Away: Mes asignado (${nameEn}):`, ok);
        await new Promise(r => setTimeout(r, 120));
    }

    // 2. Asignar Día
    if (daySelect) {
        const ok = setSelect(daySelect, opt => {
            const num = parseInt(opt.value, 10);
            const textNum = parseInt(opt.text, 10);
            return num === targetDay || textNum === targetDay;
        });
        console.log(`Post-Away: Día asignado (${targetDay}):`, ok);
        await new Promise(r => setTimeout(r, 120));
    }

    // 3. Asignar Año
    if (yearSelect) {
        const ok = setSelect(yearSelect, opt => {
            const num = parseInt(opt.value, 10);
            const textNum = parseInt(opt.text, 10);
            return num === targetYear || textNum === targetYear;
        });
        console.log(`Post-Away: Año asignado (${targetYear}):`, ok);
        await new Promise(r => setTimeout(r, 120));
    }

    // 4. Asignar Hora (detectar 24h vs 12h)
    if (hourSelect) {
        const is24Hour = !ampmSelect || hourSelect.options.length > 12 || 
                         Array.from(hourSelect.options).some(o => {
                             const n = parseInt(o.value, 10) || parseInt(o.text, 10);
                             return !isNaN(n) && n > 12;
                         });
        
        const targetHour = is24Hour ? h24 : targetHour12;
        console.log(`Post-Away: Selector de hora configurado como is24Hour=${is24Hour}, buscando hora=${targetHour}`);

        const ok = setSelect(hourSelect, opt => {
            const vNum = parseInt(opt.value, 10);
            const tNum = parseInt(opt.text, 10);
            return vNum === targetHour || tNum === targetHour;
        });
        console.log(`Post-Away: Hora asignada (${targetHour}):`, ok);
        await new Promise(r => setTimeout(r, 120));
    }

    // 5. Asignar Minutos
    if (minSelect) {
        const ok = setSelect(minSelect, opt => {
            const vNum = parseInt(opt.value, 10);
            const tNum = parseInt(opt.text, 10);
            return vNum === targetMin || tNum === targetMin;
        });
        console.log(`Post-Away: Minuto asignado (${targetMin}):`, ok);
        await new Promise(r => setTimeout(r, 120));
    }

    // 6. Asignar AM/PM (solo si existe el dropdown de AM/PM)
    if (ampmSelect) {
        const ok = setSelect(ampmSelect, opt => {
            const v = opt.value.trim().toUpperCase();
            const t = opt.text.trim().toUpperCase();
            return v === targetAmPm || t === targetAmPm;
        });
        console.log(`Post-Away: AM/PM asignado (${targetAmPm}):`, ok);
        await new Promise(r => setTimeout(r, 120));
    }

    console.log("Post-Away: Selects configurados exitosamente en X.");
    showStatusToast(`Post-Away v1.2: ¡Configurado para ${targetDay}/${targetMonth}/${targetYear} ${String(h24).padStart(2, '0')}:${String(targetMin).padStart(2, '0')}!`);
}

// ==============================================================
// POST-AWAY X FLOATING ASSISTANT WIDGET
// ==============================================================

let floatFeed = [];
let floatIndex = -1; // -1 indica no asignado aún para esta pestaña
let floatThumbCache = {};
let isFloatMinimized = false;
let isFloatExecuting = false;
let editSyncTimeout = null;
let openMode = localStorage.getItem('postaway_open_mode') || 'tab'; // 'tab' o 'window'

let isAutoBatchActive = false;
let isAutoBatchStarted = false;
let autoBatchNextTimeout = null;

// Consultar inmediatamente a background si esta pestaña fue creada con un índice asignado
chrome.runtime.sendMessage({ type: 'get-tab-post-index' }, (res) => {
    if (!chrome.runtime.lastError && res) {
        if (res.assignedIndex !== null && res.assignedIndex !== undefined) {
            sessionStorage.setItem('postaway_tab_index', res.assignedIndex.toString());
            if (floatIndex === -1) {
                floatIndex = res.assignedIndex;
            }
        }
        if (res.autoRun) {
            isAutoBatchActive = true;
            sessionStorage.setItem('postaway_auto_batch', 'true');
        }
        if (floatFeed.length > 0) renderCurrentPost();
    }
});

function getTabPostIndex() {
    // 1. Prioridad: Hash en la URL (#postaway_idx=X&postaway_autorun=1)
    const hash = window.location.hash || '';
    const match = hash.match(/postaway_idx=(\d+)/);
    if (match) {
        const parsed = parseInt(match[1], 10);
        if (!isNaN(parsed) && parsed >= 0) {
            sessionStorage.setItem('postaway_tab_index', parsed.toString());
            if (hash.includes('postaway_autorun=1')) {
                isAutoBatchActive = true;
                sessionStorage.setItem('postaway_auto_batch', 'true');
            }
            try {
                history.replaceState(null, document.title, window.location.pathname + window.location.search);
            } catch (e) {}
            return parsed;
        }
    }

    if (sessionStorage.getItem('postaway_auto_batch') === 'true') {
        isAutoBatchActive = true;
    }

    // 2. Prioridad: sessionStorage propio y aislado de esta pestaña
    const stored = sessionStorage.getItem('postaway_tab_index');
    if (stored !== null) {
        const parsed = parseInt(stored, 10);
        if (!isNaN(parsed) && parsed >= 0) {
            return parsed;
        }
    }
    return null;
}

function isPostUploaded(idx) {
    const targetIdx = (idx !== undefined) ? idx : floatIndex;
    if (!floatFeed || !floatFeed[targetIdx]) return false;
    const postId = floatFeed[targetIdx].id || ('idx_' + targetIdx);
    return sessionStorage.getItem('postaway_uploaded_' + postId) === 'true';
}

function markPostUploaded(idx) {
    const targetIdx = (idx !== undefined) ? idx : floatIndex;
    if (!floatFeed || !floatFeed[targetIdx]) return;
    const postId = floatFeed[targetIdx].id || ('idx_' + targetIdx);
    sessionStorage.setItem('postaway_uploaded_' + postId, 'true');
}

function openNextPostInNewTab(targetIdx, autoRun = false) {
    const nextIdx = (targetIdx !== undefined) ? targetIdx : (floatIndex + 1);
    if (!floatFeed || nextIdx >= floatFeed.length) {
        showStatusToast("🎉 ¡No hay más posts! Has completado la lista.");
        return;
    }

    const asWindow = (openMode === 'window');
    const modeLabel = asWindow ? 'ventana' : 'pestaña';
    showStatusToast(`🚀 Abriendo Post ${nextIdx + 1} en nueva ${modeLabel} de X...`);

    chrome.runtime.sendMessage({
        type: 'open-next-x-tab',
        postIndex: nextIdx,
        asWindow: asWindow,
        autoRun: autoRun
    }, (res) => {
        if (chrome.runtime.lastError || !res || !res.success) {
            const targetUrl = `https://x.com/compose/post#postaway_idx=${nextIdx}${autoRun ? '&postaway_autorun=1' : ''}`;
            if (asWindow) {
                window.open(targetUrl, '_blank', 'width=1280,height=800');
            } else {
                window.open(targetUrl, '_blank');
            }
        }
    });
}

function injectFloatingStyles() {
    if (document.getElementById('postaway-twitter-styles')) return;
    const style = document.createElement('style');
    style.id = 'postaway-twitter-styles';
    style.textContent = `
        #postaway-twitter-panel {
            position: fixed;
            top: 75px;
            right: 20px;
            width: 325px;
            background: rgba(15, 23, 42, 0.96);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.16);
            border-radius: 14px;
            box-shadow: 0 14px 40px rgba(0, 0, 0, 0.65);
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #e2e8f0;
            z-index: 999999;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            user-select: none;
            transition: opacity 0.2s ease, transform 0.2s ease;
        }
        #postaway-twitter-panel * {
            box-sizing: border-box;
        }
        #postaway-twitter-panel input,
        #postaway-twitter-panel textarea {
            user-select: text;
        }
        .postaway-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 9px 12px;
            background: rgba(30, 41, 59, 0.9);
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            cursor: move;
        }
        .postaway-header-title {
            display: flex;
            align-items: center;
            gap: 7px;
            font-size: 13px;
            font-weight: 700;
            color: #38bdf8;
        }
        .postaway-status-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #22c55e;
            box-shadow: 0 0 6px #22c55e;
            display: inline-block;
        }
        .postaway-status-dot.disconnected {
            background: #ef4444;
            box-shadow: 0 0 6px #ef4444;
        }
        .postaway-header-actions {
            display: flex;
            align-items: center;
            gap: 4px;
        }
        .postaway-icon-btn {
            background: transparent;
            border: none;
            color: #94a3b8;
            cursor: pointer;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 12px;
            transition: all 0.15s ease;
        }
        .postaway-icon-btn:hover {
            color: #fff;
            background: rgba(255, 255, 255, 0.12);
        }
        .postaway-mode-badge {
            font-size: 10px;
            font-weight: 600;
            padding: 2px 6px;
            border-radius: 4px;
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.12);
            color: #38bdf8;
            cursor: pointer;
            user-select: none;
            transition: all 0.15s ease;
        }
        .postaway-mode-badge:hover {
            background: rgba(56, 189, 248, 0.2);
            border-color: #38bdf8;
        }
        .postaway-nav-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 6px 12px;
            background: rgba(0, 0, 0, 0.25);
            border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }
        .postaway-nav-btn {
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.15);
            color: #e2e8f0;
            padding: 4px 10px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.15s ease;
        }
        .postaway-nav-btn:hover:not(:disabled) {
            background: rgba(29, 155, 240, 0.25);
            border-color: #1d9bf0;
            color: #38bdf8;
        }
        .postaway-nav-btn:disabled {
            opacity: 0.35;
            cursor: not-allowed;
        }
        .postaway-nav-next-highlight {
            background: linear-gradient(135deg, rgba(29, 155, 240, 0.35), rgba(2, 132, 199, 0.45)) !important;
            border-color: #38bdf8 !important;
            color: #38bdf8 !important;
            box-shadow: 0 0 10px rgba(56, 189, 248, 0.35);
        }
        .postaway-nav-next-highlight:hover:not(:disabled) {
            background: linear-gradient(135deg, rgba(29, 155, 240, 0.55), rgba(2, 132, 199, 0.65)) !important;
            color: #fff !important;
        }
        .postaway-counter {
            font-size: 11px;
            font-weight: 700;
            color: #cbd5e1;
            display: flex;
            align-items: center;
            gap: 4px;
        }
        .postaway-badge-uploaded {
            display: inline-block;
            background: rgba(34, 197, 94, 0.2);
            color: #4ade80;
            border: 1px solid rgba(34, 197, 94, 0.4);
            border-radius: 4px;
            font-size: 9px;
            padding: 1px 4px;
            font-weight: 700;
        }
        .postaway-content {
            padding: 10px 12px;
            display: flex;
            flex-direction: column;
            gap: 8px;
            max-height: 520px;
            overflow-y: auto;
        }
        .postaway-char-name {
            font-size: 12px;
            font-weight: 700;
            color: #fff;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            line-height: 1.3;
        }
        .postaway-thumb-box {
            width: 100%;
            height: 115px;
            background: rgba(0, 0, 0, 0.45);
            border-radius: 8px;
            border: 1px solid rgba(255, 255, 255, 0.08);
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
        }
        .postaway-thumb-img {
            max-height: 100%;
            max-width: 100%;
            object-fit: contain;
            display: none;
            transition: transform 0.2s;
        }
        .postaway-thumb-img:hover {
            transform: scale(1.03);
        }
        .postaway-thumb-placeholder {
            color: #64748b;
            font-size: 11px;
            text-align: center;
            padding: 8px;
        }
        .postaway-schedule-grid {
            display: flex;
            gap: 6px;
        }
        .postaway-field-group {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 2px;
        }
        .postaway-field-label {
            font-size: 10px;
            color: #94a3b8;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .postaway-input {
            width: 100%;
            padding: 5px 7px;
            background: rgba(0, 0, 0, 0.4);
            border: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: 6px;
            color: #fff;
            font-size: 11px;
        }
        .postaway-input:focus {
            border-color: #1d9bf0;
            outline: none;
        }
        .postaway-textarea-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 10px;
            color: #94a3b8;
            margin-top: 2px;
        }
        .postaway-textarea {
            width: 100%;
            padding: 6px 8px;
            background: rgba(0, 0, 0, 0.4);
            border: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: 6px;
            color: #fff;
            font-size: 11px;
            line-height: 1.35;
            resize: vertical;
            min-height: 65px;
            max-height: 140px;
            font-family: inherit;
        }
        .postaway-textarea:focus {
            border-color: #1d9bf0;
            outline: none;
        }
        .postaway-btn-upload {
            width: 100%;
            padding: 8px 12px;
            background: linear-gradient(135deg, #1d9bf0, #0284c7);
            color: #fff;
            border: none;
            border-radius: 8px;
            font-weight: 700;
            font-size: 12px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            box-shadow: 0 4px 14px rgba(29, 155, 240, 0.4);
            transition: all 0.2s ease;
            margin-top: 2px;
        }
        .postaway-btn-upload:hover:not(:disabled) {
            filter: brightness(1.1);
            transform: translateY(-1px);
            box-shadow: 0 6px 18px rgba(29, 155, 240, 0.55);
        }
        .postaway-btn-upload:active:not(:disabled) {
            transform: translateY(0);
        }
        .postaway-btn-upload:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }
        .postaway-btn-autobatch {
            width: 100%;
            padding: 8px 12px;
            background: linear-gradient(135deg, #8b5cf6, #6366f1);
            color: #fff;
            border: none;
            border-radius: 8px;
            font-weight: 700;
            font-size: 12px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            box-shadow: 0 4px 14px rgba(139, 92, 246, 0.4);
            transition: all 0.2s ease;
            margin-top: 4px;
        }
        .postaway-btn-autobatch:hover:not(:disabled) {
            filter: brightness(1.1);
            transform: translateY(-1px);
            box-shadow: 0 6px 18px rgba(139, 92, 246, 0.55);
        }
        .postaway-btn-autobatch:active:not(:disabled) {
            transform: translateY(0);
        }
        .postaway-btn-autobatch.running {
            background: linear-gradient(135deg, #ef4444, #dc2626) !important;
            box-shadow: 0 4px 14px rgba(239, 68, 68, 0.45) !important;
            animation: pulse-border 1.5s infinite;
        }
        @keyframes pulse-border {
            0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
            70% { box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
            100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
        #postaway-twitter-min-pill {
            position: fixed;
            top: 75px;
            right: 20px;
            z-index: 999999;
            background: linear-gradient(135deg, #1d9bf0, #0284c7);
            color: #ffffff;
            padding: 7px 13px;
            border-radius: 20px;
            font-weight: 700;
            font-size: 12px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.5);
            cursor: pointer;
            display: none;
            align-items: center;
            gap: 7px;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
            user-select: none;
        }
        #postaway-twitter-min-pill:hover {
            transform: scale(1.05);
            box-shadow: 0 6px 20px rgba(29, 155, 240, 0.6);
        }
        .postaway-empty-box {
            padding: 24px 14px;
            text-align: center;
            color: #94a3b8;
            font-size: 12px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
        }
    `;
    document.head.appendChild(style);
}

function makeDraggable(element, handle) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    handle.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        if (e.target.tagName === 'BUTTON' || e.target.classList.contains('postaway-icon-btn')) return;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;

        const newTop = element.offsetTop - pos2;
        const newLeft = element.offsetLeft - pos1;

        const maxTop = window.innerHeight - 80;
        const maxLeft = window.innerWidth - element.offsetWidth - 10;
        element.style.top = Math.max(10, Math.min(maxTop, newTop)) + "px";
        element.style.left = Math.max(10, Math.min(maxLeft, newLeft)) + "px";
        element.style.right = 'auto';
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

function updatePillCounter() {
    const pillCounter = document.getElementById('postaway-pill-counter');
    if (pillCounter) {
        if (floatFeed && floatFeed.length > 0) {
            pillCounter.textContent = `(${floatIndex + 1}/${floatFeed.length})`;
        } else {
            pillCounter.textContent = `(0)`;
        }
    }
}

function updateCharCount() {
    const textInput = document.getElementById('postaway-input-text');
    const counterEl = document.getElementById('postaway-char-count');
    if (textInput && counterEl) {
        const count = textInput.value.length;
        counterEl.textContent = `${count} car.`;
        counterEl.style.color = count > 280 ? '#f87171' : '#94a3b8';
    }
}

function saveCurrentPostEdits() {
    if (!floatFeed || floatFeed.length === 0 || !floatFeed[floatIndex]) return;
    const post = floatFeed[floatIndex];
    const dateInput = document.getElementById('postaway-input-date');
    const timeInput = document.getElementById('postaway-input-time');
    const textInput = document.getElementById('postaway-input-text');
    if (dateInput && dateInput.value) post.scheduleDate = dateInput.value;
    if (timeInput && timeInput.value) post.scheduleTime = timeInput.value;
    if (textInput) post.combinedText = textInput.value;
}

function triggerPostEditSync() {
    saveCurrentPostEdits();
    if (!floatFeed || !floatFeed[floatIndex]) return;
    const post = floatFeed[floatIndex];

    if (editSyncTimeout) clearTimeout(editSyncTimeout);
    editSyncTimeout = setTimeout(() => {
        chrome.runtime.sendMessage({
            type: 'update-twitter-post',
            post: {
                id: post.id,
                combinedText: post.combinedText,
                scheduleDate: post.scheduleDate,
                scheduleTime: post.scheduleTime
            }
        });
    }, 300);
}

function handlePrevPostAction() {
    saveCurrentPostEdits();
    if (!floatFeed || floatFeed.length === 0) return;
    if (floatIndex > 0) {
        floatIndex--;
        sessionStorage.setItem('postaway_tab_index', floatIndex.toString());
        renderCurrentPost();
    }
}

function handleNextPostAction() {
    saveCurrentPostEdits();
    if (!floatFeed || floatFeed.length === 0) return;

    const nextIdx = floatIndex + 1;
    if (nextIdx >= floatFeed.length) {
        showStatusToast("🎉 ¡Este es el último post de la lista!");
        return;
    }

    // Si el post actual ya fue preparado / subido en esta pestaña:
    if (isPostUploaded(floatIndex)) {
        openNextPostInNewTab(nextIdx);
    } else {
        floatIndex = nextIdx;
        sessionStorage.setItem('postaway_tab_index', floatIndex.toString());
        renderCurrentPost();
    }
}

function navigatePost(direction) {
    if (direction < 0) {
        handlePrevPostAction();
    } else {
        handleNextPostAction();
    }
}

function loadThumbnailForPost(post) {
    const thumbImg = document.getElementById('postaway-thumb-img');
    const placeholder = document.getElementById('postaway-thumb-placeholder');

    if (!post.thumbnailPath) {
        thumbImg.style.display = 'none';
        placeholder.textContent = '🖼️ Sin imagen';
        placeholder.style.display = 'block';
        return;
    }

    if (floatThumbCache[post.thumbnailPath]) {
        thumbImg.src = floatThumbCache[post.thumbnailPath];
        thumbImg.style.display = 'block';
        placeholder.style.display = 'none';
        return;
    }

    thumbImg.style.display = 'none';
    placeholder.textContent = '🖼️ Cargando miniatura...';
    placeholder.style.display = 'block';

    chrome.runtime.sendMessage({
        type: 'get-thumbnail-data',
        filePath: post.thumbnailPath
    }, (res) => {
        if (chrome.runtime.lastError) {
            placeholder.textContent = '🖼️ Error al cargar';
            return;
        }
        if (res && res.success && res.dataUrl) {
            floatThumbCache[post.thumbnailPath] = res.dataUrl;
            if (floatFeed[floatIndex] && floatFeed[floatIndex].thumbnailPath === post.thumbnailPath) {
                thumbImg.src = res.dataUrl;
                thumbImg.style.display = 'block';
                placeholder.style.display = 'none';
            }
        } else {
            placeholder.textContent = '🖼️ Sin vista previa';
        }
    });
}

function renderCurrentPost() {
    if (!floatFeed || floatFeed.length === 0) {
        document.getElementById('postaway-empty-state').style.display = 'flex';
        document.getElementById('postaway-post-form').style.display = 'none';
        document.getElementById('postaway-nav-row').style.display = 'none';
        document.getElementById('postaway-status-dot').className = 'postaway-status-dot disconnected';
        updatePillCounter();
        return;
    }

    if (floatIndex < 0) floatIndex = 0;
    if (floatIndex >= floatFeed.length) floatIndex = floatFeed.length - 1;

    const post = floatFeed[floatIndex];

    document.getElementById('postaway-empty-state').style.display = 'none';
    document.getElementById('postaway-post-form').style.display = 'flex';
    document.getElementById('postaway-nav-row').style.display = 'flex';
    document.getElementById('postaway-status-dot').className = 'postaway-status-dot';

    const isUploaded = isPostUploaded(floatIndex);
    const navPrev = document.getElementById('postaway-nav-prev');
    const navNext = document.getElementById('postaway-nav-next');
    const counterEl = document.getElementById('postaway-counter');

    navPrev.disabled = (floatIndex === 0);
    navNext.disabled = (floatIndex >= floatFeed.length - 1);

    if (isUploaded) {
        counterEl.innerHTML = `<span>Post ${floatIndex + 1} de ${floatFeed.length}</span> <span class="postaway-badge-uploaded">✓ Subido</span>`;
        if (floatIndex < floatFeed.length - 1) {
            const modeText = (openMode === 'window') ? 'Ventana' : 'Pestaña';
            navNext.innerHTML = `Siguiente ↗`;
            navNext.title = `Abrir Post ${floatIndex + 2} en una nueva ${modeText.toLowerCase()} de X`;
            navNext.classList.add('postaway-nav-next-highlight');
        } else {
            navNext.innerHTML = `Siguiente ▶`;
            navNext.title = `Fin de la lista`;
            navNext.classList.remove('postaway-nav-next-highlight');
        }
    } else {
        counterEl.textContent = `Post ${floatIndex + 1} de ${floatFeed.length}`;
        navNext.innerHTML = `Siguiente ▶`;
        navNext.title = `Siguiente post (Alt + Flecha Der)`;
        navNext.classList.remove('postaway-nav-next-highlight');
    }
    updatePillCounter();

    document.getElementById('postaway-char-name').textContent = post.characterName || post.folderName || 'Personaje';
    document.getElementById('postaway-char-name').title = post.folderName || '';

    const dateInput = document.getElementById('postaway-input-date');
    const timeInput = document.getElementById('postaway-input-time');
    dateInput.value = post.scheduleDate || '';
    timeInput.value = post.scheduleTime || '';

    const textInput = document.getElementById('postaway-input-text');
    textInput.value = post.combinedText || '';
    updateCharCount();

    const uploadBtn = document.getElementById('postaway-btn-upload');
    uploadBtn.disabled = false;
    if (isUploaded && floatIndex < floatFeed.length - 1) {
        const nextNum = floatIndex + 2;
        const modeText = (openMode === 'window') ? 'ventana' : 'pestaña';
        uploadBtn.innerHTML = `<span>✅ ¡Subido! Siguiente en nueva ${modeText} (${nextNum}/${floatFeed.length}) ↗</span>`;
        uploadBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
        uploadBtn.onclick = () => {
            openNextPostInNewTab(floatIndex + 1);
        };
    } else {
        uploadBtn.innerHTML = `<span>🚀 Subir / Programar en X</span>`;
        uploadBtn.style.background = 'linear-gradient(135deg, #1d9bf0, #0284c7)';
        uploadBtn.onclick = () => executeCurrentPostUpload(false);
    }

    const autoBatchBtn = document.getElementById('postaway-btn-autobatch');
    if (autoBatchBtn) {
        if (isAutoBatchActive) {
            autoBatchBtn.classList.add('running');
            autoBatchBtn.innerHTML = `<span>⏹️ Detener Cadena (${floatIndex + 1}/${floatFeed.length})</span>`;
            autoBatchBtn.title = 'Detener la subida automática en cadena';
        } else {
            autoBatchBtn.classList.remove('running');
            autoBatchBtn.disabled = false;
            autoBatchBtn.innerHTML = `<span>⚡ Subida Automática en Cadena</span>`;
            autoBatchBtn.title = 'Subir este post y automáticamente abrir y preparar los siguientes en nuevas pestañas hasta terminar';
        }
    }

    loadThumbnailForPost(post);
    checkAndStartAutoBatch();
}

async function executeCurrentPostUpload(isFromAutoBatch = false) {
    if (isFloatExecuting || isAutofilling || !floatFeed || !floatFeed[floatIndex]) return;

    saveCurrentPostEdits();
    const post = floatFeed[floatIndex];

    const uploadBtn = document.getElementById('postaway-btn-upload');
    const autoBatchBtn = document.getElementById('postaway-btn-autobatch');

    uploadBtn.disabled = true;
    uploadBtn.innerHTML = `<span>⏳ Preparando post en X...</span>`;
    uploadBtn.style.background = 'rgba(29, 155, 240, 0.6)';

    isFloatExecuting = true;
    isAutofilling = true;

    try {
        await runTwitterAutofill({
            text: post.combinedText,
            imagePaths: post.watermarkImages || [],
            scheduleDate: post.scheduleDate,
            scheduleTime: post.scheduleTime
        });

        markPostUploaded(floatIndex);

        uploadBtn.disabled = false;
        uploadBtn.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';
        
        if (floatIndex < floatFeed.length - 1) {
            const nextNum = floatIndex + 2;
            const modeText = (openMode === 'window') ? 'ventana' : 'pestaña';
            uploadBtn.innerHTML = `<span>✅ ¡Preparado! Siguiente en nueva ${modeText} (${nextNum}/${floatFeed.length}) ↗</span>`;
            uploadBtn.onclick = () => {
                openNextPostInNewTab(floatIndex + 1);
            };
        } else {
            uploadBtn.innerHTML = `<span>✅ ¡Último post preparado con éxito!</span>`;
            setTimeout(() => {
                uploadBtn.innerHTML = `<span>🚀 Subir / Programar de nuevo</span>`;
                uploadBtn.style.background = 'linear-gradient(135deg, #1d9bf0, #0284c7)';
                uploadBtn.onclick = () => executeCurrentPostUpload(false);
            }, 3000);
        }

        renderCurrentPost();

        if (isFromAutoBatch && isAutoBatchActive) {
            if (floatIndex < floatFeed.length - 1) {
                const nextNum = floatIndex + 2;
                showStatusToast(`✅ Post ${floatIndex + 1} preparado. Abriendo Post ${nextNum} en nueva pestaña en 2.5s...`);
                autoBatchNextTimeout = setTimeout(() => {
                    if (isAutoBatchActive) {
                        openNextPostInNewTab(floatIndex + 1, true);
                    }
                }, 2500);
            } else {
                isAutoBatchActive = false;
                sessionStorage.removeItem('postaway_auto_batch');
                chrome.runtime.sendMessage({ type: 'cancel-twitter-autobatch' });
                showStatusToast("🎉 ¡Subida automática en cadena completada! Se prepararon todos los posts en pestañas separadas.");
                if (autoBatchBtn) {
                    autoBatchBtn.classList.remove('running');
                    autoBatchBtn.innerHTML = `<span>🎉 ¡Todos los posts listos!</span>`;
                    setTimeout(() => {
                        autoBatchBtn.innerHTML = `<span>⚡ Subida Automática en Cadena</span>`;
                    }, 5000);
                }
            }
        } else {
            showStatusToast("Post preparado en X. Haz clic en 'Siguiente' para abrir el próximo post.");
        }
    } catch (err) {
        console.error("Error executing post upload:", err);
        uploadBtn.disabled = false;
        uploadBtn.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
        uploadBtn.innerHTML = `<span>⚠️ Error al preparar post</span>`;

        if (isAutoBatchActive) {
            isAutoBatchActive = false;
            sessionStorage.removeItem('postaway_auto_batch');
            chrome.runtime.sendMessage({ type: 'cancel-twitter-autobatch' });
            if (autoBatchBtn) {
                autoBatchBtn.classList.remove('running');
                autoBatchBtn.innerHTML = `<span>⚡ Subida Automática en Cadena</span>`;
            }
            showStatusToast(`⚠️ Error en Post ${floatIndex + 1}: ${err.message}. Cadena automática detenida para revisión.`, true);
        }

        setTimeout(() => {
            uploadBtn.innerHTML = `<span>🚀 Reintentar</span>`;
            uploadBtn.style.background = 'linear-gradient(135deg, #1d9bf0, #0284c7)';
            uploadBtn.onclick = () => executeCurrentPostUpload(false);
        }, 3000);
    } finally {
        isFloatExecuting = false;
        isAutofilling = false;
    }
}

function fetchTwitterFeed(showFeedback = false) {
    chrome.runtime.sendMessage({ type: 'get-twitter-feed' }, (response) => {
        if (chrome.runtime.lastError) {
            if (showFeedback) showStatusToast("Post-Away: No se pudo conectar a la aplicación", true);
            return;
        }
        if (response && response.posts) {
            floatFeed = response.posts;

            if (floatIndex === -1) {
                const tabIdx = getTabPostIndex();
                if (tabIdx !== null && tabIdx >= 0) {
                    floatIndex = tabIdx;
                } else {
                    floatIndex = response.currentIndex || 0;
                }
                sessionStorage.setItem('postaway_tab_index', floatIndex.toString());
            }

            if (floatFeed.length > 0) {
                if (floatIndex < 0) floatIndex = 0;
                if (floatIndex >= floatFeed.length) floatIndex = floatFeed.length - 1;
            }

            const activeEl = document.activeElement;
            const isEditingText = activeEl && activeEl.id === 'postaway-input-text';
            const isEditingDate = activeEl && activeEl.id === 'postaway-input-date';
            const isEditingTime = activeEl && activeEl.id === 'postaway-input-time';

            if (!isEditingText && !isEditingDate && !isEditingTime) {
                renderCurrentPost();
            }

            if (showFeedback && floatFeed.length > 0) {
                showStatusToast(`Post-Away: ${floatFeed.length} posts sincronizados.`);
            }
        }
    });
}

function toggleAutoBatch() {
    if (isAutoBatchActive) {
        isAutoBatchActive = false;
        sessionStorage.removeItem('postaway_auto_batch');
        if (autoBatchNextTimeout) {
            clearTimeout(autoBatchNextTimeout);
            autoBatchNextTimeout = null;
        }
        chrome.runtime.sendMessage({ type: 'cancel-twitter-autobatch' });
        showStatusToast("⏹️ Subida automática en cadena detenida.");
        const btnAuto = document.getElementById('postaway-btn-autobatch');
        if (btnAuto) {
            btnAuto.classList.remove('running');
            btnAuto.innerHTML = `<span>⚡ Subida Automática en Cadena</span>`;
        }
    } else {
        if (isFloatExecuting || isAutofilling) {
            showStatusToast("Post en proceso, espera a que termine.");
            return;
        }
        if (!floatFeed || floatFeed.length === 0 || floatIndex < 0) {
            showStatusToast("No hay posts disponibles para subir.", true);
            return;
        }
        isAutoBatchActive = true;
        sessionStorage.setItem('postaway_auto_batch', 'true');
        chrome.runtime.sendMessage({ type: 'set-twitter-autobatch', active: true });
        const btnAuto = document.getElementById('postaway-btn-autobatch');
        if (btnAuto) {
            btnAuto.classList.add('running');
            btnAuto.innerHTML = `<span>⏹️ Detener Cadena (${floatIndex + 1}/${floatFeed.length})</span>`;
        }
        showStatusToast(`⚡ Iniciando subida automática en cadena desde Post ${floatIndex + 1}...`);
        executeCurrentPostUpload(true);
    }
}

function checkAndStartAutoBatch() {
    if (isAutoBatchActive && !isAutoBatchStarted && floatFeed && floatFeed.length > 0 && floatIndex >= 0) {
        isAutoBatchStarted = true;
        const btnAuto = document.getElementById('postaway-btn-autobatch');
        if (btnAuto) {
            btnAuto.classList.add('running');
            btnAuto.innerHTML = `<span>⏹️ Detener Cadena (${floatIndex + 1}/${floatFeed.length})</span>`;
        }
        showStatusToast(`⚡ [Auto-Cadena] Post ${floatIndex + 1} de ${floatFeed.length}: Iniciando en 2s...`);
        setTimeout(() => {
            if (isAutoBatchActive) {
                executeCurrentPostUpload(true);
            }
        }, 2000);
    }
}

function createFloatingPanel() {
    if (document.getElementById('postaway-twitter-panel')) return;

    injectFloatingStyles();

    // Minimized pill button
    const pill = document.createElement('div');
    pill.id = 'postaway-twitter-min-pill';
    pill.innerHTML = `<span>✨ Post-Away</span> <span id="postaway-pill-counter">(0)</span> <span>▾</span>`;
    pill.onclick = () => {
        isFloatMinimized = false;
        pill.style.display = 'none';
        const p = document.getElementById('postaway-twitter-panel');
        if (p) p.style.display = 'flex';
    };
    document.body.appendChild(pill);

    // Main Floating Panel
    const panel = document.createElement('div');
    panel.id = 'postaway-twitter-panel';
    panel.innerHTML = `
        <div class="postaway-header" id="postaway-header-drag">
            <div class="postaway-header-title">
                <span class="postaway-status-dot disconnected" id="postaway-status-dot"></span>
                <span>✨ Post-Away X</span>
            </div>
            <div class="postaway-header-actions">
                <button class="postaway-mode-badge" id="postaway-btn-mode" title="Cambiar modo de apertura: Pestaña o Ventana nueva">${openMode === 'window' ? '🪟 Ventana' : '📑 Pestaña'}</button>
                <button class="postaway-icon-btn" id="postaway-btn-open-new" title="Abrir este post en nueva ventana/pestaña de X">↗</button>
                <button class="postaway-icon-btn" id="postaway-btn-refresh" title="Recargar posts de Post-Away">🔄</button>
                <button class="postaway-icon-btn" id="postaway-btn-minimize" title="Minimizar panel">➖</button>
            </div>
        </div>

        <div class="postaway-nav-row" id="postaway-nav-row" style="display: none;">
            <button class="postaway-nav-btn" id="postaway-nav-prev" title="Post anterior (Alt + Flecha Izq)">◀ Anterior</button>
            <span class="postaway-counter" id="postaway-counter">Post 0 de 0</span>
            <button class="postaway-nav-btn" id="postaway-nav-next" title="Siguiente post (Alt + Flecha Der)">Siguiente ▶</button>
        </div>

        <div class="postaway-content" id="postaway-content-box">
            <div class="postaway-empty-box" id="postaway-empty-state">
                <div style="font-size: 28px;">📭</div>
                <div>Esperando posts de Post-Away... Carga una carpeta en la aplicación.</div>
                <button class="postaway-nav-btn" id="postaway-btn-connect" style="margin-top: 4px; padding: 6px 14px; color: #38bdf8;">🔄 Conectar</button>
            </div>

            <div id="postaway-post-form" style="display: none; flex-direction: column; gap: 8px;">
                <div class="postaway-char-name" id="postaway-char-name">Personaje</div>
                
                <div class="postaway-thumb-box">
                    <img class="postaway-thumb-img" id="postaway-thumb-img" alt="Miniatura">
                    <div class="postaway-thumb-placeholder" id="postaway-thumb-placeholder">🖼️ Cargando miniatura...</div>
                </div>

                <div class="postaway-schedule-grid">
                    <div class="postaway-field-group">
                        <label class="postaway-field-label">📅 Fecha Programada</label>
                        <input type="date" class="postaway-input" id="postaway-input-date">
                    </div>
                    <div class="postaway-field-group">
                        <label class="postaway-field-label">⏰ Hora (24hs)</label>
                        <input type="time" class="postaway-input" id="postaway-input-time">
                    </div>
                </div>

                <div>
                    <div class="postaway-textarea-header">
                        <span class="postaway-field-label">📝 Texto del Post (Editable)</span>
                        <span id="postaway-char-count">0 car.</span>
                    </div>
                    <textarea class="postaway-textarea" id="postaway-input-text" rows="4" placeholder="Texto que se publicará en X..."></textarea>
                </div>

                <button class="postaway-btn-upload" id="postaway-btn-upload">
                    <span>🚀 Subir / Programar en X</span>
                </button>
                <button class="postaway-btn-autobatch" id="postaway-btn-autobatch" title="Subir este post y automáticamente abrir y preparar los siguientes en nuevas pestañas hasta terminar">
                    <span>⚡ Subida Automática en Cadena</span>
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(panel);

    makeDraggable(panel, document.getElementById('postaway-header-drag'));

    document.getElementById('postaway-btn-minimize').onclick = () => {
        isFloatMinimized = true;
        panel.style.display = 'none';
        pill.style.display = 'flex';
        updatePillCounter();
    };

    const btnMode = document.getElementById('postaway-btn-mode');
    if (btnMode) {
        btnMode.onclick = () => {
            openMode = (openMode === 'window') ? 'tab' : 'window';
            localStorage.setItem('postaway_open_mode', openMode);
            btnMode.textContent = (openMode === 'window') ? '🪟 Ventana' : '📑 Pestaña';
            renderCurrentPost();
            showStatusToast(`Modo cambiado: abrir en nueva ${openMode === 'window' ? 'ventana' : 'pestaña'}`);
        };
    }

    const btnOpenNew = document.getElementById('postaway-btn-open-new');
    if (btnOpenNew) {
        btnOpenNew.onclick = () => {
            openNextPostInNewTab(floatIndex);
        };
    }

    document.getElementById('postaway-btn-refresh').onclick = () => fetchTwitterFeed(true);
    document.getElementById('postaway-btn-connect').onclick = () => fetchTwitterFeed(true);

    document.getElementById('postaway-nav-prev').onclick = () => navigatePost(-1);
    document.getElementById('postaway-nav-next').onclick = () => navigatePost(1);

    const dateInput = document.getElementById('postaway-input-date');
    const timeInput = document.getElementById('postaway-input-time');
    const textInput = document.getElementById('postaway-input-text');

    dateInput.addEventListener('change', () => triggerPostEditSync());
    timeInput.addEventListener('change', () => triggerPostEditSync());
    textInput.addEventListener('input', () => {
        updateCharCount();
        triggerPostEditSync();
    });

    document.getElementById('postaway-btn-upload').onclick = () => executeCurrentPostUpload(false);
    document.getElementById('postaway-btn-autobatch').onclick = toggleAutoBatch;

    window.addEventListener('keydown', (e) => {
        if (e.altKey && e.key === 'ArrowLeft') {
            e.preventDefault();
            navigatePost(-1);
        } else if (e.altKey && e.key === 'ArrowRight') {
            e.preventDefault();
            navigatePost(1);
        }
    });

    fetchTwitterFeed(false);
}

// Periodically check feed
setInterval(() => {
    if (!isFloatExecuting && !isAutofilling) {
        fetchTwitterFeed(false);
    }
}, 3500);

// Initialize floating panel once page is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(createFloatingPanel, 1000);
    });
} else {
    setTimeout(createFloatingPanel, 1000);
}

// Ensure panel remains present in Twitter's SPA
setInterval(() => {
    if (!document.getElementById('postaway-twitter-panel')) {
        createFloatingPanel();
    }
}, 6000);
