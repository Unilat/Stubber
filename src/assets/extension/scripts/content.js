(function(window) {

    // listen for messages from background.js and relay them to the context script
    chrome.extension.onMessage.addListener(function(message) {
        switch (message.name) {
            case 'stubs':
                sendStubs(message.stubs);
                break;
        }
    });

    function sendStubs(stubs) {
        // stubs at this point is the full extension state, need to break it down to just the stubs
        // let stubs = [];

        // console.log(state);

        // state.forEach(folder => {
        //     folder.stubs.forEach(stub => {
        //         if (stub.disabled) return;

        //         delete stub.view;
        //         delete stub.folder;
        //         delete stub.name;

        //         stubs.push(stub);
        //     });
        // });

        console.log('sending stubs');
        window.postMessage({
            name: 'stubs',
            stubs,
            source: 'stubber.content'
        }, '*');
    }

    // listen to messages from the context script and respond appropriately
    window.addEventListener('message', function(event) {
        // Only accept messages from the same frame
        if (event.source !== window) {
            return;
        }

        var message = event.data;

        // Only accept messages that we know are ours
        if (typeof message !== 'object' || message === null ||
            message.source !== 'stubber.inject') {
            return;
        }
        // message is sent when injection code has executed, and we can send it the stubs list
        if (message.name === 'injectComplete') {
            chrome.storage.local.get('stubs', items => {
                sendStubs(items.stubs);
            });

            // still pass this message up to reset the request log in the panel
        }

        // pass the message on to the background script
        chrome.runtime.sendMessage(message);
    });

    // the function to inject
    function inject() {
        console.log('Injecting Stubber context script');

        // This is filled by devtools
        let stubs = [];

        // Incrementing id for requests to differentiate
        let requestID = 0;

        let originalOpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function(method, url, asynchronous = true, user, password) {
            console.log(method + ' ' + url);

            // mark if this request is being stubbed
            let stub;
            for (let i = 0; i < stubs.length; i++) {
                if (stubs[i].method === method.toUpperCase()
                    && (stubs[i].url === url || (stubs[i].regex && (new RegExp(stubs[i].url)).test(url)))) {
                    stub = stubs[i];
                    break;
                }
            }
            if (stub) {
                this.responseStub = stub;
            } else {
                // for reuse
                this.responseStub = null;

                // remove our load listener if its being reused
                if (this._internalLoadListener) {
                    this.removeEventListener('load', this._internalLoadListener);
                }
            }

            // remember this in case we stub it
            this._responseURL = url;
            this._method = method;

            originalOpen.call(this, method, url, asynchronous, user, password);
        };

        let originalSend = XMLHttpRequest.prototype.send;
        XMLHttpRequest.prototype.send = function(body) {

            // tell the devtools that a request happened for the request log
            let id = requestID++;
            window.postMessage({
                name: 'request',
                source: 'stubber.inject',
                request: {
                    method: this._method,
                    url: this._responseURL,
                    id
                }
            }, '*');

            // if it has a stub, respond with that, otherwise defer to wrapped xhr
            if (this.responseStub) {
                console.log('Stubbing response', this.responseStub);
                // simulate load
                Object.defineProperties(this, {
                    'readyState': {
                        value: this.DONE,
                        enumerable: true,
                        writable: true
                    },
                    'response': {
                        value: this.responseStub.response,
                        enumerable: true,
                        writable: true
                    },
                    'responseText': {
                        value: this.responseStub.response,
                        enumerable: true,
                        writable: true
                    },
                    'status': {
                        value: parseInt(this.responseStub.status),
                        enumerable: true,
                        writable: true
                    },
                    'statusText': {
                        value: 'OK',
                        enumerable: true,
                        writable: true
                    },
                    'responseURL': {
                        value: this._responseURL,
                        enumerable: true,
                        writable: true
                    }
                });

                let loadEvent = new ProgressEvent('load');
                Object.defineProperty(loadEvent, 'target', {
                    value: this,
                    enumerable: true
                });

                let loadendEvent = new ProgressEvent('loadend');
                Object.defineProperty(loadendEvent, 'target', {
                    value: this,
                    enumerable: true
                });

                this.dispatchEvent(loadEvent);
                this.dispatchEvent(loadendEvent);

                // tell the devtools we stubbed it
                window.postMessage({
                    name: 'response',
                    source: 'stubber.inject',
                    response: {
                        id,
                        body: this.responseStub.response,
                        headers: this.responseStub.headers,
                        status: this.responseStub.status,
                        stubbed: true
                    }
                }, '*');
            } else {
                // listen to response so we can send it to the devtools
                this._internalLoadListener = (e) => {
                    window.postMessage({
                        name: 'response',
                        source: 'stubber.inject',
                        response: {
                            id,
                            body: e.target.response,
                            headers: e.target.getAllResponseHeaders(),
                            status: e.target.status
                        }
                    }, '*');
                };
                this.addEventListener('load', this._internalLoadListener);

                originalSend.call(this, body);
            }
        };

        let originalGetResponseHeader = XMLHttpRequest.prototype.getResponseHeader;
        XMLHttpRequest.prototype.getResponseHeader = function(name) {
            if (this.readyState < 2) return null;

            if (this.responseStub) {
                if (this.responseStub.headers) {
                    let lines = this.responseStub.headers.split('\n');

                    for (let i = 0; i < lines.length; i++) {
                        let header = lines[i].trim().match(/([^:]*)\s*:\s*(.*)/);

                        if (header[1].toLowerCase() === name.toLowerCase()) return header[2];
                    }
                }
            } else {
                return originalGetResponseHeader.call(this, name);
            }

            return null;
        };

        let originalGetAllResponseHeaders = XMLHttpRequest.prototype.getAllResponseHeaders;
        XMLHttpRequest.prototype.getAllResponseHeaders = function() {
            if (this.readyState < 2) return null;

            if (this.responseStub) {
                return this.responseStub.headers || null;
            } else {
                return originalGetAllResponseHeaders.call(this);
            }
        };


        // Listen for messages from the content script
        window.addEventListener('message', function(event) {
            // Only accept messages from the same frame
            if (event.source !== window) {
                return;
            }

            var message = event.data;

            // Only accept messages that we know are ours
            if (typeof message !== 'object' || message === null ||
                message.source !== 'stubber.content') {
                return;
            }

            // the messages this accepts is an object matching the stubs format
            console.log('Received stubs', message.stubs);
            stubs = message.stubs;
        });

        // tell content script that the injection happened so it can send back the stubs
        window.postMessage({
            name: 'injectComplete',
            source: 'stubber.inject'
        }, '*');

    }

    // inject the context script
    var script = document.createElement('script');
    script.textContent = '(' + inject + ')();';
    (document.head || document.documentElement).appendChild(script);
    script.remove();

})(window);
