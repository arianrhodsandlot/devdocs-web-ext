var categories
var entries

var getCagegories = function(cookies) {
  var result
  if (cookies) {
    result = cookies.split('/')
  }

  result = result && result.length ?
    result :
    ['css', 'dom', 'dom_events', 'html', 'http', 'javascript']

  categories = result
}

var syncEntries = function() {
  console.log('selecting these categories...')
  console.log(categories && categories.join())
  var promises = _.map(categories, function(category) {
    var hosts = 'http://maxcdn-docs.devdocs.io'
    var path = '/' + category + '/index.json'
    return $.ajax(hosts + path)
  })

  $.when
    .apply($, promises)
    .done(function() {
      entries = categories.length > 1 ? _(arguments)
        .map(function(result, index) {
          return _.map(result[0].entries, function(entry) {
            return _.extend(entry, {
              category: categories[index]
            })
          })
        })
        .flatten()
        .value() :
        _.map(arguments[0].entries, function(entry) {
          return _.extend(entry, {
            category: categories[0]
          })
        })
    });
}

chrome.cookies.get({
  url: 'http://devdocs.io',
  name: 'docs'
}, function(docs) {
  getCagegories(docs ? docs.value : '')

  syncEntries()

  chrome.runtime.onMessage
    .addListener(function(message, sender, sendResponse) {
      var response
      message = message.toLowerCase()
      response = message ?
        _.filter(entries, function(entry) {
          var reg = new RegExp(_.reduce(message, function(prev, current) {
            if (/\.|\(|\)/.test(current)) {
              return prev
            } else {
              return prev + current + '.*'
            }
          }, '.*'), 'i')
          return _.contains(entry.category.toLowerCase() + entry.name.toLowerCase(), message) ||
            reg.test(entry.category + entry.name)
        }) :
        []
      sendResponse(response)
    });
})

chrome.cookies.onChanged
  .addListener(_.debounce(function(changeInfo) {
    if (changeInfo.cookie.domain === 'devdocs.io' &&
      changeInfo.cookie.name === 'docs') {
      getCagegories(changeInfo.cookie.value)
      syncEntries()
    }
  }, 100))
