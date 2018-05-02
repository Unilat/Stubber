export default function importStubs(state, json) {
    const folders = state.folders;
    const stubs = state.stubs;
    let folderID = Math.max(-1, ...folders.byID) + 1; // start ID counter after the ones we already have
    let stubID = Math.max(-1, ...Object.keys(stubs)) + 1;
    const importedState = typeof(json) === 'string' ? JSON.parse(json) : json;

    const newState = {
        stubs: { ...state.stubs },
        folders: {
            byID: folders.byID.slice(0),
            byHash: { ...folders.byHash }
        }
    };

    if (importedState instanceof Array) {
        for (let i = 0; i < importedState.length; i++) {
            const importedFolder = importedState[i];

            if (!importedFolder.name) continue;

            const existingFolderID = folders.byID.find(id => folders.byHash[id].name === importedFolder.name);
            const existingFolder = existingFolderID >= 0 ? folders.byHash[existingFolderID] : undefined;

            if (!existingFolder) {
                const newFolder = {
                    id: folderID++,
                    name: importedFolder.name,
                    open: !!importedFolder.open,
                    stubs: []
                };
                newState.folders.byID.push(newFolder.id);
                newState.folders.byHash[newFolder.id] = newFolder;

                // process in the stubs
                importedFolder.stubs.forEach(stub => {
                    stub.id = stubID++;
                    newFolder.stubs.push(stub.id);
                    newState.stubs[stub.id] = stub;
                });
            } else {
                // merge in folder stubs, overwriting those with the same name
                const newFolder = {
                    id: existingFolder.id,
                    name: existingFolder.name,
                    open: existingFolder.open,
                    stubs: existingFolder.stubs.slice(0)
                };
                importedFolder.stubs.forEach(stub => {
                    const existingStubID = existingFolder.stubs.find(id => stubs[id].name === stub.name);
                    const existingStub = existingStubID >= 0 ? stubs[existingStubID] : undefined;

                    if (existingStub) {
                        Object.assign(existingStub, stub);
                    } else {
                        stub.id = stubID++;
                        newFolder.stubs.push(stub.id);
                        newState.stubs[stub.id] = stub;
                    }
                });

                newState.folders.byHash[newFolder.id] = newFolder;
            }
        }
    }

    //console.log(newState);
    return newState;
}