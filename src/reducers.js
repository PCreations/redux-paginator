import {
  REQUEST_PAGE,
  RECEIVE_PAGE
} from './actionTypes'
import { buildSuffix } from './agent'

const getPageUrlFromAction = ({ meta: { pageArgName }, payload: { params, page } }) =>
  buildSuffix(pageArgName, page, params)

export const params = (params = {}, action = {}) => {
  const { type, payload } = action
  switch (type) {
    case REQUEST_PAGE:
      return {
        ...params,
        [payload.params]: undefined
      }
    case RECEIVE_PAGE:
      return {
        ...params,
        [payload.params]: payload.count
      }
    default:
      return params
  }
}

export const pages = (pages = {}, action = {}) => {
  const { type, meta, payload } = action
  let pageUrl
  switch (type) {
    case REQUEST_PAGE:
      pageUrl = getPageUrlFromAction(action)
      return {
        ...pages,
        [pageUrl]: {
          ...pages[pageUrl],
          ids: [],
          params: payload.params,
          number: payload.page,
          fetching: true
        }
      }
    case RECEIVE_PAGE:
      pageUrl = getPageUrlFromAction(action)
      return {
        ...pages,
        [pageUrl]: {
          ...pages[pageUrl],
          ids: payload.items.map(i => i[meta.idKey]),
          fetching: false
        }
      }
    default:
      return pages
  }
}

export const currentPages = (currentPages = {}, action = {}) => {
  const { type, meta } = action
  let pageUrl
  switch (type) {
    case REQUEST_PAGE:
      pageUrl = getPageUrlFromAction(action)
      return {
        ...currentPages,
        [meta.name]: pageUrl
      }
    default:
      return currentPages
  }
}

export const items = (items = {}, action = {}) => {
  const { type, payload, meta } = action
  switch (type) {
    case RECEIVE_PAGE: {
      let _items = {}
      if (meta.fromCache === false) {
        for (let item of payload.items) {
          _items[item[meta.idKey]] = {
            ...meta.initialItem,
            ...item
          }
        }
      }
      return {
        ...items,
        ..._items
      }
    }
    default:
      return items
  }
}
