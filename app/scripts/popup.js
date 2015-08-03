/* global Backbone */
$(function() {
  $(document.body).css({
    width: localStorage.getItem('width') + 'px',
    height: localStorage.getItem('height') + 'px'
  })

  var Entries = Backbone.Model.extend({
    fetch: function(query) {
      var that = this
      chrome.runtime.sendMessage(query, function(response) {
        that.clear()
        if (response.length) {
          that.set(response)
        }
      })
    }
  })
  var entries = new Entries()

  var Content = Backbone.Model.extend({
    defaults: {
      domain: 'maxcdn-docs.devdocs.io',
      category: '',
      path: '',
      hash: ''
    }
  })
  var content = new Content()

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
    search: _.debounce(function() {
      var query = this.$input.val()

      this.model.fetch(query)
    }, 200),
    completeCategory: function(e) { //to do
      return e.which !== 9
    },
    pick: function(e) {
      var keyCodes = {
        up: 38,
        down: 40,
        enter: 13,
        esc: 27
      }

      var $focusResult = this.$results.find('.focus')
      var $firstResult = this.$results.find('.result:first')
      var $lastResult = this.$results.find('.result:last')
      var $nextResult = $focusResult.next()
      var $prevResult = $focusResult.prev()

      $nextResult = $nextResult.get(0) ? $nextResult : $firstResult
      $prevResult = $prevResult.get(0) ? $prevResult : $lastResult
      if (_.contains(_.values(_.pick(keyCodes, 'up', 'down')), e.which)) {
        $focusResult.removeClass('focus')
        switch (e.which) {
          case 38:
            $prevResult.addClass('focus')
              .get(0).scrollIntoView(false)
            break
          case 40:
            $nextResult.addClass('focus')
              .get(0).scrollIntoView(false)
            break
        }
        return false
      } else if (e.which === keyCodes.enter) {
        resultsView.open()
        return false
      } else if (e.which === keyCodes.esc) {
        if (this.$input.val()) {
          this.$input.val('')
          this.search()
          return false
        }
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
      this.listenTo(this.model, 'change', this.render)
    },
    render: function() {
      var html = _.trim(this.template(this.model.attributes))
      this.$el.html(html)
      this.$content.addClass('hidden').empty()
      content
        .set({
          category: '',
          path: '',
          hash: ''
        })
      if (html) {
        this.$el.removeClass('hidden')
        this.$splash.addClass('hidden')
      } else {
        this.$el.addClass('hidden')
        this.$splash.removeClass('hidden')
      }
    },
    open: function(e) {
      var $target = this.$el.find('.focus')
      var $content = $('.content')
      var pathAndHash = $target.data('path').split('#')
      var name = $target.html()
      var category = $target.data('category')
      var path = pathAndHash[0]
      var hash = pathAndHash[1]
      hash = hash ? '#' + hash : ''

      this.$el.addClass('hidden')

      if (path) {
        content
          .set({
            category: category,
            path: path,
            hash: hash
          })
      }
    },
    highlight: function(e) {
      $(e.target)
        .addClass('focus')
        .siblings()
        .removeClass('focus')
    },
    unhighlight: function(e) {
      $(e.target).removeClass('focus')
    }
  })

  var ContentView = Backbone.View.extend({
    el: '.content',
    model: content,
    events: {
      'click a': 'redirect'
    },
    initialize: function() {
      this.listenTo(this.model, 'change', this.render)
    },
    render: function() {
      var that = this
      var contentUrl = 'http://<%= obj.domain %>/<%= obj.category %>/<%= obj.path %>.html#<%= obj.hash %>'
      var hash = this.model.get('hash')
      var $content = this.$el
      var category = this.model.get('category')

      if (!category) {
        return
      }

      var newClass = 'content _'
      if (category === 'backbone') {
        newClass += 'underscore'
      } else {
        newClass += category
      }

      $content
        .attr('class', newClass)
        .html('<div class="loading-text">Loading...</div>')

      $.ajax(_.template(contentUrl)(this.model.attributes))
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
                  .top - 54 :
                  0
              })

            //remove demos in jQuery documents
            $content
              .find('h4')
              .filter(function() {
                return $(this).html() === 'Demo:'
              })
              .remove()
          })
        })
        .fail(function() {
          $content.html('<div class="loading-text">Connect failed...</div>')
        })
    },
    redirect: function(e) {
      var href = $(e.target).attr('href')
      var path = href.split('#')[0]
      var hash = href.split('#')[1]

      hash = hash ? hash : ''

      if (path) {
        this.model.set({
          path: path,
          hash: hash
        })
        return false
      } else {
        return true
      }
    }
  })

  var appView = new AppView()
  var resultsView = new ResultsView()
  var contentView = new ContentView()

  var app = {
    entries: entries,
    content: content,
    appView: appView,
    resultsView: resultsView,
    contentView: contentView
  }

  window.app = app
})
