// mock stuff on chrome global object
const callbacks = [];
const mockMessage = (msg) => {
    callbacks.forEach(cb => cb.call(window, msg));
};
const onMessageAEL = jest.fn((callback) => {
    callbacks.push(callback);
});

global.chrome = {
    extension: {
        onMessage: {
            addListener: onMessageAEL
        }
    }
};

console.log(window);

const postMessageSpy = jest.spyOn(window, 'postMessage');
const AELSpy = jest.spyOn(window, 'addEventListener');

// eslint-disable-next-line no-unused-vars
//const w = window;
// eslint-disable-next-line no-global-assign
//const window = {};

require('../../../src/assets/extension/scripts/content.js');

describe('Content script', () => {

    it('registers listener for background script', () => {
        expect(onMessageAEL).toBeCalled();
    });

    it('tells background script injection completed', () => {
        expect(postMessageSpy).toHaveBeenCalledTimes(1);
        expect(postMessageSpy.mock.calls[0][0]).toMatchObject({'name': 'injectComplete', 'source': 'stubber.inject'});
        expect(postMessageSpy.mock.calls[0][1]).toBe('*');
    });

    it('sends stubs to context script from background script', () => {
        mockMessage({ name: 'stubs' });
        expect(postMessageSpy.mock.calls[1][0]).toMatchObject({
            name: 'stubs',
            source: 'stubber.content'
        });
        expect(postMessageSpy.mock.calls[1][1]).toBe('*');
    });

    it('registers listener for the context script', () => {
        expect(AELSpy).toHaveBeenCalled();
        expect(AELSpy.mock.calls[0][0]).toBe('message');
    });

    // it('can send an XMLHttpRequest', async () => {
    //     await new Promise(resolve => {
    //         const x = new XMLHttpRequest();
    //         x.open('GET', 'http://www.google.com');// 'https://jsonplaceholder.typicode.com/posts/1');
    //         x.onload = () => { console.log('done'); resolve(x); };
    //         x.send();
    //     });
    // }, 10000);
});