// js/category.js
import { supabase } from './supabase.js';


let questions = [];
let currentIndex = 0;
let currentCategory = '';

const container = document.getElementById('game-container');

// Extract category name from URL path (e.g. /category/love)
const pathSegments = window.location.pathname.split('/');
currentCategory = pathSegments[pathSegments.length - 1];


document.getElementById("category-title").textContent = `밸런스 게임: ${decodeURIComponent(currentCategory)}`;

loadQuestions();

async function loadQuestions() {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('category', currentCategory)
    .order('id');

  if (error) {
    container.innerHTML = `<p>문제를 불러오는 중 오류가 발생했습니다.</p>`;
    console.error(error);
    return;
  }

  questions = data;
  if (questions.length === 0) {
    container.innerHTML = `<p>해당 카테고리에 질문이 없습니다.</p>`;
    return;
  }

  renderQuestion();
}

function renderQuestion() {
  const q = questions[currentIndex];

  container.innerHTML = `
    <div class="question-box">
      <p class="question-text">${q.question}</p>
      <div class="option-buttons">
        <button onclick="window.vote('A')">${q.optiona}</button>
        <button onclick="window.vote('B')">${q.optionb}</button>
      </div>
    </div>
  `;
}

window.vote = async function (choice) {
  const q = questions[currentIndex];

  // Optimistic update
  if (choice === 'A') q.votesA++;
  else q.votesB++;

  // Update Supabase
  await supabase
    .from('questions')
    .update(choice === 'A' ? { votesA: q.votesA } : { votesB: q.votesB })
    .eq('id', q.id);

  showResult(q);
};

function showResult(q) {
  const total = q.votesA + q.votesB;
  const percentA = Math.round((q.votesA / total) * 100);
  const percentB = 100 - percentA;

  container.innerHTML = `
    <div class="result-box">
      <p class="question-text">${q.question}</p>
      <div class="result-option">
        ${q.optiona} - ${percentA}%
      </div>
      <div class="result-option">
        ${q.optionb} - ${percentB}%
      </div>
      <button onclick="next()">다음 질문</button>
    </div>
  `;
}

window.next = function () {
  currentIndex++;
  if (currentIndex < questions.length) {
    renderQuestion();
  } else {
    container.innerHTML = `<p>모든 질문을 완료했습니다! 🎉</p>`;
  }
};
