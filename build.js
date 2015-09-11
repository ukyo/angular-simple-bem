var pkg = require('./package.json');
var fs = require('fs');
var path = require('path');

var license = '/*! ' + pkg.name + ' v' + pkg.version + ' - MIT License ' + pkg.homepage + '/blob/master/LICENSE */\n';
var src = path.resolve(__dirname, 'src/angular-simple-bem.js');
var s = fs.readFileSync(src, 'utf8');

fs.writeFileSync(path.resolve(__dirname, 'dist/angular-simple-bem.common.js'), license + 'var angular = require("angular");\n' + s);
fs.writeFileSync(path.resolve(__dirname, 'dist/angular-simple-bem.js'), license + s);
