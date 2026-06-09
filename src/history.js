import localforage from 'localforage';

localforage.config({
  name: 'DropSync',
  storeName: 'transfer_history'
});

export async function addHistory(item) {
  try {
    let history = await localforage.getItem('history') || [];
    history.unshift(item); // Add to beginning
    if (history.length > 50) history.pop(); // Keep last 50
    await localforage.setItem('history', history);
    renderHistory(history);
  } catch (err) {
    console.error('Error saving history', err);
  }
}

export async function loadHistory() {
  try {
    const history = await localforage.getItem('history') || [];
    renderHistory(history);
  } catch (err) {
    console.error('Error loading history', err);
  }
}

function renderHistory(history) {
  const list = document.getElementById('history-list');
  if (history.length === 0) {
    list.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 2rem;">No recent transfers</p>';
    return;
  }

  list.innerHTML = history.map(item => {
    const isOut = item.direction === 'out';
    const icon = isOut 
      ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>'
      : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--success)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>';
    
    return `
      <div class="history-item">
        <div style="display: flex; align-items: center; gap: 1rem;">
          ${icon}
          <div>
            <div style="font-weight: 500;">${item.name}</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">
              ${new Date(item.date).toLocaleString()} • ${formatBytes(item.size)}
            </div>
          </div>
        </div>
        <span class="badge ${isOut ? 'info' : 'success'}">${isOut ? 'Sent' : 'Received'}</span>
      </div>
    `;
  }).join('');
}

function formatBytes(bytes, decimals = 2) {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
