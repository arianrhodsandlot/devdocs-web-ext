/* global _, chrome */
chrome.cookies.get({
  url: 'http://devdocs.io',
  name: 'docs'
}, function(docsCookies) {
  var getCategoriesFromCookies = _.memoize(function(cookies) {
    var defaultCategories = ['css', 'dom', 'dom_events', 'html', 'http', 'javascript']
    return _.get(cookies, 'value') ? cookies.value.split('/') : defaultCategories
  })
  var getQueryFromCategory = function(category) {
    var hosts = 'http://maxcdn-docs.devdocs.io'
    var path = '/' + category + '/index.json'
    return $.ajax(hosts + path)
  }
  var getQueriesFromCategories = _.partial(_.map, _, getQueryFromCategory)
  var getQueriesFromCookies = _.compose(getQueriesFromCategories, getCategoriesFromCookies)
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
  var queriesWithCategories = _.zip(getQueriesFromCookies(docsCookies),getCategoriesFromCookies(docsCookies))
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
      return prev + /\.|\(|\)/.test(current) ? '' : (current + '.*')
    }, '.*')
  )

  $.when.apply($, _.map(queriesWithCategories, processPromise))
    .then(function(){
      return _.flatten(arguments)
    })
    .then(function(entries) {
      var search = _.memoize(function(query) {
        var testName = _.bind(RegExp.prototype.test, getRegFromQuery(query))

        var getEntryScore = function(entry) {
          var name = getChars(entry.name)
          var fullName = entry.category + name

          if (name === query) {
            return 10
          } else if (fullName === query) {
            return 9
          } else if (_.contains(name, query)) {
            return 8
          } else if (_.contains(fullName, query)) {
            return 7
          } else if (testName(name)) {
            return 6
          } else if (testName(fullName)) {
            return 5
          } else {
            return 0
          }
        }
        var addEntryScore = function(entry) {
          return _.assign(entry, {
            score: getEntryScore(entry)
          })
        }

        return _.compose(_.isEmpty, getChars)(query) ?
          null :
          _.sortBy(
            _.filter(
              _.map(entries, addEntryScore),
              'score'
            ),
            _.partial(_.get, _, 'score')
          )
      })

      chrome.runtime.onMessage
        .addListener(function(message, sender, sendResponse) {
          return _.compose(sendResponse, search, getChars)(message)
        })
    })
})

chrome.cookies.onChanged
  .addListener(_.debounce(function(changeInfo) {
    try {
      if (changeInfo.cookie.domain === 'devdocs.io' &&
        changeInfo.cookie.name === 'docs') {
        getCategories(changeInfo.cookie.value)
        syncEntries()
      }
    } catch (e) {
      console.error(e)
    }
  }, 100))


//open a welcome page after install
if (!localStorage.getItem('install_time') ||
  !localStorage.getItem('version')) {

  localStorage.setItem('install_time', _.now())
  localStorage.setItem('version', '0.1.0')

  chrome.tabs.create({
    url: 'pages/build/options.html#welcome'
  })
}

if (!localStorage.getItem('theme')) {
  localStorage.setItem('theme', 'light')
}

if (!localStorage.getItem('width')) {
  localStorage.setItem('width', 600)
}

if (!localStorage.getItem('height')) {
  localStorage.setItem('height', 600)
}
