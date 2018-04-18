/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/popup/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/popup/index.js":
/*!****************************!*\
  !*** ./src/popup/index.js ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("/* global _, Backbone, chrome */\n$(function () {\n  let Entries = Backbone.Model.extend({\n    fetch(query) {\n      chrome.runtime.sendMessage(query, response => {\n        this.clear();\n        if (response.length) {\n          this.set(response);\n        }\n      });\n    }\n  });\n  let entries = new Entries();\n\n  let Content = Backbone.Model.extend({\n    defaults: {\n      domain: 'maxcdn-docs.devdocs.io',\n      category: '',\n      path: '',\n      hash: ''\n    }\n  });\n  let content = new Content();\n\n  let AppView = Backbone.View.extend({\n    el: 'body',\n    model: entries,\n    events: {\n      'input .input': 'search',\n      'keydown .input': 'completeCategory',\n      'keydown': 'pick'\n    },\n    initialize() {\n      this.$input = $('.input');\n      this.$results = $('.results');\n      this.$splash = $('.splash');\n      this.$content = $('.content');\n    },\n    search: _.debounce(function () {\n      let query = this.$input.val();\n\n      this.model.fetch(query);\n    }, 200),\n    completeCategory(e) {\n      //to do\n      return e.which !== 9;\n    },\n    pick(e) {\n      let keyCodes = {\n        up: 38,\n        down: 40,\n        enter: 13,\n        esc: 27\n      };\n\n      let $focusResult = this.$results.find('.focus');\n      let $firstResult = this.$results.find('.result:first');\n      let $lastResult = this.$results.find('.result:last');\n      let $nextResult = $focusResult.next();\n      let $prevResult = $focusResult.prev();\n\n      $nextResult = $nextResult.get(0) ? $nextResult : $firstResult;\n      $prevResult = $prevResult.get(0) ? $prevResult : $lastResult;\n      if (_.contains(_.values(_.pick(keyCodes, 'up', 'down')), e.which)) {\n        $focusResult.removeClass('focus');\n        switch (e.which) {\n          case 38:\n            $prevResult.addClass('focus').get(0).scrollIntoView(false);\n            break;\n          case 40:\n            $nextResult.addClass('focus').get(0).scrollIntoView(false);\n            break;\n        }\n        return false;\n      } else if (e.which === keyCodes.enter) {\n        resultsView.open();\n        return false;\n      } else if (e.which === keyCodes.esc) {\n        if (this.$input.val()) {\n          this.$input.val('');\n          this.search();\n          return false;\n        }\n      }\n    }\n  });\n\n  let ResultsView = Backbone.View.extend({\n    el: '.results',\n    template: _.template($('.result-template').html()),\n    model: entries,\n    events: {\n      'click .result': 'open',\n      'mouseenter .result': 'highlight',\n      'mouseleave .result': 'unhighlight'\n    },\n    initialize() {\n      this.$splash = $('.splash');\n      this.$content = $('.content');\n      this.listenTo(this.model, 'change', this.render);\n    },\n    render() {\n      let html = _.trim(this.template(this.model.attributes));\n      this.$el.html(html);\n      this.$content.addClass('hidden').empty();\n      content.set({\n        category: '',\n        path: '',\n        hash: ''\n      });\n      if (html) {\n        this.$el.removeClass('hidden');\n        this.$splash.addClass('hidden');\n      } else {\n        this.$el.addClass('hidden');\n        this.$splash.removeClass('hidden');\n      }\n    },\n    open() {\n      let $target = this.$el.find('.focus');\n      let pathAndHash = $target.data('path').split('#');\n      let category = $target.data('category');\n      let path = pathAndHash[0];\n      let hash = pathAndHash[1];\n      hash = hash ? '#' + hash : '';\n\n      this.$el.addClass('hidden');\n\n      if (path) {\n        content.set({\n          category: category,\n          path: path,\n          hash: hash\n        });\n      }\n    },\n    highlight: e => {\n      $(e.target).addClass('focus').siblings().removeClass('focus');\n    },\n    unhighlight: e => {\n      $(e.target).removeClass('focus');\n    }\n  });\n\n  let ContentView = Backbone.View.extend({\n    el: '.content',\n    model: content,\n    events: {\n      'click a': 'redirect'\n    },\n    initialize() {\n      this.listenTo(this.model, 'change', this.render);\n    },\n    render() {\n      let contentUrl = 'http://<%= obj.domain %>/<%= obj.category %>/<%= obj.path %>.html#<%= obj.hash %>';\n      let hash = this.model.get('hash');\n      let $content = this.$el;\n      let category = this.model.get('category');\n\n      if (!category) {\n        return;\n      }\n\n      let newClass = 'content _';\n      if (category === 'backbone') {\n        newClass += 'underscore';\n      } else {\n        newClass += category;\n      }\n\n      $content.attr('class', newClass).html('<div class=\"loading-text _splash-title\">Loading...</div>');\n\n      $.ajax(_.template(contentUrl)(this.model.attributes)).done(html => {\n        $content.html(html);\n        _.defer(function () {\n          $content.scrollTop(0).scrollTop(function () {\n            let $target = $content.find(_.contains(hash, '.') ? '[id=\"' + hash.slice(1) + '\"]' : hash);\n\n            return $target.get(0) ? $target.offset().top - 54 : 0;\n          });\n\n          //remove demos in jQuery documents\n          $content.find('h4').filter(function () {\n            return $(this).html() === 'Demo:';\n          }).remove();\n        });\n      }).fail(() => {\n        $content.html('<div class=\"loading-text\">Connect failed...</div>');\n      });\n    },\n    redirect: e => {\n      let href = $(e.target).attr('href');\n      let path = href.split('#')[0];\n      let hash = href.split('#')[1];\n\n      hash = hash ? hash : '';\n\n      if (path) {\n        this.model.set({\n          path: path,\n          hash: hash\n        });\n        return false;\n      } else {\n        return true;\n      }\n    }\n  });\n\n  let appView = new AppView();\n  let resultsView = new ResultsView();\n  let contentView = new ContentView();\n\n  let app = {\n    entries: entries,\n    content: content,\n    appView: appView,\n    resultsView: resultsView,\n    contentView: contentView\n  };\n\n  window.app = app;\n\n  // apply optionis\n  $(document.body).css({\n    width: localStorage.getItem('width') + 'px',\n    height: localStorage.getItem('height') + 'px'\n  }).addClass(localStorage.getItem('theme'));\n\n  $('#' + localStorage.getItem('theme')).attr('href', function () {\n    return $(this).data('href');\n  });\n});\n\n//# sourceURL=webpack:///./src/popup/index.js?");

/***/ })

/******/ });