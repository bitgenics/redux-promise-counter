function isPromise(thing) {
  return thing && thing.then && typeof thing.then === 'function';
}

function createPromiseCounter(callback) {
  return ({ getState }) => {
    let pendingPromises = 0;
    let timeout;

    const checkPromises = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (pendingPromises < 1) {
          callback(getState());
        }
      }, 0);
    };
    checkPromises();
    return next => (action) => {
      const retval = next(action);

      const promiseFulfill = () => {
        pendingPromises -= 1;
        checkPromises();
      };

      if (isPromise(retval)) {
        pendingPromises += 1;
        retval.then(promiseFulfill, promiseFulfill);
      }
      return retval;
    };
  };
}

export default createPromiseCounter;
