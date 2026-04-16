// --- Global Variables ---
let captchaAnswer = 0;

// --- 1. CAPTCHA & Arithmetic ---
function generateCaptcha() {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    captchaAnswer = num1 + num2; // Basic arithmetic
    const promptElement = document.getElementById('captcha-prompt');
    if(promptElement) {
        promptElement.innerText = `What is ${num1} + ${num2}?`;
    }
}

function verifyCaptcha() {
    const userAnswer = document.getElementById('captcha-input').value;
    const errorMsg = document.getElementById('captcha-error');
    
    // Conditional Statement
    if (parseInt(userAnswer) === captchaAnswer) {
        document.getElementById('captcha-overlay').style.display = 'none';
        // Show Cookie Modal after CAPTCHA
        document.getElementById('cookie-modal').style.display = 'flex';
    } else {
        errorMsg.innerText = "Wrong answer, Ganondorf! Try again.";
        generateCaptcha();
    }
}

// --- 2. Cookie Modal ---
function acceptCookies() {
    const modal = document.getElementById('cookie-modal');
    // Updating CSS dynamically
    modal.style.opacity = '0';
    setTimeout(() => modal.style.display = 'none', 500);
}

// --- 3. Lightbox ---
function openLightbox(element) {
    const lightbox = document.getElementById('lightbox-overlay');
    const lightboxImg = document.getElementById('lightbox-img');
    if (element.tagName === 'IMG') { lightboxImg.src = element.src; }
    lightbox.style.display = 'flex';
}

function closeLightbox() {
    document.getElementById('lightbox-overlay').style.display = 'none';
}

// --- 4. JSON & Dynamic HTML ---
async function loadTimeline() {
    try {
        const response = await fetch('timeline.json');
        const data = await response.json();
        const container = document.getElementById('timeline-display');
        if (container) {
            let html = '<div class="timeline-grid">';
            data.zelda_timeline.forEach(game => {
                html += `<div class="timeline-item"><h3>${game.title}</h3><p>${game.description}</p></div>`;
            });
            html += '</div>';
            // Updating HTML element dynamically
            container.innerHTML = html;
        }
    } catch (e) { console.log(e); }
}

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('timeline') || document.body;

  function renderTimeline(data) {
    // simple example renderer — adapt to your original loadTimeline()
    console.log('Timeline data:', data);
    // create a small list in the page for demonstration
    const wrap = document.createElement('div');
    const ul = document.createElement('ul');
    const events = Array.isArray(data.events) ? data.events : [];
    for (let i = 0; i < events.length; i++) {
      const e = events[i];
      const li = document.createElement('li');
      li.textContent = `${e.year} — ${e.title}: ${e.description}`;
      ul.appendChild(li);
    }
    wrap.appendChild(ul);
    container.appendChild(wrap);
  }

  // Try embedded JSON first (works without server)
  const scriptTag = document.getElementById('timeline-data');
  if (scriptTag) {
    try {
      const data = JSON.parse(scriptTag.textContent);
      renderTimeline(data);
      return;
    } catch (err) {
      console.error('Embedded JSON parse error:', err);
      // fall through to fetch fallback
    }
  }

  // Fallback: attempt to fetch timeline.json (will fail on file:// — run a server for this)
  const jsonPath = 'timeline.json';
  fetch(jsonPath)
    .then(res => {
      if (!res.ok) throw new Error(`Could not load ${jsonPath} (${res.status})`);
      return res.json();
    })
    .then(data => renderTimeline(data))
    .catch(err => {
      console.error('Failed to load timeline.json:', err);
      // show message for local file users
      const p = document.createElement('p');
      p.className = 'error';
      p.textContent = 'Could not load timeline.json. If you opened this file directly, either embed the JSON in the HTML or run a local server (see instructions).';
      document.body.appendChild(p);
    });
});

window.onload = () => {
    generateCaptcha();
    loadTimeline();
};