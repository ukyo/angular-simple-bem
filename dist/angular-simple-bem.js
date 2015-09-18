/*! angular-simple-bem v0.3.3 - MIT License https://github.com/ukyo/angular-simple-bem/blob/master/LICENSE */
(function(){
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
}).directive('bem', ['$angularSimpleBemParse', '$animate', function (parse, $animate) {
  var BASE_DEFINITION = '__bem__';
  var getParentDefinition = function getParentDefinition(_x) {
    var _left;

    var _again = true;

    _function: while (_again) {
      var el = _x;
      parent = undefined;
      _again = false;

      var parent = el.parent();
      if (!parent.length) throw new Error('bem: no parent');

      if (_left = parent.attr(BASE_DEFINITION)) {
        return _left;
      }

      _x = parent;
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
    link: {
      pre: function pre(scope, element, attr) {
        var match, be, m, modifiers, rawModifiers, boolModifiers, cs, oneTimeBinding, expr;

        match = attr.bem.trim().match(/^([\s\S]*?)(?:--(::)?([\s\S]*))?$/);
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

        if (/^__/.test(be)) {
          be = getParentDefinition(element) + be;
        }
        element.attr(BASE_DEFINITION, be);
        element.addClass(be);

        cs = concatString.bind(null, be + '--');
        if (/^\([\s\S]+\)$/.test(m)) {
          expr = m.slice(1, -1);
        } else if (/^\{[\s\S]+\}$/.test(m)) {
          expr = m;
        } else {
          modifiers = m ? parse(m) : [];
          rawModifiers = modifiers.filter(filterRawModifier);
          boolModifiers = modifiers.filter(filterBoolModifier);
          element.addClass(rawModifiers.map(function (m) {
            return cs(m.key);
          }).join(' '));
          if (boolModifiers.length) expr = '{' + boolModifiers.map(function (_ref) {
            var key = _ref.key;
            var value = _ref.value;
            return '\'' + key + '\':' + value;
          }).join() + '}';
        }

        if (!expr) return;
        var oldValue, toAdd, toRemove;
        scope.$watch(oneTimeBinding + expr, function bemWatchAction(newValue) {
          if (!oldValue) {
            toAdd = [];
            oldValue = {};
            angular.forEach(newValue, function (v, k) {
              v = !!v;
              oldValue[k] = v;
              v && toAdd.push(cs(k));
            });
            toAdd.length && element.addClass(toAdd.join(' '));
          } else {
            toAdd = [];
            toRemove = [];
            angular.forEach(newValue, function (v, k) {
              v = !!v;
              if (oldValue[k] === v) return;
              oldValue[k] = v;
              (v ? toAdd : toRemove).push(cs(k));
            });
            toAdd.length && $animate.addClass(element, toAdd.join(' '));
            toRemove.length && $animate.removeClass(element, toRemove.join(' '));
          }
        }, true);
      }
    }
  };
}]);
}());