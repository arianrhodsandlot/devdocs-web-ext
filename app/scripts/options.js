$(function() {
  var $optionPage = $('.option-page')

  var switchOptionPage = function(index) {
    $optionPage
      .addClass('hidden')
      .eq(index)
      .removeClass('hidden')
  }

  $('.option-navs')
    .on('click', '.option-nav', function() {
      var $nav = $(this)
      var index = $nav.index()
      $nav.addClass('selected').siblings().removeClass('selected')
      switchOptionPage(index)
    })
})
