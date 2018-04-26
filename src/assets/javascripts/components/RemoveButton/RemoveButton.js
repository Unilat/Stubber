import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Tooltip from '../Tooltip';
import classNames from 'classnames';

import './RemoveButton.scss';

export default class RemoveButton extends Component {

    static propTypes = {
        onRemove: PropTypes.func.isRequired,
        tooltip: PropTypes.string,
        bottom: PropTypes.bool
    };

    static defaultProps = {
        tooltip: 'Remove'
    };

    constructor(props) {
        super(props);

        this.state = {
            holding: false
        };

        this.timeout = null;

        this.mouseDown = this.mouseDown.bind(this);
        this.mouseUp = this.mouseUp.bind(this);
        this.done = this.done.bind(this);
    }

    mouseDown() {
        this.setState({ holding: true });

        this.timeout = setTimeout(this.done, 1000);
    }

    mouseUp() {
        clearTimeout(this.timeout);

        this.setState({ holding: false });
    }

    done() {
        this.setState({ holding: false });
        this.props.onRemove();
    }
    
    render() {
        const buttonClass = classNames({
            'remove': true,
            'holding': this.state.holding
        });
        return (
            <button className={buttonClass} onMouseLeave={this.mouseUp} onMouseDown={this.mouseDown} onMouseUp={this.mouseUp}><Tooltip bottom={this.props.bottom} text={this.props.tooltip} /></button>
        );
    }
}