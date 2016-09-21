import esprima from 'esprima';
import Set from 'es6-set'; // "Thanks", IE, for still not supporting native sets

function errorCanNotParseCode() {
  return {
    error: true,
    msg: 'Can not parse code'
  };
}


function traverse(node, fn) {
  let stack = [node];
  let shouldStop = false;
  while (!shouldStop && stack.length) {
    let current = stack.pop();
    fn(current, () => { shouldStop = true });
    Object.keys(current).forEach(key => {
      const element = current[key];
      if (element === undefined || element === null) {
        return;
      } if (element instanceof Array) {
        for (let i = 0; i < element.length; i++) {
          if (element[i].type) {
            stack.push(element[i]);
          }
        }
      } else if (typeof element === 'object' && element.type) {
        stack.push(element);
      }
    });
  }
}

function parseCode(code) {
  let parsed = null;
  try {
    parsed = esprima.parse(code, { tolerant: true });
    if (parsed.errors.length) {
      return null;
    }
  } catch (ex) {
    return null;
  }
  return parsed;
}

function astHasAny(ast, list = []) {
  let result = false;
  const set = new Set(list);
  traverse(ast, (node, stopTraverse) => {
    const nodeType = node.type;
    if (!nodeType) { return; }
    if (nodeType && set.has(nodeType)) {
      result = true;
      stopTraverse();
    }
  });
  return result;
}

function astHasAll(ast, list = []) {
  if (!list.length) {
    return true;
  }
  let result = false;
  const set = new Set(list);
  traverse(ast, (node, stopTraverse) => {
    const nodeType = node.type;
    if (!nodeType) { return; }
    if (set.has(nodeType)) {
      set.delete(nodeType);
      if (set.size === 0) {
        result = true;
        stopTraverse();
      }
    }
  });
  return result;
}

function pathTailMatchesStructure(path, structure, lastMatchedStructureIdx) {
  return path[path.length - 1] === structure[lastMatchedStructureIdx + 1];
}

function matchStructure(ast, structure = []) {
  if (!structure.length) { return true; }

  let path = [],
    stack = [];

  stack.push([ast, -1]);

  while (stack.length) {
    let [ current, lastMatchedIdx ] = stack[stack.length - 1];
    if (current.__childrenAdded) {
      stack.pop();
      path.pop();
    } else {
      path.push(current.type);
      if (pathTailMatchesStructure(path, structure, lastMatchedIdx)) {
        lastMatchedIdx++;
        if (lastMatchedIdx == structure.length - 1) { return true; }
      }
      let keys = Object.keys(current);
      current.__childrenAdded = true;
      if (keys.length) {
        for (let i = 0; i < keys.length; i++) {
          let element = current[keys[i]];
          if (element === undefined || element === null) {
            continue;
          }
          if (element instanceof Array && element.length) {
            for (let j = element.length-1; j >= 0; j--) {
              if (element[j].type) {
                stack.push([element[j], lastMatchedIdx]);
              }
            }
          } else if (typeof element === 'object' && element.type) {
            stack.push([element, lastMatchedIdx]);
          }
        }
      }
    }
  }

  return false;
}

export default {
  checkCode: (code, conditions = {
    whitelist: [],
    blacklist: [],
    structure: ''
  }) => {
    const ast = parseCode(code);
    if (!ast) {
      return errorCanNotParseCode();
    }
    return {
      whitelist: astHasAll(ast, conditions.whitelist),
      blacklist: !astHasAny(ast, conditions.blacklist),
      structure: matchStructure(ast, conditions.structure)
    }
  },

  checkWhitelist: (code, whitelist = []) => {
    const ast = parseCode(code);
    if (!ast) {
      return errorCanNotParseCode();
    }
    return astHasAll(ast, whitelist);
  },

  checkBlacklist: (code, blacklist = []) => {
    const ast = parseCode(code);
    if (!ast) {
      return errorCanNotParseCode();
    }
    return !astHasAny(ast, blacklist);
  },

  checkStructure: (code, structure = '') => {
    const ast = parseCode(code);
    if (!ast) {
      return errorCanNotParseCode();
    }
    return matchStructure(ast, structure);
  }
};