let facts = [];
const BATCH_SIZE = 50;
let currentList = [];
let currentWords = null;
let displayedCount = 0;
let loading = false;

const searchInput = document.getElementById('search');
const resultsDiv = document.getElementById('results');
const statsDiv = document.getElementById('stats');
const loadingDiv = document.getElementById('loading');

// Random elements
const randomSection = document.getElementById('random-section');
const randomText = document.getElementById('random-text');
const randomMeta = document.getElementById('random-meta');
const randomPrev = document.getElementById('random-prev');
const randomNext = document.getElementById('random-next');
const randomCopy = document.getElementById('random-copy');

// Random state
let randomHistory = [];
let randomIndex = -1;

fetch('facts.json')
    .then(r => r.json())
    .then(data => {
        facts = data;
        loadingDiv.style.display = 'none';
        statsDiv.textContent = `${facts.length} facts chargés`;
        showResults(facts);
        randomSection.style.display = 'block';
        showRandomFact(false);
    })
    .catch(() => {
        loadingDiv.textContent = 'Erreur : impossible de charger facts.json';
    });

// === Search ===
let debounceTimer;
searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(doSearch, 200);
});

function doSearch() {
    const query = searchInput.value.trim().toLowerCase();
    if (!query) {
        statsDiv.textContent = `${facts.length} facts`;
        showResults(facts);
        return;
    }

    const words = query.split(/\s+/);
    const filtered = facts.filter(f => {
        const t = f.text.toLowerCase();
        return words.every(w => t.includes(w));
    });

    statsDiv.textContent = `${filtered.length} résultat${filtered.length !== 1 ? 's' : ''}`;
    showResults(filtered, words);
}

function showResults(list, words) {
    currentList = list;
    currentWords = words;
    displayedCount = 0;
    resultsDiv.innerHTML = '';

    if (list.length === 0) {
        resultsDiv.innerHTML = '<div class="no-results">Aucun résultat</div>';
        return;
    }

    loadMore();
}

function loadMore() {
    if (loading || displayedCount >= currentList.length) return;
    loading = true;

    const isFirstBatch = displayedCount === 0;
    const batch = currentList.slice(displayedCount, displayedCount + BATCH_SIZE);
    const html = batch.map(f => `
        <div class="card${isFirstBatch ? '' : ' fade-in'}" data-id="${f.id}">
            <div class="card-body">
                <p class="card-text">${highlightText(f.text, currentWords)}</p>
            </div>
            <div class="card-footer">
                <span>#${f.id}</span>
                <span class="card-rating">${f.rating !== null ? f.rating + '/10' : ''}</span>
                <button class="card-copy" data-text="${escapeAttr(f.text)}">Copier</button>
            </div>
        </div>
    `).join('');

    // Remove previous "more" indicator
    const moreEl = resultsDiv.querySelector('.more-results');
    if (moreEl) moreEl.remove();

    resultsDiv.insertAdjacentHTML('beforeend', html);
    displayedCount += batch.length;

    // Fade in new cards
    if (!isFirstBatch) {
        requestAnimationFrame(() => {
            resultsDiv.querySelectorAll('.card.fade-in:not(.visible)').forEach(card => {
                card.classList.add('visible');
            });
        });
    }

    if (displayedCount < currentList.length) {
        resultsDiv.insertAdjacentHTML('beforeend',
            `<div class="more-results">${currentList.length - displayedCount} facts restants</div>`);
    }

    loading = false;
}

// Infinite scroll
window.addEventListener('scroll', () => {
    if (displayedCount >= currentList.length) return;
    const threshold = document.documentElement.scrollHeight - window.innerHeight - 200;
    if (window.scrollY >= threshold) {
        loadMore();
    }
});

// === Copy (search results) ===
resultsDiv.addEventListener('click', (e) => {
    const btn = e.target.closest('.card-copy');
    if (!btn) return;
    copyWithFeedback(btn, btn.dataset.text);
});

// === Random fact ===
function getRandomFact() {
    return facts[Math.floor(Math.random() * facts.length)];
}

function displayFact(fact, animate) {
    if (!animate) {
        randomText.textContent = fact.text;
        updateMeta(fact);
        return;
    }
    randomText.classList.add('fading');
    setTimeout(() => {
        randomText.textContent = fact.text;
        updateMeta(fact);
        randomText.classList.remove('fading');
    }, 400);
}

function updateMeta(fact) {
    const rating = fact.rating !== null ? ` — ${fact.rating}/10` : '';
    randomMeta.textContent = `#${fact.id}${rating}`;
}

function showRandomFact(animate) {
    const fact = getRandomFact();
    if (randomIndex < randomHistory.length - 1) {
        randomHistory = randomHistory.slice(0, randomIndex + 1);
    }
    randomHistory.push(fact);
    randomIndex = randomHistory.length - 1;
    displayFact(fact, animate);
}

randomPrev.addEventListener('click', () => {
    if (randomIndex > 0) {
        randomIndex--;
        displayFact(randomHistory[randomIndex], true);
    }
});

randomNext.addEventListener('click', () => {
    if (randomIndex < randomHistory.length - 1) {
        randomIndex++;
        displayFact(randomHistory[randomIndex], true);
    } else {
        showRandomFact(true);
    }
});

randomCopy.addEventListener('click', () => {
    const fact = randomHistory[randomIndex];
    if (!fact) return;
    copyWithFeedback(randomCopy, fact.text);
});

// === Shared copy helper ===
function copyWithFeedback(btn, text) {
    navigator.clipboard.writeText(text).then(() => {
        const original = btn.textContent;
        btn.textContent = 'Copié !';
        btn.classList.add('copied');
        setTimeout(() => {
            btn.textContent = original;
            btn.classList.remove('copied');
        }, 1500);
    });
}

// === Keyboard navigation ===
document.addEventListener('keydown', (e) => {
    if (document.activeElement === searchInput) return;
    if (e.key === 'ArrowLeft') {
        e.preventDefault();
        randomPrev.click();
    } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        randomNext.click();
    }
});

// === Helpers ===
function highlightText(text, words) {
    const escaped = escapeHtml(text);
    if (!words || words.length === 0) return escaped;
    const pattern = words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    return escaped.replace(new RegExp(`(${pattern})`, 'gi'), '<mark>$1</mark>');
}

function escapeAttr(text) {
    return text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeHtml(text) {
    const d = document.createElement('div');
    d.textContent = text;
    return d.innerHTML;
}
