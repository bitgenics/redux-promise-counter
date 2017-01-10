function isPromise(thing) {
  return thing && thing.then && typeof thing.then === 'function';
}

function createPromiseCounter(callback) {
  return ({ getState }) => {
    let pendingPromises = 0;
    // in case there are no promises we want to fire
    // the callback in the next Tick
    const timeout = setTimeout(() => {
      if (pendingPromises === 0) {
        callback(getState());
      }
    }, 0);
    return next => (action) => {
      const retval = next(action);

      const promiseFulfill = () => {
        pendingPromises -= 1;
        // console.log("Pending Promises: " + pendingPromises);
        if (pendingPromises < 1) {
          clearTimeout(timeout);
          callback(getState());
        }
      };

      if (isPromise(retval)) {
        pendingPromises += 1;
        // console.log("Pending Promises: " + pendingPromises);
        retval.then(promiseFulfill, promiseFulfill);
      }
      return retval;
    };
  };
}

export default createPromiseCounter;
