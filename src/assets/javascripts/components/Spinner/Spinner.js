import { Component } from 'react';
import PropTypes from 'prop-types';

import './Spinner.scss';

export default class Spinner extends Component {

    static propTypes = {
        open: PropTypes.bool.isRequired
    };

    constructor(props) {
        super(props);

        this.state = {
            animationComplete: true
        };
    }

    componentWillReceiveProps(nextProps) {
        if (!nextProps.open && this.props.open) {
            setTimeout(() => this.setState({ animationComplete: true }), 200);
        } else if (nextProps.open && !this.props.open) {
            this.setState({ animationComplete: false });
        }
    }
    
    render() {
        return !this.props.open && this.state.animationComplete ? null : (
            <div className={'backdrop' + (this.props.open ? '' : ' leaving')}>
                <div className="spinner-wrap">
                    <div className="spinner"></div>
                </div>
            </div>
        );
    }
}