import assert from 'assert';
import api from '../src/api';

// TDD rocks!
// TODO: Var declaration in for block, check how it looks like in ast
// TODO: hoisting
// TODO: webworker loaded
describe('API', () => {
  describe('exports', () => {
    it('should have necessary methods', () => {
      assert('checkWhitelist' in api);
      assert('checkBlacklist' in api);
      assert('checkStructure' in api);
      assert('checkCode' in api);
    });
  });

  describe('#checkWhiteList', () => {
    it('should handle unparseable code', () => {
      assert(api.checkWhitelist('s{o]me wr0n$ c0d#', []).error);
    });
    it('should work with empty list', () => {
      assert(api.checkWhitelist(
        'var i = 5; if (i < 3) { console.log(1); } else { console.log(2); }',
        []
      ));
    });
    it('should work with single element', () => {
      assert(api.checkWhitelist(
        'var i = 5;',
        ['VariableDeclaration']
      ));
      assert(api.checkWhitelist(
        'if (i == 5) { console.log(1); }',
        ['VariableDeclaration']
      ) === false);
    });
    it('should work with multiple elements in the list', () => {
      assert(api.checkWhitelist(
        'var i = 5; if (i < 3) { console.log(1); } for (i = 0; i < 4; i++) { } ',
        ['VariableDeclaration', 'IfStatement']
      ));
      assert(api.checkWhitelist(
        'var i = 5; if (i < 3) { console.log(1); } for (i = 0; i < 4; i++) { } ',
        ['VariableDeclaration', 'IfStatement', 'WhileStatement']
      ) === false);
    });
    it('should work despite of order and depth', () => {
      assert(api.checkWhitelist(
        'var i; for (i = 0; i < 10; i++) { if (i < 5) console.log(1); }',
        ['IfStatement', 'VariableDeclaration']
      ));
    });
    it('should work with elements inside for inits/ifs etc', () => {
      assert(api.checkWhitelist(
        'for (var i = 0; i < 10; i++) { console.log(i); }',
        ['VariableDeclaration']
      ));
      assert(api.checkWhitelist(
        'for (i = 0; i < 10; i++) { console.log(i); }',
        ['VariableDeclaration']
      ) === false);
      assert(api.checkWhitelist(
        'if (hello()) { /* nothing */ }',
        ['CallExpression']
      ));
    });
  });

  describe('#checkBlacklist', () => {
    it('should handle unparseable code', () => {
      assert(api.checkBlacklist('s{o]me wr0n$ c0d#', []).error);
    });
    it('should work with empty list', () => {
      assert(api.checkBlacklist(
        'var i = 5; if (i < 3) { console.log(1); } else { console.log(2); }',
        []
      ));
    });
    it('should work with single element', () => {
      assert(api.checkBlacklist(
        'var i = 5; if (i < 3) { console.log(1); } else { console.log(2); }',
        ['ForStatement']
      ));
      assert(api.checkBlacklist(
        'var i = 5; if (i < 3) { console.log(1); } else { console.log(2); }',
        ['IfStatement']
      ) === false);
    });
    it('should work with multiple elements in the list', () => {
      assert(api.checkBlacklist(
        'var i = 5; if (i < 3) { console.log(1); } else { console.log(2); }',
        ['ForStatement', 'WhileStatement']
      ));
      assert(api.checkBlacklist(
        'var i = 5; if (i < 3) { console.log(1); } else { console.log(2); }',
        ['ForStatement', 'WhileStatement', 'VariableDeclaration']
      ) === false)
    });
    it('should work with elements inside for inits/ifs etc', () => {
      assert(api.checkBlacklist(
        'for (var i = 0; i < 10; i++) { console.log(i); }',
        ['VariableDeclaration']
      ) === false);
      assert(api.checkBlacklist(
          'for (i = 0; i < 10; i++) { console.log(i); }',
          ['VariableDeclaration']
        ));
      assert(api.checkBlacklist(
        'if (hello()) { /* nothing */ }',
        ['CallExpression']
      ) === false);
    });
  });



  describe('#checkStructure', () => {
    it('should handle unparseable code', () => {
      assert(api.checkStructure('s{o]me wr0n$ c0d#', []).error);
    });
    it('should work with empty list', () => {
      assert(api.checkStructure(
        'var i; for (i = 0; i < 10; i++) { if (i < 5) { console.log(1); } else { console.log(2); } }',
        []
      ));
    });
    it('should work with single element in list, that is first in ast', () => {
      assert(api.checkStructure(
        'var i = 0; for (i = 0; i < 10; i++) { if (i < 5) { console.log(1); } else { console.log(2); } }',
        ['VariableDeclaration']
      ));
    });
    it('should work with single element in list, that is in the middle of ast', () => {
      assert(api.checkStructure(
        'var i; for (i = 0; i < 10; i++) { if (i < 5) { console.log(1); } else { console.log(2); } }',
        ['IfStatement']
      ));
    });
    it('should work with single element in list, that is a leaf in the ast', () => {
      assert(api.checkStructure(
        'var i; for (i = 0; i < 10; i++) { if (i < 5) { console.log(1); } else { console.log(2); } }',
        ['IfStatement']
      ));
    });
    it('should work with multiple elements in the list', () => {
      assert(api.checkStructure(
        'for (var i = 0; i < 10; i++) { if (i < 5) { console.log(1); } else { console.log(2); } }',
        ['ForStatement', 'IfStatement', 'BlockStatement']
      ));
    });
  });



  describe('#checkCode', () => {
    it('should handle unparseable code', () => {
      assert(api.checkCode('s{o]me wr0n$ c0d#', {
        whitelist: [],
        blacklist: [],
        structure: []
      }).error);
    });

    it('should call corresponding methods', () => {
      // TODO: expose astHasAll/astHasAny methods of API to use sinon
      const tests = [{
        code: 'var i = 5; if (i < 5) console.log(1); ',
        whitelist: ['VariableDeclaration'], // true
        blacklist: ['WhileStatement'], // true
        structure: ['IfStatement', 'CallExpression'] // true
      }, {
        code: 'if (i < 5) console.log(1);',
        whitelist: ['VariableDeclaration'], // false
        blacklist: ['WhileStatement'], // true
        structure: ['IfStatement', 'CallExpression'] // true
      }, {
        code: 'var i = 5; if (i < 5) console.log(1);',
        whitelist: ['ForStatement'], // false
        blacklist: ['IfStatement'], // false
        structure: ['ForStatement'] // false
      }];

      tests.forEach(test => {
        const result = api.checkCode(test.code, test),
          wlResult = api.checkWhitelist(test.code, test.whitelist),
          blResult = api.checkBlacklist(test.code, test.blacklist),
          strResult = api.checkStructure(test.code, test.structure);

        assert.equal(result.whitelist, wlResult);
        assert.equal(result.blacklist, blResult);
        assert.equal(result.structure, strResult);
      });
    });
  });
});