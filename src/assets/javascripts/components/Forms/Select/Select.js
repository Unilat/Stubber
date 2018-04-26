import React from 'react';
import PropTypes from 'prop-types';

import './Select.scss';
import BaseInput from '../BaseInput/BaseInput';

export default class Select extends BaseInput {

    static propTypes = {
        
    };

    static contextTypes = {
        parentForm: PropTypes.object
    };

    constructor(props, context) {
        super(props, context);
    }

    render() {
        const { name, id } = this.props;
        return (
            <div className="select">
                <select id={id} name={name} onChange={this.onInputChange.bind(this)} value={this.state.value}>
                    {this.props.children}
                </select>
            </div>
        );
    }
}