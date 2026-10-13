// Cortex (control remoto desde el celular). main.js lo ejecuta en la ventana con executeJavaScript.
// Solo usa los mismos botones y funciones de la interfaz: el flujo de subida es exactamente el de escritorio.
if (!window.__cortexAction) {
    const log = window.__cortexLog = [];
    const push = msg => { log.push({ t: Date.now(), msg: String(msg) }); if (log.length > 30) log.shift(); };
    // Mientras se opera desde el celular, alert/confirm no bloquean la ventana (nadie está frente al PC para cerrarlos).
    // En cuanto tocas la ventana con el mouse vuelven a ser normales.
    window.__cortexRemote = false;
    const origAlert = window.alert.bind(window);
    const origConfirm = window.confirm.bind(window);
    window.alert = msg => { push(msg); if (!window.__cortexRemote) origAlert(msg); };
    window.confirm = msg => { if (!window.__cortexRemote) return origConfirm(msg); push('✔ ' + msg); return true; };
    document.addEventListener('mousedown', () => { window.__cortexRemote = false; }, true);

    const $ = id => document.getElementById(id);
    const fire = el => el.dispatchEvent(new Event('change', { bubbles: true }));
    const status = () => ({
        folder: currentSession.lastFolder,
        profile: currentSession.activeProfile || 'nicky',
        date: $('global-date')?.value || '',
        time: $('global-time')?.value || '',
        superAuto: !!$('chk-super-auto')?.checked,
        uploading: isAutoUploading,
        superStage: superAutoStage,
        queue: autoUploadQueue.length,
        batchText: ($('btn-auto-batch')?.textContent || '').trim(),
        rarText: ($('rar-status')?.textContent || '').trim(),
        posts: currentPosts.map(p => ({ id: p.id, title: p.title, images: p.imagesCount, hasRar: !!p.hasRar, done: !!(currentSession.donePosts || {})[p.id] })),
        log: log.slice(-10),
    });
    const actions = {
        status: async () => {},
        profile: async ({ profile }) => { const el = $(profile === 'nova' ? 'profile-nova' : 'profile-nicky'); el.checked = true; fire(el); },
        load: async ({ path }) => { if (isAutoUploading) throw new Error('Hay una subida en curso'); await navigateToFolder(path); },
        schedule: async ({ date, time }) => {
            if (date !== undefined) { $('global-date').value = date; fire($('global-date')); }
            if (time !== undefined) { $('global-time').value = time; fire($('global-time')); }
        },
        superAuto: async ({ on }) => { const c = $('chk-super-auto'); c.checked = !!on; fire(c); },
        compress: async () => { $('btn-compress-all').click(); },
        start: async () => {
            if (isAutoUploading) throw new Error('Ya hay una subida en curso');
            if (!currentPosts.some(p => p.hasRar)) throw new Error('No hay posts con .rar: comprime primero');
            $('btn-auto-batch').click();
        },
        cancel: async () => { if (isAutoUploading) await cancelAutoUpload(); },
    };
    window.__cortexAction = async (name, args) => {
        if (!actions[name]) throw new Error('Acción desconocida: ' + name);
        if (name !== 'status') window.__cortexRemote = true;
        await actions[name](args || {});
        return status();
    };
}
