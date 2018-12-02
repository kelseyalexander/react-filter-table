import React from 'react';
import './styles/react-filter-table.scss';
import cloneDeep from 'lodash/cloneDeep';
import find from 'lodash/find';
import uniq from 'lodash/uniq';
import moment from 'moment';
import { ModalContainer, modal } from './modal';

export default class ReactFilterTable extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            term: "",
            filtered: cloneDeep(this.props.items),
            filters: {}
        }

        this.sortArray = this.sortArray.bind(this);
        this.showModal = this.showModal.bind(this);
        this.clearFilter = this.clearFilter.bind(this);
        this.filterOn = this.filterOn.bind(this);
        this.filterItems = this.filterItems.bind(this);
        this.searchItems = this.searchItems.bind(this);
    }

    /**
     * Update the search term
     * @param {Event} e 
     */
    onChange(e) {
        this.setState({term: e.currentTarget.value});
    }

    /**
     * Capture the key event and start search
     * @param {Event} e 
     */
    search(e) {
        if (e.keyCode === 13) {
            e.preventDefault();
            this.searchItems();
        }
    }

    /**
     * Search the filtered items for matches to the term
     */
    searchItems() {
        let items = cloneDeep(this.state.filtered);
        let term = this.state.term.toLowerCase();
        let regex = new RegExp(term, "g");
        let filtered = [];

        for (let i=0; i<items.length; i++) {
            let item = items[i];
            let found = false;

            for (var key in item) {
                let value = item[key].toLowerCase()

                if (value.match(regex) || value.indexOf(term) !== -1) {
                    found = true;
                }
            }

            if (found) {
                filtered.push(item);
            }
        }

        if (term === "") {
            this.filterItems(cloneDeep(this.props.items), cloneDeep(this.state.filters));
        } else {
            this.setState({filtered: filtered});
        }
    }

    /**
     * Clear all search settings
     * @param {Event} e 
     */
    clear(e) {
        this.setState({term: ""});
        this.setState({filtered: cloneDeep(this.props.items)});
        this.setState({filters: {}});

        let cells = document.getElementById(this.props.headerId).children;

        for (let i=0; i<cells.length; i++) {
            let span = cells[i].children[0].children[1];
            span.classList.remove("fa-arrow-down");
            span.classList.remove("fa-arrow-up");
        }
    }

    /**
     * Clear filters for a specific key
     * @param {String} key 
     */
    clearFilter(key, e) {
        let checkboxes = e.currentTarget.parentElement.parentElement.children;

        for (let i=1; i<checkboxes.length; i++) {
            checkboxes[i].children[0].checked = false;
        }

        let items = cloneDeep(this.props.items);
        let filters = cloneDeep(this.state.filters);
            delete filters[key];

        this.setState({filters: filters});
        this.filterItems(items, filters);
    }

    /**
     * Filter items on a specific key and value
     * @param {String} key 
     * @param {Event} e
     */
    filterOn(key, e) {
        let value = e.currentTarget.value;
        let selected = e.currentTarget.checked;
        let items = cloneDeep(this.props.items);
        let filters = cloneDeep(this.state.filters);

        if (filters[key] === undefined && selected) {
            filters[key] = [value];
        } else if (selected) {
            filters[key].push(value);
        } else {
            let index = filters[key].indexOf(value);
            filters[key].splice(index, 1);
        }

        this.setState({filters: filters});
        this.filterItems(items, filters);
    }

    /**
     * Filter the items for all selected filters
     * @param {Array} items 
     * @param {Object} filters 
     */
    filterItems(items, filters) {
        let filtered = items.filter(item => {
            let match = true;

            for (var filter in filters) {
                for (let i=0; i< filters[filter].length; i++) {
                    match = item[filter].indexOf(filters[filter][i]) === -1 ? false : match;
                }
            }

            return match;
        })

        this.setState({filtered: filtered});
    }

    /**
     * Sort the items based on the header clicked
     * @param {Event} e 
     */
    sort(e) {
        let key = e.currentTarget.children[0].innerHTML;
        let index = parseInt(e.currentTarget.parentElement.getAttribute('index'));
        let span = e.currentTarget.children[1];
        let cells = e.currentTarget.parentElement.parentElement.children;
        let sortOrder = "";

        if (span.classList.contains("fa-arrow-down")) {
            span.classList.remove("fa-arrow-down");
            span.classList.add("fa-arrow-up");
            sortOrder = "-";
        } else {
            span.classList.remove("fa-arrow-up");
            span.classList.add("fa-arrow-down");
        }

        for (let i=0; i<cells.length; i++) {
            if (i !== index) {
                let span = cells[i].children[0].children[1];
                span.classList.remove("fa-arrow-down");
                span.classList.remove("fa-arrow-up");
            }
        }

        let items = cloneDeep(this.state.filtered);
            items.sort(this.sortArray(`${sortOrder}${key}`));

        this.setState({filtered: items});
    }

    /**
     * Sort the array of objects based on a key
     * @param {String} prop 
     */
    sortArray(prop) {
        let sortOrder = 1;

        if (prop[0] === "-") {
            sortOrder = -1;
            prop = prop.substr(1);
        }

        return function (a,b) {
            let date = moment(a[prop]);
            let result = null;

            if (date.isValid()) {
                result = moment(a[prop]) < moment(b[prop]) ? -1 : moment(a[prop]) > moment(b[prop]) ? 1 : 0;
            } else {
                result = (a[prop] < b[prop]) ? -1 : (a[prop] > b[prop]) ? 1 : 0;
            }

            return result * sortOrder;
        }
    }

    /**
     * Show filter options for a given key
     * @param {String} key 
     */
    showModal(key) {
        let self = this;
        let items = cloneDeep(this.props.items);
        let filters = cloneDeep(this.state.filters);
        let filter = filters[key] !== undefined ? filters[key] : [];
        let options = items.map((item, i) => {
            return item[key];
        })

        let newOptions = [];

        for (let i=0; i<options.length; i++) {
            if (options[i].match(/^([a-zA-Z]+, )+[a-zA-Z]+$/)) {
                let values = options[i].split(', ');
                newOptions = newOptions.concat(values);
            } else {
                newOptions.push(options[i]);
            }
        }

        options = uniq(newOptions);

        modal.show(
            <div className="search-filters">
                <div className="filter-block">
                    <span className="fas fa-minus-circle" onClick={(e) => self.clearFilter(key, e)}></span>
                    <label>Clear all filters from {key}</label>
                </div>
                {options.map((option, i) => {
                    return(
                        <div className="filter-block">
                            {filter.indexOf(option) !== -1 && (
                                <input type="checkbox" value={option} onChange={(e) => self.filterOn(key, e)} checked/>
                            )}
                            {filter.indexOf(option) === -1 && (
                                <input type="checkbox" value={option} onChange={(e) => self.filterOn(key, e)}/>
                            )}
                            <label>{option}</label>
                        </div>
                    )  
                })}
            </div>, 
            { hideClose: false }
        )
    }

    render() {
        return(
            <div className={`FilterTable ${this.props.className}`}>
                <div className="search-actions">
                    <input type="text" value={this.state.term} onChange={this.onChange.bind(this)} onKeyDown={this.search.bind(this)}/>
                    <button type="button" className="clear-button" onClick={this.clear.bind(this)}>Clear</button>
                </div>
                <div className="search">
                        <div id={this.props.headerId} className="search-header">
                            {Object.keys(this.props.items[0]).map((key, i) => {
                                return(
                                    <div key={i} index={i} className="search-cell">
                                        <div className="sorter" onClick={this.sort.bind(this)}>
                                            <span className="sort-key">{key}</span>
                                            <span className="fas"></span>
                                        </div>
                                        <div className="filter" onClick={(e) => this.showModal(key)}>
                                            <span className="fas fa-caret-down"></span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                        {this.state.filtered.length > 0 && (
                            <div className="search-body">
                                {this.state.filtered.map((item, i) => {
                                    return (
                                        <div key={i} className="search-row">
                                            {Object.keys(item).map((key, j) => {
                                                return (
                                                    <div key={j} className="search-cell">{item[key]}</div>
                                                )
                                            })}
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                        {this.state.filtered.length === 0 && (
                            <span style={{
                                display: 'block',
                                textAlign: 'center',
                                width: '100%',
                                fontWeight: '500',
                                padding: '4px'
                            }}
                            >
                                No results
                            </span>
                        )}
                </div>
                <ModalContainer/>
            </div>
        )
    }
}

ReactFilterTable.defaultProps = {
    items: [],
    className: "",
    headerId: "search-header"
}