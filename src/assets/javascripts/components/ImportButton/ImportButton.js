import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Tooltip from '../Tooltip';
import { importAction } from '../../app/reducer';
import importStubs from '../../utils/import';

import './ImportButton.scss';

class ImportButton extends Component {

    static propTypes = {
        state: PropTypes.object.isRequired,
        importAction: PropTypes.func.isRequired
    };

    constructor(props) {
        super(props);

        this.state = {
            holding: false
        };

        this.fileImport = this.fileImport.bind(this);
        this.onClick = this.onClick.bind(this);
    }

    // component does not update, it just receives the full state
    shouldComponentUpdate() { return false; }

    onClick() {
        this.input.click();
    }

    fileImport(e) {
        let files = e.target.files;
        let reader = new FileReader();
        reader.onload = this.onLoad.bind(this);
        reader.readAsText(files[0]);
    }

    onLoad(e) {
        this.props.importAction(importStubs(this.props.state, e.target.result));
    }
    
    render() {
        return (
            <button className="import" onClick={this.onClick}>
                <Tooltip text="Import" bottom />
                <input tabIndex="-1" ref={input=>this.input=input} type="file" onChange={this.fileImport} />
            </button>
        );
    }
}

export default connect(state => ({ state }), dispatch => ({ importAction: bindActionCreators(importAction, dispatch) }))(ImportButton);