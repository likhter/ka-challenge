export default {
  1: {
    code: `
// Expected result:
//  whitelist --> ok
//  blacklist --> ok
//  structure --> ok
// What to do: try adding while somewhere to 
//  see how blacklist condition works

for (var i = 0; i < 10; i++) {
  if (i > 5) 
    console.log('i > 5');
  else
    console.log('i < 5');
}
`,
    whitelist: ['ForStatement', 'IfStatement'],
    blacklist: ['WhileStatement'],
    structure: ['ForStatement', 'IfStatement']
  },
  2: {
    code: `
// Expected result:
//  whitelist --> error
//  blacklist --> error
//  structure --> error
// How to fix: remove *while*, add *if*

for (var i = 0; i < 10; i++) {
  while (i < 5) { i++; }
  console.log('i=', i);
}
`,
    whitelist: ['ForStatement', 'IfStatement'],
    blacklist: ['WhileStatement'],
    structure: ['ForStatement', 'IfStatement']
  },
  3: {
    code: `
// Expected result:
//  whitelist --> error
//  blacklist --> ok
//  structure --> ok
// How to fix: declare x

if (x < 5) {
  console.log('x < 5');
} else {
  console.log('x > 5');
}
`,
    whitelist: ['VariableDeclaration', 'IfStatement'],
    blacklist: ['ForStatement'],
    structure: ['IfStatement']
  },
  4: {
    code: `
// ES6 also works, thanks to Esprima!
// Expected result:
//  whitelist --> ok (VariableDeclaration inside ForStatement init)
//  blacklist --> ok
//  structure --> error
// How to fix: classical js closure problem. 
//  Wrap onSomeEvent handler with IIFE. 

const elementList = [/*defined somewhere*/];
for (let i = 0; i < elementList.length; i++) {
	elementList[i].onSomeEvent = function() {
		alert("Element number " + i);
	};
}
`,
    whitelist: ['VariableDeclaration', 'ForStatement'],
    blacklist: ['IfStatement', 'WhileStatement'],
    structure: ['ForStatement', 'CallExpression', 'FunctionExpression', 'FunctionExpression']
  }
}