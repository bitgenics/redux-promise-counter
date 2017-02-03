import createPromiseCounter from '../src/index';

/* eslint-disable no-undef */

test('Calls next() with action', () => {
  const action = { action: 'blah' };
  const callback = jest.fn();
  const getState = jest.fn();
  const next = jest.fn();
  const promiseCounter = createPromiseCounter(callback)({ getState })(next);
  promiseCounter(action);
  expect(next).toHaveBeenCalledWith(action);
});

test('Returns null on null return value', () => {
  const action = { action: 'blah' };
  const callback = jest.fn();
  const getState = jest.fn();
  const next = jest.fn();
  next.mockReturnValue(null);
  const promiseCounter = createPromiseCounter(callback)({ getState })(next);
  expect(promiseCounter(action)).toBe(null);
});

test('Returns exact same non-Promise values as return value from next(action)', () => {
  const next = jest.fn();
  const retval = { retval: 'Stuff' };
  next.mockReturnValue(retval);
  const promiseCounter = createPromiseCounter(jest.fn())({ getState: jest.fn() })(next);
  expect(promiseCounter({ action: 'blah' })).toBe(retval);
});

test('Call callback next tick if no pending promises', () => {
  jest.useFakeTimers();
  const callback = jest.fn();
  const getState = jest.fn();
  const state = { state: 'Stuff' };
  getState.mockReturnValue(state);
  const promiseCounter = createPromiseCounter(callback)({ getState })(jest.fn());
  promiseCounter({ action: 'blah' });
  expect(callback).not.toHaveBeenCalled();
  jest.runTimersToTime(0);
  expect(callback).toHaveBeenCalledWith(state);
});

test('Call callback when one promise succeeds', () => {
  jest.useRealTimers();
  const callback = jest.fn();
  const promise = new Promise((resolve) => {
    setTimeout(() => { resolve('Stuff!'); }, 20);
  });
  const next = jest.fn(() => promise);
  const state = { state: 'Stuff' };
  const getState = jest.fn(() => state);
  const promiseCounter = createPromiseCounter(callback)({ getState })(next);
  promiseCounter({ action: 'blah' });
  expect(callback).not.toHaveBeenCalled();
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve('s');
    }, 30);
  }).then(() => { expect(callback).toHaveBeenCalledWith(state); });
});

test('Call callback when one promise rejects', () => {
  jest.useRealTimers();
  const callback = jest.fn();
  const promise = new Promise((resolve, reject) => {
    setTimeout(() => { reject(Error('Stuff!')); }, 20);
  });
  const next = jest.fn(() => promise);
  const state = { state: 'Stuff' };
  const getState = jest.fn(() => state);
  const promiseCounter = createPromiseCounter(callback)({ getState })(next);
  promiseCounter({ action: 'blah' });
  expect(callback).not.toHaveBeenCalled();
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve('s');
    }, 30);
  }).then(() => { expect(callback).toHaveBeenCalledWith(state); });
});

// Due to the asynchronous nature, if these tests fail they time out
// but not with the correct assertion.
test('Call callback once after all promises have fulfilled', (done) => {
  jest.useRealTimers();
  const callback = jest.fn();
  const promise1 = new Promise((resolve) => {
    setTimeout(() => { resolve('Stuff!'); }, 10);
  });
  const promise2 = new Promise((resolve) => {
    setTimeout(() => { resolve('Good!'); }, 20);
  });
  const next = jest.fn();
  next.mockReturnValueOnce(promise1).mockReturnValueOnce(promise2);
  const state = { state: 'Stuff' };
  const getState = jest.fn(() => state);
  const promiseCounter = createPromiseCounter(callback)({ getState })(next);
  promiseCounter({ action: 'blah' });
  promiseCounter({ action: 'bbbb' });
  expect(callback).not.toHaveBeenCalled();
  setTimeout(() => {
    expect(callback).not.toHaveBeenCalled();
  }, 15);
  setTimeout(() => {
    expect(callback).toHaveBeenCalledWith(state);
    done();
  }, 25);
});

// Due to the asynchronous nature, if these tests fail they time out
// but not with the correct assertion.
test('Call callback once after all sequential promises have fulfilled', (done) => {
  jest.useRealTimers();
  const callback = jest.fn();
  const promise1 = new Promise((resolve) => {
    setTimeout(() => { resolve('Stuff!'); }, 10);
  }).then(() => {
    new Promise((resolve) => {  // eslint-disable-line no-new
      setTimeout(() => { resolve('Good!'); }, 10);
    });
  });
  const next = jest.fn();
  next.mockReturnValueOnce(promise1);
  const state = { state: 'Stuff' };
  const getState = jest.fn(() => state);
  const promiseCounter = createPromiseCounter(callback)({ getState })(next);
  promiseCounter({ action: 'blah' });
  promiseCounter({ action: 'bbbb' });
  expect(callback).not.toHaveBeenCalled();
  setTimeout(() => {
    expect(callback).not.toHaveBeenCalled();
  }, 15);
  setTimeout(() => {
    expect(callback).toHaveBeenCalledWith(state);
    done();
  }, 25);
});
/* eslint-enable no-undef */
