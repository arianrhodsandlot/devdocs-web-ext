var data = {
	a: 1,
	b: 2
}

$.when(
		$.ajax('http://maxcdn-docs.devdocs.io/jquery/index.json'),
		$.ajax('http://maxcdn-docs.devdocs.io/lodash/index.json'),
		$.ajax('http://maxcdn-docs.devdocs.io/express/index.json'),
		$.ajax('http://maxcdn-docs.devdocs.io/angular/index.json')
	)
	.done(function() {
		data = _(arguments)
			.map(function(result) {
				console.log(result[0])
				return result[0].entries
			})
			.flatten()
			.value()
	});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
	var response = message ? _.filter(data, function(entry) {
		var reg = new RegExp(_.reduce(message, function(prev, current) {
			return prev + current + '.*'
		}, '.*'), 'i')
		return reg.test(entry.name)
	}) : []
	sendResponse(response)
});
