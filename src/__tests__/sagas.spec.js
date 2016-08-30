import expect from 'expect'
import { call, take, put, fork } from 'redux-saga/effects'

import { REQUEST_PAGE } from '../actionTypes'
import {
    requestPage,
    receivePage
} from '../actions'
import {
  fetchPage as fetchPageRequest,
  FROM_CACHE_FLAG
} from '../agent'
import {
    requestPageWatcher,
    fetchPage
} from '../sagas'


describe('request page watcher', () => {

  it('should watch for every REQUEST_PAGE action and fork the fetchPage saga', () => {
    const saga = requestPageWatcher()
    let next = saga.next()
    expect(next.value).toEqual(take(REQUEST_PAGE))

    next = saga.next(requestPage('endpoint', 'name', { id: undefined, fooField: undefined }, 'resultsKey', 'countKey', 'p', 'id', 'page', 'params'))
    expect(next.value).toEqual(fork(fetchPage, 'endpoint', 'name', { id: undefined, fooField: undefined }, 'resultsKey', 'countKey', 'p', 'id', 'page', 'params'))

    next = saga.next()
    expect(next.value).toEqual(take(REQUEST_PAGE))
  })

})

describe('fetch page saga', () => {

  it('should fetch the page and put the receive page action', () => {
    const saga = fetchPage('endpoint', 'name', { id: undefined, fooField: undefined }, 'resultsKey', 'countKey', 'p', 'id', 'page', 'params')
    let response = {
      resultsKey: [ 'foo', 'bar' ],
      countKey: 42
    }

    let next = saga.next()
    expect(next.value).toEqual(call(fetchPageRequest, 'endpoint', 'p', 'page', 'params'))

    next = saga.next({ response, [FROM_CACHE_FLAG]: null })
    expect(next.value)
      .toEqual(put(receivePage('endpoint', 'name', { id: undefined, fooField: undefined }, 'p', 'id', 'page', 'params', [ 'foo', 'bar' ], 42, response, true)))
  })

})
