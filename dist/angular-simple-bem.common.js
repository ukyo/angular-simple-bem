/*!angular-simple-bem v0.1.2 - MIT License https://github.com/ukyo/angular-simple-bem/blob/master/LICENSE */
var angular = require("angular");angular.module('angular-simple-bem', [])

.directive('bem', function() {
  'use strict';

  var BASE_DEFINITION = '$angular-simple-bem-base-definition';

  function getParentDefinition(el) {
    return el.parent().data(BASE_DEFINITION) || getParentDefinition(parent);
  }

  function filterRawModifier(m) {
    return m.indexOf(':') === -1;
  }

  function filterBoolModifier(m) {
    return m.indexOf(':') !== -1;
  }

  function concatString(s1, s2) {
    return s1 + s2;
  }

  function stringifyKey(s) {
    var match = s.match(/^([^:]+):([\s\S]+)$/);
    return '"' + match[1].trim() + '":' + match[2];
  }

  return {
    restrict: 'A',
    compile: function(tElement, tAttr) {
      var match, blockOrElement, be, m, modifiers, rawModifiers, boolModifiers, cs, oneTimeBinding;

      match = tAttr.bem.trim().match(/^([\s\S]*?)(?:--(::)?([\s\S]*))?$/);
      if (!match) throw new Error('bem: invalid pattern');
      be = match[1].trim();
      m = (match[3] || '').trim();
      oneTimeBinding = match[2] || '';

      blockOrElement = /^__/.test(be) ? getParentDefinition(tElement) + be : be;
      tElement.data(BASE_DEFINITION, blockOrElement);

      modifiers = m ? m.split(/\s*,\s*/) : [];
      rawModifiers = modifiers.filter(filterRawModifier);
      boolModifiers = modifiers.filter(filterBoolModifier);

      cs = concatString.bind(null, blockOrElement + '--');
      tElement.addClass([blockOrElement].concat(rawModifiers.map(cs)).join(' '));

      return function bemLink(scope, element) {
        scope.$watch(oneTimeBinding + '{' + boolModifiers.map(cs).map(stringifyKey).join() + '}', function bemWatchAction(newValue) {
          angular.forEach(newValue, function(v, k) {
            element.toggleClass(k, v);
          });
        }, true);
      };
    }
  };
});