$(function() {
  var $optionPages = $('.option-page')
  var $optionNavs = $('.option-nav')

  var switchOptionPage = function(index) {
    var $prevPage = $optionPages.not('.hidden')
    var $currentPage = $optionPages.eq(index)

    $optionNavs
      .removeClass('selected')
      .eq(index)
      .addClass('selected')

    $prevPage.addClass('hidden')
    $currentPage
      .removeClass('hidden')
      .addClass('showing')

    setTimeout(function() {
      $currentPage
        .removeClass('showing')
        .trigger('show')
    }, 100)
  }

  $(window)
    .on('hashchange', function() {
      var $targetNav = $(location.hash.replace(/#/, '.option-'))
      var index = $targetNav.index()
      console.log($targetNav, index)
      index = index !== -1 ? index : 0
      switchOptionPage(index)
    })
    .trigger('hashchange')

  $('.option-docs')
    .on('show', (function() {
      var $iframe = $('.option-docs iframe')
      return function() {
        if (!$iframe.attr('src')) {
          $iframe.attr('src', 'http://devdocs.io')
            .load(function() {
              var $arrow = $('.arrow')
              $arrow
                .click(function() {
                  $(this).remove()
                })
              setTimeout(function() {
                $arrow.addClass('showing')
              }, 500)

              setTimeout(function() {
                $arrow
                  .removeClass('showing')
                  .addClass('transparent')
              }, 1500)

              setTimeout(function() {
                $arrow.remove()
              }, 1800)
            })
        }
      }
    })())

  $('.theme')
    .on('change', 'input', function() {
      var $themeInput = $(this)
      localStorage.setItem('theme', $themeInput.val())
    })
    .find('.' + localStorage.getItem('theme'))
    .prop('checked', true)

  $('.size')
    .on('input', '.width', function() {
      var $width = $(this)
      var width = $width.val()
      $width.next().html(width)
      localStorage.setItem('width', width)
    })
    .on('input', '.height', function() {
      var $height = $(this)
      var height = $height.val()
      $height.next().html(height)
      localStorage.setItem('height', height)
    })
    .find('input')
    .val(function() {
      var $size = $(this)
      var key = $size.attr('name')
      return localStorage.getItem(key)
    })
    .trigger('input')
})
