/* ============================================================
   app.js — Application controller
   ============================================================ */

let essays = [];

/* ---------- Init ---------- */

async function init() {
  showLoading();
  try {
    essays = await fetchEssays();
    renderEssayList(essays);
  } catch (err) {
    console.error('Failed to load essays:', err);
    showToast('加载失败');
    // Show empty state on error too
    document.getElementById('essayList').style.display = 'none';
    document.getElementById('emptyState').style.display = 'block';
  }
  bindEvents();
}

/* ---------- Event Binding ---------- */

function bindEvents() {
  // FAB — new essay
  document.getElementById('newEssayBtn').addEventListener('click', () => {
    showWritingModal(null);
  });

  // Writing modal
  document.getElementById('saveEssay').addEventListener('click', handleSave);
  document.getElementById('cancelWriting').addEventListener('click', hideWritingModal);
  document.getElementById('essayContent').addEventListener('input', updateWritingMetadata);
  document.getElementById('essayTitle').addEventListener('input', updateWritingMetadata);

  // Reading modal
  document.getElementById('closeReading').addEventListener('click', hideReadingModal);
  document.getElementById('editEssay').addEventListener('click', () => {
    const modal = document.getElementById('readingModal');
    const essay = {
      id: modal.dataset.essayId,
      title: modal.dataset.essayTitle,
      content: modal.dataset.essayContent
    };
    closeReadingModalSilent();
    showWritingModal(essay);
  });
  document.getElementById('deleteEssay').addEventListener('click', () => {
    const essayId = document.getElementById('readingModal').dataset.essayId;
    closeReadingModalSilent();
    showConfirmModal(essayId);
  });

  // Confirm modal
  document.getElementById('confirmDelete').addEventListener('click', handleDelete);
  document.getElementById('cancelDelete').addEventListener('click', hideConfirmModal);

  // Overlay — close modals
  document.getElementById('overlay').addEventListener('click', () => {
    if (document.getElementById('writingModal').classList.contains('active')) {
      hideWritingModal();
    }
    if (document.getElementById('readingModal').classList.contains('active')) {
      hideReadingModal();
    }
    if (document.getElementById('confirmModal').classList.contains('active')) {
      hideConfirmModal();
    }
  });

  // Keyboard
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (document.getElementById('confirmModal').classList.contains('active')) {
        hideConfirmModal();
      } else if (document.getElementById('writingModal').classList.contains('active')) {
        hideWritingModal();
      } else if (document.getElementById('readingModal').classList.contains('active')) {
        hideReadingModal();
      }
    }
  });

  // Search
  const searchInput = document.getElementById('searchInput');
  const debouncedFilter = debounce(() => {
    const query = searchInput.value;
    const filtered = filterEssays(essays, query);
    renderEssayList(filtered);
  }, 200);
  searchInput.addEventListener('input', debouncedFilter);
}

/* ---------- Save Handler ---------- */

async function handleSave() {
  const titleInput = document.getElementById('essayTitle');
  const contentInput = document.getElementById('essayContent');
  const title = titleInput.value.trim();
  const content = contentInput.value;

  if (!content.trim()) {
    showToast('请输入内容');
    contentInput.focus();
    return;
  }

  const fullText = title + '\n' + content;
  const wordCount = countWords(fullText);
  const charCount = countChars(fullText);
  const editId = document.getElementById('writingModal').dataset.editId;

  const saveBtn = document.getElementById('saveEssay');
  const originalText = saveBtn.textContent;
  saveBtn.textContent = '保存中...';
  saveBtn.style.pointerEvents = 'none';
  saveBtn.style.opacity = '0.6';

  try {
    if (editId) {
      await updateEssay(editId, { title, content, wordCount, charCount });
      showToast('已更新');
    } else {
      await saveEssay({ title, content, wordCount, charCount });
      showToast('已保存');
    }

    hideWritingModal();

    // Re-fetch and render
    showLoading();
    essays = await fetchEssays();
    renderEssayList(essays);
  } catch (err) {
    console.error('Save failed:', err);
    showToast('保存失败，请重试');
  } finally {
    saveBtn.textContent = originalText;
    saveBtn.style.pointerEvents = '';
    saveBtn.style.opacity = '';
  }
}

/* ---------- Delete Handler ---------- */

async function handleDelete() {
  const essayId = document.getElementById('confirmModal').dataset.essayId;
  if (!essayId) return;

  const passwordInput = document.getElementById('deletePassword');
  if (passwordInput.value !== 'woshisb') {
    showToast('删除失败');
    return;
  }

  const confirmBtn = document.getElementById('confirmDelete');
  const originalText = confirmBtn.textContent;
  confirmBtn.textContent = '删除中...';
  confirmBtn.style.pointerEvents = 'none';

  try {
    await deleteEssay(essayId);
    showToast('已删除');
    hideConfirmModal();

    // Re-fetch and render
    showLoading();
    essays = await fetchEssays();
    renderEssayList(essays);
  } catch (err) {
    console.error('Delete failed:', err);
    showToast('删除失败，请重试');
  } finally {
    confirmBtn.textContent = originalText;
    confirmBtn.style.pointerEvents = '';
  }
}

/* ---------- Start ---------- */

document.addEventListener('DOMContentLoaded', init);
