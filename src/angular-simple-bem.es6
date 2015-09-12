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

.directive('bem', ['$angularSimpleBemParse', parse => {
  var BASE_DEFINITION = '$angular-simple-bem-base-definition';
  var getParentDefinition = el => el.parent().data(BASE_DEFINITION) || getParentDefinition(el.parent());
  var filterBoolModifier = m => m.value;
  var filterRawModifier = m => !m.value;
  var concatString = (s1, s2) => s1 + s2;

  return {
    restrict: 'A',
    compile: (tElement, tAttr) => {
      var match, be, m, modifiers, rawModifiers, boolModifiers, cs, oneTimeBinding;

      match = tAttr.bem.trim().match(/^([\s\S]*?)(?:--(::)?([\s\S]*))?$/);
      if (!match) throw new Error('bem: invalid pattern');
      [, be, oneTimeBinding = '', m = ''] = match;
      be = be.trim();
      m = m.trim();

      if (/^__/.test(be)) be = getParentDefinition(tElement) + be;
      tElement.data(BASE_DEFINITION, be);

      modifiers = m ? parse(m) : [];
      rawModifiers = modifiers.filter(filterRawModifier);
      boolModifiers = modifiers.filter(filterBoolModifier);

      cs = concatString.bind(null, be + '--');
      tElement.addClass([be, ...rawModifiers.map(m => m.key).map(cs)].join(' '));

      return function bemLink(scope, element) {
        scope.$watch(`${oneTimeBinding}{${boolModifiers.map(({key, value}) => `'${cs(key)}':${value}`).join()}}`, function bemWatchAction(newValue) {
          angular.forEach(newValue, (v, k) => element.toggleClass(k, !!v));
        }, true);
      };
    }
  };
}]);
