import {
  RECEIVE_PAGE,
  REQUEST_PAGE
} from './actionTypes'


export const requestPage = (
  endpoint,
  name,
  initialItem,
  resultsKey,
  countKey,
  pageArgName,
  idKey,
  page,
  params
) => ({
  type: REQUEST_PAGE,
  meta: {
    endpoint,
    name,
    initialItem,
    resultsKey,
    countKey,
    pageArgName,
    idKey
  },
  payload: {
    page,
    params
  }
})

export const receivePage = (
  endpoint,
  name,
  initialItem,
  pageArgName,
  idKey,
  page,
  params,
  items,
  count,
  fromCache = false
) => ({
  type: RECEIVE_PAGE,
  meta: {
    endpoint,
    name,
    initialItem,
    pageArgName,
    idKey,
    fromCache
  },
  payload: {
    page,
    params,
    items,
    count
  }
})
