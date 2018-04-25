import $ from 'jquery'
import './chrome-i18n'

$(function () {
  let $optionPages = $('.option-page')
  let $optionNavs = $('.option-nav')

  let switchOptionPage = (index) => {
    let $prevPage = $optionPages.not('.hidden')
    let $currentPage = $optionPages.eq(index)

    $optionNavs
      .removeClass('selected')
      .eq(index)
      .addClass('selected')

    $prevPage.addClass('hidden')
    $currentPage
      .removeClass('hidden')
      .addClass('showing')

    setTimeout(function () {
      $currentPage
        .removeClass('showing')
        .trigger('show')
    }, 100)
  }

  $(window)
    .on('hashchange', function () {
      let $targetNav = $(location.hash.replace(/#/, '.option-'))
      let index = $targetNav.index()
      index = index !== -1 ? index : 0
      switchOptionPage(index)
    })
    .trigger('hashchange')

  $('.option-docs')
    .on('show', (function () {
      let $iframe = $('.option-docs iframe')
      return function () {
        if (!$iframe.attr('src')) {
          $iframe.attr('src', 'https://devdocs.io/settings')
        }
      }
    })())

  $('.theme')
    .on('change', 'input', function () {
      let $themeInput = $(this)
      localStorage.setItem('theme', $themeInput.val())
    })
    .find('.' + localStorage.getItem('theme'))
    .prop('checked', true)

  $('.size')
    .on('input', '.width', function () {
      let $width = $(this)
      let width = $width.val()
      $width.next().html(width)
      localStorage.setItem('width', width)
    })
    .on('input', '.height', function () {
      let $height = $(this)
      let height = $height.val()
      $height.next().html(height)
      localStorage.setItem('height', height)
    })
    .find('input')
    .val(function () {
      let $size = $(this)
      let key = $size.attr('name')
      return localStorage.getItem(key)
    })
    .trigger('input')
})
