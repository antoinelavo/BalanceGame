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
  
    // fallback in case votes are missing
    q.votesA = q.votesA ?? 0;
    q.votesB = q.votesB ?? 0;
  
    if (choice === 'A') q.votesA++;
    else q.votesB++;
  
    const updatePayload = {
      votesA: q.votesA,
      votesB: q.votesB
    };
  
    const { error } = await supabase
      .from('questions')
      .update(updatePayload)
      .eq('id', q.id);
  
    if (error) {
      console.error("Failed to update vote:", error.message);
      alert("투표 저장에 실패했습니다.");
      return;
    }
  
    showResult(q);
  };
  

function showResult(q) {
    // fallback defaults to 0 if missing
    const votesA = q.votesA ?? 0;
    const votesB = q.votesB ?? 0;
    const total = votesA + votesB || 1; // prevent divide by 0
  
    const percentA = Math.round((votesA / total) * 100);
    const percentB = 100 - percentA;
  
    container.innerHTML = `
      <div class="result-box">
        <p class="question-text">${q.question}</p>
        <div class="result-option">
          ${q.optionA} - ${percentA}%
        </div>
        <div class="result-option">
          ${q.optionB} - ${percentB}%
        </div>
        <button onclick="next()">다음 질문</button>
      </div>
    `;
  }
  
