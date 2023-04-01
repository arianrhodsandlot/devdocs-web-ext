/**
 * @file This file is ported from the original source in devdocs, which was written in CoffeeScript. See https://github.com/freeCodeCamp/devdocs/blob/main/assets/javascripts/app/searcher.coffee
 */

/* These lines are added to make the transpiled result of the original CoffeeScript works properly */
import { $ } from '../lib/util'
import { Events } from '../lib/events'
import { app } from './app'

export { app }
/* end */

var SEPARATOR, fuzzyRegexp, i, index, lastIndex, match, matchIndex, matchLength, matcher, query, queryLength, score, separators, value, valueLength,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

SEPARATOR = '.';

query = queryLength = value = valueLength = matcher = fuzzyRegexp = index = lastIndex = match = matchIndex = matchLength = score = separators = i = null;

function exactMatch() {;

index = value.indexOf(query);

if (!(index >= 0)) {
  return;
}

lastIndex = value.lastIndexOf(query);

if (index !== lastIndex) {
  return Math.max(scoreExactMatch(), ((index = lastIndex) && scoreExactMatch()) || 0);
} else {
  return scoreExactMatch();
}

};

function scoreExactMatch() {;

score = 100 - (valueLength - queryLength);

if (index > 0) {
  if (value.charAt(index - 1) === SEPARATOR) {
    score += index - 1;
  } else if (queryLength === 1) {
    return;
  } else {
    i = index - 2;
    while (i >= 0 && value.charAt(i) !== SEPARATOR) {
      i--;
    }
    score -= (index - i) + (valueLength - queryLength - index);
  }
  separators = 0;
  i = index - 2;
  while (i >= 0) {
    if (value.charAt(i) === SEPARATOR) {
      separators++;
    }
    i--;
  }
  score -= separators;
}

separators = 0;

i = valueLength - queryLength - index - 1;

while (i >= 0) {
  if (value.charAt(index + queryLength + i) === SEPARATOR) {
    separators++;
  }
  i--;
}

score -= separators * 5;

return Math.max(1, score);

};

function fuzzyMatch() {;

if (valueLength <= queryLength || value.indexOf(query) >= 0) {
  return;
}

if (!(match = fuzzyRegexp.exec(value))) {
  return;
}

matchIndex = match.index;

matchLength = match[0].length;

score = scoreFuzzyMatch();

if (match = fuzzyRegexp.exec(value.slice(i = value.lastIndexOf(SEPARATOR) + 1))) {
  matchIndex = i + match.index;
  matchLength = match[0].length;
  return Math.max(score, scoreFuzzyMatch());
} else {
  return score;
}

};

function scoreFuzzyMatch() {;

if (matchIndex === 0 || value.charAt(matchIndex - 1) === SEPARATOR) {
  return Math.max(66, 100 - matchLength);
} else if (matchIndex + matchLength === valueLength) {
  return Math.max(33, 67 - matchLength);
} else {
  return Math.max(1, 34 - matchLength);
}

};

