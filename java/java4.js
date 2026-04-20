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

(function () {
  // Render timeline into #timeline-display
  function renderTimeline(data) {
    const container = document.getElementById('timeline-display');
    if (!container) return;
    container.innerHTML = '';

    const items = Array.isArray(data.zelda_timeline) ? data.zelda_timeline : [];
    if (!items.length) {
      container.textContent = 'No timeline data available.';
      return;
    }

    const wrap = document.createElement('div');
    wrap.className = 'timeline-list';

    items.forEach(item => {
      const card = document.createElement('article');
      card.className = 'timeline-item';

      const title = document.createElement('h3');
      title.textContent = item.title || item.id || 'Untitled';
      card.appendChild(title);

      if (item.era) {
        const era = document.createElement('div');
        era.className = 'timeline-era';
        era.textContent = item.era;
        card.appendChild(era);
      }

      if (item.placement) {
        const placement = document.createElement('div');
        placement.className = 'timeline-placement';
        placement.textContent = item.placement;
        card.appendChild(placement);
      }

      if (item.description) {
        const desc = document.createElement('p');
        desc.textContent = item.description;
        card.appendChild(desc);
      }

      if (item.key_event) {
        const ke = document.createElement('p');
        ke.className = 'timeline-keyevent';
        ke.textContent = 'Key event: ' + item.key_event;
        card.appendChild(ke);
      }

      wrap.appendChild(card);
    });

    container.appendChild(wrap);
  }


  function loadTimeline() {
    const embedded = document.getElementById('timeline-data');
    if (embedded) {
      try {
        const data = JSON.parse(embedded.textContent);
        renderTimeline(data);
        return;
      } catch (err) {
        console.error('Embedded timeline JSON parse error:', err);

      }
    }

    fetch('timeline.json')
      .then(res => {
        if (!res.ok) throw new Error(`Failed to load timeline.json (${res.status})`);
        return res.json();
      })
      .then(data => renderTimeline(data))
      .catch(err => {
        console.error('Timeline load error:', err);
        const container = document.getElementById('timeline-display');
        if (container) {
          container.innerHTML = `<p class="error">Could not load timeline. If opening the file directly, either run a local server or embed the JSON in the page.</p>`;
        }
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadTimeline);
  } else {
    loadTimeline();
  }
})();

window.onload = () => {
    generateCaptcha();
    loadTimeline();
};

// --- Form handling for the new feedback form ---
function getStoredSubmissions() {
    try {
      return JSON.parse(localStorage.getItem('siteFormSubmissions') || '[]');
    } catch {
      return [];
    }
  }
  
  function storeSubmission(obj) {
    const arr = getStoredSubmissions();
    arr.push(obj);
    localStorage.setItem('siteFormSubmissions', JSON.stringify(arr));
  }
  
  function renderSubmissions() {
    const container = document.getElementById('form-results');
    const submissions = getStoredSubmissions();
    if (!container) return;
    if (!submissions.length) {
      container.innerHTML = '<p>No submissions yet.</p>';
      return;
    }
    const html = submissions.map((s, i) => {
      return `<div class="submission">
        <strong>${i+1}. ${escapeHtml(s.name || 'Anonymous')}</strong>
        <div>Era: ${escapeHtml(s.era || '')} • Rating: ${escapeHtml(s.rating || '')} • Subscribed: ${s.subscribe ? 'Yes' : 'No'}</div>
        <p>${escapeHtml(s.message || '')}</p>
      </div>`;
    }).join('');
    container.innerHTML = html;
  }
  
  function escapeHtml(str) {
    return String(str)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }
  
  function initForm() {
    const form = document.getElementById('site-form');
    const clearBtn = document.getElementById('form-clear');
    if (!form) return;
  
    form.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const data = new FormData(form);
      const obj = {
        name: data.get('name'),
        era: data.get('era'),
        subscribe: data.get('subscribe') === 'on',
        rating: data.get('rating'),
        message: data.get('message'),
        ts: Date.now()
      };
      storeSubmission(obj);
      renderSubmissions();
      form.reset();
    });
  
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        form.reset();
      });
    }
  
    // render existing on load
    renderSubmissions();
  }
  
  // call initForm at the end of DOMContentLoaded handler
  initForm();