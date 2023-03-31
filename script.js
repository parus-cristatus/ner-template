const text = document.querySelector('.text');
const buttons = document.querySelectorAll('.btn');
const errorBlock = document.querySelector('.error');
const outputTable = document.querySelector('.output-table');
let output = [];
let selectionColor = '';
let label = '';
let buttonClicked = false;
let isDoubleClick = false;

// Divide string into tokens
const tokens = text.textContent.trim().split('').map((token, index) => {
  return `<span data-index="${index}">${token}</span>`;
});
text.innerHTML = tokens.join('');

const spans = document.querySelectorAll('.text span');

// Add class for whitespace tokens
spans.forEach(span => {
  if (span.textContent.trim() === '') {
    span.classList.add('whitespace')
  }
});

// Prevent default dblclick selection
text.addEventListener('dblclick', (event) => {
  event.preventDefault();
});

buttons.forEach(button => {
  button.addEventListener('click', () => {
    for (let button of buttons) {
      button.classList.remove('pressed');
    }
    button.classList.add('pressed');
    selectionColor = button.dataset.color;
    label = button.dataset.class;
    buttonClicked = true;
  });
});


text.addEventListener('mouseup', () => {
  selectionIsMade = true;     
  const selection = window.getSelection().toString().trim();
      
  if (selection !== '' && buttonClicked) {
    isDoubleClick = true;
    errorBlock.style.display = 'none';
    const indices = calculateSelectionIndices();
    const selectionLength = indices.selectionEndIndex - indices.selectionStartIndex + 1;

    if (/\s/.test(selection)) {
      showError('Select separate entities.');
      window.getSelection().removeAllRanges();
      return;
    }
    
    spans.forEach(span => {
      const spanIndex = parseInt(span.dataset.index);
      if (spanIndex >= indices.selectionStartIndex && spanIndex <= indices.selectionEndIndex && span.textContent.trim() !== '') {
        handleSelectionBackground(span, selectionColor, 'add');
          } 
        });

        if (!output.some(sel => sel.start === indices.selectionStartIndex || sel.end === indices.selectionEndIndex)) {
           output = setOutput(label, selection, indices.selectionStartIndex, indices.selectionEndIndex, selectionLength)
          renderOutput(output, outputTable);
        }
        console.log(output);
        
        // Remove browser selection
        window.getSelection().removeAllRanges();
        
      } else {
        window.getSelection().removeAllRanges();
        if (!isDoubleClick) {
          showError('Please select a label.');
        }

      }

});



// Remove selection on click
spans.forEach(span => {
  span.addEventListener('dblclick', () => {
    isDoubleClick = true;
    let selectionIndex = removeSelection(span);
    output = output.filter(sel => sel.start !== selectionIndex);
    renderOutput(output, outputTable);
    console.log('After removal: ', output);
  });
});


function findNearestNonWhitespaceSpanIndex(span, direction) {
  let currentSpan = span;
  while (currentSpan) {
    if (!currentSpan.classList.contains('whitespace')) {
      return parseInt(currentSpan.dataset.index);
    } else {
      currentSpan = currentSpan[`${direction}ElementSibling`];
    }
  }
}


// calculate start and end indices of selected fragment
function calculateSelectionIndices() {
        let selectionStartSpan = window.getSelection().anchorNode.parentNode;
        let selectionEndSpan = window.getSelection().focusNode.parentNode;
        let selectionStartIndex = findNearestNonWhitespaceSpanIndex(selectionStartSpan, 'next');
        let selectionEndIndex = findNearestNonWhitespaceSpanIndex(selectionEndSpan, 'previous');

        return {
          "selectionStartIndex": selectionStartIndex,
          "selectionEndIndex": selectionEndIndex
        }
}


//Calculate selection start token index to remove it

function calculateSelectedStartIndex(token) {
      let selectionIndex = 0;
  
      if (token.previousElementSibling && token.previousElementSibling.classList.contains('whitespace')) {
        selectionIndex = parseInt(token.dataset.index)
      } else if (!token.previousElementSibling) {
        selectionIndex = parseInt(token.dataset.index);
      } else {
        
        while (token && token.classList.contains('selected') && !token.classList.contains('whitespace')) {
          token = token.previousElementSibling;
        }

        if (token) {
          selectionIndex = parseInt(token.dataset.index) + 1;
        }
        

        
      }

      return selectionIndex;
}


function removeSelection(span) {
    let selectionIndex  = calculateSelectedStartIndex(span);
    if (span.classList.contains('selected')) {

      handleSelectionBackground(span, '', 'remove');
      iterateThroughSpans(span, 'previous', (currentSpan) => {
  handleSelectionBackground(currentSpan, '', 'remove');
});
      iterateThroughSpans(span, 'next', (currentSpan) => {
  handleSelectionBackground(currentSpan, '', 'remove');
});
    }
    return selectionIndex; 
}


function iterateThroughSpans(startingSpan, direction, callback) {
  let currentSpan = startingSpan[direction + 'ElementSibling'];
  while (currentSpan && !currentSpan.classList.contains('whitespace')) {
    callback(currentSpan);
    currentSpan = currentSpan[direction + 'ElementSibling'];
  }
}


function setOutput(label, selection, start, end, length) {
        const newSelection = {
          'label': label,
          'fragment': selection,
          'start': start,
          'end': end,
          'len': length           
        };

        if (newSelection.len <= 0) {
          return output;
        } else {
        output.push(newSelection);
        return output.sort((a, b) => a.start - b.start);
        }

}


function showError(err) {
  errorBlock.style.display = 'block';
  errorBlock.textContent = err;
}

function handleSelectionBackground(span, bg, action) {
      action === 'add' ? span.classList.add('selected') : span.classList.remove('selected');
      span.style.backgroundColor = bg;
    }


function renderOutput(output, outputContainer) {
  outputContainer.innerHTML = '<tr><th>Fragment</th><th>Label</th><th>Start</th><th>End</th><th>Length</th></tr>';
  output.forEach(item => {
    const row = document.createElement('tr');
    const labelCell = document.createElement('td');
    labelCell.textContent = item.label;
    const fragmentCell = document.createElement('td');
    fragmentCell.textContent = item.fragment;
    const startCell = document.createElement('td');
    startCell.textContent = item.start;
    const endCell = document.createElement('td');
    endCell.textContent = item.end;
    const lengthCell = document.createElement('td');
    lengthCell.textContent = item.len;
    row.appendChild(labelCell);
    row.appendChild(fragmentCell);
    row.appendChild(startCell);
    row.appendChild(endCell);
    row.appendChild(lengthCell);
    outputContainer.appendChild(row);
  });
}




