import React, { Component } from 'react';

export default class BaseInput extends Component {
    constructor(props, context) {
        super(props);

        this.onChangeCallback = () => {};

        this.parentForm = context.parentForm;

        // flag for when the input will start showing errors. Errors are always
        // checked for, but not displayed until the subclass decides it should be
        this.state = {
            shouldBeValidated: false,
            value: this.props.default
        };

        this.validators = [];
        if (this.props.validator) this.validators = this.validators.concat(this.props.validator);

        if (this.props.required) {
            this.validators.push(value => !value && 'Required');
        }
    }

    componentDidMount() {
        this.parentForm.registerInput(this);

        this.onChangeCallback(this.props.name, this.state.value);

        if (this.props.default) {
            this.setValue(this.props.default);
        }
    }

    setValue(value) {
        this.value = value;
        this.setState({ value });
    }

    reset() {
        const value = this.value = this.props.default || '';
        this.setState({ value, shouldBeValidated: false });
    }

    componentWillUnmount() {
        this.parentForm.unregisterInput(this);
    }

    // the Form will provide a callback so the input can tell it when it has updated
    registerOnChange(cb) {
        this.onChangeCallback = cb;
    }

    // the change listener on the actual input
    onInputChange(e) {
        const target = e.target;
        const value = this.value = (target.type === 'checkbox' ? target.checked : target.value);

        this.setValue(value);

        this.onChangeCallback(this.props.name, value);
    }
}