app.Searcher = (function() {
  var CHUNK_SIZE, DEFAULTS, DOT_REGEXP, ELLIPSIS, EMPTY_PARANTHESES_REGEXP, EMPTY_STRING, EOS_SEPARATORS_REGEXP, EVENT_REGEXP, INFO_PARANTHESES_REGEXP, SEPARATORS_REGEXP, STRING, WHITESPACE_REGEXP;

  $.extend(Searcher.prototype, Events);

  CHUNK_SIZE = 20000;

  DEFAULTS = {
    max_results: app.config.max_results,
    fuzzy_min_length: 3
  };

  SEPARATORS_REGEXP = /#|::|:-|->|\$(?=\w)|\-(?=\w)|\:(?=\w)|\ [\/\-&]\ |:\ |\ /g;

  EOS_SEPARATORS_REGEXP = /(\w)[\-:]$/;

  INFO_PARANTHESES_REGEXP = /\ \(\w+?\)$/;

  EMPTY_PARANTHESES_REGEXP = /\(\)/;

  EVENT_REGEXP = /\ event$/;

  DOT_REGEXP = /\.+/g;

  WHITESPACE_REGEXP = /\s/g;

  EMPTY_STRING = '';

  ELLIPSIS = '...';

  STRING = 'string';

  Searcher.normalizeString = function(string) {
    return string.toLowerCase().replace(ELLIPSIS, EMPTY_STRING).replace(EVENT_REGEXP, EMPTY_STRING).replace(INFO_PARANTHESES_REGEXP, EMPTY_STRING).replace(SEPARATORS_REGEXP, SEPARATOR).replace(DOT_REGEXP, SEPARATOR).replace(EMPTY_PARANTHESES_REGEXP, EMPTY_STRING).replace(WHITESPACE_REGEXP, EMPTY_STRING);
  };

  Searcher.normalizeQuery = function(string) {
    string = this.normalizeString(string);
    return string.replace(EOS_SEPARATORS_REGEXP, '$1.');
  };

  function Searcher(options) {
    if (options == null) {
      options = {};
    }
    this.matchChunks = bind(this.matchChunks, this);
    this.match = bind(this.match, this);
    this.options = $.extend({}, DEFAULTS, options);
  }

  Searcher.prototype.find = function(data, attr, q) {
    this.kill();
    this.data = data;
    this.attr = attr;
    this.query = q;
    this.setup();
    if (this.isValid()) {
      this.match();
    } else {
      this.end();
    }
  };

  Searcher.prototype.setup = function() {
    query = this.query = this.constructor.normalizeQuery(this.query);
    queryLength = query.length;
    this.dataLength = this.data.length;
    this.matchers = [exactMatch];
    this.totalResults = 0;
    this.setupFuzzy();
  };

  Searcher.prototype.setupFuzzy = function() {
    if (queryLength >= this.options.fuzzy_min_length) {
      fuzzyRegexp = this.queryToFuzzyRegexp(query);
      this.matchers.push(fuzzyMatch);
    } else {
      fuzzyRegexp = null;
    }
  };

  Searcher.prototype.isValid = function() {
    return queryLength > 0 && query !== SEPARATOR;
  };

  Searcher.prototype.end = function() {
    if (!this.totalResults) {
      this.triggerResults([]);
    }
    this.trigger('end');
    this.free();
  };

  Searcher.prototype.kill = function() {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.free();
    }
  };

  Searcher.prototype.free = function() {
    this.data = this.attr = this.dataLength = this.matchers = this.matcher = this.query = this.totalResults = this.scoreMap = this.cursor = this.timeout = null;
  };

  Searcher.prototype.match = function() {
    if (!this.foundEnough() && (this.matcher = this.matchers.shift())) {
      this.setupMatcher();
      this.matchChunks();
    } else {
      this.end();
    }
  };

  Searcher.prototype.setupMatcher = function() {
    this.cursor = 0;
    this.scoreMap = new Array(101);
  };

  Searcher.prototype.matchChunks = function() {
    this.matchChunk();
    if (this.cursor === this.dataLength || this.scoredEnough()) {
      this.delay(this.match);
      this.sendResults();
    } else {
      this.delay(this.matchChunks);
    }
  };

  Searcher.prototype.matchChunk = function() {
    var j, k, len, ref, ref1;
    matcher = this.matcher;
    for (j = 0, ref = this.chunkSize(); 0 <= ref ? j < ref : j > ref; 0 <= ref ? j++ : j--) {
      value = this.data[this.cursor][this.attr];
      if (value.split) {
        valueLength = value.length;
        if (score = matcher()) {
          this.addResult(this.data[this.cursor], score);
        }
      } else {
        score = 0;
        ref1 = this.data[this.cursor][this.attr];
        for (k = 0, len = ref1.length; k < len; k++) {
          value = ref1[k];
          valueLength = value.length;
          score = Math.max(score, matcher() || 0);
        }
        if (score > 0) {
          this.addResult(this.data[this.cursor], score);
        }
      }
      this.cursor++;
    }
  };

  Searcher.prototype.chunkSize = function() {
    if (this.cursor + CHUNK_SIZE > this.dataLength) {
      return this.dataLength % CHUNK_SIZE;
    } else {
      return CHUNK_SIZE;
    }
  };

  Searcher.prototype.scoredEnough = function() {
    var ref;
    return ((ref = this.scoreMap[100]) != null ? ref.length : void 0) >= this.options.max_results;
  };

  Searcher.prototype.foundEnough = function() {
    return this.totalResults >= this.options.max_results;
  };

  Searcher.prototype.addResult = function(object, score) {
    var base, name;
    ((base = this.scoreMap)[name = Math.round(score)] || (base[name] = [])).push(object);
    this.totalResults++;
  };

  Searcher.prototype.getResults = function() {
    var j, objects, ref, results;
    results = [];
    ref = this.scoreMap;
    for (j = ref.length - 1; j >= 0; j += -1) {
      objects = ref[j];
      if (objects) {
        results.push.apply(results, objects);
      }
    }
    return results.slice(0, this.options.max_results);
  };

  Searcher.prototype.sendResults = function() {
    var results;
    results = this.getResults();
    if (results.length) {
      this.triggerResults(results);
    }
  };

  Searcher.prototype.triggerResults = function(results) {
    this.trigger('results', results);
  };

  Searcher.prototype.delay = function(fn) {
    return this.timeout = setTimeout(fn, 1);
  };

  Searcher.prototype.queryToFuzzyRegexp = function(string) {
    var char, chars, j, len;
    chars = string.split('');
    for (i = j = 0, len = chars.length; j < len; i = ++j) {
      char = chars[i];
      chars[i] = $.escapeRegexp(char);
    }
    return new RegExp(chars.join('.*?'));
  };

  return Searcher;

})();

app.SynchronousSearcher = (function(superClass) {
  extend(SynchronousSearcher, superClass);

  function SynchronousSearcher() {
    this.match = bind(this.match, this);
    return SynchronousSearcher.__super__.constructor.apply(this, arguments);
  }

  SynchronousSearcher.prototype.match = function() {
    if (this.matcher) {
      this.allResults || (this.allResults = []);
      this.allResults.push.apply(this.allResults, this.getResults());
    }
    return SynchronousSearcher.__super__.match.apply(this, arguments);
  };

  SynchronousSearcher.prototype.free = function() {
    this.allResults = null;
    return SynchronousSearcher.__super__.free.apply(this, arguments);
  };

  SynchronousSearcher.prototype.end = function() {
    this.sendResults(true);
    return SynchronousSearcher.__super__.end.apply(this, arguments);
  };

  SynchronousSearcher.prototype.sendResults = function(end) {
    var ref;
    if (end && ((ref = this.allResults) != null ? ref.length : void 0)) {
      return this.triggerResults(this.allResults);
    }
  };

  SynchronousSearcher.prototype.delay = function(fn) {
    return fn();
  };

  return SynchronousSearcher;

})(app.Searcher);
