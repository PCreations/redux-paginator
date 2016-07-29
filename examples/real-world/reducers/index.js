import * as ActionTypes from '../actions'
import merge from 'lodash/merge'
import { routerReducer as routing } from 'react-router-redux'
import { combineReducers } from 'redux'
import {
  stargazersByRepoPaginator,
  starredByUserPaginator
} from '../paginators'

// Updates an entity cache in response to any action with response.entities.
function entities(state = { users: {}, repos: {} }, action) {
  if (action.response && action.response.entities) {
    return merge({}, state, action.response.entities)
  }

  return merge({}, state, {
    users: stargazersByRepoPaginator.itemsReducer(state.users, action),
    repos: starredByUserPaginator.itemsReducer(state.repos, action),
  })
}

// Updates error message to notify about the failed fetches.
function errorMessage(state = null, action) {
  const { type, error } = action

  if (type === ActionTypes.RESET_ERROR_MESSAGE) {
    return null
  } else if (error) {
    return action.error
  }

  return state
}

const rootReducer = combineReducers({
  entities,
  paginations: combineReducers({
    users: stargazersByRepoPaginator.reducers,
    repos: starredByUserPaginator.reducers
  }),
  errorMessage,
  routing
})

export default rootReducer
