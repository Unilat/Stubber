import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class Pagination extends Component {
    static propTypes = {
        actions: PropTypes.object.isRequired,
        total: PropTypes.number.isRequired,
        state: PropTypes.object.isRequired
    };

    nextPage() {
        const { total, state: { page, perPage }} = this.props;
        if (page < Math.ceil(total / perPage)) {
            this.props.actions.goToPage(page + 1);
        }
    }

    prevPage() {
        const page = this.props.state.page - 1;
        if (page > 0) {
            this.props.actions.goToPage(page);
        }
    }

    goToPage(page) {
        this.props.actions.goToPage(page);
    }

    render() {
        const {actions, total, state: { page, perPage }} = this.props;
        const last = Math.ceil(total / perPage);
        const rangeLow = Math.max(1, page - 1);
        const rangeHigh = Math.min(last, page + 1);
        const range = [];
        const prevDisabled = page < 2;
        const nextDisabled = page >= last;
        let lastWasEllipsis = false;

        for (let i = 1; i <= last; i++) {
            if (i === 1 || i === last || (i >= rangeLow && i <= rangeHigh)) {
                range.push(
                    <li key={i} className={'pagination__number' + (i === page ? ' pagination__number--selected' : '')}>
                        <a href="#" onClick={() => this.goToPage(i)}>{i}</a>
                    </li>
                );
                lastWasEllipsis = false;
            } else if (!lastWasEllipsis) {
                range.push(<li key={i} className="pagination__number pagination__ellipsis">...</li>);
                lastWasEllipsis = true;
            }
        }

        return (
            <nav className="pagination">
                <ul>
                    <li className={'pagination__prev' + (prevDisabled ? ' disabled': '')}><a href="#" onClick={() => this.prevPage()}>Previous</a></li>
                    {range}
                    <li className={'pagination__next' + (nextDisabled ? ' disabled': '')}><a href="#" onClick={() => this.nextPage()}>Next</a></li>
                </ul>
            </nav>
        );
    }
}
