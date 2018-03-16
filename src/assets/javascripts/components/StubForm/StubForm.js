import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { stubActions } from '../../reducers/stubs';
import { moveStub } from '../../reducers/folders';
import Form from '../Forms/Form';
import Textbox from '../Forms/Textbox';
import Select from '../Forms/Select';
import Submit from '../Forms/Submit';
import Checkbox from '../Forms/Checkbox';

import './StubForm.scss';

class StubForm extends Component {

    static propTypes = {
        closeModal: PropTypes.func.isRequired,
        folders: PropTypes.object.isRequired,
        initial: PropTypes.object,
        editing: PropTypes.object,
        actions: PropTypes.object.isRequired,
        folderID: PropTypes.number
    };

    constructor(props) {
        super(props);

        this.state = {
            openTab: 0
        };

        this.onValidate = this.onValidate.bind(this);
        this.onError = this.onError.bind(this);
    }

    componentDidMount() {
        const defaults = this.props.initial || this.props.editing;
        if (defaults) {
            this.formRef.setValues({ ...defaults, folder: this.props.folderID.toString() });
        } else {
            this.formRef.setValues({
                folder: this.props.folderID.toString(),
                method: 'GET',
                status: '200'
            });
        }

        this.nameInput.focus();
    }

    onValidate(form) {
        const { actions, editing, folderID, closeModal } = this.props;
        const folder = parseInt(form.folder);

        delete form.folder;

        if (editing) {
            actions.editStub(Object.assign({}, editing, form));

            if (folderID !== folder) {
                actions.moveStub(folderID, folder, editing);
            }
        } else {
            actions.addStub(folder, form);
        }

        closeModal();
    }

    onError() {

    }

    remove() {
        this.props.actions.removeFolder(this.props.id);
    }

    tab(index) {
        this.setState({ openTab: index });
    }
    
    render() {
        return (
            <Form className="stubform padding--sm" ref={form => this.formRef = form} onValidate={this.onValidate} onError={this.onError}>
                <div className="stubform__top">
                    <div className="grid margin-bottom--sm">
                        <div className="col col--6">
                            <label htmlFor="name">Name</label>
                            <Textbox ref={input=>this.nameInput=input} id="name" name="name" required />
                        </div>
                        <div className="col col--6">
                            <label htmlFor="folder">Folder</label>
                            <Select id="folder" name="folder">
                                {Object.keys(this.props.folders).map(key => (
                                    <option key={key} value={key}>{this.props.folders[key].name}</option>
                                ))}
                            </Select>
                        </div>
                    </div>
                    <div className="grid margin-bottom--sm">
                        <div className="col col--fill">
                            <label htmlFor="method">Request</label>
                            <div className="url-bar">
                                <Select id="method" name="method">
                                    <option value="GET">GET</option>
                                    <option value="POST">POST</option>
                                    <option value="PUT">PUT</option>
                                    <option value="PATCH">PATCH</option>
                                    <option value="DELETE">DELETE</option>
                                </Select>
                                <Textbox className="url" id="url" name="url" required />
                            </div>
                        </div>
                        <div className="col">
                            <label htmlFor="regex">RegEx</label>
                            <Checkbox name="regex" id="regex" />
                        </div>
                    </div>
                    <div className="grid padding-bottom--sm">
                        <div className="col col--fill">
                            <label>Response</label>
                            <div className="tab-list">
                                <label onClick={() => this.tab(0)} className={this.state.openTab === 0 ? 'selected' : ''}>Body</label>
                                <label onClick={() => this.tab(1)} className={this.state.openTab === 1 ? 'selected' : ''}>Headers</label>
                            </div>
                        </div>
                        <div className="col">
                            <label htmlFor="status">Status</label>
                            <Textbox className="status-input" id="status" name="status" />
                        </div>
                    </div>
                </div>
                <div className="stubform__bottom">
                    <div className="tabs">
                        <div className="tab" style={{'display': this.state.openTab === 0 ? 'block' : 'none'}}>
                            <Textbox type="textarea" id="response" name="response" />
                        </div>
                        <div className="tab" style={{'display': this.state.openTab === 1 ? 'block' : 'none'}}>
                            <Textbox type="textarea" id="headers" name="headers" />
                        </div>
                    </div>
                </div>
                <div className="toolbar">
                    <Submit>{this.props.editing ? 'Save' : 'Add'}</Submit>
                </div>
            </Form>
        );
    }
}

export default connect(
    state => ({ folders: state.folders.byHash }),
    dispatch => ({ actions: bindActionCreators({ ...stubActions, moveStub }, dispatch) })
)(StubForm);