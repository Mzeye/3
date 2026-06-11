/* ============================================================
   ui.js — DOM rendering & modal management
   ============================================================ */

/* ---------- History-based modal tracking ---------- */
let modalHistoryPushed = false;

function pushModalState() {
  if (!modalHistoryPushed) {
    history.pushState({ modal: true }, '');
    modalHistoryPushed = true;
  }
}

function popModalState() {
  if (modalHistoryPushed) {
    modalHistoryPushed = false;
    history.back();
  }
}

function closeAllModals() {
  modalHistoryPushed = false;
  document.getElementById('readingModal').classList.remove('active');
  document.getElementById('writingModal').classList.remove('active');
  document.getElementById('confirmModal').classList.remove('active');
  document.getElementById('overlay').classList.remove('active');
  document.body.style.overflow = '';
  delete document.getElementById('writingModal').dataset.editId;
  delete document.getElementById('confirmModal').dataset.essayId;
}

window.addEventListener('popstate', () => {
  if (modalHistoryPushed) {
    closeAllModals();
  }
});

/* ---------- Essay List ---------- */

function renderEssayList(essays) {
  const container = document.getElementById('essayList');
  const emptyState = document.getElementById('emptyState');

  container.innerHTML = '';

  if (!essays || essays.length === 0) {
    container.style.display = 'none';
    emptyState.style.display = 'block';
    return;
  }

  container.style.display = 'block';
  emptyState.style.display = 'none';

  essays.forEach((essay, idx) => {
    const card = createEssayEntry(essay, idx);
    container.appendChild(card);
  });
}

function createEssayEntry(essay, index) {
  const entry = document.createElement('article');
  entry.className = 'essay-entry';
  entry.style.animationDelay = `${index * 60}ms`;
  entry.dataset.id = essay.id;

  const title = essay.title && essay.title.trim()
    ? essay.title.trim()
    : '无标题';

  const titleClass = title === '无标题' ? 'untitled' : '';

  const excerptText = excerpt(essay.content, 150);

  entry.innerHTML = `
    <h3 class="essay-entry-title ${titleClass}">${escapeHTML(title)}</h3>
    ${excerptText ? `<p class="essay-entry-excerpt">${escapeHTML(excerptText)}</p>` : ''}
  `;

  entry.addEventListener('click', () => showReadingModal(essay));
  return entry;
}

/* ---------- Reading Modal ---------- */

function showReadingModal(essay) {
  document.getElementById('readingTitle').textContent =
    essay.title && essay.title.trim() ? essay.title.trim() : '无标题';
  document.getElementById('readingBody').textContent = essay.content;

  document.getElementById('readingModal').classList.add('active');
  document.getElementById('overlay').classList.add('active');
  document.body.style.overflow = 'hidden';

  document.getElementById('readingModal').dataset.essayId = essay.id;
  document.getElementById('readingModal').dataset.essayTitle = essay.title || '';
  document.getElementById('readingModal').dataset.essayContent = essay.content || '';

  pushModalState();
}

function hideReadingModal() {
  document.getElementById('readingModal').classList.remove('active');
  document.getElementById('overlay').classList.remove('active');
  document.body.style.overflow = '';
  popModalState();
}

function closeReadingModalSilent() {
  document.getElementById('readingModal').classList.remove('active');
  document.getElementById('overlay').classList.remove('active');
  modalHistoryPushed = false;
}

/* ---------- Writing Modal ---------- */

function showWritingModal(essay) {
  const titleInput = document.getElementById('essayTitle');
  const contentInput = document.getElementById('essayContent');

  if (essay) {
    // Edit mode
    titleInput.value = essay.title || document.getElementById('readingModal').dataset.essayTitle || '';
    contentInput.value = essay.content || document.getElementById('readingModal').dataset.essayContent || '';
    document.getElementById('writingModal').dataset.editId = essay.id || document.getElementById('readingModal').dataset.essayId || '';
  } else {
    // New essay mode
    titleInput.value = '';
    contentInput.value = '';
    delete document.getElementById('writingModal').dataset.editId;
  }

  updateWritingMetadata();

  document.getElementById('writingModal').classList.add('active');
  document.getElementById('overlay').classList.add('active');
  document.body.style.overflow = 'hidden';

  pushModalState();

  // Focus content textarea after a tick
  setTimeout(() => contentInput.focus(), 150);
}

function hideWritingModal() {
  document.getElementById('writingModal').classList.remove('active');
  document.getElementById('overlay').classList.remove('active');
  document.body.style.overflow = '';
  delete document.getElementById('writingModal').dataset.editId;
  popModalState();
}

function updateWritingMetadata() {
  const title = document.getElementById('essayTitle').value || '';
  const content = document.getElementById('essayContent').value || '';
  const fullText = title + '\n' + content;
  const wc = countWords(fullText);
  const cc = countChars(fullText);

  document.getElementById('writingMeta').innerHTML = `
    <span class="meta-item">${cc.toLocaleString()} 字符</span>
    <span class="meta-sep">·</span>
    <span class="meta-item">${wc.toLocaleString()} 词</span>
  `;
}

/* ---------- Confirm Modal ---------- */

function showConfirmModal(essayId) {
  document.getElementById('confirmModal').dataset.essayId = essayId;
  document.getElementById('confirmModal').classList.add('active');
  document.getElementById('overlay').classList.add('active');
  document.getElementById('deletePassword').value = '';
  pushModalState();
}

function hideConfirmModal() {
  document.getElementById('confirmModal').classList.remove('active');
  document.getElementById('overlay').classList.remove('active');
  document.body.style.overflow = '';
  delete document.getElementById('confirmModal').dataset.essayId;
  popModalState();
}

/* ---------- Toast ---------- */

let toastTimer;

function showToast(message, duration) {
  duration = duration || 2200;
  const toast = document.getElementById('toast');
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add('visible');
  toastTimer = setTimeout(() => toast.classList.remove('visible'), duration);
}

/* ---------- Loading ---------- */

function showLoading() {
  const container = document.getElementById('essayList');
  container.innerHTML = `
    <div class="loader">
      <div class="loader-dot"></div>
      <div class="loader-dot"></div>
      <div class="loader-dot"></div>
    </div>
  `;
  container.style.display = 'block';
  document.getElementById('emptyState').style.display = 'none';
}

/* ---------- Helpers ---------- */

function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
