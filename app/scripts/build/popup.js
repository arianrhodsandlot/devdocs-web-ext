/* global Backbone */
$(function() {
  var Entries = Backbone.Model.extend({
    fetch: function(query) {
      var that = this
      chrome.runtime.sendMessage(query, function(response) {
        if (response.length) {
          that.set(response)
        } else {
          that.clear()
        }
      })
    }
  })
  var entries = new Entries()

  var AppView = Backbone.View.extend({
    el: 'body',
    model: entries,
    events: {
      'input .input': 'search',
      'keydown .input': 'completeCategory',
      'keydown': 'pick'
    },
    initialize: function() {
      this.$input = $('.input')
      this.$results = $('.results')
      this.$splash = $('.splash')
    },
    search: function() {
      var query = this.$input.val()

      this.model.fetch(query)
      this.$splash[query ? 'add' : 'remove' + 'Class']('hidden')
    },
    completeCategory: function(e) { //to do
      return e.which !== 9
    },
    pick: function(e) {
      var keyCodes = {
        up: 38,
        down: 40,
        enter: 13
      };

      var $activeResult = this.$results.find('.active')
      var $firstResult = this.$results.find('.result:first')
      var $lastResult = this.$results.find('.result:last')
      var $nextResult = $activeResult.next()
      var $prevResult = $activeResult.prev()

      $nextResult = $nextResult.get(0) ? $nextResult : $firstResult
      $prevResult = $prevResult.get(0) ? $prevResult : $firstResult
      if (_.contains(_.values(_.pick(keyCodes, 'up', 'down')), e.which)) {
        $activeResult.removeClass('active')
        switch (e.which) {
          case 38:
            $prevResult.addClass('active')
            break
          case 40:
            $nextResult.addClass('active')
            break
        }
        return false
      } else if (e.which === keyCodes.enter) {
        resultsView.open()
        return false
      }
    }
  })

  var ResultsView = Backbone.View.extend({
    el: '.results',
    template: _.template($('.result-template').html()),
    model: entries,
    events: {
      'click .result': 'open'
    },
    initialize: function() {
      this.listenTo(this.model, 'change', this.render);
    },
    render: function() {
      var html = _.trim(this.template(this.model.attributes))
      $('.splash').addClass('hidden')
      this.$el.html(html)
        .removeClass('hidden')
    },
    open: function(e) {
      var $target = $(e.target)
      var path = $target.data('path')

      $.get('http://maxcdn-docs.devdocs.io/jquery/' + path + '.html').done(function(html) {
        var $content = $('.content')
        $content.html(html)
        _.defer(function() {
          $content
            .find('h4')
            .filter(function() {
              return $(this).html() === 'Demo:'
            })
            .after(function() {
              var $iframe = $('<iframe>')
              var html = _.unescape($(this).prev().html())
              console.log(html, $iframe.contents())
              $iframe.contents().find('body').html('a')
              return $iframe
            })
        })

      })
      this.$el.addClass('hidden')
      $('.content').removeClass('hidden')
    }
  })

  var appView = new AppView()
  var resultsView = new ResultsView()
  window.e = entries
})
