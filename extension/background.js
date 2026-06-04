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
                chrome.debugger.sendCommand({ tabId: tabId }, "DOM.querySelector", {
                    nodeId: rootNodeId,
                    selector: 'input[type="file"]'
                }, (res2) => {
                    const inputNodeId = res2 ? res2.nodeId : null;
                    if (inputNodeId) {
                        chrome.debugger.sendCommand({ tabId: tabId }, "DOM.setFileInputFiles", {
                            nodeId: inputNodeId,
                            files: [message.filePath]
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
