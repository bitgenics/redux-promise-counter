# redux-promise-counter
Keep track of unresolved promises in Redux Actions. Useful for Server Side Rendering.

## Why redux-promise-counter

Server Side Rendering seems easy in React with the `renderToString` method, which renders our components to a String. But there is a catch, well 2 really.

There are 2 obstacles in real-world Server Side Rendering scenarios:
* Async actions
* Transferring state to the client

Now Redux has decent support for transferring state to the client, which leaves us with Asynchronous actions. That is what `redux-promise-counter` is for.

The problem with asynchronous actions is that if you do a `renderToString` none of your actions have had a chance to complete before rendering the output. So the HTML you are sending to the client will be the spinners, not the actual information they are after.

The idea behind `redux-promise-counter` is simple. It will keep track of all the promises that are kicked off by Redux Actions in combination with middleware like `redux-thunk`. When all of the actions are fulfilled a callback is called.

## Usage

### Installation
npm:
```
npm install redux-promise-counter
```

yarn:
```
yarn add redux-promise-counter
```

### Import

```javascript
import createPromiseCounter from 'redux-promise-counter'
```

### Use

```javascript
const promiseCounter = createPromiseCounter((state) => {
  // All promises are fulfilled, store is full.
  // Do your final rendering and send HTML & state to client.
})

// redux-promise-counter needs to be loaded before any async
// middleware such as redux-thunk
const middleware = [ promiseCounter, thunk ];

const store = createStore(
  reducer,
  applyMiddleware(...middleware)
);
```