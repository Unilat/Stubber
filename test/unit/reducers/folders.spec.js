import reducer, { folderActions } from '../../../src/assets/javascripts/reducers/folders.js';
import { addStub, removeStub } from '../../../src/assets/javascripts/reducers/stubs.js';
import { importAction } from '../../../src/assets/javascripts/app/reducer.js';
import importedStubs from './stubs.js';
import importStubs from '../../../src/assets/javascripts/utils/import.js';

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
                stubs: [3, 4]
            },
            101: {
                name: 'Folder 2',
                id: 101,
                open: false,
                stubs: []
            },
            102: {
                name: 'Folder 3',
                id: 102,
                open: false,
                stubs: [0, 1, 2]
            }
        },
        editing: null
    };

    test('initial state is empty', () => {
        expect(reducer()).toEqual(state);
    });

    test('can add a folder', () => {
        const newState = reducer(state, folderActions.addFolder({ name: 'Folder 1' }));
        expect(newState.byID).toHaveLength(1);
        expect(Object.keys(newState.byHash)).toHaveLength(1);
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
        expect(newState.byID).toHaveLength(2);
        expect(Object.keys(newState.byHash)).toHaveLength(2);
        expect(newState.byHash[101]).toBeUndefined;
        expect(newState.byID).not.toContain(101);
    });

    test('can edit a folder', () => {
        const newState = reducer(fullState, folderActions.editFolder(101, 'New Name'));
        expect(newState.byHash[101].name).toBe('New Name');
        expect(newState.editing).toBeNull;
        expect(newState.byID).toEqual(fullState.byID);
    });

    test('can toggle a folder', () => {
        let newState = reducer(fullState, folderActions.toggleFolderOpen(101));
        expect(newState.byHash[101].open).toBe(true);
        newState = reducer(newState, folderActions.toggleFolderOpen(101));
        expect(newState.byHash[101].open).toBe(false);
    });

    test('can add a stub', () => {
        const newState = reducer(fullState, addStub(101, { name: 'New Stub', id: 0 }));
        expect(newState.byHash[101].stubs).toHaveLength(1);
        expect(newState.byHash[101].stubs[0]).toBe(0);
    });

    test('can remove a stub', () => {
        const newState = reducer(fullState, removeStub({ id: 1 }));
        expect(newState.byHash[102].stubs).toHaveLength(2);
        expect(newState.byHash[102].stubs).not.toContain(1);
    });

    test('can move a stub within folder', () => {
        const newState = reducer(fullState, folderActions.moveStub(102, 102, { id: 0 }, 2));
        expect(newState.byHash[102].stubs).toHaveLength(3);
        expect(newState.byHash[102].stubs[1]).toBe(0);
    });

    test('does nothing when moving stub to same place', () => {
        let newState = reducer(fullState, folderActions.moveStub(102, 102, { id: 0 }, 1));
        expect(newState.byHash[102].stubs.length).toBe(3);
        expect(newState.byHash[102].stubs[0]).toBe(0);
        
        newState = reducer(fullState, folderActions.moveStub(102, 102, { id: 0 }, 0));
        expect(newState.byHash[102].stubs.length).toBe(3);
        expect(newState.byHash[102].stubs[0]).toBe(0);
    });

    test('can move a stub between folders', () => {
        const newState = reducer(fullState, folderActions.moveStub(100, 102, { id: 3 }, 1));
        expect(newState.byHash[102].stubs.length).toBe(4);
        expect(newState.byHash[100].stubs.length).toBe(1);
        expect(newState.byHash[102].stubs).toContain(3);
        expect(newState.byHash[100].stubs).not.toContain(3);
        expect(newState.byHash[102].stubs[1]).toBe(3);
    });

    test('can move a folder', () => {
        const newState = reducer(fullState, folderActions.moveFolder(100, 3));
        expect(newState.byID).toHaveLength(3);
        expect(newState.byID[0]).toBe(101);
        expect(newState.byID[2]).toBe(100);
    });

    test('updates folder ID counter after import', () => {
        const importedState = importStubs({
            stubs: {},
            folders: {
                byID: [],
                byHash: {}
            },
            logs: {
                byID: [],
                byHash: {}
            }
        }, importedStubs);
        let newState = reducer(state, importAction(importedState));
        newState = reducer(newState, folderActions.addFolder({ name: 'Folder 1' }));
        // imported did +2, the two top tests have each incremented it twice as well, so it should be 4 here
        expect(newState.byID[0]).toBe(4);
    });
});