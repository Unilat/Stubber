import React from 'react';
import { render } from 'react-dom';
import App from './App';
import configureStore from './store/configureStore';
import { Provider } from 'react-redux';
import exportState from '../utils/export';
import { REQUEST, RESPONSE } from '../reducers/logs';
import { importAction } from '../app/reducer';
import importStubs from '../utils/import';

import 'styles/styles.scss';

export const store = configureStore();

// Get the DOM Element that will host our React application
const rootEl = document.getElementById('app');

render(
    <Provider store={store}>
        <App />
    </Provider>,
    rootEl
);

// load state from local storage
chrome.storage.local.get('state', items => {
    const state = items.state || [];
    console.log('Loaded state', state);

    store.dispatch(importAction(importStubs(store.getState(), state)));
});

// Create a connection to the background page
const backgroundPageConnection = chrome.runtime.connect({
    name: "devtools-page"
});

// tell the background page that there's a new panel
backgroundPageConnection.postMessage({
    name: 'init',
    tabId: chrome.devtools.inspectedWindow.tabId
});

// listen for background page messages
backgroundPageConnection.onMessage.addListener(function (message) {
    console.log('Received message', message);
    switch (message.name) {
        // the inspected page is making a request
        case 'request':
            store.dispatch({
                type: REQUEST,
                request: message.request
            });
            break;
        // the inspected page got a response
        case 'response':
            store.dispatch({
                type: RESPONSE,
                response: message.response
            });
            break;
        // the inspected page got the context script injected
        case 'injectComplete':
            resetLog();
            break;
    }
});

// cached state.stubs so we don't send updates on folder changes, ordering, etc.
let cachedStubs = null;
store.subscribe(() => {
    const state = store.getState();
    const stubs = Object.keys(state.stubs).filter(id => !state.stubs[id].disabled).map(id => state.stubs[id]);

    if (cachedStubs !== state.stubs) {
        // send just the stubs to the context script
        backgroundPageConnection.postMessage({
            name: 'stubs',
            tabId: chrome.devtools.inspectedWindow.tabId,
            stubs 
        });

        cachedStubs = state.stubs;
    }

    // save app state to localStorage
    const exported = exportState(state);
    console.log('Saved stubs: ', exported);
    chrome.storage.local.set({
        state: exported, // for the panel to recall next time
        stubs // for the background script to serve on ON/OFF toggle to the context scripts
    });
});