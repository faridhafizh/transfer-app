import QRCodeStyling from 'qr-code-styling';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { sendFiles, processIncomingData } from './fileTransfer.js';
import { updateConnectionStatus } from './ui.js';
import Peer from 'simple-peer';

let peer = null;
let qrCode = null;

export function initWebRTC() {
  updateConnectionStatus('disconnected', 'Waiting for connection...');
  
  // Create an initiator peer first, just to generate an offer
  peer = new Peer({
    initiator: true,
    trickle: false, // Wait for all ICE candidates for QR
    config: {
      iceServers: [] // Local only
    }
  });

  peer.on('signal', data => {
    // Encode SDP offer to JSON
    const signalData = JSON.stringify(data);
    displayQR(signalData);
  });

  peer.on('connect', () => {
    updateConnectionStatus('connected', 'Connected');
    console.log('Peer connected');
  });

  peer.on('data', data => {
    processIncomingData(data);
  });

  peer.on('close', () => {
    updateConnectionStatus('disconnected', 'Disconnected');
    // Re-init
    setTimeout(initWebRTC, 1000);
  });

  peer.on('error', err => {
    console.error('Peer error', err);
    updateConnectionStatus('disconnected', 'Error connecting');
  });
}

function displayQR(data) {
  const container = document.getElementById('qr-container');
  container.innerHTML = ''; // Clear

  qrCode = new QRCodeStyling({
    width: 250,
    height: 250,
    type: "svg",
    data: data,
    dotsOptions: {
      color: "#8b5cf6",
      type: "rounded"
    },
    backgroundOptions: {
      color: "#ffffff",
    },
    imageOptions: {
      crossOrigin: "anonymous",
      margin: 10
    }
  });

  qrCode.append(container);
}

export function startScanner() {
  const scannerModal = document.getElementById('scanner-modal');
  scannerModal.classList.remove('hidden');

  const html5QrcodeScanner = new Html5QrcodeScanner(
    "reader",
    { fps: 10, qrbox: {width: 250, height: 250} },
    /* verbose= */ false
  );

  html5QrcodeScanner.render((decodedText, decodedResult) => {
    // Received a signal from the other peer
    try {
      const signalData = JSON.parse(decodedText);
      html5QrcodeScanner.clear();
      scannerModal.classList.add('hidden');
      
      if (signalData.type === 'offer') {
        // Destroy the initiator peer, we become receiver
        peer.destroy();
        peer = new Peer({
          initiator: false,
          trickle: false,
          config: { iceServers: [] }
        });
        
        peer.on('signal', answerData => {
          // Display answer QR
          displayQR(JSON.stringify(answerData));
        });
        
        peer.on('connect', () => {
          updateConnectionStatus('connected', 'Connected');
        });
        
        peer.on('data', processIncomingData);
        
        peer.signal(signalData);
      } else {
        // It's an answer, we are initiator
        peer.signal(signalData);
      }
      
    } catch (err) {
      console.error('Invalid QR code', err);
    }
  }, (errorMessage) => {
    // ignore scanning errors
  });
  
  document.getElementById('btn-close-scanner').onclick = () => {
    html5QrcodeScanner.clear();
    scannerModal.classList.add('hidden');
  };
}

export function sendToPeer(files) {
  if (!peer || !peer.connected) {
    alert('Peer not connected!');
    return;
  }
  sendFiles(peer, files);
}

export function startDiscovery() {
  // mDNS / WebRTC automatic discovery placeholder
  alert('Auto-discovery (mDNS) will broadcast looking for nearby peers.');
  // In a real PWA without backend, true local auto-discovery relies on signaling servers if local
  // For MVP offline, QR is the primary mechanism.
}
