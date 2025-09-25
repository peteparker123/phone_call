// Configuration for different environments
const isLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
const peerConfig = {
  host: isLocalhost ? location.hostname : 'https://phone-call-01ph.onrender.com/', // Replace with your actual Render URL
  port: isLocalhost ? (location.port || 8000) : 443,
  secure: !isLocalhost,
  debug: 1,
  path: "/myapp",
};

const peer = new Peer(
  `${Math.floor(Math.random() * 2 ** 18)
    .toString(36)
    .padStart(4, 0)}`,
  peerConfig,
);
window.peer = peer;
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

peer.on("open", () => {
  document.getElementById("cast-status").textContent =
    `Your device ID is: ${peer.id}`;
});

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
  const call = peer.call(remoteId, window.localStream);
  call.on('stream', (remoteStream) => {
    window.remoteAudio.srcObject = remoteStream;
    window.remoteAudio.autoplay = true;
    callContainer.hidden = false;
    callBtn.hidden = true;
  });
  
  call.on('close', () => {
    hangUp();
  });
  
  window.currentCall = call;
}

// Answer incoming calls
peer.on('call', (call) => {
  call.answer(window.localStream);
  call.on('stream', (remoteStream) => {
    window.remoteAudio.srcObject = remoteStream;
    window.remoteAudio.autoplay = true;
    callContainer.hidden = false;
    callBtn.hidden = true;
  });
  
  call.on('close', () => {
    hangUp();
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

// Handle peer connection errors
peer.on('error', (err) => {
  console.error('PeerJS error:', err);
  document.getElementById("cast-status").textContent = `Error: ${err.message}`;
});
