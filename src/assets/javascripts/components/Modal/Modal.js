import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import './Modal.scss';

const modalRoot = document.getElementById('modal-root');

export default class Modal extends Component {

    static propTypes = {
        title: PropTypes.string.isRequired,
        open: PropTypes.bool,
        onClose: PropTypes.func,
        actions: PropTypes.node,
        children: PropTypes.node
    };

    constructor(props) {
        super(props);

        this.el = document.createElement('div');

        this.state = {
            animationComplete: true // track whether it's fully closed (animated out done)
        };

        this.close = this.close.bind(this);
    }

    componentDidMount() {
        modalRoot.appendChild(this.el);
    }

    componentWillUnmount() {
        modalRoot.removeChild(this.el);
    }

    componentWillUpdate(nextProps) {
        if (nextProps.open && !this.props.open) {
            // reset animationComplete flag on open
            this.setState({ animationComplete: false });
        } else if (!nextProps.open && this.props.open) {
            // when closing, set state after animation completes
            setTimeout(() => this.setState({ animationComplete: true }), 200);
        }
    }

    close() {
        if (this.props.onClose) this.props.onClose();
    }

    render() {
        return !this.props.open && this.state.animationComplete ? null :
            // only render when it's open OR when it's closed but the animation isn't done
            ReactDOM.createPortal(
                <div className={'backdrop' + (this.props.open ? '' : ' leaving')} onClick={this.close}>
                    <div className="modal" onClick={(e) => { if (e.target.className !== 'modal') e.stopPropagation(); }}>
                        <div className="modal__title">
                            <div className="actions modal__actions">
                                {this.props.actions}
                                <button onClick={this.close} className="modal__close"></button>
                            </div>
                            <span>{this.props.title}</span>
                        </div>
                        <div className="modal__content">
                            <div className="modal__content-wrap">
                                {this.props.children}
                            </div>
                        </div>
                    </div>
                </div>,
                this.el
            );
    }
}