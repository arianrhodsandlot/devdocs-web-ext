/* global _, chrome */
var log = function(msg) {
  return function(x) {
    console.log(msg)
    return x
  }
}
var getCategoriesFromCookie = function(cookie) {
  var defaultCategories = ['css', 'dom', 'dom_events', 'html', 'http', 'javascript']
  return _.get(cookie, 'value') ?
    cookie.value.split('/') :
    defaultCategories
}
var getQueryFromCategory = function(category) {
  var hosts = 'http://maxcdn-docs.devdocs.io'
  var path = '/' + category + '/index.json'
  return $.ajax(hosts + path)
}
var getQueriesFromCookie = _.compose(
  log('Fetching documents\'s entries...'),
  _.partial(_.map, _, getQueryFromCategory),
  getCategoriesFromCookie
)
var processPromise = function(queryWidhCategory) {
  var query = _.first(queryWidhCategory)
  var category = _.last(queryWidhCategory)
  var getExtendedEntry = function(entry) {
    return _.assign(entry, {
      category: category
    })
  }
  var getEntriesFromRes = function(res) {
    return _.map(res.entries, getExtendedEntry)
  }
  return query.then(getEntriesFromRes)
}

var getQueriesWithCategories = function(cookie) {
  return _.zip(
    getQueriesFromCookie(cookie),
    getCategoriesFromCookie(cookie)
  )
}

var getChars = function(str) {
  var words = _.trim(str).toLowerCase().match(/\w+/g)
  if (!words || words.length === 0) {
    return ''
  }
  return words.join('')
}
var getRegFromQuery = _.compose(
  _.partial(RegExp, _, 'i'),
  _.partial(_.reduce, _, function(prev, current) {
    return prev + (
      /\.|\(|\)/.test(current) ?
      '' :
      (current + '.*')
    )
  }, '.*')
)
var getEntryScore = function(entry, query) {
  var name = getChars(entry.name)
  var fullName = entry.category + name
  var testName = _.bind(RegExp.prototype.test, getRegFromQuery(query))

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

var getScore = _.partial(_.get, _, 'score')
var getSearcher = function(entries) {
  return _.memoize(function(query) {
    console.log('searching for ' + query)
    var addEntryScore = function(entry) {
      return _.assign(entry, {
        score: getEntryScore(entry, query)
      })
    }
    return _.compose(_.isEmpty, getChars)(query) ?
      null :
      _.sortBy(
        _.filter(
          _.map(entries, addEntryScore),
          _.compose(
            _.negate(_.isNaN),
            getScore
          )
        ),
        getScore
      )
  })

}
var getmsghandler = function(searcher) {
  return function(message, sender, sendResponse) {
    console.log('msg is coming')
    return _.compose(sendResponse, searcher, getChars)(message)
  }
}
var getpromises = function(cookie) {
  return _.map(getQueriesWithCategories(cookie), processPromise)
}
var startlisten = function(cookie) {
  return $.when.apply($, getpromises(cookie)).then(function() {
    var listener = _.compose(getmsghandler, getSearcher, _.flatten)(arguments)
    chrome.runtime.onMessage.addListener(listener)
    return listener
  })
}

var listenpromise

chrome.cookies.get({
  url: 'http://devdocs.io',
  name: 'docs'
}, function(cookie) {
  listenpromise = startlisten(cookie)
})

chrome.cookies.onChanged.addListener(_.debounce(function(changeInfo) {
  var cookie = changeInfo.cookie
  if (cookie.domain === 'devdocs.io' && cookie.name === 'docs') {
    console.log('Cookie is changed to ' + cookie.value + '!')
    listenpromise.then(_.bind(chrome.runtime.onMessage.removeListener, chrome.runtime.onMessage))
    listenpromise = startlisten(cookie)
  }
}, 500))

//open a welcome page after install
if (_.any([localStorage.install_time, localStorage.version], _.isUndefined)) {
  chrome.tabs.create({
    url: 'pages/build/options.html#welcome'
  })
}

_.assign(localStorage, {
  version: '0.1.0',
  install_time: _.now(),
  theme: 'light',
  width: 600,
  height: 600
})
