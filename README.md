# redux-paginator
---

[![NPM Version](https://img.shields.io/npm/v/redux-paginator.svg?style=flat)](https://www.npmjs.com/package/redux-paginator)
[![NPM Downloads](https://img.shields.io/npm/dm/redux-paginator.svg?style=flat)](https://www.npmjs.com/package/redux-paginator)
[![Build Status](https://img.shields.io/travis/PCreations/redux-paginator/master.svg?style=flat)](https://travis-ci.org/PCreations/redux-paginator)
[![codecov.io](https://codecov.io/gh/PCreations/redux-paginator/coverage.svg?branch=master)](https://codecov.io/github/PCreations/redux-paginator?branch=master)

`redux-paginator` helps you deal with paginated API with [Redux](https://github.com/reactjs/redux) without the need to create new actions and reducers cases

## Installation
```npm install --save redux-paginator```

## Motivation

When dealing with server-side paginated API, I always find myself writting the same actions, reducers cases and selectors for the entities I'm dealing with. Furthemore, I sometime need to display the paginated result, and sometime the whole list of result (or a part of it that's not depending on pagination), so the pagination and the entities need to be managed through different reducers to keep the state normalized. To sum it up : **I should be able to add pagination to any non paginated redux app**. That's exactly what `redux-paginator` is made for.

## Usage

Let's start by an example, let's say we want to consume the TodoAPI, the main endpoint for retrieving all todos is...
```
GET /todos/
```

...with this response shape :
```
{
  results: [
    { id: todo1, text: 'some todo task 1' },
    { id: todo2, text: 'some todo task 2' },
    { id: todo3, text: 'some todo task 3' },
  ]
}
```

We want our reducers to reduce that response into this state shape :
```
state = {
  todos: {
    'todo1': {
      id: 'todo1',
      text: 'some todo task 1'
    },
    todo2': {
      id: 'todo2',
      text: 'some todo task 2'
    },
    'todo3': {
      id: 'todo3',
      text: 'some todo task 3'
    }
  }
}
```

We can handle that by this kind of reducer :
```
const todos = (todos = {}, action = {}) {
  switch (action.type) {
    case 'TODOS_RECEIVED':
      let _todos = {}
      for (let todo of action.results) {
        _todos = {
          ...todos,
          [todo.id]: todo
        }
      }
      return {
        ...todos,
        ..._todos
      }
    default:
      return todos
  }
}
```

So far so good ! But what if we receive hundreds or thousands of todos items from the api ? It's totally possible to paginate the results client-side, but for efficiency API often provides a paginated endpoint. Here is the one for the TodoAPI :
```
GET /todos/paginated/(?page=n)
```

With this response shape (for the call `/todos/paginated/?page=1`) :
```
{
  count: 42,  // the total number of todos
  results: [  // the todos for this page
    { id: todo1, text: 'some todo task 1' },
    { id: todo2, text: 'some todo task 2' },
    { id: todo3, text: 'some todo task 3' },
  ]
}
```


How to deal with this new endpoint ? We could edit our reducer and our actions to handle the pagination but what if we also need to access the previous endpoint ? With `redux-paginator` you can do that very easily by creating a `paginator`.

### Creating a paginator

We need a `paginator` to paginate our `todos`. Let's create it :
```
import { createPaginator } from 'redux-paginator'

const todosPaginator = createPaginator('/todos/paginated/', [ 'todos' ], {
  resultsKey: 'todos',
  countKey: 'count',
  pageArgName: 'page'
})
```

Ok, let's examinate the `createPaginator` function. It receives 3 arguments :
* **`endpoint`** : the paginated endpoint
* **`names`** *(array)* : an array of names. Lets you have multiple `currentPage` for the same endpoint, for example when dealing with many datatables on the same page with paginated items from the same base endpoint but with diffent params (more on this bellow). For now, we only need one paginated `todos` list at a time.
* **`options`** *(object)* : an object defining 4 options :
  - `resultsKey` defines the key to look for results in the response received from the api. If you omit this option, the paginator will look for results directly in the response (i.e, the response *is* the result array)
  - `countKey` defines the key to look for total count of items if provided by the api
  - `initialItem` defines the shape of your initial item in case you want additionnal fields to be present only on the client-side, we don't use it here but we could have passed a specific `todo` item shape defining some default value such as `{id: undefined, text: '', state: 'saved'}`. Used for reducing the response to your entities reducer. More on this bellow.

The created `paginator` object exposes these properties :
```
// the pagination reducers bound to the configuration provided above
todosPaginator.reducers

// an action creator that creates an action for requesting
// a page for the "todos" part of this paginator.
// An action creator is available for each "name" defined
// in the "names" argument of the createPaginator function
todosPaginator.todos.requestPage

// a reducer you need to compose to your entities reducer.
todosPaginator.itemsReducer
```

We now need to compose or actual `todos` reducer with the `todosPaginator.itemsReducer` created for us by `redux-paginator`. We simply do this by returning the results of this reducer in the `default` case instead of directly returning the `todos`:

```
const todos = (todos = {}, action = {}) {
  switch (action.type) {
    case 'TODOS_RECEIVED':
      let _todos = {}
      for (let todo of action.results) {
        _todos = {
          ...todos,
          [todo.id]: todo
        }
      }
      return {
        ...todos,
        ..._todos
      }
    default:
      return todosPaginator.itemsReducer(todos, action)
  }
}
```

You'll also need to add the `todosPaginator.reducers` to your root reducer :

```
export default combineReducers({
  todos,
  pagination: todosPaginator.reducers
})
```

And we're **done** ! There is nothing else to do in the reducer part.


### Add the `paginatorMiddleware` or fork the `requestPageWatcher` saga to enable `redux-paginator`

In order to `redux-paginator` to work properly, you need to add the `paginatorMiddleware` or if your prefer working with [`redux-saga`](https://github.com/yelouafi/redux-saga) you can use the `requestPageWatcher` instead. Both of them are available at the root :
```
import { paginatorMiddleware } from 'redux-paginator'
// or
import { requestPageWatcher } from 'redux-paginator'
```


### Requesting for a page

Remember the `requestPage` action creator provided by the paginator above ? Here is its signature :
* **`requestPage(page, params)`** : the `page` argument is the page number you're requesting and the `params` is a string that will be smartly appended to the `endpoint`
example:
```
todosPaginator.todos.requestPage(2)  // will request the page '/todos/paginated/?page=2'
todosPaginator.todos.requestPage(2, 'order=id&search=foo')  // =>  '/todos/paginated/?order=id&search=foo&page=2'
todosPaginator.todos.requestPage(2, 'popular/')  // => '/todos/paginated/popular/?page=2'
todosPaginator.todos.requestPage(2, 'popular/?order=id&search=foo')  // => '/todos/paginated/popular/?order=id&search=foo&page=2'
```

Internally, `redux-paginator` keeps an array of promises for each url, so a page already fetched is not fetched a second time.


### Using the selectors to display the data

Now you're probably wondering how you can effectively use these data ? Let's introduce the selectors ! `redux-paginator` exposes few useful selectors for you. Each one expect to receive as their first argument (or their second in case of two selectors) the slice of the state where you mount the paginator reducers. In our case, it's the `pagination` slice :
```
export default combineReducers({
  todos,
  pagination: todosPaginator.reducers  // 'pagination' is where we mount redux-paginator for todos endpoint
})
```

For all the above example, `state` is the whole state application, accessible in `mapStateToProps` for example if you use [`react-redux`](https://github.com/reactjs/react-redux). `'todos'` represents the only name we provided in the names array when creating our paginator.

* **`getCurrentPageNumber(pagination, name)`**
Selects the current page number for the given `pagination` slice of state and `name`.

example:
```
import { getCurrentPageNumber } from 'redux-paginator'
const pageNumber = getCurrentPageNumber(state.paginations, 'todos')
```
* **`getCurrentPageResults(items, pagination, name)`**
Selects the current page results given a list of items, a `pagination` slice of state and `name`.

example:
```
import { getCurrentPageResults } from 'redux-paginator'

const todosForCurrentPage = getCurrentPageResults(state.todos, state.pagination, 'todos')
```
* **`getAllResults(items, pagination, name)`**
Selects all the results up to the current page given a list of items, a `pagination` slice of state and `name`.

example:
```
import { getAllResults } from 'redux-paginator'

const allTodosUpToCurrentPage = getAllResults(state.todos, state.pagination, 'todos')
```
* **`getCurrentTotalResultsCount(pagination, name)`**
Selects the total results count for the the provided `pagination` and `name`. If the paginated API returns the total count of items available, you can use this value to generate the pagination UI.

example:
```
import { getCurrentTotalResultsCount } from 'redux-paginator'

const totalResultsCount = getCurrentTotalResultsCount(state.pagination, 'todos')
```

* **`isCurrentPageFetching(pagination, name)`**
Selects whether the current page is fetching or not. Usefull to display some visual information to the user.

example:
```
import { isCurrentPageFetching } from 'redux-paginator'

const isFetching = isCurrentPageFetching(state.pagination, 'todos')
```

### Usage with react

Take a look at the `examples` folder. The `real-world` example is exactly the same as the "official" one in the [redux repo](https://github.com/reactjs/redux/tree/master/examples/real-world) but implements pagination via `redux-paginator`. This example use [`normalizr`](https://github.com/paularmstrong/normalizr) but you're totally free to not use it.

```
git clone https://github.com/PCreations/redux-paginator.git
cd redux-paginator/examples/real-world
npm install
npm start
```
