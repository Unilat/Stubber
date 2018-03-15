import stubsReducer from '../reducers/stubs';
import foldersReducer from '../reducers/folders';
import logs from '../reducers/logs';

const initialState = {
    stubs: {},
    folders: {
        byID: [],
        byHash: {}
    },
    logs: {
        byID: [],
        byHash: {}
    }
};

export const IMPORT = 'IMPORT';
export const CLEAR_ALL = 'CLEAR_ALL';

export default function root(state = initialState, action = {}) {

    if (action.type === 'CLEAR_ALL') {
        return initialState;
    }

    // call these two to get IMPORT action so they can update their internal IDs
    const stubs = stubsReducer(state.stubs, action);
    const folders = foldersReducer(state.folders, action);

    // but intercept IMPORT here, because the above will not update state with IMPORT
    // but this will
    if (action.type === IMPORT) {
        return { ...initialState, ...action.state }; // just replace the whole state
    }

    // otherwise the state we get from the sub-reducers
    return {
        stubs,
        folders,
        logs: logs(state.logs, action)
    };
}

export const importAction = (state) => ({ type: IMPORT, state });
export const clearState = () => ({ type: CLEAR_ALL });