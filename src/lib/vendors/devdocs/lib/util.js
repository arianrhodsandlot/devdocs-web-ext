/**
 * @file This file is ported from the original source in devdocs, which was written in CoffeeScript. See https://github.com/freeCodeCamp/devdocs/blob/main/assets/javascripts/lib/util.coffee
 */

var ESCAPE_HTML_MAP, ESCAPE_HTML_REGEXP, ESCAPE_REGEXP, HIGHLIGHT_DEFAULTS, buildFragment, isAndroid, isChromeForAndroid, isIE, isIOS, isMac, smoothDistance, smoothDuration, smoothEnd, smoothScroll, smoothStart,
  slice = [].slice;

export const $ = function(selector, el) {
  if (el == null) {
    el = document;
  }
  try {
    return el.querySelector(selector);
  } catch (error) {

  }
};

export const $$ = function(selector, el) {
  if (el == null) {
    el = document;
  }
  try {
    return el.querySelectorAll(selector);
  } catch (error) {

  }
};

$.id = function(id) {
  return document.getElementById(id);
};

$.hasChild = function(parent, el) {
  if (!parent) {
    return;
  }
  while (el) {
    if (el === parent) {
      return true;
    }
    if (el === document.body) {
      return;
    }
    el = el.parentNode;
  }
};

$.closestLink = function(el, parent) {
  if (parent == null) {
    parent = document.body;
  }
  while (el) {
    if (el.tagName === 'A') {
      return el;
    }
    if (el === parent) {
      return;
    }
    el = el.parentNode;
  }
};

$.on = function(el, event, callback, useCapture) {
  var j, len, name, ref;
  if (useCapture == null) {
    useCapture = false;
  }
  if (event.indexOf(' ') >= 0) {
    ref = event.split(' ');
    for (j = 0, len = ref.length; j < len; j++) {
      name = ref[j];
      $.on(el, name, callback);
    }
  } else {
    el.addEventListener(event, callback, useCapture);
  }
};

$.off = function(el, event, callback, useCapture) {
  var j, len, name, ref;
  if (useCapture == null) {
    useCapture = false;
  }
  if (event.indexOf(' ') >= 0) {
    ref = event.split(' ');
    for (j = 0, len = ref.length; j < len; j++) {
      name = ref[j];
      $.off(el, name, callback);
    }
  } else {
    el.removeEventListener(event, callback, useCapture);
  }
};

$.trigger = function(el, type, canBubble, cancelable) {
  var event;
  if (canBubble == null) {
    canBubble = true;
  }
  if (cancelable == null) {
    cancelable = true;
  }
  event = document.createEvent('Event');
  event.initEvent(type, canBubble, cancelable);
  el.dispatchEvent(event);
};

$.click = function(el) {
  var event;
  event = document.createEvent('MouseEvent');
  event.initMouseEvent('click', true, true, window, null, 0, 0, 0, 0, false, false, false, false, 0, null);
  el.dispatchEvent(event);
};

$.stopEvent = function(event) {
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();
};

$.eventTarget = function(event) {
  return event.target.correspondingUseElement || event.target;
};

buildFragment = function(value) {
  var child, fragment, j, len, ref;
  fragment = document.createDocumentFragment();
  if ($.isCollection(value)) {
    ref = $.makeArray(value);
    for (j = 0, len = ref.length; j < len; j++) {
      child = ref[j];
      fragment.appendChild(child);
    }
  } else {
    fragment.innerHTML = value;
  }
  return fragment;
};

$.append = function(el, value) {
  if (typeof value === 'string') {
    el.insertAdjacentHTML('beforeend', value);
  } else {
    if ($.isCollection(value)) {
      value = buildFragment(value);
    }
    el.appendChild(value);
  }
};

