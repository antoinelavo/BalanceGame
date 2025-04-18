import { supabase } from '/supabase.js';

let questions = [];
let currentIndex = 0;
const container = document.getElementById('game-container');

// TEMP FOR LOCAL TESTING:
const currentCategory = new URLSearchParams(window.location.search).get('name') || 'love';


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
      <div class="split-wrapper">
        <div class="option-box left-option" id="vote-a">${q.optiona}</div>
        <div class="option-box right-option" id="vote-b">${q.optionb}</div>
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
    <div class="split-wrapper with-button">
      <div class="option-box left-option">
        ${q.optiona} <br /><span class="percentage">${percentA}%</span>
      </div>
      <div class="option-box right-option">
        ${q.optionb} <br /><span class="percentage">${percentB}%</span>
      </div>
      <button class="next-button-overlay" id="next-btn">다음 질문</button>
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

function renderCategoryFooter() {
    const categories = [
      { name: "love", emoji: "💖", label: "연애" },
      { name: "nonsense", emoji: "🧠", label: "넌센스" },
      { name: "idol", emoji: "🎤", label: "아이돌" },
      { name: "animal", emoji: "🐶", label: "동물" },
      { name: "sports", emoji: "⚽", label: "스포츠" },
      { name: "19", emoji: "🔞", label: "19금" }
    ];
  
    const footer = document.getElementById("category-footer");
  
    // Filter out the current category
    const filtered = categories.filter(cat => cat.name !== currentCategory);
  
    footer.innerHTML = `
      <div class="category-grid">
        ${filtered.map(cat => `
          <a href="/category/${cat.name}" class="category-button">
            ${cat.emoji} <span>${cat.label}</span>
          </a>
        `).join('')}
      </div>
    `;
  }
  
  
  
renderCategoryFooter();
  