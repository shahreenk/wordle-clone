let guessesContainer = document.querySelector('#guesses-container');

for (let i = 1; i <= 30; i++) {
  let square = document.createElement('div');
  square.setAttribute('id', `letter-${i}`);
  square.setAttribute('class', 'square');
  guessesContainer.appendChild(square);
}

const squares = document.querySelectorAll('.square');
const loadingDiv = document.querySelector('.info-bar');
const resultModal = document.querySelector('.result-modal')
const ANSWER_LENGTH = 5;
const ROUNDS = 6;

async function init() {
  let currentGuess = '';
  let currentRow = 0;
  let isLoading = true;

  const res = await fetch('https://words.dev-apis.com/word-of-the-day?random=1');
  const resObj = await res.json();
  const word = resObj.word.toUpperCase();
  const wordParts = word.split('');
  let done = false;
  setLoading(false);
  isLoading = false;

  function addLetter(letter) {
    if(currentGuess.length < ANSWER_LENGTH) {
      currentGuess += letter;
    } else {
      currentGuess = currentGuess.substring(0, currentGuess.length - 1) + letter;
    }
    console.log(currentGuess);
    squares[ANSWER_LENGTH * currentRow + currentGuess.length - 1].innerText = letter;
  }

  async function commit(){
    if(currentGuess.length !== ANSWER_LENGTH) {
      // do nothing
      return;
    }

    isLoading = true;
    setLoading(isLoading);
    const res = await fetch('https://words.dev-apis.com/validate-word', {
      method: 'POST',
      body: JSON.stringify({word: currentGuess})
    });

    const resObj = await res.json();
    const validWord = resObj.validWord;

    isLoading = false;
    setLoading(isLoading);

    if (!validWord) {
      markInvalidWord();
      return;
    }

    const guessParts = currentGuess.split('');
    const map = makeMap(wordParts);
    console.log(map);

    for (let i = 0; i < ANSWER_LENGTH; i++) {
      // mark as correct
      if (guessParts[i] === wordParts[i]) {
        squares[currentRow * ANSWER_LENGTH + i].classList.add('correct');
        map[guessParts[i]]--;
      }
    }

    for (let i = 0; i < ANSWER_LENGTH; i++) {
      if (guessParts[i] === wordParts[i]) {
        // do nothing, already done
      } else if (wordParts.includes(guessParts[i]) && map[guessParts[i]] > 0) {
        squares[currentRow * ANSWER_LENGTH + i].classList.add('close');
        map[guessParts[i]]--;
      } else {
        squares[currentRow * ANSWER_LENGTH + i].classList.add('wrong');
      }
    }

    currentRow++;

    if (currentGuess === word) {
      resultModal.style.cssText = 'display: flex; color: #6aaa64';
      resultModal.innerHTML = `
        <div class="char-1">Y</div>
        <div class="char-2">O</div>
        <div class="char-3">U&nbsp;</div>
        <div class="char-4">W</div>
        <div class="char-5">I</div>
        <div class="char-6">N</div>
        <div class="char-7">!</div>
      `
      done = true;
      return;
    } else if (currentRow === ROUNDS) {
      resultModal.style.cssText = 'display: flex; color: crimson';
      resultModal.innerHTML = `
        <div class="char-1">Y</div>
        <div class="char-2">O</div>
        <div class="char-3">U&nbsp;</div>
        <div class="char-4">L</div>
        <div class="char-5">O</div>
        <div class="char-6">S</div>
        <div class="char-7">E</div>
      `
      done = true;
    }

    currentGuess = '';
  }

  function backspace() {
    currentGuess = currentGuess.substring(0, currentGuess.length - 1);
    console.log(currentGuess);
    squares[ANSWER_LENGTH * currentRow + currentGuess.length].innerText = '';
  }

  function markInvalidWord() {
    for (let i= 0; i < ANSWER_LENGTH; i++) {
      squares[currentRow * ANSWER_LENGTH + i].classList.remove('invalid');
      setTimeout(() => squares[[currentRow * ANSWER_LENGTH + i]].classList.add('invalid'), 10
      )
    }
  }

  document.addEventListener('keydown', function(e) {
    if (done || isLoading) {
      // do nothing
      return;
    }

    const action = e.key;
    console.log(action);
    if(action === 'Enter') {
      commit();
    } else if(action === 'Backspace') {
      backspace();
    } else if(isLetter(action)) {
      addLetter(action.toUpperCase());
    } else {
      // do nothing
    }
  })
}

function isLetter(letter) {
  return /^[a-zA-Z]$/.test(letter);
}

function setLoading(isLoading) {
  loadingDiv.classList.toggle('hidden', !isLoading);
}

function makeMap(array) {
  const obj = {}
  for (let i = 0; i < array.length; i++) {
    const letter = array[i];
    if (obj[letter]) {
      obj[letter]++;
    }
    else {
      obj[letter] = 1;
    }
  }
  return obj;
} 

init();


  
