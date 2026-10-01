const tabPostIndexMap = new Map();

chrome.tabs.onRemoved.addListener((tabId) => {
    tabPostIndexMap.delete(tabId);
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'poll') {
        fetch('http://127.0.0.1:3030/poll')
            .then(response => response.json())
            .then(data => {
                sendResponse(data);
            })
            .catch(err => {
                sendResponse({ error: err.toString() });
            });
        return true; // indicates asynchronous response
    }

    if (message.type === 'poll-twitter') {
        fetch('http://127.0.0.1:3030/poll-twitter')
            .then(response => response.json())
            .then(data => {
                sendResponse(data);
            })
            .catch(err => {
                sendResponse({ error: err.toString() });
            });
        return true; // indicates asynchronous response
    }

    if (message.type === 'get-twitter-feed') {
        fetch('http://127.0.0.1:3030/twitter-feed')
            .then(response => response.json())
            .then(data => {
                sendResponse(data);
            })
            .catch(err => {
                sendResponse({ error: err.toString() });
            });
        return true;
    }

    if (message.type === 'update-twitter-post') {
        fetch('http://127.0.0.1:3030/twitter-feed/update-post', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(message.post)
        })
            .then(response => response.json())
            .then(data => {
                sendResponse(data);
            })
            .catch(err => {
                sendResponse({ error: err.toString() });
            });
        return true;
    }

    if (message.type === 'open-next-x-tab') {
        const postIndex = Number(message.postIndex) || 0;
        const asWindow = !!message.asWindow;
        const targetUrl = `https://x.com/compose/post#postaway_idx=${postIndex}`;

        if (asWindow) {
            chrome.windows.create({ url: targetUrl, focused: true }, (win) => {
                const newTab = win && win.tabs ? win.tabs[0] : null;
                if (newTab && newTab.id) {
                    tabPostIndexMap.set(newTab.id, postIndex);
                }
                sendResponse({ success: true, tabId: newTab ? newTab.id : null });
            });
        } else {
            chrome.tabs.create({ url: targetUrl, active: true }, (newTab) => {
                if (newTab && newTab.id) {
                    tabPostIndexMap.set(newTab.id, postIndex);
                }
                sendResponse({ success: true, tabId: newTab ? newTab.id : null });
            });
        }
        return true;
    }

    if (message.type === 'get-tab-post-index') {
        const tabId = sender.tab ? sender.tab.id : null;
        const assigned = (tabId && tabPostIndexMap.has(tabId)) ? tabPostIndexMap.get(tabId) : null;
        sendResponse({ success: true, assignedIndex: assigned });
        return true;
    }

    if (message.type === 'get-thumbnail-data') {
        if (!message.filePath) {
            sendResponse({ success: false, error: 'No filePath' });
            return true;
        }
        fetch(`http://127.0.0.1:3030/thumbnail?file=${encodeURIComponent(message.filePath)}`)
            .then(res => {
                if (!res.ok) throw new Error("Image not found");
                return res.blob();
            })
            .then(blob => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    sendResponse({ success: true, dataUrl: reader.result });
                };
                reader.readAsDataURL(blob);
            })
            .catch(err => {
                sendResponse({ success: false, error: err.toString() });
            });
        return true;
    }

    if (message.type === 'upload') {
        const tabId = sender.tab.id;

        const performUpload = () => {
            chrome.debugger.sendCommand({ tabId: tabId }, "DOM.getDocument", {}, (res) => {
                if (!res || !res.root) {
                    chrome.debugger.detach({ tabId: tabId }, () => {
                        const _ = chrome.runtime.lastError;
                    });
                    sendResponse({ success: false, error: "DOM no encontrado" });
                    return;
                }
                
                const rootNodeId = res.root.nodeId;
                chrome.debugger.sendCommand({ tabId: tabId }, "DOM.querySelectorAll", {
                    nodeId: rootNodeId,
                    selector: 'input[type="file"]'
                }, async (res2) => {
                    const nodeIds = res2 ? res2.nodeIds : [];
                    if (nodeIds.length > 0) {
                        let targetNodeId = null;
                        for (const id of nodeIds) {
                            try {
                                const attrsRes = await new Promise((resolve, reject) => {
                                    chrome.debugger.sendCommand({ tabId: tabId }, "DOM.getAttributes", { nodeId: id }, (res) => {
                                        if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
                                        else resolve(res);
                                    });
                                });
                                const attrs = attrsRes.attributes || [];
                                let isImageAccept = false;
                                let isFileInputTestId = false;
                                for (let i = 0; i < attrs.length; i += 2) {
                                    const attrName = (attrs[i] || '').toLowerCase();
                                    const attrVal = (attrs[i+1] || '').toLowerCase();
                                    if (attrName === 'accept' && attrVal.includes('image')) {
                                        isImageAccept = true;
                                    }
                                    if (attrName === 'data-testid' && attrVal === 'fileinput') {
                                        isFileInputTestId = true;
                                    }
                                }
                                
                                if (message.isTwitter && (isFileInputTestId || isImageAccept)) {
                                    targetNodeId = id; break;
                                } else if (message.isGallery && isImageAccept) {
                                    targetNodeId = id; break;
                                } else if (message.isAttachment && !isImageAccept) {
                                    targetNodeId = id; break;
                                }
                            } catch(e) {}
                        }
                        
                        if (!targetNodeId) targetNodeId = nodeIds[nodeIds.length - 1];

                        chrome.debugger.sendCommand({ tabId: tabId }, "DOM.setFileInputFiles", {
                            nodeId: targetNodeId,
                            files: message.files
                        }, () => {
                            chrome.debugger.detach({ tabId: tabId }, () => {
                                const _ = chrome.runtime.lastError;
                            });
                            sendResponse({ success: true });
                        });
                    } else {
                        chrome.debugger.detach({ tabId: tabId }, () => {
                            const _ = chrome.runtime.lastError;
                        });
                        sendResponse({ success: false, error: "Input type=file no encontrado" });
                    }
                });
            });
        };
        
        chrome.debugger.attach({ tabId: tabId }, "1.3", () => {
            if (chrome.runtime.lastError) {
                const errMsg = chrome.runtime.lastError.message || '';
                if (errMsg.includes("Already attached")) {
                    performUpload();
                    return;
                }
                console.error("Debugger attach error:", chrome.runtime.lastError);
                sendResponse({ success: false, error: chrome.runtime.lastError.message });
                return;
            }
            performUpload();
        });
        return true;
    }
});
