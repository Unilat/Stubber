import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import './Textbox.scss';
import BaseInput from '../BaseInput/BaseInput';

export default class Textbox extends BaseInput {

    static propTypes = {
        type: PropTypes.string
    };

    static defaultProps = {
        type: 'text'
    };

    static contextTypes = {
        parentForm: PropTypes.object
    };

    constructor(props, context) {
        super(props, context);

        this.state = {
            value: this.props.default || '',
            errors: []
        };
    }
    
    onBlur(e) {
        this.setState({ shouldBeValidated: true });
    }

    focus() {
        this.input.focus();
    }

    render() {
        const { validator, onChange, className, ...props } = this.props;
        const textboxClass = {
            'textbox': true,
            'textbox--error': this.state.errors.length && this.state.shouldBeValidated
        };
        if (className) textboxClass[className] = true;

        return (
            <div className={classNames(textboxClass)}>
                {this.props.type === 'text' ? 
                    <input ref={input=>this.input=input} value={this.state.value} autoComplete="off" type="text" {...props} onChange={this.onInputChange.bind(this)} onBlur={this.onBlur.bind(this)} /> :
                    <textarea value={this.state.value} {...props} onChange={this.onInputChange.bind(this)} onBlur={this.onBlur.bind(this)} />
                }
                {this.state.shouldBeValidated ? this.state.errors.map((error, i) => <div key={i} className="error">{error}</div>) : null}
            </div>
        );
    }
}