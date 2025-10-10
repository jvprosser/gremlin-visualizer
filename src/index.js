import React from 'react';
import ReactDOM from 'react-dom/client'; // 1. Changed import for React 18
import { configureStore } from '@reduxjs/toolkit'; // 2. Import from Redux Toolkit
import { createLogger } from 'redux-logger';
import { Provider } from 'react-redux';

import { reducer as gremlinReducer } from './reducers/gremlinReducer';
import { reducer as graphReducer } from './reducers/graphReducer';
import { reducer as optionReducer } from './reducers/optionReducer';
import { App } from './App';

// 3. configureStore replaces createStore, combineReducers, and composeEnhancers
const store = configureStore({
  reducer: {
    gremlin: gremlinReducer,
    graph: graphReducer,
    options: optionReducer,
  },
  // The logger is added to the default middleware (like thunk)
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(createLogger()),
});

// 4. Use the new React 18 root API
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>
    <App />
  </Provider>
);
