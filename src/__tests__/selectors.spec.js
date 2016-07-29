import expect from 'expect'

import {
  getCurrentPageNumber,
  getCurrentPageResults,
  getCurrentTotalResultsCount,
  getAllResults,
  isCurrentPageFetching
} from '../selectors'


const paginator = {
  params: {
    'foo=bar': 42,
    'foo=baz': 17
  },
  pages: {
    'foo=bar?page=1': {
      number: 1,
      params: 'foo=bar',
      ids: [ 1, 2, 3 ],
      fetching: false
    },
    'foo=bar?page=2': {
      number: 2,
      params: 'foo=bar',
      ids: [],
      fetching: true
    },
    'foo=bar?page=3': {
      number: 3,
      params: 'foo=bar',
      ids: [ 7, 8, 9 ]
    },
    'foo=baz?page=1': {
      number: 1,
      params: 'foo=baz',
      ids: [ 1, 4, 6 ],
      fetching: false
    }
  },
  currentPages: {
    name1: 'foo=bar?page=2',
    name2: 'foo=baz?page=1'
  }
}

const items = {
  1: 'foo1',
  2: 'foo2',
  3: 'foo3',
  4: 'foo4',
  5: 'foo5',
  6: 'foo6',
  7: 'foo7',
  8: 'foo8',
  9: 'foo9'
}

describe('selectors', () => {

  it('getCurrentPageNumber should select the current page number from pagination slice of state', () => {
    expect(getCurrentPageNumber(paginator, 'name1'))
      .toEqual(2)
  })

  it('getCurrentPageNumber should return 1 if the current page is not defined', () => {
    expect(getCurrentPageNumber(paginator, 'name3'))
      .toEqual(1)
  })

  it('getCurrentPageResults should select the items from the given items param corresponding to the current page for the provided name', () => {
    expect(getCurrentPageResults(items, paginator, 'name2'))
      .toEqual([ 'foo1', 'foo4', 'foo6' ])
  })

  it('getCurrentPageResults should return an empty array if current page for the provided name is undefined', () => {
    expect(getCurrentPageResults(items, paginator, 'name3'))
      .toEqual([])
  })

  it('getAllResults shoud select all the items ids for pages with same params than the current page', () => {
    expect(getAllResults(items, paginator, 'name1'))
      .toEqual([ 'foo1', 'foo2', 'foo3', 'foo7', 'foo8', 'foo9' ])
  })

  it('getCurrentTotalResultsCount should return the total count for the current params of the provided name', () => {
    expect(getCurrentTotalResultsCount(paginator, 'name2'))
      .toEqual(17)
  })

  it('getCurrentTotalResultsCount should return 0 if current page url is undefined for the provided name', () => {
    expect(getCurrentTotalResultsCount(paginator, 'name3'))
      .toEqual(0)
  })

  it('isCurrentPageFetching should return whether the current page is fetching or not for the provided name', () => {
    expect(isCurrentPageFetching(paginator, 'name1'))
      .toEqual(true)
  })
})
