import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import { BaseComponentContainer } from './components/base-component';
import { StatusPage } from './components/status/status-page';
import thunkMiddleware from 'redux-thunk';
import createLogger from 'redux-logger';
import { createStore, applyMiddleware, compose } from 'redux';
import rootReducer from './root-reducer';
import {Provider} from 'react-redux';
import {Router, Route, hashHistory} from 'react-router';
import App from './components/app';
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

const routes = (
  <Route component={App}>
    <Route path='/' component={BaseComponentContainer} />
    <Route path='/status' component={StatusPage} />
  </Route>
);

const rootElement = document.getElementById('app');

ReactDOM.render(
  <Provider store={store}>
    <Router history={hashHistory}>{routes}</Router>
  </Provider>, 
  rootElement
);

const sessionToken = Cookies.get('sessionToken');

store.dispatch(validateSession(sessionToken));
