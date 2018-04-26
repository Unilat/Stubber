import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { bindActionCreators } from 'redux';
import classNames from 'classnames';
import { clearLog } from '../../reducers/logs';
import Modal from '../Modal';
import StubForm from '../StubForm';
import Tooltip from '../Tooltip';

import './LogButton.scss';

class LogButton extends Component {

    static propTypes = {
        logs: PropTypes.array.isRequired,
        clearLog: PropTypes.func.isRequired
    };

    constructor(props) {
        super(props);

        this.state = {
            addStubOpen: false,
            addStubLog: undefined,
            logOpen: false
        };

        this.closeAddStub = this.closeAddStub.bind(this);
        this.closeLog = this.closeLog.bind(this);
        this.openLog = this.openLog.bind(this);
        this.clearLog = this.clearLog.bind(this);

        this.clearButton = <button className="clear-log" onClick={this.clearLog}><Tooltip text="Clear" bottom /></button>;
    }

    addStub(log) {
        if (log.stubbed) return;

        this.setState({ logOpen: false, addStubOpen: true, addStubLog: log });
    }

    closeAddStub() {
        this.setState({ addStubOpen: false, addStubLog: undefined });
    }

    openLog() {
        this.setState({ logOpen: true });
    }

    closeLog() {
        this.setState({ logOpen: false });
    }

    clearLog() {
        this.props.clearLog();
    }
    
    // Both the log modal and add stub modal are managed from here, so we can close logs
    // when they go to add a stub, which would close both if logs opened add-stub
    render() {
        return (
            <button className="log" id="log-btn" onClick={this.openLog}>
                <Tooltip text="Request Log" bottom />
                
                <Modal title="Request Log" open={this.state.logOpen} onClose={this.closeLog} actions={this.clearButton}>
                    <table className="log">
                        <tbody>
                            {this.props.logs.map(log => (
                                <tr key={log.id} className={'log-item ' + (log.stubbed ? 'log-item--stubbed':'')} onClick={this.addStub.bind(this, log)}>
                                    <td className="log-item__method">{log.method}</td>
                                    <td className="log-item__url">{shortenURL(log.url)}</td>
                                    <td className="log-item__status">
                                        <span className={statusClass(log.status)}>{log.status}</span>
                                        {log.stubbed ? <div className="log-item__stub"></div> : null}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Modal>

                <Modal title="Add Stub" open={this.state.addStubOpen} onClose={this.closeAddStub}>
                    <StubForm initial={this.state.addStubLog} closeModal={this.closeAddStub} folderID={0} />
                </Modal>
            </button>
        );
    }
}

function statusClass(status) {
    status = parseInt(status);
    return classNames({
        'log-item__status--pending': !status,
        'log-item__status--success': status >= 200 && status < 300,
        'log-item__status--redirect': status >= 300 && status < 400,
        'log-item__status--error': status >= 400
    });
}

function shortenURL(url) {
    let bits = url.split('/');
    while (bits[bits.length-1] === '') bits.pop();
    return bits.pop();
}

export default connect(
    // eslint-disable-next-line no-unused-vars
    state => createSelector(
        state => state.logs,
        logs => ({ logs: logs.byID.map(id => logs.byHash[id]) })
    ),
    dispatch => ({ clearLog: bindActionCreators(clearLog, dispatch) })
)(LogButton);