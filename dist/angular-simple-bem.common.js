/*! angular-simple-bem v0.2.1 - MIT License https://github.com/ukyo/angular-simple-bem/blob/master/LICENSE */
var angular = require("angular");
'use strict';

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

angular.module('angular-simple-bem', []).factory('$angularSimpleBemParse', function () {
  var pairs = {
    '}': '{',
    ']': '[',
    ')': '('
  };

  return function angularSimpleBemParse(s) {
    var i, n, c, last;
    var stack = [];
    var isKeyPhase = true;
    var key = '';
    var value = '';
    var results = [];

    var addResult = function addResult() {
      results.push({ key: key.trim(), value: value.trim() });
      key = '';
      value = '';
    };

    for (i = 0, n = s.length; i < n; ++i) {
      c = s[i];
      if (isKeyPhase) {
        switch (c) {
          case ':':
            isKeyPhase = false;
            break;
          case ',':
            addResult();
            break;
          default:
            key += c;
        }
      } else {
        last = stack[stack.length - 1] || '';
        switch (c) {
          case ',':
            if (!stack.length) {
              addResult();
              isKeyPhase = true;
            }
            break;
          case '(':
          case '[':
          case '{':
            !/["']/.test(last) && stack.push(c);
            break;
          case ')':
          case ']':
          case '}':
            last === pairs[c] && stack.pop();
            break;
          case '"':
          case "'":
            !/['"]/.test(last) ? stack.push(c) : last === c && stack.pop();
            break;
          case '\\':
            value += c;
            c = s[++i];
            break;
        }
        if (!isKeyPhase) value += c;
      }
    }
    addResult();

    return results;
  };
}).directive('bem', ['$angularSimpleBemParse', function (parse) {
  var BASE_DEFINITION = '$angular-simple-bem-base-definition';
  var getParentDefinition = function getParentDefinition(_x) {
    var _left;

    var _again = true;

    _function: while (_again) {
      var el = _x;
      _again = false;

      if (_left = el.parent().data(BASE_DEFINITION)) {
        return _left;
      }

      _x = el.parent();
      _again = true;
      continue _function;
    }
  };
  var filterBoolModifier = function filterBoolModifier(m) {
    return m.value;
  };
  var filterRawModifier = function filterRawModifier(m) {
    return !m.value;
  };
  var concatString = function concatString(s1, s2) {
    return s1 + s2;
  };

  return {
    restrict: 'A',
    compile: function compile(tElement, tAttr) {
      var match, be, m, modifiers, rawModifiers, boolModifiers, cs, oneTimeBinding, expr;

      match = tAttr.bem.trim().match(/^([\s\S]*?)(?:--(::)?([\s\S]*))?$/);
      if (!match) throw new Error('bem: invalid pattern');
      var _match = match;

      var _match2 = _slicedToArray(_match, 4);

      be = _match2[1];
      var _match2$2 = _match2[2];
      oneTimeBinding = _match2$2 === undefined ? '' : _match2$2;
      var _match2$3 = _match2[3];
      m = _match2$3 === undefined ? '' : _match2$3;

      be = be.trim();
      m = m.trim();

      if (/^__/.test(be)) be = getParentDefinition(tElement) + be;
      tElement.data(BASE_DEFINITION, be);
      tElement.addClass(be);

      cs = concatString.bind(null, be + '--');
      if (/^\([\s\S]+\)$/.test(m)) {
        expr = m.slice(1, -1);
      } else if (/^\{[\s\S]+\}$/.test(m)) {
        expr = m;
      } else {
        modifiers = m ? parse(m) : [];
        rawModifiers = modifiers.filter(filterRawModifier);
        boolModifiers = modifiers.filter(filterBoolModifier);
        tElement.addClass(rawModifiers.map(function (m) {
          return cs(m.key);
        }).join(' '));
        expr = '{' + boolModifiers.map(function (_ref) {
          var key = _ref.key;
          var value = _ref.value;
          return '\'' + key + '\':' + value;
        }).join() + '}';
      }

      return function bemLink(scope, element) {
        if (!expr) return;
        scope.$watch(oneTimeBinding + expr, function bemWatchAction(newValue) {
          angular.forEach(newValue, function (v, k) {
            return element.toggleClass(cs(k), !!v);
          });
        }, true);
      };
    }
  };
}]);