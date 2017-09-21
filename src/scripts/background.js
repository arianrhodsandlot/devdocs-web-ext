/* global _, chrome */
let log = function(msg) {
  return function(x) {
    console.log(msg)
    return x
  }
}
let getCategoriesFromCookie = function(cookie) {
  let defaultCategories = ['css', 'dom', 'dom_events', 'html', 'http', 'javascript']
  return _.get(cookie, 'value') ?
    cookie.value.split('/') :
    defaultCategories
}
let getQueryFromCategory = function(category) {
  let hosts = 'http://maxcdn-docs.devdocs.io'
  let path = '/' + category + '/index.json'
  return $.ajax(hosts + path)
}
let getQueriesFromCookie = _.compose(
  log('Fetching documents\'s entries...'),
  _.partial(_.map, _, getQueryFromCategory),
  getCategoriesFromCookie
)
let processPromise = function(queryWidhCategory) {
  let query = _.first(queryWidhCategory)
  let category = _.last(queryWidhCategory)
  let getExtendedEntry = function(entry) {
    return _.assign(entry, {
      category: category
    })
  }
  let getEntriesFromRes = function(res) {
    return _.map(res.entries, getExtendedEntry)
  }
  return query.then(getEntriesFromRes)
}

let getQueriesWithCategories = function(cookie) {
  return _.zip(
    getQueriesFromCookie(cookie),
    getCategoriesFromCookie(cookie)
  )
}

let getChars = function(str) {
  let words = _.trim(str).toLowerCase().match(/\w+/g)
  if (!words || words.length === 0) {
    return ''
  }
  return words.join('')
}
let getRegFromQuery = _.compose(
  _.partial(RegExp, _, 'i'),
  _.partial(_.reduce, _, function(prev, current) {
    return prev + (
      /\.|\(|\)/.test(current) ?
      '' :
      (current + '.*')
    )
  }, '.*')
)
let getEntryScore = function(entry, query) {
  let name = getChars(entry.name)
  let fullName = entry.category + name
  let testName = _.bind(RegExp.prototype.test, getRegFromQuery(query))

  if (name === query) {
    return 0
  } else if (fullName === query) {
    return 1
  } else if (_.contains(name, query)) {
    return 2
  } else if (_.contains(fullName, query)) {
    return 3
  } else if (testName(name)) {
    return 4
  } else if (testName(fullName)) {
    return 5
  } else {
    return NaN
  }
}

let getScore = _.partial(_.get, _, 'score')
let getSearcher = function(entries) {
  return _.memoize(function(query) {
    console.log('searching for ' + query)
    let addEntryScore = function(entry) {
      return _.assign(entry, {
        score: getEntryScore(entry, query)
      })
    }
    return _.compose(_.isEmpty, getChars)(query) ?
      null :
      _.sortBy(
        _.filter(
          _.map(entries, addEntryScore),
          _.compose(_.negate(_.isNaN), getScore)
        ),
        getScore
      )
  })

}
let getmsghandler = function(searcher) {
  return function(message, sender, sendResponse) {
    console.log('msg is coming')
    const response = _.compose(searcher, getChars)(message)
    return sendResponse(response ? response.slice(0, 100) : response)
  }
}
let getpromises = function(cookie) {
  return _.map(getQueriesWithCategories(cookie), processPromise)
}
let startlisten = function(cookie) {
  return $.when.apply($, getpromises(cookie)).then(function() {
    let listener = _.compose(getmsghandler, getSearcher, _.flatten)(arguments)
    chrome.runtime.onMessage.addListener(listener)
    return listener
  })
}

let listenpromise

chrome.cookies.get({
  url: 'http://devdocs.io',
  name: 'docs'
}, function(cookie) {
  listenpromise = startlisten(cookie)
})

chrome.cookies.onChanged.addListener((function(changeInfo) {
  let cookie = changeInfo.cookie
  if (cookie.name !== 'docs') return
  if (!_.includes(['devdocs.io', '.devdocs.io'], cookie.domain)) return

  console.log('Cookie is changed to ' + cookie.value + '!')
  listenpromise.then(_.bind(chrome.runtime.onMessage.removeListener, chrome.runtime.onMessage))
  listenpromise = startlisten(cookie)
}))

//open a welcome page after install
if (_.any([localStorage.install_time, localStorage.version], _.isUndefined)) {
  chrome.tabs.create({
    url: 'pages/options.html#welcome'
  })
}

_.assign(localStorage, {
  version: '0.1.4',
  install_time: _.now(),
  theme: 'light',
  width: 600,
  height: 600
})