$.prepend = function(el, value) {
  if (!el.firstChild) {
    $.append(value);
  } else if (typeof value === 'string') {
    el.insertAdjacentHTML('afterbegin', value);
  } else {
    if ($.isCollection(value)) {
      value = buildFragment(value);
    }
    el.insertBefore(value, el.firstChild);
  }
};

$.before = function(el, value) {
  if (typeof value === 'string' || $.isCollection(value)) {
    value = buildFragment(value);
  }
  el.parentNode.insertBefore(value, el);
};

$.after = function(el, value) {
  if (typeof value === 'string' || $.isCollection(value)) {
    value = buildFragment(value);
  }
  if (el.nextSibling) {
    el.parentNode.insertBefore(value, el.nextSibling);
  } else {
    el.parentNode.appendChild(value);
  }
};

$.remove = function(value) {
  var el, j, len, ref, ref1, ref2;
  if ($.isCollection(value)) {
    ref = $.makeArray(value);
    for (j = 0, len = ref.length; j < len; j++) {
      el = ref[j];
      if ((ref1 = el.parentNode) != null) {
        ref1.removeChild(el);
      }
    }
  } else {
    if ((ref2 = value.parentNode) != null) {
      ref2.removeChild(value);
    }
  }
};

$.empty = function(el) {
  while (el.firstChild) {
    el.removeChild(el.firstChild);
  }
};

$.batchUpdate = function(el, fn) {
  var parent, sibling;
  parent = el.parentNode;
  sibling = el.nextSibling;
  parent.removeChild(el);
  fn(el);
  if (sibling) {
    parent.insertBefore(el, sibling);
  } else {
    parent.appendChild(el);
  }
};

$.rect = function(el) {
  return el.getBoundingClientRect();
};

$.offset = function(el, container) {
  var left, top;
  if (container == null) {
    container = document.body;
  }
  top = 0;
  left = 0;
  while (el && el !== container) {
    top += el.offsetTop;
    left += el.offsetLeft;
    el = el.offsetParent;
  }
  return {
    top: top,
    left: left
  };
};

$.scrollParent = function(el) {
  var ref, ref1;
  while ((el = el.parentNode) && el.nodeType === 1) {
    if (el.scrollTop > 0) {
      break;
    }
    if ((ref = (ref1 = getComputedStyle(el)) != null ? ref1.overflowY : void 0) === 'auto' || ref === 'scroll') {
      break;
    }
  }
  return el;
};

$.scrollTo = function(el, parent, position, options) {
  var height, lastElementOffset, offsetBottom, offsetTop, parentHeight, parentScrollHeight, scrollTop, top;
  if (position == null) {
    position = 'center';
  }
  if (options == null) {
    options = {};
  }
  if (!el) {
    return;
  }
  if (parent == null) {
    parent = $.scrollParent(el);
  }
  if (!parent) {
    return;
  }
  parentHeight = parent.clientHeight;
  parentScrollHeight = parent.scrollHeight;
  if (!(parentScrollHeight > parentHeight)) {
    return;
  }
  top = $.offset(el, parent).top;
  offsetTop = parent.firstElementChild.offsetTop;
  switch (position) {
    case 'top':
      parent.scrollTop = top - offsetTop - (options.margin != null ? options.margin : 0);
      break;
    case 'center':
      parent.scrollTop = top - Math.round(parentHeight / 2 - el.offsetHeight / 2);
      break;
    case 'continuous':
      scrollTop = parent.scrollTop;
      height = el.offsetHeight;
      lastElementOffset = parent.lastElementChild.offsetTop + parent.lastElementChild.offsetHeight;
      offsetBottom = lastElementOffset > 0 ? parentScrollHeight - lastElementOffset : 0;
      if (top - offsetTop <= scrollTop + height * (options.topGap || 1)) {
        parent.scrollTop = top - offsetTop - height * (options.topGap || 1);
      } else if (top + offsetBottom >= scrollTop + parentHeight - height * ((options.bottomGap || 1) + 1)) {
        parent.scrollTop = top + offsetBottom - parentHeight + height * ((options.bottomGap || 1) + 1);
      }
  }
};

