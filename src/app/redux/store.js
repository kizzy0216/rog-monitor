import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import rootReducer from './reducers';
import { reactReduxFirebase, getFirebase } from 'react-redux-firebase';
import fbConfig from '../config/fbConfig';

// const firebaseMiddleware = thunk.withExtraArgument(getFirebase);
// const enhancer = compose(applyMiddleware(firebaseMiddleware));
// const store = createStore(rootReducer, enhancer);

const store = createStore(
  rootReducer,
  compose(
    applyMiddleware(thunk.withExtraArgument(getFirebase)),
    reactReduxFirebase(fbConfig)
  )
);

export default store;
