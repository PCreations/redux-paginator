import expect from 'expect'

import { buildSuffix } from '../agent'


describe('buildSuffix', () => {

  it('should correctly build the url suffix when simple params are provided', () => {
    expect(buildSuffix('p', 1, 'foo=bar'))
      .toEqual('?foo=bar&p=1')
  })

  it('should correctly build the url suffix when less simple params are provided', () => {
    expect(buildSuffix('p', 1, 'foo=bar&baz=foo'))
      .toEqual('?baz=foo&foo=bar&p=1')
  })

  it('should correctly build the url suffix when params contains no extractable query params', () => {
    expect(buildSuffix('p', 1, 'foo/bar'))
      .toEqual('foo/bar?p=1')
  })

  it('should correctly build the url suffix when "params" is not provided', () => {
    expect(buildSuffix('p', 1, ''))
      .toEqual('?p=1')
  })

  it('should correctly build the url suffix when complex params are provided', () => {
    expect(buildSuffix('p', 1, 'foo/bar?bar=biz&baz=foo'))
      .toEqual('foo/bar?baz=foo&bar=biz&p=1')
  })

})
