import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { loadUser, requestStarredPage } from '../actions'
import User from '../components/User'
import Repo from '../components/Repo'
import List from '../components/List'
import zip from 'lodash/zip'
import {
    getCurrentPageNumber,
    getAllResults,
    getCurrentPageResults,
    isCurrentPageFetching
} from '../../../lib'

function loadData(props) {
  const { login } = props
  props.loadUser(login, [ 'name' ])
  props.loadStarred(1, `${login}/starred`)
}

class UserPage extends Component {
  constructor(props) {
    super(props)
    this.renderRepo = this.renderRepo.bind(this)
    this.handleLoadMoreClick = this.handleLoadMoreClick.bind(this)
  }

  componentWillMount() {
    loadData(this.props)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.login !== this.props.login) {
      loadData(nextProps)
    }
  }

  handleLoadMoreClick() {
    this.props.loadStarred(this.props.page + 1, `${this.props.login}/starred`)
  }

  renderRepo(repo) {
    return (
      <Repo repo={repo}
            owner={repo.owner}
            key={repo.full_name} />
    )
  }

  render() {
    const { user, login } = this.props
    if (!user) {
      return <h1><i>Loading {login}’s profile...</i></h1>
    }

    const { starredRepos, starredRepoOwners, starredPagination } = this.props
    return (
      <div>
        <User user={user} />
        <hr />
        <List renderItem={this.renderRepo}
              items={starredRepos}
              onLoadMoreClick={this.handleLoadMoreClick}
              loadingLabel={`Loading ${login}’s starred...`}
              pageCount={this.props.page}
              isFetching={this.props.isFetching} />
      </div>
    )
  }
}

UserPage.propTypes = {
  login: PropTypes.string.isRequired,
  user: PropTypes.object,
  starredPagination: PropTypes.object,
  starredRepos: PropTypes.array.isRequired,
  starredRepoOwners: PropTypes.array.isRequired,
  loadUser: PropTypes.func.isRequired,
  loadStarred: PropTypes.func.isRequired
}

function mapStateToProps(state, ownProps) {
  // We need to lower case the login due to the way GitHub's API behaves.
  // Have a look at ../middleware/api.js for more details.
  const login = ownProps.params.login.toLowerCase()

  const {
    paginations: { ['repos']: reposPagination },
    entities: { users, repos }
  } = state

  const isFetching = isCurrentPageFetching(reposPagination, 'starred')
  const starredRepos = getAllResults(repos, reposPagination, 'starred')
  const currentPageResults = getCurrentPageResults(repos, reposPagination, 'starred')
  const page = currentPageResults.length > 0 ? getCurrentPageNumber(reposPagination, 'starred') : 0

  return {
    page,
    isFetching,
    starredRepos,
    login,
    repos,
    user: users[login]
  }
}

function mapDispatchToProps(dispatch, ownProps) {

  return {
    loadStarred(page, params) {
      dispatch(requestStarredPage(page, params))
    },
    loadUser(login, fields) {
      dispatch(loadUser(login, fields))
    }
  }

}

export default connect(mapStateToProps, mapDispatchToProps)(UserPage)
