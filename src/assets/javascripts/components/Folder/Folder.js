import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { createSelector } from 'reselect';
import classNames from 'classnames';
import { folderActions } from '../../reducers/folders';
import { addStub, disableStub } from '../../reducers/stubs';
import Stub from '../Stub';
import Tooltip from '../Tooltip';
import RemoveButton from '../RemoveButton';
import Modal from '../Modal';
import StubForm from '../StubForm';

import './Folder.scss';

export class Folder extends Component {

    static propTypes = {
        folder: PropTypes.object.isRequired,
        editing: PropTypes.bool.isRequired,
        actions: PropTypes.object.isRequired,
        disabled: PropTypes.bool.isRequired,
        id: PropTypes.number.isRequired
    };

    constructor(props) {
        super(props);

        this.state = {
            addStubOpen: false,
            editing: this.props.editing
        };

        this.addStub = this.addStub.bind(this);
        this.editName = this.editName.bind(this);
        this.nameBlur = this.nameBlur.bind(this);
        this.nameInput = this.nameInput.bind(this);
        this.remove = this.remove.bind(this);
        this.closeAddStub = this.closeAddStub.bind(this);
        this.toggle = this.toggle.bind(this);
        this.inputClick = this.inputClick.bind(this);
        this.disable = this.disable.bind(this);
        this.mouseDown = this.mouseDown.bind(this);
        this.mouseMove = this.mouseMove.bind(this);
        this.mouseUp = this.mouseUp.bind(this);

        this.app = document.getElementsByClassName('stubber')[0];
    }

    componentDidMount() {
        if (this.state.editing) {
            this.editName();
        }

        this.updateDropdown();
    }

    componentDidUpdate() {
        this.updateDropdown();
    }

    shouldComponentUpdate(nextProps, nextState) {
        // only update when folder changes or when the modal toggles, not editing or actions
        return (
            this.props.folder !== nextProps.folder ||
            this.state.addStubOpen !== nextState.addStubOpen ||
            this.props.disabled !== nextProps.disabled
        );
    }

    updateDropdown() {
        this.stubContainer.style.height = (this.props.folder.open ? this.stubWrap.clientHeight : 0) + 'px';
    }

    editName() {
        this.input.disabled = false;
        this.input.focus();
        this.input.setSelectionRange(0, this.input.value.length);
        this.setState({ editing: true });
    }

    saveName(e) {
        this.input.disabled = true;
        this.props.actions.editFolder(this.props.folder.id, e.target.value);
        this.setState({ editing: false });
    }

    nameBlur(e) {
        this.saveName(e);
    }

    nameInput(e) {
        if (e.which === 13) this.input.blur();
    }

    addStub() {
        this.setState({ addStubOpen: true });
    }

    closeAddStub() {
        this.setState({ addStubOpen: false });
    }

    remove() {
        this.props.actions.removeFolder(this.props.folder);
    }

    toggle() {
        this.props.actions.toggleFolderOpen(this.props.id);
    }

    inputClick(e) {
        if (this.state.editing) e.stopPropagation();
    }

    disable() {
        this.props.actions.disableStub(this.props.folder.stubs, !this.props.disabled);
    }

    // Drag stuff, vanilla to avoid the react lifecycle
    mouseDown(e) {
        this.startY = e.clientY;
        this.lastPlacement = -1;
        this.rAF = null;

        this.offsetY = this.wrapper.getBoundingClientRect().top;
        this.parent = this.wrapper.parentNode;

        this.positions = this.findPlacements();
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

        if (lastPlacement < 0) return;

        // check for movement
        const placement = positions[lastPlacement];
        this.props.actions.moveFolder(this.props.folder.id, placement.index);
        
        console.log('placement ', placement);
    }

    findPlacements() {
        let placements = [];
        document.querySelectorAll('.folder').forEach((folder, folderIndex) => {
            const header = folder.querySelector('.folder__header');
            const box = header.getBoundingClientRect();
            // one additional placement for before the first folder
            if (folderIndex === 0) placements.push({ y: box.top - 8, index: 0 });
            // placements are all below each folder
            placements.push({ y: box.bottom + 2 + folder.querySelector('.folder__stubs').clientHeight, index: folderIndex + 1 });
        });
        return placements;
    }
    
    render() {
        const { disabled, folder: {id, name, open, stubs} } = this.props;
        console.log(`Folder ${id} render`);
        
        const folderClass = classNames({
            'folder': true,
            'folder--open': open,
            'disabled': disabled
        });
        return (
            <div className={folderClass}>
                <div className="folder__placeholder">
                    <div className="folder__header" onClick={this.toggle} ref={elem=>this.wrapper=elem}>
                        <div className="folder__handle" onMouseDown={this.mouseDown}></div>
                        <div className="folder__header-wrap" onClick={this.inputClick}>
                            <input ref={input=>this.input=input} className="folder__name" type="text" onKeyPress={this.nameInput} onBlur={this.nameBlur} defaultValue={name} disabled />
                        </div>
                        <div className="actions" onClick={e=>e.stopPropagation()}>
                            <button className="edit" onClick={this.editName}><Tooltip text="Edit" /></button>
                            <button className="add-stub" onClick={this.addStub}><Tooltip text="Add Stub" /></button>
                            <RemoveButton onRemove={this.remove} />
                            <button className="disable" onClick={this.disable}><Tooltip text={disabled ? 'Enable' : 'Disable'} /></button>
                        </div>
                    </div>
                </div>
                <div ref={elem=>this.stubContainer=elem} className="folder__stubs">
                    <div ref={elem => this.stubWrap = elem} className="folder__stub-list">
                        {stubs.map(stubID => (
                            <Stub key={stubID} id={stubID} folderID={id} />
                        ))}
                    </div>
                </div>
                
                <Modal title="Add Stub" open={this.state.addStubOpen} onClose={this.closeAddStub}>
                    <StubForm closeModal={this.closeAddStub} folderID={id} />
                </Modal>
            </div>
        );
    }
}

export default connect(
    (state, props) => createSelector(
        [
            (state, props) => state.folders.byHash[props.id],
            (state) => state.folders.editing,
            // selector for determining if all children stubs are disabled
            (state) => {
                const folder = state.folders.byHash[props.id];
                if (folder.stubs.length === 0) return false;

                for (let i = 0; i < folder.stubs.length; i++) {
                    if (!state.stubs[folder.stubs[i]].disabled) return false;
                }
                return true;
            }
        ], (folder, editing, disabled) => ({
            folder,
            editing: editing === folder.id,
            disabled
        })
    ),
    (dispatch) => ({
        actions: bindActionCreators({ ...folderActions, addStub, disableStub }, dispatch)
    })
)(Folder);