import CodeMirror from 'codemirror';
import 'codemirror/mode/javascript/javascript';
import samples from './samples';

const workerSrc = 'worker.js';
const filters = ['whitelist', 'blacklist', 'structure'];
let editor,
  worker,
  parseErrorEl,
  filterInputs = {},
  resultSpans = {};

function parseStringToArray(str) {
  if (/^\s*$/.test(str)) {
    return [];
  }
  return str.
        replace(/^\s+/, '').
        replace(/\s+$/, '').
        split(/\s+/);
}

function getConditions() {
  let result = {};
  filters.forEach(filterName => {
    result[filterName] = parseStringToArray(filterInputs[filterName].value);
  });
  return result;
}

function showFilterResult(filterName, resultSuccessful) {
  const span = resultSpans[filterName];
  span.classList.remove('hidden');
  span.textContent = resultSuccessful ? 'condition met' : 'condition violated';
  span.classList.remove(resultSuccessful ? 'resultErr' : 'resultOk');
  span.classList.add(resultSuccessful ? 'resultOk' : 'resultErr');
}

function hideFilterResults() {
  Object.keys(resultSpans).forEach(filterName => resultSpans[filterName].classList.add('hidden'));
}

function showParseError() {
  parseErrorEl.classList.remove('hidden');
}

function hideParseError() {
  parseErrorEl.classList.add('hidden');
}

function onWorkerMessage(msg) {
  const result = msg.data;
  if (!result) {
    return;
  }
  if (result.error) {
    hideFilterResults();
    showParseError();
  } else {
    hideParseError();
    filters.forEach(filterName => showFilterResult(filterName, result[filterName]));
  }
}

function submitCode() {
  worker.postMessage({
    conditions: getConditions(),
    code: editor.getValue()
  });
}

function onSampleBtnClick(ev) {
  const btn = ev.target,
    sampleData = samples[btn.dataset.sampleId];

  filters.forEach(filterName => filterInputs[filterName].value = sampleData[filterName].join(' '));
  editor.setValue(sampleData.code);
}


document.addEventListener('DOMContentLoaded', () => {
  editor = CodeMirror.fromTextArea(document.getElementById('editor'), {
    lineNumbers: true,
    mode: 'javascript',
    tabSize: 2,
    viewportMargin: Infinity
  });
  worker = new Worker(workerSrc);
  worker.onmessage = onWorkerMessage;
  editor.on('change', submitCode);
  parseErrorEl = document.getElementById('parseError');
  filters.forEach(filterName => {
    filterInputs[filterName] = document.querySelector('#' + filterName + ' input');
    resultSpans[filterName] = document.querySelector('#' + filterName + ' span');
    filterInputs[filterName].addEventListener('blur', submitCode);
  });
  // FF and IE do not support .forEach for NodeList
  Array.prototype.forEach.call(document.querySelectorAll('.sampleBtn'), (btn) => btn.addEventListener('click', onSampleBtnClick))
});


