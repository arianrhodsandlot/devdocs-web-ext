/* global Backbone */
$(function() {
  var Entries = Backbone.Model.extend({
    fetch: function(query) {
      var that = this
      chrome.runtime.sendMessage(query, function(response) {
        console.log(response)
        that.clear()
        if (response.length) {
          that.set(response)
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
      this.$content = $('.content')
    },
    search: function() {
      var query = this.$input.val()

      this.model.fetch(query)
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
      $prevResult = $prevResult.get(0) ? $prevResult : $lastResult
      if (_.contains(_.values(_.pick(keyCodes, 'up', 'down')), e.which)) {
        $activeResult.removeClass('active')
        switch (e.which) {
          case 38:
            $prevResult.addClass('active')
              .get(0).scrollIntoView(false)
            break
          case 40:
            $nextResult.addClass('active')
              .get(0).scrollIntoView(false)
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
      'click .result': 'open',
      'mouseenter .result': 'highlight',
      'mouseleave .result': 'unhighlight'
    },
    initialize: function() {
      this.$splash = $('.splash')
      this.$content = $('.content')
      this.listenTo(this.model, 'change', this.render);
    },
    render: function() {
      var html = _.trim(this.template(this.model.attributes))
      this.$el.html(html)
      this.$content.addClass('hidden').empty()
      if (html) {
        this.$el.removeClass('hidden')
        this.$splash.addClass('hidden')
      } else {
        this.$el.addClass('hidden')
        this.$splash.removeClass('hidden')
      }
    },
    open: function(e) {
      var $target = this.$el.find('.active')
      var $content = $('.content')
      var pathAndHash = $target.data('path').split('#')
      var name = $target.html()
      var category = $target.data('category')
      var path = pathAndHash[0]
      var hash = pathAndHash[1]
      hash = hash ? '#' + hash : ''

      this.$el.addClass('hidden')

      appView.$input.val(name).select()

      $content
        .attr('class', 'content _' + category)
        .html('<div class="loading-text">Loading...</div>')

      $.get('http://maxcdn-docs.devdocs.io/' + category + '/' + path + '.html' + hash)
        .done(function(html) {
          $content.html(html)
          _.defer(function() {
            $content
              .scrollTop(0)
              .scrollTop(function() {
                var $target = $content.find(
                  _.contains(hash, '.') ?
                  '[id="' + hash.slice(1) + '"]' :
                  hash
                )

                return $target.get(0) ?
                  $target.offset()
                  .top - 50 :
                  0
              })
              .find('h4')
              .filter(function() {
                return $(this).html() === 'Demo:'
              })
              .after(function() {
                var $iframe = $('<iframe>')
                var html = _.unescape($(this).prev().html())
                $iframe.contents().find('body').html('a')
                return $iframe
              })
          })
        })
        .fail(function() {
          $content.html('<div class="loading-text">Connect failed...</div>')
        })
      return false
    },
    highlight: function(e) {
      $(e.target).addClass('active')
    },
    unhighlight: function(e) {
      $(e.target).removeClass('active')
    }
  })

  var appView = new AppView()
  var resultsView = new ResultsView()
  window.e = entries
})
