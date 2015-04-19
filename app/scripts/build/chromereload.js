'use strict';
var LIVERELOAD_HOST, LIVERELOAD_PORT, connection;

LIVERELOAD_HOST = 'localhost:';

LIVERELOAD_PORT = 35729;

connection = new WebSocket('ws://' + LIVERELOAD_HOST + LIVERELOAD_PORT + '/livereload');

connection.onerror = function(error) {
  console.log('reload connection got error:', error);
};

connection.onmessage = function(e) {
  var data;
  if (e.data) {
    data = JSON.parse(e.data);
    if (data && data.command === 'reload') {
      chrome.runtime.reload();
    }
  }
};
