import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter as Router, Switch, Route} from "react-router-dom";

import Main from "./components/main";

class App extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
	        <Router>
	            <Switch>
		    		<Route path='/' component={Main} />
				</Switch>
	        </Router>
	    )
	}
}

ReactDOM.render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
	document.getElementById('root')
);