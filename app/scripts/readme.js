var template = document.getElementById('template').innerHTML
var html = _.template(template)({
  readme: chrome.i18n.getMessage('readme'),
  p1: chrome.i18n.getMessage('p1'),
  p2: chrome.i18n.getMessage('p2'),
  p4: chrome.i18n.getMessage('p4'),
  p3: chrome.i18n.getMessage('p3')
})
document.body.innerHTML = html
document.title = chrome.i18n.getMessage('readme')
