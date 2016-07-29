import { createPaginator } from '../../../lib'

export const stargazersByRepoPaginator = createPaginator(
  'https://api.github.com/repos/',
  [ 'stargazers' ], {
    initialItem: {},
    pageArgName: 'page',
    idKey: 'login'
  }
)

export const starredByUserPaginator = createPaginator(
  'https://api.github.com/users/',
  [ 'starred' ], {
    initialItem: {},
    pageArgName: 'page',
    idKey: 'full_name'
  }
)
