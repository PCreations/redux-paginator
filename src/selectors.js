import pick from 'lodash.pick'

export const getCurrentPageNumber = (pagination, name) => {
  const currentPage = pagination.pages[pagination.currentPages[name]]
  return typeof currentPage == 'undefined' ? 1 : currentPage.number
}

export const getCurrentPageResults = (items, pagination, name) => {
  const currentPage = pagination.pages[pagination.currentPages[name]]
  return typeof currentPage == 'undefined' ? [] : Object.values(pick(items || [], currentPage.ids))
}

export const getAllResults = (items, pagination, name) => {
  const currentPage = pagination.pages[pagination.currentPages[name]]
  if (typeof currentPage == 'undefined') {
    return []
  }
  let allPagesKeys = Object.keys(pagination.pages)
  let allPagesIds = []
  for (let key of allPagesKeys) {
    if (pagination.pages[key].params == currentPage.params) {
      allPagesIds = allPagesIds.concat(pagination.pages[key].ids)
    }
  }
  return Object.values(pick(items || [], allPagesIds))
}

export const getCurrentTotalResultsCount = (pagination, name) => {
  const currentPageUrl = pagination.currentPages[name]
  const currentPage = pagination.pages[currentPageUrl]
  return typeof currentPageUrl == 'undefined' ? 0 :
    pagination.params[currentPage.params]
}

export const isCurrentPageFetching = (pagination, name) => (pagination.pages[pagination.currentPages[name]] || { fetching: true }).fetching
