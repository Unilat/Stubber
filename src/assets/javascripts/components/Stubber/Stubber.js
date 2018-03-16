import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { folderActions } from '../../reducers/folders';
import { stubActions } from '../../reducers/stubs';
import Folder from '../Folder';
import Tooltip from '../Tooltip';
import ImportButton from '../ImportButton';
import LogButton from '../LogButton';
import exportState from '../../utils/export';
import { store } from '../../app';
import RemoveButton from '../RemoveButton';
import { clearState } from '../../app/reducer';

import './Stubber.scss';

class Stubber extends Component {

    static propTypes = {
        actions: PropTypes.object.isRequired
    };

    constructor(props) {
        super(props);

        this.state = {
            logsOpen: false
        };

        this.addFolder = this.addFolder.bind(this);
        this.openLogs = this.openLogs.bind(this);
        this.closeLogs = this.closeLogs.bind(this);
        this.export = this.export.bind(this);
        this.clearState = this.clearState.bind(this);
    }

    addFolder() {
        this.props.actions.addFolder({
            name: 'New Folder'
        });
    }

    openLogs() {
        this.setState({ logsOpen: true });
    }

    closeLogs() {
        this.setState({ logsOpen: false });
    }

    clearState() {
        this.props.actions.clearState();
    }

    export() {
        let exp = JSON.stringify(exportState(store.getState()), null, 4);
        let a = document.createElement('a');
        let blob = new Blob([exp], {type: 'octet/stream'});
        let url = window.URL.createObjectURL(blob);
        a.setAttribute('href', url);
        a.setAttribute('download', 'stubs.json');
        a.click();
    }
    
    render() {
        const { folders } = this.props;
        console.log('Stubber render');
        return (
            <div className="stubber">
                <header>
                    <div className="logo"></div><span>Stubber</span>
                    <div className="actions tooltips-bottom">
                        <button className="add-folder" id="add-folder-btn" onClick={this.addFolder}><Tooltip text="Add Folder" bottom /></button>
                        <ImportButton />
                        <button className="export" id="export-btn" onClick={this.export}><Tooltip text="Export" bottom /></button>
                        <RemoveButton bottom tooltip="Remove All" onRemove={this.clearState} />
                        <LogButton />
                    </div>
                </header>
                <div className={'folder-list ' + (folders.length === 0 ? 'folder-list--empty' : '')}>
                    {folders.length === 0 ?
                        <p>You ain't got no stubs, Lieutenant Dan!</p> :
                        folders.map(id => (
                            <Folder key={id} id={id} />
                        ))
                    }
                </div>
            </div>
        );
    }
}

export default connect(
    state => ({
        folders: state.folders.byID
    }),
    (dispatch) => ({
        actions: bindActionCreators({ ...folderActions, ...stubActions, clearState }, dispatch)
    })
)(Stubber);