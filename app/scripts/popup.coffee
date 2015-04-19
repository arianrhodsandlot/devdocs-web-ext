$ ->
  xiame = {} # Backbone Object container

  $body = $(document.body)

  $body.click ->
    $body = ($ @)
    $.ajax 'http://www.xiami.com/song/playlist-default/cat/json'
    .done (json) ->
      console.log json

  window.xiame = xiame
