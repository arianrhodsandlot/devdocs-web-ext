/* global _, chrome */
chrome.cookies.get({
  url: 'http://devdocs.io',
  name: 'docs'
}, function(docsCookies) {
  var getCategoriesFromCookies = _.memoize(function(cookies) {
    var defaultCategories = ['css', 'dom', 'dom_events', 'html', 'http', 'javascript']
    return cookies ? cookies.split('/') : defaultCategories
  })

  var getQueryFromCategory = function(category) {
    var hosts = 'http://maxcdn-docs.devdocs.io'
    var path = '/' + category + '/index.json'
    return $.ajax(hosts + path)
  }

  var getQueriesFromCategories = _.partial(_.map, _, getQueryFromCategory)

  var getQueriesFromCookies = _.compose(getQueriesFromCategories, getCategoriesFromCookies)

  var getCategory = function(category) {
    return {
      category: category
    }
  }

  var queries = getQueriesFromCookies(docsCookies)
  var categories = getCategoriesFromCookies(docsCookies)
  var queriesWithCategories = _.zip(queries, categories)

  _.map(queriesWithCategories, function(queryWidhCategory) {
    var query = _.first(queryWidhCategory)
    var category = _.last(queryWidhCategory)

    query
      .then(function(res) {
        var entries = res.entries
        var getExtendedEntry = _.compose(function(o) {
          return function(p) {
            return _.assign(o, p)
          }
        }, getCategory)(category)
        return _.map(entries, getExtendedEntry)
      })
  })

  $.when(queries)
    .then(function(a) {
      console.log(a)
    })

  // send search results to popup page
  chrome.runtime.onMessage
    .addListener(function(message, sender, sendResponse) {
      var response

      var getChars = function(str) {
        var words
        str = _.trim(str)
        words = str.toLowerCase().match(/\w+/g)
        if (!words || words.length === 0) {
          return ''
        }
        return words.join('')
      }

      var query = getChars(message)

      if (query === '') {
        response = []
      } else if (cache[query]) {
        response = cache[query]
      } else {
        var reg = new RegExp(_.reduce(query, function(prev, current) {
          if (/\.|\(|\)/.test(current)) {
            return prev
          } else {
            return prev + current + '.*'
          }
        }, '.*'), 'i')

        response = _(_.clone(entries, true))
          .map(function(entry) {
            entry.query = query
            return entry
          })
          .reject(function(entry) {
            var name = getChars(entry.name)
            var category = getChars(entry.category)

            if (name === entry.query) {
              entry.score = 10
              entry.partten = name + ',' + entry.query
            } else if (name.indexOf(entry.query) > -1) {
              entry.score = 9
              entry.partten = name + ',' + entry.query
            } else if ((category + name).indexOf(entry.query) > -1) {
              entry.score = 8
              entry.partten = category + name + ',' + entry.query
            } else if (reg.test(category + name)) {
              entry.score = 7
              entry.partten = reg + ',' + category + name
            }

            return _.isUndefined(entry.score)
          })
          .value()

        response = _.sortBy(response, function(entry) {
          return -entry.score
        })

        cache[query] = response
      }

      sendResponse(response)
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
