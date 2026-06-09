import { startScanner, startDiscovery, sendToPeer } from './webrtc.js';
import { loadHistory } from './history.js';

export function setupUI() {
  document.getElementById('btn-scan').addEventListener('click', startScanner);
  document.getElementById('btn-discover').addEventListener('click', startDiscovery);

  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  const folderInput = document.getElementById('folder-input');

  document.getElementById('btn-select-file').addEventListener('click', () => fileInput.click());
  document.getElementById('btn-select-folder').addEventListener('click', () => folderInput.click());

  // Drag and drop events
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    if (e.dataTransfer.files.length > 0) {
      sendToPeer(Array.from(e.dataTransfer.files));
    }
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      sendToPeer(Array.from(e.target.files));
    }
  });

  folderInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      sendToPeer(Array.from(e.target.files));
    }
  });

  // Load history
  loadHistory();
}

export function updateConnectionStatus(status, text) {
  const indicator = document.getElementById('connection-status');
  const textEl = document.getElementById('connection-text');
  
  if (status === 'connected') {
    indicator.className = 'status-indicator connected';
    textEl.style.color = 'var(--success)';
  } else {
    indicator.className = 'status-indicator';
    textEl.style.color = 'var(--text-muted)';
  }
  textEl.textContent = text;
}

export function updateProgress(percent, text) {
  const container = document.getElementById('progress-container');
  const bar = document.getElementById('progress-bar');
  const statusText = document.getElementById('transfer-status');
  
  if (percent >= 0 && percent < 100) {
    container.classList.remove('hidden');
    bar.style.width = percent + '%';
    statusText.textContent = text || `Transferring... ${Math.round(percent)}%`;
  } else if (percent >= 100) {
    bar.style.width = '100%';
    statusText.textContent = text || 'Transfer complete!';
    setTimeout(() => {
      container.classList.add('hidden');
      statusText.textContent = '';
      bar.style.width = '0%';
    }, 2000);
  }
}
