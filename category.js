import { supabase } from '/supabase.js';

let questions = [];
let currentIndex = 0;
let currentCategory = '';
const container = document.getElementById('game-container');

// Get category slug from URL (e.g., /category/love → "love")
const pathSegments = window.location.pathname.split('/');
currentCategory = decodeURIComponent(pathSegments[pathSegments.length - 1]);

document.getElementById("category-title").textContent = `밸런스 게임: ${currentCategory}`;

// Load questions from Supabase
async function loadQuestions() {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('category', currentCategory)
    .order('id');

  if (error || !data || data.length === 0) {
    container.innerHTML = `<p>질문을 불러오는 데 실패했거나 존재하지 않습니다.</p>`;
    console.error(error);
    return;
  }

  questions = data;
  renderQuestion();
}

// Render the current question
function renderQuestion() {
  const q = questions[currentIndex];

  container.innerHTML = `
    <div class="question-box">
      <p class="question-text">${q.question}</p>
      <div class="option-buttons">
        <button id="vote-a">${q.optiona}</button>
        <button id="vote-b">${q.optionb}</button>
      </div>
    </div>
  `;

  document.getElementById('vote-a').addEventListener('click', () => vote('A'));
  document.getElementById('vote-b').addEventListener('click', () => vote('B'));
}

// Handle voting
async function vote(choice) {
  const q = questions[currentIndex];

  // Fallbacks to prevent NaN or null
  q.votesa = q.votesa ?? 0;
  q.votesb = q.votesb ?? 0;

  if (choice === 'A') q.votesa++;
  else q.votesb++;

  const { error } = await supabase
    .from('questions')
    .update({ votesa: q.votesa, votesb: q.votesb })
    .eq('id', q.id);

  if (error) {
    alert("투표 저장에 실패했습니다.");
    console.error("Vote update failed:", error);
    return;
  }

  showResult(q);
}

// Show result after voting
function showResult(q) {
  const votesA = q.votesa ?? 0;
  const votesB = q.votesb ?? 0;
  const total = votesA + votesB || 1;

  const percentA = Math.round((votesA / total) * 100);
  const percentB = 100 - percentA;

  container.innerHTML = `
    <div class="result-box">
      <p class="question-text">${q.question}</p>
      <div class="result-option">${q.optiona ?? '옵션 A'} - ${percentA}%</div>
      <div class="result-option">${q.optionb ?? '옵션 B'} - ${percentB}%</div>
      <button id="next-btn">다음 질문</button>
    </div>
  `;

  document.getElementById('next-btn').addEventListener('click', () => {
    currentIndex++;
    if (currentIndex < questions.length) {
      renderQuestion();
    } else {
      container.innerHTML = `<p>모든 질문을 완료했습니다! 🎉</p>`;
    }
  });
}

// Start the game
loadQuestions();