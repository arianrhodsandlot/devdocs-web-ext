/* global _, Backbone, chrome */
$(function () {
  let Entries = Backbone.Model.extend({
    fetch (query) {
      chrome.runtime.sendMessage(query, (response) => {
        this.clear()
        if (response.length) {
          this.set(response)
        }
      })
    }
  })
  let entries = new Entries()

  let Content = Backbone.Model.extend({
    defaults: {
      domain: 'maxcdn-docs.devdocs.io',
      category: '',
      path: '',
      hash: ''
    }
  })
  let content = new Content()

  let AppView = Backbone.View.extend({
    el: 'body',
    model: entries,
    events: {
      'input .input': 'search',
      'keydown .input': 'completeCategory',
      'keydown': 'pick'
    },
    initialize () {
      this.$input = $('.input')
      this.$results = $('.results')
      this.$splash = $('.splash')
      this.$content = $('.content')
    },
    search: _.debounce(function () {
      let query = this.$input.val()

      this.model.fetch(query)
    }, 200),
    completeCategory (e) { //to do
      return e.which !== 9
    },
    pick (e) {
      let keyCodes = {
        up: 38,
        down: 40,
        enter: 13,
        esc: 27
      }

      let $focusResult = this.$results.find('.focus')
      let $firstResult = this.$results.find('.result:first')
      let $lastResult = this.$results.find('.result:last')
      let $nextResult = $focusResult.next()
      let $prevResult = $focusResult.prev()

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

  let ResultsView = Backbone.View.extend({
    el: '.results',
    template: _.template($('.result-template').html()),
    model: entries,
    events: {
      'click .result': 'open',
      'mouseenter .result': 'highlight',
      'mouseleave .result': 'unhighlight'
    },
    initialize () {
      this.$splash = $('.splash')
      this.$content = $('.content')
      this.listenTo(this.model, 'change', this.render)
    },
    render () {
      let html = _.trim(this.template(this.model.attributes))
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
    open () {
      let $target = this.$el.find('.focus')
      let pathAndHash = $target.data('path').split('#')
      let category = $target.data('category')
      let path = pathAndHash[0]
      let hash = pathAndHash[1]
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
    highlight: (e) => {
      $(e.target)
        .addClass('focus')
        .siblings()
        .removeClass('focus')
    },
    unhighlight: (e) => {
      $(e.target).removeClass('focus')
    }
  })

  let ContentView = Backbone.View.extend({
    el: '.content',
    model: content,
    events: {
      'click a': 'redirect'
    },
    initialize () {
      this.listenTo(this.model, 'change', this.render)
    },
    render () {
      let contentUrl = 'http://<%= obj.domain %>/<%= obj.category %>/<%= obj.path %>.html#<%= obj.hash %>'
      let hash = this.model.get('hash')
      let $content = this.$el
      let category = this.model.get('category')

      if (!category) {
        return
      }

      let newClass = 'content _'
      if (category === 'backbone') {
        newClass += 'underscore'
      } else {
        newClass += category
      }

      $content
        .attr('class', newClass)
        .html('<div class="loading-text _splash-title">Loading...</div>')

      $.ajax(_.template(contentUrl)(this.model.attributes))
        .done((html) => {
          $content.html(html)
          _.defer(function () {
            $content
              .scrollTop(0)
              .scrollTop(function () {
                let $target = $content.find(
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
              .filter(function () {
                return $(this).html() === 'Demo:'
              })
              .remove()
          })
        })
        .fail(() => {
          $content.html('<div class="loading-text">Connect failed...</div>')
        })
    },
    redirect: (e) => {
      let href = $(e.target).attr('href')
      let path = href.split('#')[0]
      let hash = href.split('#')[1]

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

  let appView = new AppView()
  let resultsView = new ResultsView()
  let contentView = new ContentView()

  let app = {
    entries: entries,
    content: content,
    appView: appView,
    resultsView: resultsView,
    contentView: contentView
  }

  window.app = app

  // apply optionis
  $(document.body)
    .css({
      width: localStorage.getItem('width') + 'px',
      height: localStorage.getItem('height') + 'px'
    })
    .addClass(localStorage.getItem('theme'))

  $('#' + localStorage.getItem('theme'))
    .attr('href', function () {
      return $(this).data('href')
    })
})
