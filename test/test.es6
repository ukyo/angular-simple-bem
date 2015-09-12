describe('angular-simple-bem tests', function() {
  var $scope, $compile;

  function compile(s) {
    return $compile('<div>' + s + '</div>')($scope);
  }

  beforeEach(module('angular-simple-bem'));
  beforeEach(inject(function($rootScope, _$compile_) {
    $scope = $rootScope.$new();
    $compile = _$compile_;
  }));

  describe('block or element', function() {
    it('can nest', function() {
      var el = compile('<div bem="block"><div bem="__el1"><div bem="__el2"></div></div></div>');
      $scope.$digest();
      assert(el.find('[bem="block"]').hasClass('block'));
      assert(el.find('[bem="__el1"]').hasClass('block__el1'));
      assert(el.find('[bem="__el2"]').hasClass('block__el1__el2'));
    });
  });

  describe('modifier', function() {
    it('can has a modifier', function() {
      var el = compile('<div bem="block--mod"><div bem="__el1--mod"></div></div>');
      $scope.$digest();

      assert(el.find('[bem="block--mod"]').hasClass('block block--mod'));
      assert(el.find('[bem="__el1--mod"]').hasClass('block__el1 block__el1--mod'));
    });

    it('can has modifiers', function() {
      var el = compile('<div bem="block--mod1,mod2"><div bem="__el1--mod1,mod2"></div></div>');
      $scope.$digest();

      assert(el.find('[bem="block--mod1,mod2"]').hasClass('block block--mod1 block--mod2'));
      assert(el.find('[bem="__el1--mod1,mod2"]').hasClass('block__el1 block__el1--mod1 block__el1--mod2'));
    });

    it('can has modifiers with binding', function() {
      $scope.foo = true;
      var el = compile('<div bem="block--mod:foo"><div bem="__el1--mod:!foo"></div></div>');
      $scope.$digest();

      assert(el.find('[bem="block--mod:foo"]').hasClass('block block--mod'));
      assert(el.find('[bem="__el1--mod:!foo"]').hasClass('block__el1'));

      $scope.foo = false;
      $scope.$digest();

      assert(el.find('[bem="block--mod:foo"]').hasClass('block'));
      assert(el.find('[bem="__el1--mod:!foo"]').hasClass('block__el1 block__el1--mod'));
    });

    it('can has modifiers with one time binding', function() {
      $scope.foo = true;
      var el = compile('<div bem="block--::mod:foo"><div bem="__el1--::mod:!foo"></div></div>');
      $scope.$digest();

      assert(el.find('[bem="block--::mod:foo"]').hasClass('block block--mod'));
      assert(el.find('[bem="__el1--::mod:!foo"]').hasClass('block__el1'));

      $scope.foo = false;
      $scope.$digest();

      assert(el.find('[bem="block--::mod:foo"]').hasClass('block block--mod'));
      assert(el.find('[bem="__el1--::mod:!foo"]').hasClass('block__el1'));
    });
  });
});
