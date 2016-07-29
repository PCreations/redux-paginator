import expect from 'expect'

import {
  requestPage
} from '../actions'
import {
  onlyForEndpoint,
  requestPageActionCreatorForEndpoint,
  getRequestPageActionCreatorsFor,
  createPaginator
} from '../createPaginator'


describe('onlyForEndpoint', () => {

  it('should apply the provided reducer if actions meta endpoint is the same than the provided endpoint', () => {
    const fooReducer = () => ({
      foo: 'bar'
    })
    const endpoint = 'some/endpoint/'
    const fooAction = {
      type: 'FOO',
      meta: {
        endpoint
      }
    }
    const state = onlyForEndpoint(endpoint, fooReducer)(undefined, fooAction)
    expect(state)
      .toEqual({
        foo: 'bar'
      })
  })

  it('should NOT apply the provided reducer if actions meta endpoint differs from the provided one', () => {
    const fooReducer = () => ({
      foo: 'bar'
    })
    const endpoint = 'some/endpoint/'
    const fooAction = {
      type: 'FOO',
      meta: {
        endpoint: 'some/other/endpoint/'
      }
    }
    const state = onlyForEndpoint(endpoint, fooReducer)(undefined, fooAction)
    expect(state)
      .toEqual({})
  })

})

describe('requestPageActionCreatorForEndpoint', () => {

  it('should create an action creator for provided options', () => {
    const actionCreator = requestPageActionCreatorForEndpoint(
      'some/endpoint/',
      'some name',
      'p',
      'id',
      { id: undefined, fooField: undefined },
      'results',
      'count'
    )
    const action = actionCreator(2, 'foo=bar')
    expect(action)
      .toEqual(requestPage(
        'some/endpoint/',
        'some name',
        { id: undefined, fooField: undefined },
        'results',
        'count',
        'p',
        'id',
        2,
        'foo=bar'
      ))
  })

})

describe('getRequestPageActionCreatorsFor', () => {

  it('should create action creators for the given endpoint, pageNameArg and names', () => {
    const actionCreators = getRequestPageActionCreatorsFor(
      'some/api/endpoint/',
      [ 'foo', 'bar' ],
      'p',
      'id',
      { id: undefined, fooField: undefined },
      'results',
      'count'
    )
    const actionForFoo = actionCreators.foo.requestPage(42, 'foo=bar')
    const actionForBar = actionCreators.bar.requestPage(17, 'bar=foo')
    expect(actionForFoo)
      .toEqual(requestPage(
        'some/api/endpoint/',
        'foo',
        { id: undefined, fooField: undefined },
        'results',
        'count',
        'p',
        'id',
        42,
        'foo=bar'
      ))
    expect(actionForBar)
      .toEqual(requestPage(
        'some/api/endpoint/',
        'bar',
        { id: undefined, fooField: undefined },
        'results',
        'count',
        'p',
        'id',
        17,
        'bar=foo'
      ))
  })

})

describe('createPaginator', () => {

  it('should create correct request action creator', () => {
    const paginator = createPaginator('some/api/endpoint', [ 'foo' ], {
      initialItem: { id: undefined, fooField: undefined },
      pageArgName: 'p',
      idKey: 'id_field',
      resultsKey: 'results',
      countKey: 'count'
    })
    const action = paginator.foo.requestPage(42, 'foo=bar')
    expect(action)
      .toEqual(requestPage(
        'some/api/endpoint',
        'foo',
        { id: undefined, fooField: undefined },
        'results',
        'count',
        'p',
        'id_field',
        42,
        'foo=bar'
      ))
  })

})