$.scrollToWithImageLock = function() {
  var args, el, image, j, len, parent, ref;
  el = arguments[0], parent = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
  if (parent == null) {
    parent = $.scrollParent(el);
  }
  if (!parent) {
    return;
  }
  $.scrollTo.apply($, [el, parent].concat(slice.call(args)));
  ref = parent.getElementsByTagName('img');
  for (j = 0, len = ref.length; j < len; j++) {
    image = ref[j];
    if (!image.complete) {
      (function() {
        var onLoad, timeout, unbind;
        onLoad = function(event) {
          clearTimeout(timeout);
          unbind(event.target);
          return $.scrollTo.apply($, [el, parent].concat(slice.call(args)));
        };
        unbind = function(target) {
          return $.off(target, 'load', onLoad);
        };
        $.on(image, 'load', onLoad);
        return timeout = setTimeout(unbind.bind(null, image), 3000);
      })();
    }
  }
};

$.lockScroll = function(el, fn) {
  var parent, top;
  if (parent = $.scrollParent(el)) {
    top = $.rect(el).top;
    if (parent !== document.body && parent !== document.documentElement) {
      top -= $.rect(parent).top;
    }
    fn();
    parent.scrollTop = $.offset(el, parent).top - top;
  } else {
    fn();
  }
};

smoothScroll = smoothStart = smoothEnd = smoothDistance = smoothDuration = null;

$.smoothScroll = function(el, end) {
  var newDistance, startTime;
  if (!window.requestAnimationFrame) {
    el.scrollTop = end;
    return;
  }
  smoothEnd = end;
  if (smoothScroll) {
    newDistance = smoothEnd - smoothStart;
    smoothDuration += Math.min(300, Math.abs(smoothDistance - newDistance));
    smoothDistance = newDistance;
    return;
  }
  smoothStart = el.scrollTop;
  smoothDistance = smoothEnd - smoothStart;
  smoothDuration = Math.min(300, Math.abs(smoothDistance));
  startTime = Date.now();
  smoothScroll = function() {
    var p, y;
    p = Math.min(1, (Date.now() - startTime) / smoothDuration);
    y = Math.max(0, Math.floor(smoothStart + smoothDistance * (p < 0.5 ? 2 * p * p : p * (4 - p * 2) - 1)));
    el.scrollTop = y;
    if (p === 1) {
      return smoothScroll = null;
    } else {
      return requestAnimationFrame(smoothScroll);
    }
  };
  return requestAnimationFrame(smoothScroll);
};

$.extend = function() {
  var j, key, len, object, objects, target, value;
  target = arguments[0], objects = 2 <= arguments.length ? slice.call(arguments, 1) : [];
  for (j = 0, len = objects.length; j < len; j++) {
    object = objects[j];
    if (object) {
      for (key in object) {
        value = object[key];
        target[key] = value;
      }
    }
  }
  return target;
};

$.makeArray = function(object) {
  if (Array.isArray(object)) {
    return object;
  } else {
    return Array.prototype.slice.apply(object);
  }
};

$.arrayDelete = function(array, object) {
  var index;
  index = array.indexOf(object);
  if (index >= 0) {
    array.splice(index, 1);
    return true;
  } else {
    return false;
  }
};

$.isCollection = function(object) {
  return Array.isArray(object) || typeof (object != null ? object.item : void 0) === 'function';
};

ESCAPE_HTML_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;'
};

