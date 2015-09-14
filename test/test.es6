describe('angular-simple-bem tests', function() {
  var $scope, $compile, parse;

  var compile = s => $compile(`<div>${s}</div>`)($scope);

  beforeEach(module('angular-simple-bem'));
  beforeEach(inject(($rootScope, _$compile_, $angularSimpleBemParse) => {
    $scope = $rootScope.$new();
    $compile = _$compile_;
    parse = $angularSimpleBemParse;
  }));

  describe('parse', () => {
    it('modifiers', () => {
      assert.deepEqual(parse('foo'), [
        {key: 'foo', value: ''}
      ]);
      assert.deepEqual(parse('foo,bar'), [
        {key: 'foo', value: ''},
        {key: 'bar', value: ''}
      ]);
      assert.deepEqual(parse(`    foo      ,       bar
        , baz`), [
        {key: 'foo', value: ''},
        {key: 'bar', value: ''},
        {key: 'baz', value: ''}
      ]);

      var expr = 'foo({a:[",,,)}]", \'({[\\\',,,\'], b: 1}) + {a: 1, b: 2, \'({[\': "]})"} - [1, 2, 3]';
      assert.deepEqual(parse(`foo:${expr}`), [
        {key: 'foo', value: expr}
      ]);
      assert.deepEqual(parse(`     foo
             :
        ${expr}
        `), [
        {key: 'foo', value: expr}
      ]);
      assert.deepEqual(parse(`foo:${expr},bar`), [
        {key: 'foo', value: expr},
        {key: 'bar', value: ''}
      ]);
      assert.deepEqual(parse(`foo,bar:${expr}`), [
        {key: 'foo', value: ''},
        {key: 'bar', value: expr}
      ]);
      assert.deepEqual(parse(`foo:${expr},bar:${expr}`), [
        {key: 'foo', value: expr},
        {key: 'bar', value: expr}
      ]);
      assert.deepEqual(parse(`foo:${expr},bar,baz:${expr}`), [
        {key: 'foo', value: expr},
        {key: 'bar', value: ''},
        {key: 'baz', value: expr}
      ]);
      assert.deepEqual(parse(`foo,bar:${expr},baz`), [
        {key: 'foo', value: ''},
        {key: 'bar', value: expr},
        {key: 'baz', value: ''}
      ]);
    });
  });

  describe('block or element', () => {
    it('can nest', () => {
      var el = compile(`
        <div bem="block">
          <div bem="__el1">
            <div bem="__el2"></div>
          </div>
        </div>
      `);
      $scope.$digest();

      assert(el.find('[bem="block"]').hasClass('block'));
      assert(el.find('[bem="__el1"]').hasClass('block__el1'));
      assert(el.find('[bem="__el2"]').hasClass('block__el1__el2'));
    });
  });

  describe('transclude: "element"', () => {

    it('can use', () => {
      var el = compile(`
        <div bem="block">
          <div bem="__el1">
            <div bem="__el2" ng-if="foo"></div>
          </div>
        </div>
      `);
      $scope.foo = false;
      $scope.$digest();

      assert(el.find('[bem="block"]').hasClass('block'));
      assert(el.find('[bem="__el1"]').hasClass('block__el1'));
      assert.throws(el.find('[bem="__el2"]').hasClass('block__el1__el2'));

      $scope.foo = true;
      $scope.$digest();
      assert(el.find('[bem="__el2"]').hasClass('block__el1__el2'));
    });
  });

  describe('modifier', () => {
    it('can has a modifier', () => {
      var el = compile(`
        <div bem="block--mod">
          <div bem="__el1--mod"></div>
        </div>
      `);
      $scope.$digest();

      assert(el.find('[bem="block--mod"]').hasClass('block block--mod'));
      assert(el.find('[bem="__el1--mod"]').hasClass('block__el1 block__el1--mod'));
    });

    it('can has modifiers', () => {
      var el = compile(`
        <div bem="block--mod1,mod2">
          <div bem="__el1--mod1,mod2"></div>
        </div>
      `);
      $scope.$digest();

      assert(el.find('[bem="block--mod1,mod2"]').hasClass('block block--mod1 block--mod2'));
      assert(el.find('[bem="__el1--mod1,mod2"]').hasClass('block__el1 block__el1--mod1 block__el1--mod2'));
    });

    it('can has modifiers with binding', () => {
      $scope.foo = true;
      var el = compile(`
        <div bem="block--mod:foo">
          <div bem="__el1--mod:!foo"></div>
        </div>
      `);
      $scope.$digest();

      assert(el.find('[bem="block--mod:foo"]').hasClass('block block--mod'));
      assert(el.find('[bem="__el1--mod:!foo"]').hasClass('block__el1'));

      $scope.foo = false;
      $scope.$digest();

      assert(el.find('[bem="block--mod:foo"]').hasClass('block'));
      assert(el.find('[bem="__el1--mod:!foo"]').hasClass('block__el1 block__el1--mod'));
    });

    it('can has modifiers with one time binding', () => {
      $scope.foo = true;
      $scope.bar = undefined;

      var el = compile(`
        <div bem="block--::mod:foo">
          <div bem="__el1--::mod:bar"></div>
        </div>
      `);
      $scope.$digest();

      assert(el.find('[bem="block--::mod:foo"]').hasClass('block block--mod'));
      assert(el.find('[bem="__el1--::mod:bar"]').hasClass('block__el1'));

      $scope.foo = false;
      $scope.bar = true
      $scope.$digest();

      assert(el.find('[bem="block--::mod:foo"]').hasClass('block block--mod'));
      assert(el.find('[bem="__el1--::mod:bar"]').hasClass('block__el1 block__el1--mod'));

      $scope.bar = false
      $scope.$digest();

      assert(el.find('[bem="__el1--::mod:bar"]').hasClass('block__el1 block__el1--mod'));
    });

    it('can has expressions', () => {
      $scope.foo = {mod: true};
      $scope.bar = false;
      var el = compile(`
        <div bem="block--(foo)">
          <div bem="__el1--({mod: bar})"></div>
        </div>
      `);
      $scope.$digest();

      assert(el.find('[bem="block--(foo)"]').hasClass('block block--mod'));
      assert(el.find('[bem="__el1--({mod: bar})"]').hasClass('block__el1'));

      $scope.foo.mod = false;
      $scope.bar = true;
      $scope.$digest();

      assert(el.find('[bem="block--(foo)"]').hasClass('block'));
      assert(el.find('[bem="__el1--({mod: bar})"]').hasClass('block__el1 block__el1--mod'));
    });

    it('can has expressions with one time binding', () => {
      $scope.foo = {mod: true};
      $scope.bar = undefined;
      var el = compile(`
        <div bem="block--::(foo)">
          <div bem="__el1--::({mod: bar})"></div>
          <div bem="__el1--::{mod: bar}"></div>
        </div>
      `);
      $scope.$digest();

      assert(el.find('[bem="block--::(foo)"]').hasClass('block block--mod'));
      assert(el.find('[bem="__el1--::({mod: bar})"]').hasClass('block__el1'));
      assert(el.find('[bem="__el1--::{mod: bar}"]').hasClass('block__el1'));

      $scope.foo.mod = false;
      $scope.bar = true;
      $scope.$digest();

      assert(el.find('[bem="block--::(foo)"]').hasClass('block block--mod'));
      assert(el.find('[bem="__el1--::({mod: bar})"]').hasClass('block__el1 block__el1--mod'));
      assert(el.find('[bem="__el1--::{mod: bar}"]').hasClass('block__el1 block__el1--mod'));

      $scope.bar = false;
      $scope.$digest();

      assert(el.find('[bem="__el1--::({mod: bar})"]').hasClass('block__el1 block__el1--mod'));
      assert(el.find('[bem="__el1--::{mod: bar}"]').hasClass('block__el1 block__el1--mod'));
    });
  });
});
