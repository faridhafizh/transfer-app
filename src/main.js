import './style.css'
import { initWebRTC, startDiscovery } from './webrtc.js';
import { setupUI } from './ui.js';

document.querySelector('#app').innerHTML = `
  <div class="container">
    <header>
      <div class="logo">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
        DropSync
      </div>
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <div class="status-indicator" id="connection-status"></div>
        <span id="connection-text" style="color: var(--text-muted); font-size: 0.875rem;">Waiting for connection...</span>
      </div>
    </header>

    <div class="main-grid">
      <!-- Left Column: Pairing & Discovery -->
      <div class="card glass-panel">
        <h2>Device Pairing</h2>
        <p style="color: var(--text-muted); font-size: 0.875rem;">Scan QR code or use auto-discovery to connect to a nearby device securely.</p>
        
        <div id="qr-container"></div>
        
        <div style="display: flex; gap: 1rem; margin-top: 1rem;">
          <button id="btn-scan" class="primary" style="flex: 1;">Scan QR</button>
          <button id="btn-discover" style="flex: 1;">Discover</button>
        </div>
      </div>

      <!-- Right Column: Transfer & History -->
      <div class="card glass-panel" style="grid-row: span 2;">
        <h2>File Transfer</h2>
        <p style="color: var(--text-muted); font-size: 0.875rem;">Send files or folders directly to the connected device.</p>
        
        <div class="file-drop-area" id="drop-zone">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 1rem; color: var(--primary);"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><polyline points="9 15 12 12 15 15"></polyline></svg>
          <h3 style="margin: 0 0 0.5rem 0;">Drag & Drop files here</h3>
          <p style="color: var(--text-muted); font-size: 0.875rem; margin-bottom: 1rem;">or</p>
          <div style="display: flex; gap: 1rem; justify-content: center;">
            <button id="btn-select-file" class="primary">Select File</button>
            <button id="btn-select-folder">Select Folder</button>
          </div>
          <input type="file" id="file-input" multiple class="hidden">
          <input type="file" id="folder-input" webkitdirectory directory class="hidden">
        </div>

        <div class="progress-container hidden" id="progress-container">
          <div class="progress-bar" id="progress-bar"></div>
        </div>
        <div id="transfer-status" style="text-align: center; font-size: 0.875rem; color: var(--text-muted); margin-top: 0.5rem;"></div>

        <h3 style="margin-top: 2rem; margin-bottom: 0;">Transfer History</h3>
        <div class="history-list" id="history-list">
          <p style="color: var(--text-muted); text-align: center; padding: 2rem;">No recent transfers</p>
        </div>
      </div>

      <!-- Bottom Left Column: Premium Features -->
      <div class="card glass-panel" style="opacity: 0.7;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h2>Pro Features</h2>
          <span class="badge info">Coming Soon</span>
        </div>
        <p style="color: var(--text-muted); font-size: 0.875rem;">Premium features for advanced synchronization.</p>
        <div style="display: flex; flex-direction: column; gap: 0.5rem; margin-top: 1rem;">
          <label style="display: flex; align-items: center; gap: 0.5rem; cursor: not-allowed;"><input type="checkbox" disabled> Clipboard Sync</label>
          <label style="display: flex; align-items: center; gap: 0.5rem; cursor: not-allowed;"><input type="checkbox" disabled> Auto Folder Sync</label>
          <label style="display: flex; align-items: center; gap: 0.5rem; cursor: not-allowed;"><input type="checkbox" disabled> Share Wi-Fi Credentials</label>
        </div>
      </div>
    </div>
  </div>

  <!-- QR Scanner Modal -->
  <div id="scanner-modal" class="modal-overlay hidden">
    <div class="modal-content glass-panel">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <h2>Scan Peer QR Code</h2>
        <button id="btn-close-scanner" style="background:transparent; border:none; color:white; padding: 0.5rem; border-radius: 50%;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
      </div>
      <div id="reader"></div>
    </div>
  </div>
`;

setupUI();
initWebRTC();
