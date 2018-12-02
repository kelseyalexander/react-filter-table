# React Filter Table
A table component for ReactJS with keyword matching, sorting, and filtering. Uses a modal for filtering on specific columns.

- [Properties](#properties)
- [Usage](#usage)
- [License](#license)

## Properties

| Prop Name       | Type    | Default              | Description                     |
|-----------------|---------|----------------------|---------------------------------|
| items           | Array   | []                   | Items to filter                 |
| headerId        | String  | "search-header"      | ID of the table header          |

## Usage
```jsx

import React from 'react';
import ReactFilterTable from 'react-filter-table';

export default class MyClass extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            items: [
                {ID: "1", Title: "Item 1", 
                    Color: "Red", Fruit: "Apple, Tomato", Price:"$0.75", Expiry: "12/17/2018", Ranking: "1"},
                {ID: "2", Title: "Item 2", 
                    Color: "Orange", Fruit: "Orange, Mango", Price:"$1.25", Expiry: "12/02/2018", Ranking: "3"},
                {ID: "3", Title: "Item 3", 
                    Color: "Red", Fruit: "Raspberry, Tomato", Price:"$1.55", Expiry: "11/28/2018", Ranking: "4"},
                {ID: "4", Title: "Item 4", 
                    Color: "Yellow", Fruit: "Banana", Price:"$1.25", Expiry: "11/07/2018", Ranking: "2"},
            ]
        }
    }

    render() {
        return(
            <div>
                <ReactFilterTable
                    items={this.state.items}
                    className="item-filter"
                    headerId="filter-table-header"
                />
            </div>
        )
    }
}
```

## License
MIT Licensed.