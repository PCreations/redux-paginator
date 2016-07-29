import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import Repo from '../components/Repo'
import User from '../components/User'
import List from '../components/List'
import { loadRepo, requestStargazersPage } from '../actions'
import {
    getCurrentPageNumber,
    getAllResults,
    getCurrentPageResults,
    isCurrentPageFetching
} from '../../../lib'

function loadData(props) {
  const { fullName } = props
  props.loadRepo(fullName, [ 'description' ])
  props.loadStargazers(1, `${props.fullName}/stargazers`)
}

class RepoPage extends Component {
  constructor(props) {
    super(props)
    this.renderUser = this.renderUser.bind(this)
    this.handleLoadMoreClick = this.handleLoadMoreClick.bind(this)
  }

  componentWillMount() {
    loadData(this.props)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.fullName !== this.props.fullName) {
      loadData(nextProps)
    }
  }

  handleLoadMoreClick() {
    this.props.loadStargazers(this.props.page + 1, `${this.props.fullName}/stargazers`)
  }

  renderUser(user) {
    return (
      <User user={{
              login: user.login,
              avatarUrl: user.avatar_url,
              name: user.name
            }}
            key={user.login} />
    )
  }

  render() {
    const { repo, owner, name } = this.props
    if (!repo || !owner) {
      return <h1><i>Loading {name} details...</i></h1>
    }

    return (
      <div>
        <Repo repo={repo}
                    owner={owner} />
        <hr />
        <List renderItem={this.renderUser}
              items={this.props.stargazers}
              onLoadMoreClick={this.handleLoadMoreClick}
              loadingLabel={`Loading stargazers of ${name}...`}
              pageCount={this.props.page}
              isFetching={this.props.isFetching}/>
      </div>
    )
  }
}

RepoPage.propTypes = {
  repo: PropTypes.object,
  fullName: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  owner: PropTypes.object,
  stargazers: PropTypes.array.isRequired,
  loadRepo: PropTypes.func.isRequired,
  loadStargazers: PropTypes.func.isRequired
}

function mapStateToProps(state, ownProps) {
  // We need to lower case the login/name due to the way GitHub's API behaves.
  // Have a look at ../middleware/api.js for more details.
  const login = ownProps.params.login.toLowerCase()
  const name = ownProps.params.name.toLowerCase()

  const {
    paginations: { ['users']: usersPagination },
    entities: { users, repos }
  } = state

  const isFetching = isCurrentPageFetching(usersPagination, 'stargazers')
  const stargazers = getAllResults(users, usersPagination, 'stargazers')
  const currentPageResults = getCurrentPageResults(users, usersPagination, 'stargazers')
  const page = currentPageResults.length > 0 ? getCurrentPageNumber(usersPagination, 'stargazers') : 0

  const fullName = `${login}/${name}`

  return {
    page,
    isFetching,
    fullName,
    name,
    stargazers,
    repo: repos[fullName],
    owner: users[login]
  }
}

function mapDispatchToProps(dispatch, ownProps) {

  return {
    loadStargazers(page, params) {
      dispatch(requestStargazersPage(page, params))
    },
    loadRepo(fullName, fields) {
      dispatch(loadRepo(fullName, fields))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(RepoPage)
