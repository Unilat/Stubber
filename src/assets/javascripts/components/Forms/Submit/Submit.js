import React, { Component } from 'react';
import PropTypes from 'prop-types';

import './Submit.scss';

export default class Submit extends Component {

    static propTypes = {
        
    };

    static contextTypes = {
        parentForm: PropTypes.object
    }

    constructor(props, context) {
        super(props);

        this.parentForm = context.parentForm;
    }

    submit(e) {
        e.preventDefault();
        this.parentForm.submit();
    }

    render() {
        return (
            <button {...this.props} type="submit" onClick={this.submit.bind(this)}>{this.props.children}</button>
        );
    }
}