$(function() {
  var $optionPage = $('.option-page')

  var switchOptionPage = function(index) {
    $optionPage
      .addClass('hidden')
      .eq(index)
      .removeClass('hidden')
      .trigger('show')
  }

  $('.option-navs')
    .on('click', '.option-nav', function() {
      var $nav = $(this)
      var index = $nav.index()
      $nav
        .addClass('selected')
        .siblings()
        .removeClass('selected')

      switchOptionPage(index)
      return false
    })

  $('.option-docs')
    .on('show', (function() {
      var $iframe = $('.option-docs iframe')
      return function() {
        if (!$iframe.attr('src')) {
          $iframe.attr('src', 'http://devdocs.io')
            .ready(function() {
              $('.arrow')
                .click(function(){
                  $(this).remove()
                })
                .css('top', '-400px')
                .fadeIn(100)
                .animate({
                  top: '-130px'
                }, 300)
                .delay(2000)
                .fadeOut(100)
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
