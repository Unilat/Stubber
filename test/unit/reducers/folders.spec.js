import reducer, { folderActions } from '../../../src/assets/javascripts/reducers/folders.js';

describe('Folders reducer', () => {
    const state = { byID: [], byHash: {}, editing: null };
    // start the IDs high here because each time we call the reducer its internal ID is incrementing
    // so this way there is no overlap
    const fullState = {
        byID: [100, 101, 102],
        byHash: {
            100: {
                name: 'Folder 1',
                id: 100,
                open: false,
                stubs: []
            },
            101: {
                name: 'Folder 1',
                id: 100,
                open: false,
                stubs: []
            },
            102: {
                name: 'Folder 1',
                id: 100,
                open: false,
                stubs: []
            }
        },
        editing: null
    };

    test('initial state is empty', () => {
        expect(reducer()).toEqual(state);
    });

    test('can add a folder', () => {
        const newState = reducer(state, folderActions.addFolder({ name: 'Folder 1' }));
        expect(newState.byID.length).toBe(1);
        expect(Object.keys(newState.byHash).length).toBe(1);
        expect(newState.byID[0]).toBe(0);
        expect(newState.byHash[0].name).toBe('Folder 1');
        expect(newState.byHash[0].id).toBe(0);
    });

    test('increments new folder IDs', () => {
        const newState = reducer(state, folderActions.addFolder({ name: 'Folder 2' }));
        expect(newState.byID[0]).toBe(1);
    });

    test('can remove a folder', () => {
        const newState = reducer(fullState, folderActions.removeFolder({ id: 101 }));
        expect(newState.byID.length).toBe(2);
        expect(Object.keys(newState.byHash).length).toBe(2);
        expect(newState.byHash[101]).toBeUndefined;
        expect(newState.byID.includes(101)).toBe(false);
    });
});