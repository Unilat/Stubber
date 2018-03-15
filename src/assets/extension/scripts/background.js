(function() {
    // A collection of panel connections by inspected tabId
    let connections = {};
    // A list of all tabIds that had successful injected context scripts (and thus are stubbing)
    // This is important because if browser action turns stubber OFF/ON and there are stubbing
    // pages that haven't opened a Stubber devtools panel, they won't be in 'connections'
    let stubbedTabs = [];

    // Whether Stubber is ON or OFF
    // null until background.js boots and retrieves from storage
    let engaged = null;

    // promisify local storage getting whether stubber is on or off.
    // this way we can delay responding to page initial injections with
    // empty stubs when the browser boots for the first time
    let engagedPromise = new Promise((resolve, reject) => {
        chrome.storage.local.get(items => {
            // set our internal value
            engaged = items['stubber-engaged'] || false;
            // set the appropriate browser action icon
            updateBrowserAction();
            resolve(engaged);
        });
    });

    function isEngaged() {
        return new Promise(resolve => {
            if (engaged === null) {
                resolve(engagedPromise);
            } else {
                resolve(engaged);
            }
        });
    }

    chrome.browserAction.onClicked.addListener(function (tab) {
        engaged = !engaged;
        updateBrowserAction();

        chrome.storage.local.set({ 'stubber-engaged': engaged});

        // clear or resend the stubs from any context scripts
        stubbedTabs.forEach(tabId => {
            if (engaged) {
                // send whatever stubs we received last
                chrome.storage.local.get('stubs', ({ stubs }) => 
                    chrome.tabs.sendMessage(tabId, { name: 'stubs', stubs }, function(response) {})
                );
            } else {
                // clear out stubs
                chrome.tabs.sendMessage(tabId, { name: 'stubs', stubs: [] }, function(response) {});
            }
        });
    });

    function updateBrowserAction() {
        chrome.browserAction.setTitle({ title: 'Stubber ' + (engaged ? 'ON': 'OFF')});
        const ending = engaged ? '.png' : '-off.png';
        chrome.browserAction.setIcon({ path: {
            '16': 'images/stubber16' + ending,
            '48': 'images/stubber48' + ending,
            '128': 'images/stubber128' + ending,
            '256': 'images/stubber256' + ending
        }});
    }

    chrome.runtime.onConnect.addListener(function(port) {

        var extensionListener = function(message, sender, sendResponse) {

            // The original connection event doesn't include the tab ID of the
            // DevTools page, so we need to send it explicitly.
            if (message.name == 'init') {
                connections[message.tabId] = port;
                return;
            }

            switch (message.name) {
                case 'stubs': {
                    // stubs message sent from panel when state of stubs has changed
                    // content script loads original stubs from chrome.storage.local
                    // don't send anything if Stubber isn't engaged
                    if (engaged) chrome.tabs.sendMessage(message.tabId, message, function(response) {});
                }
            }

            // other message handling
            console.log(message);
        }

        // Listen to messages sent from the DevTools page
        port.onMessage.addListener(extensionListener);

        port.onDisconnect.addListener(function(port) {
            port.onMessage.removeListener(extensionListener);

            var tabs = Object.keys(connections);
            for (var i = 0, len = tabs.length; i < len; i++) {
                if (connections[tabs[i]] == port) {
                    delete connections[tabs[i]]
                    break;
                }
            }
        });
    });

    // Receive message from content script and relay to the devTools page for the
    // current tab
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        // Messages from content scripts should have sender.tab set
        if (sender.tab) {
            var tabId = sender.tab.id;
            if (tabId in connections) {
                // forward message to panel for that tab
                connections[tabId].postMessage(request);
            } else {
                console.log('Tab not found in connection list.', request);
            }

            if (request.name === 'injectComplete') {
                stubbedTabs.push(tabId);

                // whether or not devtools is open, if its 'injectComplete' and Stubber is OFF, we need to send back empty stubs
                isEngaged().then(engaged => {
                    if (!engaged) {
                        console.log(`Tab ${tabId} injected, Stubber is OFF, sending empty stubs`);
                        chrome.tabs.sendMessage(tabId, { name: 'stubs', stubs: [] }, function(response) {});
                    }
                });
            }
        } else {
            console.log('sender.tab not defined.');
        }
        return true;
    });

    // listen for tabs closing so we can remove their tabId from the stubbedTabs list
    chrome.tabs.onRemoved.addListener(tabId => {
        stubbedTabs = stubbedTabs.filter(id => id !== tabId);
    });
})();