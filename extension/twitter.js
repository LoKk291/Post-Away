console.log("Post-Away: Script de automatización de X (Twitter) cargado.");

let isAutofilling = false;

function shouldPoll() {
    if (document.visibilityState === 'visible') return true;
    if (window.location.href.includes('/compose/post')) return true;
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
