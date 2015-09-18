angular.module('angular-simple-bem', [])

.factory('$angularSimpleBemParse', () => {
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

    var addResult = () => {
      results.push({key: key.trim(), value: value.trim()});
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
            !/['"]/.test(last) ? stack.push(c) : (last === c && stack.pop());
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
})

.directive('bem', ['$angularSimpleBemParse', '$animate', (parse, $animate) => {
  var BASE_DEFINITION = '__bem__';
  var getParentDefinition = el => {
    var parent = el.parent();
    if (!parent.length) throw new Error('bem: no parent');
    return parent.attr(BASE_DEFINITION) || getParentDefinition(parent);
  };
  var filterBoolModifier = m => m.value;
  var filterRawModifier = m => !m.value;
  var concatString = (s1, s2) => s1 + s2;

  return {
    restrict: 'A',
    link: {
      pre(scope, element, attr) {
        var match, be, m, modifiers, rawModifiers, boolModifiers, cs, oneTimeBinding, expr;

        match = attr.bem.trim().match(/^([\s\S]*?)(?:--(::)?([\s\S]*))?$/);
        if (!match) throw new Error('bem: invalid pattern');
        [, be, oneTimeBinding = '', m = ''] = match;
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
          element.addClass(rawModifiers.map(m => cs(m.key)).join(' '));
          if (boolModifiers.length) expr = `{${boolModifiers.map(({key, value}) => `'${key}':${value}`).join()}}`;
        }

        if (!expr) return;
        var oldValue, toAdd, toRemove;
        scope.$watch(oneTimeBinding + expr, function bemWatchAction(newValue) {
          if (!oldValue) {
            toAdd = [];
            oldValue = {};
            angular.forEach(newValue, (v, k) => {
              v = !!v;
              oldValue[k] = v;
              v && toAdd.push(cs(k));
            });
            toAdd.length && element.addClass(toAdd.join(' '));
          } else {
            toAdd = [];
            toRemove = [];
            angular.forEach(newValue, (v, k) => {
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
