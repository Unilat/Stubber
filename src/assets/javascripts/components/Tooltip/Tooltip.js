import React from 'react';
import { PureComponent } from 'react';
import PropTypes from 'prop-types';

import './Tooltip.scss';

export default class Tooltip extends PureComponent {

    static propTypes = {
        text: PropTypes.string.isRequired,
        bottom: PropTypes.bool
    };

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.adjust();
    }

    componentDidUpdate() {
        this.adjust();
    }

    adjust() {
        if (this.elem) {
            console.log('there');
            const half = Math.floor(this.elem.getBoundingClientRect().width / 2);
            this.elem.style.transform = `translate3d(-${half}px, 0, 0)`;
            this.elem.style.width = (half * 2) + 'px';
        }
    }
    
    render() {
        return (
            <i className={this.props.bottom ? 'bottom' : ''} ref={(tt) => { this.elem = tt; }}>{this.props.text}</i>
        );
    }
}