import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { stubActions } from '../../reducers/stubs';
import { moveStub } from '../../reducers/folders';
import classNames from 'classnames';
import Tooltip from '../Tooltip';
import Modal from '../Modal';
import StubForm from '../StubForm';
import RemoveButton from '../RemoveButton';

import './Stub.scss';

class Stub extends Component {

    static propTypes = {
        stub: PropTypes.object.isRequired,
        folderID: PropTypes.number.isRequired,
        actions: PropTypes.object.isRequired,
        folderOrder: PropTypes.array.isRequired
    };

    constructor(props) {
        super(props);

        this.state = {
            editStubOpen: false,
            isDuplicating: false
        };

        this.editStub = this.editStub.bind(this);
        this.closeEditStub = this.closeEditStub.bind(this);
        this.duplicateStub = this.duplicateStub.bind(this);
        this.remove = this.remove.bind(this);
        this.disable = this.disable.bind(this);
        this.mouseDown = this.mouseDown.bind(this);
        this.mouseMove = this.mouseMove.bind(this);
        this.mouseUp = this.mouseUp.bind(this);

        this.app = document.getElementsByClassName('stubber')[0];
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (nextProps.folderOrder !== this.props.folderOrder) {
            // if folderOrder changed, ensure something else changed to determine whether to update
            for (let key in this.props) {
                if (key !== 'folderOrder' && this.props[key] !== nextProps[key]) return true;
            }

            for (let key in this.state) {
                if (this.state[key] !== nextState[key]) return true;
            }

            return false;
        }

        return true;
    }

    editStub() {
        this.setState({ editStubOpen: true });
    }

    duplicateStub() {
        this.setState({ editStubOpen: true, isDuplicating: true });
    }

    closeEditStub() {
        this.setState({ editStubOpen: false, isDuplicating: false });
    }

    remove() {
        this.props.actions.removeStub(this.props.stub);
    }

    disable() {
        this.props.actions.disableStub(this.props.stub.id, !this.props.stub.disabled);
    }

    // Drag stuff, vanilla to avoid the react lifecycle
    mouseDown(e) {
        this.startY = e.clientY;
        this.lastPlacement = -1;
        this.rAF = null;

        this.offsetY = this.wrapper.getBoundingClientRect().top;
        this.parent = this.wrapper.parentNode;

        this.positions = findPlacements();
        console.log(this.positions);

        this.wrapper.classList.add('dragging');
        this.wrapper.style.transform = `translate3d(0, ${this.offsetY}px, 0)`;
        this.app.appendChild(this.wrapper);

        // create a placer element to indicate where the stub will be dropped
        this.placer = document.createElement('div');
        this.placer.classList.add('stub-placer');
        this.app.appendChild(this.placer);
        this.placer.style.top = this.offsetY + 'px';

        window.addEventListener('mousemove', this.mouseMove);
        window.addEventListener('mouseup', this.mouseUp);
    }

    mouseMove(e) {
        const { startY, offsetY, positions, placer, wrapper } = this;

        let diffY = e.clientY - startY + offsetY;
        const previousPlacement = this.lastPlacement;

        if (diffY > positions[0].y) {
            for (let i = 1; i < positions.length; i++) {
                let prev = positions[i - 1];
                let next = positions[i];
                if (diffY < next.y && diffY > prev.y && i !== this.lastPlacement) {
                    this.lastPlacement = i;
                    break;
                }
            }
        } else {
            this.lastPlacement = 0;
        }

        if (previousPlacement !== this.lastPlacement) {
            placer.style.top = (positions[this.lastPlacement].y) + 'px';
            console.log(positions[this.lastPlacement]);
        }

        cancelAnimationFrame(this.rAF);
        this.rAF = requestAnimationFrame(() => {
            wrapper.style.transform = `translate3d(0, ${diffY}px, 0)`;
        });
    }

    mouseUp() {
        const { lastPlacement, positions, placer, wrapper, rAF } = this;

        cancelAnimationFrame(rAF);

        window.removeEventListener('mousemove', this.mouseMove);
        window.removeEventListener('mouseup', this.mouseUp);

        wrapper.classList.remove('dragging');
        wrapper.style = '';

        placer.remove();
        this.parent.appendChild(this.wrapper);

        // check for movement
        const placement = positions[lastPlacement];
        this.props.actions.moveStub(this.props.folderID, this.props.folderOrder[placement.folderIndex], this.props.stub, placement.index);
        
        console.log('placement ', placement);
    }
    
    render() {
        const { id, method, name, url, disabled } = this.props.stub;
        const { isDuplicating } = this.state;
        console.log(`Stub ${id} render`);
        const methodClass = classNames({
            'stub__method': true,
            ['stub__method--' + method]: true
        });
        const stubClass = classNames({
            'stub': true,
            'disabled': disabled === true
        });
        return (
            <div className={stubClass}>
                <div className="stub-wrapper" ref={elem=>this.wrapper=elem}>
                    <div className={methodClass}><span onMouseDown={this.mouseDown}>{method}</span></div>
                    <div className="stub__content">
                        <div className="stub__name">{name}</div>
                        <div className="stub__url">{url}</div>
                    </div>
                    <div className="actions">
                        <button className="edit" onClick={this.editStub}><Tooltip text="Edit" /></button>
                        <button className="duplicate" onClick={this.duplicateStub}><Tooltip text="Duplicate" /></button>
                        <RemoveButton onRemove={this.remove} />
                        <button className="disable" onClick={this.disable}><Tooltip text={disabled ? 'Enable' : 'Disable'} /></button>
                    </div>
                </div>

                <Modal title={(isDuplicating ? 'Add' : 'Edit') + ' Stub'} open={this.state.editStubOpen} onClose={this.closeEditStub}>
                    <StubForm initial={isDuplicating ? this.props.stub : undefined} editing={isDuplicating ? undefined : this.props.stub} folderID={this.props.folderID} closeModal={this.closeEditStub} />
                </Modal>
            </div>
        );
    }
}

function findPlacements() {
    let placements = [];
    document.querySelectorAll('.folder').forEach((folder, folderIndex) => {
        let j = 0;
        if (folder.classList.contains('folder--open')) {
            folder.querySelectorAll('.stub').forEach((stub, stubIndex) => {
                let box = stub.getBoundingClientRect();
                // one additional placement for the top of the folder, before the first stub
                if (stubIndex === 0) placements.push({ y: box.top, index: j++, folderIndex });
                // placements are all below each stub
                placements.push({ y: box.bottom, index: j++, folderIndex });
            });
        } else {
            // the folder isn't open but dropping it here will put it at the end of the stub list
            placements.push({ y: folder.getBoundingClientRect().bottom, folderIndex, isFolder: true });
        }
    });
    return placements;
}

export default connect(
    (state, props) => ({
        stub: state.stubs[props.id],
        folderOrder: state.folders.byID
    }),
    dispatch => ({ actions: bindActionCreators({ ...stubActions, moveStub }, dispatch) })
)(Stub);