const socket = io();

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute")
const cameraBtn = document.getElementById("camera")
const camerasSelect = document.getElementById("cameras")

const call = document.getElementById("call")

let myStream;
let muted = false;
let cameraOff = false;
let roomName;
let myPeerConnection;

call.hidden = true;






async function getCameras() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter((device) => device.kind === "videoinput");
      const currentCamera = myStream.getVideoTracks()[0];
      cameras.forEach((camera) => {
        const option = document.createElement("option");
        option.value = camera.deviceId;
        option.innerText = camera.label;
        if (currentCamera.label === camera.label) {
          option.selected = true;
        }
        camerasSelect.appendChild(option);
      });
    } catch (e) {
      console.log(e);
    }
  }

async function getMedia(deviceId) {
    const initialConstrains = {
      audio: true,
      video: { facingMode: { exact: "user" }},
    };
    const cameraConstraints = {
      video: { deviceId: { exact: deviceId } }

    };
    try {
      myStream = await navigator.mediaDevices.getUserMedia(
        deviceId ? cameraConstraints : initialConstrains
      );
      myFace.srcObject = myStream;
      if (!deviceId) {
        await getCameras();
      }
    } catch (e) {
      console.log(e);
    }
  }

function handleMuteClick(){
    myStream.getAudioTracks().forEach(track => track.enabled = !track.enabled)
    if(muted){
        muteBtn.innerText = "mute"
        muted = false;
    }
    else{
        muteBtn.innerText = "Unmute"
        muted = true;
    }
}

function handleCameraClick(){
    myStream.getVideoTracks().forEach(track => track.enabled = !track.enabled)
    if(cameraOff){
        cameraBtn.innerText = "Turn Camera off";
        cameraOff = false;
    }else{
        cameraBtn.innerText = "Turn Camera on"
        cameraOff = true
    }
}

async function handleCameraChange(){
    await getMedia(camerasSelect.value);
}

muteBtn.addEventListener("click", handleMuteClick) 
cameraBtn.addEventListener("click", handleCameraClick)
camerasSelect.addEventListener("input", handleCameraChange)

//welcome form

const welcome = document.getElementById("welcome")
const welcomeForm = welcome.querySelector("form")

async function initCall(){
    welcome.hidden = true;
    call.hidden = false;
    await getMedia();
    makeConnection();
}

async function handleWelcomeSubmit(event){
    event.preventDefault();
    const input = welcomeForm.querySelector("input");
    await initCall();
    socket.emit("join_room", input.value,initCall);
    roomName = input.value;
    input.value = "";
}

welcome.addEventListener("submit",handleWelcomeSubmit)

//socket code

socket.on("welcome", async () => {
    const offer = await myPeerConnection.createOffer();
    await myPeerConnection.setLocalDescription(offer);
    console.log("sent the offer");
    await socket.emit("offer", offer, roomName);
});

socket.on("ice",(ice)=>{
    myPeerConnection.addIceCandidate(ice)
})

socket.on("offer",async (offer)=>{
    await myPeerConnection.setRemoteDescription(offer);
    console.log("received the offer")
    const answer = await myPeerConnection.createAnswer();
    await myPeerConnection.setLocalDescription(answer);
    socket.emit("answer",answer, roomName);
    console.log("sent the answer");
})

socket.on("answer", async (answer) => {
    console.log("received the answer")
    await myPeerConnection.setRemoteDescription(answer);
  });




// RTC code

function makeConnection(){
    myPeerConnection = new RTCPeerConnection();
    myPeerConnection.addEventListener("icecandidate", handleIce);
    myPeerConnection.addEventListener("addstream",handleAddStream)
    myStream
        .getTracks()
        .forEach(track => myPeerConnection.addTrack(track,myStream));
}

function handleIce(data){
    socket.emit("ice",data.candidate,roomName);
}

function handleAddStream(data) {
    const peerFace = document.getElementById("peerFace");
    peerFace.srcObject = data.stream;
  }

// getCameras();
