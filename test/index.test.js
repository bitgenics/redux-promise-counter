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
  jest.runTimersToTime(1);
  expect(callback).toHaveBeenCalledWith(state);
});

test('Call callback when one promise succeeds', () => {
  jest.useRealTimers();
  const callback = jest.fn();
  const promise = new Promise((resolve) => {
    setTimeout(() => { resolve('Stuff!'); }, 50);
  });
  const next = jest.fn();
  next.mockReturnValue(promise);
  const getState = jest.fn();
  const state = { state: 'Stuff' };
  getState.mockReturnValue(state);
  const promiseCounter = createPromiseCounter(callback)({ getState })(next);
  promiseCounter({ action: 'blah' });
  expect(callback).not.toHaveBeenCalled();
  return promise.then(() => {
    expect(callback).toHaveBeenCalledWith(state);
  });
});

test('Call callback when one promise rejects', () => {
  jest.useRealTimers();
  const callback = jest.fn();
  const promise = new Promise((resolve, reject) => {
    setTimeout(() => { reject(Error('Stuff!')); }, 50);
  });
  const next = jest.fn(() => promise);
  const getState = jest.fn();
  const state = { state: 'Stuff' };
  getState.mockReturnValue(state);
  const promiseCounter = createPromiseCounter(callback)({ getState })(next);
  promiseCounter({ action: 'blah' });
  expect(callback).not.toHaveBeenCalled();
  return promise.then(null, () => {
    expect(callback).toHaveBeenCalledWith(state);
  });
});

test('Call callback once after all promises have fulfilled', () => {
  jest.useRealTimers();
  const callback = jest.fn();
  const promise1 = new Promise((_, reject) => {
    setTimeout(() => { reject(Error('Stuff!')); }, 50);
  });
  const promise2 = new Promise((resolve) => {
    setTimeout(() => { resolve('Good!'); }, 60);
  });
  const next = jest.fn();
  next.mockReturnValueOnce(promise1).mockReturnValueOnce(promise2);
  const getState = jest.fn();
  const state = { state: 'Stuff' };
  getState.mockReturnValue(state);
  const promiseCounter = createPromiseCounter(callback)({ getState })(next);
  promiseCounter({ action: 'blah' });
  expect(callback).not.toHaveBeenCalled();
  return Promise.all([promise1, promise2]).then(null, () => {
    expect(callback).toHaveBeenCalledWith(state);
  });
});
/* eslint-enable no-undef */
