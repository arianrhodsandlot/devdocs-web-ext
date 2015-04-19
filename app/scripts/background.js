var entries

var categories = ['jquery', 'lodash', 'express', 'angular']
var promises = _.map(categories, function(category) {
  var domain = 'http://maxcdn-docs.devdocs.io'
  var path = '/' + category + '/index.json'
  return $.ajax(domain + path)
})

$.when
  .apply($, promises)
  .done(function() {
    entries = _(arguments)
      .map(function(result, index) {
        return _.map(result[0].entries, function(entry) {
          return _.extend(entry, {
            category: categories[index]
          })
        })
      })
      .flatten()
      .value()
  });

chrome.runtime.onMessage
  .addListener(function(message, sender, sendResponse) {
    var response = message ?
      _.filter(entries, function(entry) {
        var reg = new RegExp(_.reduce(message, function(prev, current) {
          return prev + current + '.*'
        }, '.*'), 'i')
        return reg.test(entry.category + entry.name)
      }) :
      []
    sendResponse(response)
  });
