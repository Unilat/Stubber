import React, { Component } from 'react';
import PropTypes from 'prop-types';
import BaseInput from '../BaseInput/BaseInput';

import './Checkbox.scss';

export default class Checkbox extends BaseInput {

    static propTypes = {
        
    };

    static contextTypes = {
        parentForm: PropTypes.object
    };

    constructor(props, context) {
        super(props, context);
        
        this.state = {
            value: false
        }
    }

    render() {
        const { name, id } = this.props;
        return (
            <label className="checkbox">
                <input type="checkbox" id={id} name={name} onChange={this.onInputChange.bind(this)} checked={this.state.value} />
                <div className="check"></div>
            </label>
        );
    }
}