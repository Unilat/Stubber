import { IMPORT } from '../app/reducer';
import { REMOVE_FOLDER } from '../reducers/folders';

export const ADD_STUB = 'ADD_STUB';
export const REMOVE_STUB = 'REMOVE_STUB';
export const EDIT_STUB = 'EDIT_STUB';
export const DISABLE_STUB = 'DISABLE_STUB';

let stubID = 0;
// stubs state is just a hashmap of ID, ordering is taken care of on the folder level
export default function stubs(state = {}, action = {}) {
    switch (action.type) {
        case ADD_STUB: {
            const newState = { ...state };
            const stub = action.stub;

            stub.id = stubID++; // give new stubs an ID

            // add it to the hash map
            newState[stub.id] = stub;

            return newState;
        }

        case REMOVE_STUB: {
            const newState = { ...state };
            delete newState[action.stub.id];

            return newState;
        }

        case EDIT_STUB: {
            return {
                ...state,
                [action.stub.id]: {
                    ...state[action.stub.id],
                    ...action.stub
                }
            };
        }

        // handle remove folder because it should remove the associated stubs
        case REMOVE_FOLDER: {
            // this gets handled before folders reducer so the folder is still there, giving us the list of those
            // that need removed
            const stubs = { ...state };

            action.folder.stubs.forEach(id => {
                delete stubs[id];
            });

            return stubs;
        }

        case DISABLE_STUB: { // can call using multiple IDs (for toggling entire folders)
            const stubs = { ...state };
            [].concat(action.id).forEach(id => {
                stubs[id] = {
                    ...stubs[id],
                    disabled: action.disabled
                };
            });

            return stubs;
        }

        case IMPORT: {
            // set the ID to the number of stubs
            stubID = Object.keys(action.state.stubs).length;
        }

        default:
            return state;
    }
}

export const addStub = (folderID, stub) => ({
    type: ADD_STUB,
    stub,
    folderID
});

export const removeStub = (stub) => ({
    type: REMOVE_STUB,
    stub
});

export const editStub = (stub) => ({
    type: EDIT_STUB,
    stub
});

export const disableStub = (id, disabled) => ({
    type: DISABLE_STUB,
    id,
    disabled
});

export const stubActions = {
    addStub, removeStub, editStub, disableStub
};