ESCAPE_HTML_REGEXP = /[&<>"'\/]/g;

$.escape = function(string) {
  return string.replace(ESCAPE_HTML_REGEXP, function(match) {
    return ESCAPE_HTML_MAP[match];
  });
};

ESCAPE_REGEXP = /([.*+?^=!:${}()|\[\]\/\\])/g;

$.escapeRegexp = function(string) {
  return string.replace(ESCAPE_REGEXP, "\\$1");
};

$.urlDecode = function(string) {
  return decodeURIComponent(string.replace(/\+/g, '%20'));
};

$.classify = function(string) {
  var i, j, len, substr;
  string = string.split('_');
  for (i = j = 0, len = string.length; j < len; i = ++j) {
    substr = string[i];
    string[i] = substr[0].toUpperCase() + substr.slice(1);
  }
  return string.join('');
};

$.framify = function(fn, obj) {
  if (window.requestAnimationFrame) {
    return function() {
      var args;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return requestAnimationFrame(fn.bind.apply(fn, [obj].concat(slice.call(args))));
    };
  } else {
    return fn;
  }
};

$.requestAnimationFrame = function(fn) {
  if (window.requestAnimationFrame) {
    requestAnimationFrame(fn);
  } else {
    setTimeout(fn, 0);
  }
};

$.noop = function() {};

$.popup = function(value) {
  var win;
  try {
    win = window.open();
    if (win.opener) {
      win.opener = null;
    }
    win.location = value.href || value;
  } catch (error) {
    window.open(value.href || value, '_blank');
  }
};

isMac = null;

$.isMac = function() {
  var ref;
  return isMac != null ? isMac : isMac = ((ref = navigator.userAgent) != null ? ref.indexOf('Mac') : void 0) >= 0;
};

isIE = null;

$.isIE = function() {
  var ref, ref1;
  return isIE != null ? isIE : isIE = ((ref = navigator.userAgent) != null ? ref.indexOf('MSIE') : void 0) >= 0 || ((ref1 = navigator.userAgent) != null ? ref1.indexOf('rv:11.0') : void 0) >= 0;
};

isChromeForAndroid = null;

$.isChromeForAndroid = function() {
  var ref;
  return isChromeForAndroid != null ? isChromeForAndroid : isChromeForAndroid = ((ref = navigator.userAgent) != null ? ref.indexOf('Android') : void 0) >= 0 && /Chrome\/([.0-9])+ Mobile/.test(navigator.userAgent);
};

isAndroid = null;

$.isAndroid = function() {
  var ref;
  return isAndroid != null ? isAndroid : isAndroid = ((ref = navigator.userAgent) != null ? ref.indexOf('Android') : void 0) >= 0;
};

isIOS = null;

$.isIOS = function() {
  var ref, ref1;
  return isIOS != null ? isIOS : isIOS = ((ref = navigator.userAgent) != null ? ref.indexOf('iPhone') : void 0) >= 0 || ((ref1 = navigator.userAgent) != null ? ref1.indexOf('iPad') : void 0) >= 0;
};

$.overlayScrollbarsEnabled = function() {
  var div, result;
  if (!$.isMac()) {
    return false;
  }
  div = document.createElement('div');
  div.setAttribute('style', 'width: 100px; height: 100px; overflow: scroll; position: absolute');
  document.body.appendChild(div);
  result = div.offsetWidth === div.clientWidth;
  document.body.removeChild(div);
  return result;
};

HIGHLIGHT_DEFAULTS = {
  className: 'highlight',
  delay: 1000
};

$.highlight = function(el, options) {
  if (options == null) {
    options = {};
  }
  options = $.extend({}, HIGHLIGHT_DEFAULTS, options);
  el.classList.add(options.className);
  setTimeout((function() {
    return el.classList.remove(options.className);
  }), options.delay);
};

$.copyToClipboard = function(string) {
  var result, textarea;
  textarea = document.createElement('textarea');
  textarea.style.position = 'fixed';
  textarea.style.opacity = 0;
  textarea.value = string;
  document.body.appendChild(textarea);
  try {
    textarea.select();
    result = !!document.execCommand('copy');
  } catch (error) {
    result = false;
  } finally {
    document.body.removeChild(textarea);
  }
  return result;
};
