import { saveAs } from 'file-saver';
import { updateProgress } from './ui.js';
import { addHistory } from './history.js';

const CHUNK_SIZE = 64 * 1024; // 64KB
let incomingFileInfo = null;
let incomingFileData = [];
let bytesReceived = 0;

export function sendFiles(peer, files) {
  files.forEach(file => {
    sendFile(peer, file);
  });
}

function sendFile(peer, file) {
  const fileInfo = {
    type: 'header',
    name: file.webkitRelativePath || file.name,
    size: file.size,
    fileType: file.type
  };
  
  // Send header
  peer.send(JSON.stringify(fileInfo));

  // Add history
  addHistory({
    name: fileInfo.name,
    size: fileInfo.size,
    direction: 'out',
    date: Date.now()
  });

  const reader = new FileReader();
  let offset = 0;

  reader.onload = e => {
    peer.send(e.target.result);
    offset += e.target.result.byteLength;
    updateProgress((offset / file.size) * 100, `Sending ${file.name}...`);
    
    if (offset < file.size) {
      readSlice(offset);
    } else {
      peer.send(JSON.stringify({ type: 'eof', name: fileInfo.name }));
      updateProgress(100, `Sent ${file.name}`);
    }
  };

  const readSlice = o => {
    const slice = file.slice(o, o + CHUNK_SIZE);
    reader.readAsArrayBuffer(slice);
  };

  readSlice(0);
}

export function processIncomingData(data) {
  if (typeof data === 'string') {
    const msg = JSON.parse(data);
    if (msg.type === 'header') {
      incomingFileInfo = msg;
      incomingFileData = [];
      bytesReceived = 0;
      updateProgress(0, `Receiving ${msg.name}...`);
    } else if (msg.type === 'eof') {
      const blob = new Blob(incomingFileData, { type: incomingFileInfo.fileType });
      saveAs(blob, incomingFileInfo.name);
      updateProgress(100, `Received ${incomingFileInfo.name}`);
      
      addHistory({
        name: incomingFileInfo.name,
        size: incomingFileInfo.size,
        direction: 'in',
        date: Date.now()
      });
      
      incomingFileInfo = null;
      incomingFileData = [];
    }
  } else {
    incomingFileData.push(data);
    bytesReceived += data.byteLength;
    if (incomingFileInfo) {
      updateProgress((bytesReceived / incomingFileInfo.size) * 100, `Receiving ${incomingFileInfo.name}...`);
    }
  }
}
