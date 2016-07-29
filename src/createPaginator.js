import { combineReducers } from 'redux'

import {
  params as paramsReducer,
  pages as pagesReducer,
  currentPages as currentPagesReducer,
  items as itemsReducer
} from './reducers'
import { requestPage } from './actions'


export const onlyForEndpoint = (endpoint, reducer) => (state = {}, action = {}) =>
  typeof action.meta == 'undefined' ? state : action.meta.endpoint == endpoint ? reducer(state, action) : state


export const requestPageActionCreatorForEndpoint = (
  endpoint,
  name,
  pageArgName,
  idKey,
  initialItem,
  resultsKey,
  countKey
) =>
  (page, params) => requestPage(
    endpoint,
    name,
    initialItem,
    resultsKey,
    countKey,
    pageArgName,
    idKey,
    page,
    params
  )

export const getRequestPageActionCreatorsFor = (
  endpoint,
  names,
  pageArgName,
  idKey,
  initialItem,
  resultsKey,
  countKey
) => {
  let actions = {}
  for (let name of names) {
    actions = {
      ...actions,
      [name]: {
        requestPage:requestPageActionCreatorForEndpoint(
          endpoint,
          name,
          pageArgName,
          idKey,
          initialItem,
          resultsKey,
          countKey
        )
      }
    }
  }
  return actions
}

export const paginator = (itemsReducer, params, pages, currentPages, requestPageActionCreators) => ({
  reducers: combineReducers({
    params,
    pages,
    currentPages
  }),
  itemsReducer,
  ...requestPageActionCreators
})


export const createPaginator = (endpoint, names, {
  initialItem,
  resultsKey,
  countKey,
  pageArgName = 'page',
  idKey = 'id'
}) => {

  const params = onlyForEndpoint(endpoint, paramsReducer)

  const pages = onlyForEndpoint(endpoint, pagesReducer)

  const currentPages = onlyForEndpoint(endpoint, currentPagesReducer)

  const requestPageActionCreators = getRequestPageActionCreatorsFor(
    endpoint,
    names,
    pageArgName,
    idKey,
    initialItem,
    resultsKey,
    countKey
  )

  return paginator(itemsReducer, params, pages, currentPages, requestPageActionCreators)

}
