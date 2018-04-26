import React, { Component } from 'react';
import PropTypes from 'prop-types';

import './Form.scss';

export default class Form extends Component {

    static propTypes = {
        onValidate: PropTypes.func,
        onError: PropTypes.func,
        className: PropTypes.string,
        children: PropTypes.node
    };

    static childContextTypes = {
        parentForm: PropTypes.object
    };

    constructor(props) {
        super(props);

        // shape:
        // name: {
        //     name,
        //     component,
        //     validators,
        //     errors,
        //     value
        // }
        this.inputs = {};
        this.model = {};
    }

    getChildContext() {
        return { parentForm: this };
    }

    updateValue(name, value) {
        Object.assign(this.model, { [name]: value });
        this.inputs[name].value = value;

        // on an update we validate the whole form again since some validation references other fields
        for (let name in this.inputs) {
            this.setErrors(this.inputs[name]);
        }

        //console.log(this.model, this.errors);
    }

    registerInput(component) {
        let input = this.inputs[component.props.name] = {
            name: component.props.name,
            component,
            validators: component.validators,
            errors: [],
            value: component.state.value
        };

        // set the initial errors on the input
        this.setErrors(input);

        component.registerOnChange(this.updateValue.bind(this));
    }

    setErrors(input) {
        let errors = input.validators.map(validator => validator(input.value, this.model)).filter(err => err);
        input.errors = errors;
        input.component.setState({ errors });
    }

    setValues(values) {
        for (let name in values) {
            let value = values[name];
            let input = this.inputs[name];

            if (input) {
                input.value = value;
                input.component.setValue(value);
                this.model[name] = value;
                
            }
        }

        // do errors after value setting in case some fields rely on others' values
        this.setAllErrors();
    }

    reset() {
        this.model = {};

        for (let name in this.inputs) {
            let input = this.inputs[name];

            input.component.reset();
            this.model[name] = input.component.value;
        }
    }

    // recalcs all errors on the form after a reset or setValues
    setAllErrors() {
        for (let name in this.inputs) {
            let input = this.inputs[name];
            if (input) this.setErrors(input);
        }
    }

    unregisterInput(input) {
        delete this.inputs[input.props.name];
    }

    submit() {
        let invalid = false;
        for (let name in this.inputs) {
            if (this.inputs[name].errors.length) {
                invalid = true;
                break;
            }
        }

        if (invalid) {
            this.props.onError && this.props.onError(this.errors);

            // mark all the inputs as shouldBeValidated to show errors on ontouched fields
            for (let name in this.inputs) {
                this.inputs[name].component.setState({ shouldBeValidated: true });
            }
        } else {
            this.props.onValidate && this.props.onValidate(Object.assign({}, this.model));
        }
    }
    
    render() {
        return (
            <form className={this.props.className}>
                {this.props.children}
            </form>
        );
    }
}