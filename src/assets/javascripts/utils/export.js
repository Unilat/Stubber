export default function exportState(state) {
    // reduce the state to a simple folder list, with stubs embedded
    const exported = [];
    const folders = state.folders;
    const stubs = state.stubs;

    return folders.byID.map(folderID => {
        const folder = { ...folders.byHash[folderID] };

        delete folder.id;

        return {
            ...folder,
            stubs: folder.stubs.map(stubID => {
                const stub = { ...stubs[stubID] };

                delete stub.id;

                return stub;
            })
        };
    });
}