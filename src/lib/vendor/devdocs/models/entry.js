/**
 * @file This file is ported from the original devdocs's source, which was written in CoffeeScript. See https://github.com/freeCodeCamp/devdocs/blob/main/assets/javascripts/models/entry.coffee
 */

/* These lines are added to make the transpiled result of the original CoffeeScript works properly */
import { app } from '../app/app'
/* end */

var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

app.models.Entry = (function(superClass) {
  var ALIASES, applyAliases;

  extend(Entry, superClass);

  function Entry() {
    Entry.__super__.constructor.apply(this, arguments);
    this.text = applyAliases(app.Searcher.normalizeString(this.name));
  }

  Entry.prototype.addAlias = function(name) {
    var text;
    text = applyAliases(app.Searcher.normalizeString(name));
    if (!Array.isArray(this.text)) {
      this.text = [this.text];
    }
    this.text.push(Array.isArray(text) ? text[1] : text);
  };

  Entry.prototype.fullPath = function() {
    return this.doc.fullPath(this.isIndex() ? '' : this.path);
  };

  Entry.prototype.dbPath = function() {
    return this.path.replace(/#.*/, '');
  };

  Entry.prototype.filePath = function() {
    return this.doc.fullPath(this._filePath());
  };

  Entry.prototype.fileUrl = function() {
    return this.doc.fileUrl(this._filePath());
  };

  Entry.prototype._filePath = function() {
    var result;
    result = this.path.replace(/#.*/, '');
    if (result.slice(-5) !== '.html') {
      result += '.html';
    }
    return result;
  };

  Entry.prototype.isIndex = function() {
    return this.path === 'index';
  };

  Entry.prototype.getType = function() {
    return this.doc.types.findBy('name', this.type);
  };

  Entry.prototype.loadFile = function(onSuccess, onError) {
    return app.db.load(this, onSuccess, onError);
  };

  applyAliases = function(string) {
    var i, j, len, word, words;
    if (ALIASES.hasOwnProperty(string)) {
      return [string, ALIASES[string]];
    } else {
      words = string.split('.');
      for (i = j = 0, len = words.length; j < len; i = ++j) {
        word = words[i];
        if (!(ALIASES.hasOwnProperty(word))) {
          continue;
        }
        words[i] = ALIASES[word];
        return [string, words.join('.')];
      }
    }
    return string;
  };

  Entry.ALIASES = ALIASES = {
    'angular': 'ng',
    'angular.js': 'ng',
    'backbone.js': 'bb',
    'c++': 'cpp',
    'coffeescript': 'cs',
    'crystal': 'cr',
    'elixir': 'ex',
    'javascript': 'js',
    'julia': 'jl',
    'jquery': '$',
    'knockout.js': 'ko',
    'kubernetes': 'k8s',
    'less': 'ls',
    'lodash': '_',
    'löve': 'love',
    'marionette': 'mn',
    'markdown': 'md',
    'matplotlib': 'mpl',
    'modernizr': 'mdr',
    'moment.js': 'mt',
    'openjdk': 'java',
    'nginx': 'ngx',
    'numpy': 'np',
    'pandas': 'pd',
    'postgresql': 'pg',
    'python': 'py',
    'ruby.on.rails': 'ror',
    'ruby': 'rb',
    'rust': 'rs',
    'sass': 'scss',
    'tensorflow': 'tf',
    'typescript': 'ts',
    'underscore.js': '_'
  };

  return Entry;

})(app.Model);
