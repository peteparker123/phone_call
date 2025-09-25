// Configuration for different environments
const isLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
const peerConfig = {
  host: isLocalhost ? location.hostname : 'phone-call-01ph.onrender.com', // Fixed: Remove https:// and trailing slash
  port: isLocalhost ? (location.port || 8000) : 443,
  secure: !isLocalhost,
  debug: 2, // Increased debug level
  path: "/myapp",
};

console.log('PeerJS Configuration:', peerConfig);
console.log('Is localhost?', isLocalhost);
console.log('Current location:', location);

const peer = new Peer(
  `${Math.floor(Math.random() * 2 ** 18)
    .toString(36)
    .padStart(4, 0)}`,
  peerConfig,
);

console.log('Peer created with config:', peerConfig);
window.peer = peer;

// Enhanced error handling and connection status
peer.on('open', (id) => {
  console.log('Peer connection opened with ID:', id);
  document.getElementById("cast-status").textContent = `Your device ID is: ${id}`;
});

peer.on('connection', (conn) => {
  console.log('Data connection established:', conn);
});

peer.on('call', (call) => {
  console.log('Incoming call from:', call.peer);
});

peer.on('error', (err) => {
  console.error('PeerJS error details:', err);
  console.error('Error type:', err.type);
  console.error('Error message:', err.message);
  
  let errorMessage = 'Connection Error: ';
  switch(err.type) {
    case 'browser-incompatible':
      errorMessage += 'Browser not supported';
      break;
    case 'disconnected':
      errorMessage += 'Lost connection to server';
      break;
    case 'invalid-id':
      errorMessage += 'Invalid peer ID';
      break;
    case 'invalid-key':
      errorMessage += 'Invalid API key';
      break;
    case 'network':
      errorMessage += 'Network error';
      break;
    case 'peer-unavailable':
      errorMessage += 'Peer is unavailable';
      break;
    case 'ssl-unavailable':
      errorMessage += 'SSL connection unavailable';
      break;
    case 'server-error':
      errorMessage += 'Server error';
      break;
    case 'socket-error':
      errorMessage += 'Socket connection error';
      break;
    case 'socket-closed':
      errorMessage += 'Socket connection closed';
      break;
    case 'unavailable-id':
      errorMessage += 'ID already taken';
      break;
    case 'webrtc':
      errorMessage += 'WebRTC error';
      break;
    default:
      errorMessage += err.message || 'Unknown error';
  }
  
  document.getElementById("cast-status").textContent = errorMessage;
  
  // Attempt to reconnect for certain error types
  if (err.type === 'disconnected' || err.type === 'network' || err.type === 'socket-error') {
    console.log('Attempting to reconnect in 3 seconds...');
    setTimeout(() => {
      peer.reconnect();
    }, 3000);
  }
});

peer.on('disconnected', () => {
  console.log('Peer disconnected');
  document.getElementById("cast-status").textContent = 'Disconnected - Attempting to reconnect...';
});

peer.on('close', () => {
  console.log('Peer connection closed');
  document.getElementById("cast-status").textContent = 'Connection closed';
});
function getLocalStream() {
  navigator.mediaDevices
    .getUserMedia({ video: false, audio: true })
    .then((stream) => {
      window.localStream = stream; // A
      window.localAudio.srcObject = stream; // B
      window.localAudio.autoplay = true; // C
    })
    .catch((err) => {
      console.error(`you got an error: ${err}`);
    });
}
getLocalStream();

// DOM elements
const callBtn = document.querySelector('.call-btn');
const hangupBtn = document.querySelector('.hangup-btn');
const modal = document.querySelector('.modal');
const connectBtn = document.querySelector('.connect-btn');
const remoteIdInput = document.querySelector('.modal input');
const callContainer = document.querySelector('.call-container');
const closeModal = document.querySelector('#close');

// Show modal when call button is clicked
callBtn.addEventListener('click', () => {
  modal.hidden = false;
});

// Close modal
closeModal.addEventListener('click', () => {
  modal.hidden = true;
});

// Connect to peer
connectBtn.addEventListener('click', () => {
  const remoteId = remoteIdInput.value.trim();
  if (remoteId) {
    connectToPeer(remoteId);
    modal.hidden = true;
  }
});

// Hang up call
hangupBtn.addEventListener('click', () => {
  hangUp();
});

// Connect to a peer
function connectToPeer(remoteId) {
  console.log('Attempting to call peer:', remoteId);
  const call = peer.call(remoteId, window.localStream);
  
  addCallErrorHandling(call);
  
  call.on('stream', (remoteStream) => {
    console.log('Received remote stream');
    window.remoteAudio.srcObject = remoteStream;
    window.remoteAudio.autoplay = true;
    callContainer.hidden = false;
    callBtn.hidden = true;
    document.getElementById("cast-status").textContent = `Connected to: ${remoteId}`;
  });
  
  window.currentCall = call;
}

// Answer incoming calls
peer.on('call', (call) => {
  console.log('Answering call from:', call.peer);
  call.answer(window.localStream);
  
  addCallErrorHandling(call);
  
  call.on('stream', (remoteStream) => {
    console.log('Received remote stream from incoming call');
    window.remoteAudio.srcObject = remoteStream;
    window.remoteAudio.autoplay = true;
    callContainer.hidden = false;
    callBtn.hidden = true;
    document.getElementById("cast-status").textContent = `Call from: ${call.peer}`;
  });
  
  window.currentCall = call;
});

// Hang up function
function hangUp() {
  if (window.currentCall) {
    window.currentCall.close();
  }
  if (window.remoteAudio.srcObject) {
    window.remoteAudio.srcObject.getTracks().forEach(track => track.stop());
    window.remoteAudio.srcObject = null;
  }
  callContainer.hidden = true;
  callBtn.hidden = false;
  window.currentCall = null;
}

// Additional call error handling
function addCallErrorHandling(call) {
  call.on('error', (err) => {
    console.error('Call error:', err);
    document.getElementById("cast-status").textContent = `Call error: ${err.message}`;
  });
  
  call.on('close', () => {
    console.log('Call ended');
    hangUp();
  });
}
