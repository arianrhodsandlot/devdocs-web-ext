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
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/background/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/background/index.js":
/*!*********************************!*\
  !*** ./src/background/index.js ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("/* global _, chrome */\nlet log = function (msg) {\n  return function (x) {\n    console.log(msg);\n    return x;\n  };\n};\nlet getCategoriesFromCookie = function (cookie) {\n  let defaultCategories = ['css', 'dom', 'dom_events', 'html', 'http', 'javascript'];\n  return _.get(cookie, 'value') ? cookie.value.split('/') : defaultCategories;\n};\nlet getQueryFromCategory = function (category) {\n  let hosts = 'http://maxcdn-docs.devdocs.io';\n  let path = '/' + category + '/index.json';\n  return $.ajax(hosts + path);\n};\nlet getQueriesFromCookie = _.compose(log('Fetching documents\\'s entries...'), _.partial(_.map, _, getQueryFromCategory), getCategoriesFromCookie);\nlet processPromise = function (queryWidhCategory) {\n  let query = _.first(queryWidhCategory);\n  let category = _.last(queryWidhCategory);\n  let getExtendedEntry = function (entry) {\n    return _.assign(entry, {\n      category: category\n    });\n  };\n  let getEntriesFromRes = function (res) {\n    return _.map(res.entries, getExtendedEntry);\n  };\n  return query.then(getEntriesFromRes);\n};\n\nlet getQueriesWithCategories = function (cookie) {\n  return _.zip(getQueriesFromCookie(cookie), getCategoriesFromCookie(cookie));\n};\n\nlet getChars = function (str) {\n  let words = _.trim(str).toLowerCase().match(/\\w+/g);\n  if (!words || words.length === 0) {\n    return '';\n  }\n  return words.join('');\n};\nlet getRegFromQuery = _.compose(_.partial(RegExp, _, 'i'), _.partial(_.reduce, _, function (prev, current) {\n  return prev + (/\\.|\\(|\\)/.test(current) ? '' : current + '.*');\n}, '.*'));\nlet getEntryScore = function (entry, query) {\n  let name = getChars(entry.name);\n  let fullName = entry.category + name;\n  let testName = _.bind(RegExp.prototype.test, getRegFromQuery(query));\n\n  if (name === query) {\n    return 0;\n  } else if (fullName === query) {\n    return 1;\n  } else if (_.contains(name, query)) {\n    return 2;\n  } else if (_.contains(fullName, query)) {\n    return 3;\n  } else if (testName(name)) {\n    return 4;\n  } else if (testName(fullName)) {\n    return 5;\n  } else {\n    return NaN;\n  }\n};\n\nlet getScore = _.partial(_.get, _, 'score');\nlet getSearcher = function (entries) {\n  return _.memoize(function (query) {\n    console.log('searching for ' + query);\n    let addEntryScore = function (entry) {\n      return _.assign(entry, {\n        score: getEntryScore(entry, query)\n      });\n    };\n    return _.compose(_.isEmpty, getChars)(query) ? null : _.sortBy(_.filter(_.map(entries, addEntryScore), _.compose(_.negate(_.isNaN), getScore)), getScore);\n  });\n};\nlet getmsghandler = function (searcher) {\n  return function (message, sender, sendResponse) {\n    console.log('msg is coming');\n    const response = _.compose(searcher, getChars)(message);\n    return sendResponse(response ? response.slice(0, 100) : response);\n  };\n};\nlet getpromises = function (cookie) {\n  return _.map(getQueriesWithCategories(cookie), processPromise);\n};\nlet startlisten = function (cookie) {\n  return $.when.apply($, getpromises(cookie)).then(function () {\n    let listener = _.compose(getmsghandler, getSearcher, _.flatten)(arguments);\n    chrome.runtime.onMessage.addListener(listener);\n    return listener;\n  });\n};\n\nlet listenpromise;\n\nchrome.cookies.get({\n  url: 'http://devdocs.io',\n  name: 'docs'\n}, function (cookie) {\n  listenpromise = startlisten(cookie);\n});\n\nchrome.cookies.onChanged.addListener(function (changeInfo) {\n  let cookie = changeInfo.cookie;\n  if (cookie.name !== 'docs') return;\n  if (!_.includes(['devdocs.io', '.devdocs.io'], cookie.domain)) return;\n\n  console.log('Cookie is changed to ' + cookie.value + '!');\n  listenpromise.then(_.bind(chrome.runtime.onMessage.removeListener, chrome.runtime.onMessage));\n  listenpromise = startlisten(cookie);\n});\n\n//open a welcome page after install\nif (_.any([localStorage.install_time, localStorage.version], _.isUndefined)) {\n  chrome.tabs.create({\n    url: 'pages/options.html#welcome'\n  });\n}\n\n_.assign(localStorage, {\n  version: '0.1.4',\n  install_time: _.now(),\n  theme: 'light',\n  width: 600,\n  height: 600\n});\n\n//# sourceURL=webpack:///./src/background/index.js?");

/***/ })

/******/ });