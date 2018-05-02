import reducer, { stubActions } from '../../../src/assets/javascripts/reducers/stubs.js';
import { folderActions } from '../../../src/assets/javascripts/reducers/folders.js';
import { importAction } from '../../../src/assets/javascripts/app/reducer.js';
import importedStubs from './stubs.js';
import importStubs from '../../../src/assets/javascripts/utils/import.js';

describe('Stubs reducer', () => {
    const state = {};
    const fullState = {
        0: {
            'disabled': true,
            'headers': 'headers',
            'method': 'GET',
            'name': '/agents 401',
            'response': 'json',
            'status': '666',
            'url': 'calvin is dope'
        },
        1: {
            'headers': 'headers',
            'method': 'GET',
            'name': 'A new imported stub',
            'response': '{"account":[]}',
            'status': '200',
            'url': 'url'
        },
        2: {
            'headers': 'headers',
            'method': 'GET',
            'name': 'A new imported stub',
            'response': '{"account":[]}',
            'status': '200',
            'url': 'url'
        }
    };

    test('initial state is empty', () => {
        expect(reducer()).toEqual(state);
    });

    test('can add a stub', () => {
        const newState = reducer(state, stubActions.addStub(0, { name: 'Stub 1' }));
        expect(Object.keys(newState)).toHaveLength(1);
        expect(newState).toHaveProperty('0');
        expect(newState[0].name).toBe('Stub 1');
        expect(newState[0].id).toBe(0);
    });

    test('increments new stub IDs', () => {
        const newState = reducer(state, stubActions.addStub(0, { name: 'Stub 2' }));
        expect(newState[1].id).toBe(1);
    });

    test('can remove a stub', () => {
        const newState = reducer(fullState, stubActions.removeStub({ id: 1 }));
        expect(Object.keys(newState)).toHaveLength(2);
        expect(newState).not.toHaveProperty('1');
    });

    test('can edit a stub', () => {
        const edit = { id: 1, name: 'Test', status: 400 };
        const newState = reducer(fullState, stubActions.editStub(edit));
        expect(newState[1]).toMatchObject(edit);
    });

    test('can remove a folder\'s stubs', () => {
        const newState = reducer(fullState, folderActions.removeFolder({ stubs: [1, 2] }));
        expect(Object.keys(newState)).toHaveLength(1);
        expect(newState).not.toHaveProperty('1');
        expect(newState).not.toHaveProperty('2');
    });

    test('can disable a stub', () => {
        const newState = reducer(fullState, stubActions.disableStub(1, true));
        expect(newState[1].disabled).toBe(true);
    });

    test('can enable a stub', () => {
        const newState = reducer(fullState, stubActions.disableStub(0, false));
        expect(newState[0].disabled).toBe(false);
    });

    test('updates stub ID counter after import', () => {
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
        newState = reducer(newState, stubActions.addStub(0, { name: 'Stub 1' }));
        // imported did +3, the two top tests have each incremented it twice as well, so it should be 5 here
        expect(newState).toHaveProperty('5');
    });
});