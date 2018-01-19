/**
*
* @licstart  The following is the entire license notice for the JavaScript code in this file.
*
* UI for removing references to local databases from Melinda
*
* Copyright (C) 2016-2017 University Of Helsinki (The National Library Of Finland)
*
* This file is part of melinda-local-ref-removal-ui
*
* melinda-local-ref-removal-ui program is free software: you can redistribute it and/or modify
* it under the terms of the GNU Affero General Public License as
* published by the Free Software Foundation, either version 3 of the
* License, or (at your option) any later version.
*
* melinda-local-ref-removal-ui is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU Affero General Public License for more details.
*
* You should have received a copy of the GNU Affero General Public License
* along with this program.  If not, see <http://www.gnu.org/licenses/>.
*
* @licend  The above is the entire license notice
* for the JavaScript code in this file.
*
*/import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import { BaseComponentContainer } from './components/base-component';
import { StatusPage } from './components/status/status-page';
import thunkMiddleware from 'redux-thunk';
import createLogger from 'redux-logger';
import { createStore, applyMiddleware, compose } from 'redux';
import rootReducer from './root-reducer';
import {Provider} from 'react-redux';
import {HashRouter,Route} from 'react-router-dom';
import {App} from './components/app';
import * as Cookies from 'js-cookie';
import { validateSession } from './action-creators/session-actions';

const loggerMiddleware = createLogger();

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(
  rootReducer,
  composeEnhancers(
    applyMiddleware(
      thunkMiddleware,
      loggerMiddleware
    )
  )
);

const rootElement = document.getElementById('app');

ReactDOM.render(
  <Provider store={store}>
    <HashRouter>
      <App>
        <Route exact path='/' component={BaseComponentContainer} />
        <Route exact path='/status' component={StatusPage} />
      </App>
    </HashRouter>
  </Provider>, 
  rootElement
);

const sessionToken = Cookies.get('sessionToken');

store.dispatch(validateSession(sessionToken));
