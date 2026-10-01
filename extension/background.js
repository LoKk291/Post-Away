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

    if (message.type === 'upload') {
        const tabId = sender.tab.id;
        
        chrome.debugger.attach({ tabId: tabId }, "1.3", () => {
            if (chrome.runtime.lastError) {
                console.error("Debugger attach error:", chrome.runtime.lastError);
                sendResponse({ success: false, error: chrome.runtime.lastError.message });
                return;
            }

            chrome.debugger.sendCommand({ tabId: tabId }, "DOM.getDocument", {}, (res) => {
                if (!res || !res.root) {
                    chrome.debugger.detach({ tabId: tabId });
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
                            chrome.debugger.detach({ tabId: tabId });
                            sendResponse({ success: true });
                        });
                    } else {
                        chrome.debugger.detach({ tabId: tabId });
                        sendResponse({ success: false, error: "Input type=file no encontrado" });
                    }
                });
            });
        });
        return true;
    }
});
