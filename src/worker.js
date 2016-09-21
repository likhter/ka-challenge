import api from './api';

self.onmessage = function(msg) {
  const conditions = msg.data.conditions,
    code = msg.data.code;

  if (typeof conditions !== 'undefined' && typeof code !== 'undefined') {
    self.postMessage(api.checkCode(code, conditions));
  }
};