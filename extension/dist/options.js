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
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/options/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/options/index.js":
/*!******************************!*\
  !*** ./src/options/index.js ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("$(function () {\n  let $optionPages = $('.option-page');\n  let $optionNavs = $('.option-nav');\n\n  let switchOptionPage = index => {\n    let $prevPage = $optionPages.not('.hidden');\n    let $currentPage = $optionPages.eq(index);\n\n    $optionNavs.removeClass('selected').eq(index).addClass('selected');\n\n    $prevPage.addClass('hidden');\n    $currentPage.removeClass('hidden').addClass('showing');\n\n    setTimeout(function () {\n      $currentPage.removeClass('showing').trigger('show');\n    }, 100);\n  };\n\n  $(window).on('hashchange', function () {\n    let $targetNav = $(location.hash.replace(/#/, '.option-'));\n    let index = $targetNav.index();\n    index = index !== -1 ? index : 0;\n    switchOptionPage(index);\n  }).trigger('hashchange');\n\n  $('.option-docs').on('show', function () {\n    let $iframe = $('.option-docs iframe');\n    return function () {\n      if (!$iframe.attr('src')) {\n        $iframe.attr('src', 'http://devdocs.io');\n      }\n    };\n  }());\n\n  $('.theme').on('change', 'input', function () {\n    let $themeInput = $(this);\n    localStorage.setItem('theme', $themeInput.val());\n  }).find('.' + localStorage.getItem('theme')).prop('checked', true);\n\n  $('.size').on('input', '.width', function () {\n    let $width = $(this);\n    let width = $width.val();\n    $width.next().html(width);\n    localStorage.setItem('width', width);\n  }).on('input', '.height', function () {\n    let $height = $(this);\n    let height = $height.val();\n    $height.next().html(height);\n    localStorage.setItem('height', height);\n  }).find('input').val(function () {\n    let $size = $(this);\n    let key = $size.attr('name');\n    return localStorage.getItem(key);\n  }).trigger('input');\n});\n\n//# sourceURL=webpack:///./src/options/index.js?");

/***/ })

/******/ });