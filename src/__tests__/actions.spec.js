import expect from 'expect'
import expectPredicate from 'expect-predicate'
import { isFSA } from 'flux-standard-action'

import {
  receivePage,
  requestPage
} from '../actions'
import {
  RECEIVE_PAGE,
  REQUEST_PAGE
} from '../actionTypes'

expect.extend(expectPredicate)


describe('actions', () => {

  it('should create receive page action', () => {
    expect(receivePage('some/api/endpoint/', 'name', { id: undefined, fooField: undefined }, 'p', 'id', 2, 'foo=bar', [ 'foo','bar','baz' ], 42))
      .toEqual({
        type: RECEIVE_PAGE,
        meta: {
          endpoint: 'some/api/endpoint/',
          name: 'name',
          initialItem: {
            id: undefined,
            fooField: undefined
          },
          pageArgName: 'p',
          idKey: 'id',
          fromCache: false,
        },
        payload: {
          params: 'foo=bar',
          page: 2,
          items: [ 'foo','bar','baz' ],
          count: 42,
          raw: undefined
        }
      })
      .toPass(isFSA)
  })

  it('should create request page action', () => {
    expect(requestPage('some/api/endpoint/', 'name', { id: undefined, fooField: undefined }, 'results', 'count', 'p', 'id', 2, 'foo=bar', { 'Accept': 'application/json' }))
      .toEqual({
        type: REQUEST_PAGE,
        meta: {
          endpoint: 'some/api/endpoint/',
          name: 'name',
          initialItem: {
            id: undefined,
            fooField: undefined
          },
          resultsKey: 'results',
          countKey: 'count',
          pageArgName: 'p',
          idKey: 'id',
          headers: { 'Accept': 'application/json' }
        },
        payload: {
          params: 'foo=bar',
          page: 2
        }
      })
      .toPass(isFSA)
  })

})
