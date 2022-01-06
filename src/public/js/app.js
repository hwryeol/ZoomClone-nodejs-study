const socket = io();

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute")
const cameraBtn = document.getElementById("camera")
const camerasSelect = document.getElementById("cameras")
const welcome = document.getElementById("welcome")
const call = document.getElementById("call")

let mystream;
let muted = false;
let cameraOff = false;
let roomName;
let myPeerConnection;

call.hidden = true;

welcomeForm = welcome.querySelector("form")

async function startMedia(){
    welcome.hidden = true;
    call.hidden = false;
    await getMedia();
    makeConnection();
}

function handleWelcomeSubmit(event){
    event.preventDefault();
    const input = welcomeForm.querySelector("input");
    socket.emit("join_room", input.value,startMedia);
    roomName = input.value;
    input.value = "";
}

welcome.addEventListener("submit",handleWelcomeSubmit)


async function getCameras(){
    try{
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(device => device.kind === "videoinput");

        cameras.forEach(camera => {
            const option = document.createElement("option");
            option.value = camera.deviceId;
            option.innerText = camera.label;
            console.log(option)
            camerasSelect.appendChild(option);
        })
    }catch(e){
        console.log(e)
    }
}

async function getMedia(){
    try {
        mystream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: {facingMode: "user"},
        });
        myFace.srcObject = mystream;
    } catch(e){
        console.log(e);
    }
}

function handleMuteClick(){
    mystream.getAudioTracks().forEach(track => track.enabled = !track.enabled)
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
    mystream.getVideoTracks().forEach(track => track.enabled = !track.enabled)
    if(cameraOff){
        cameraBtn.innerText = "Turn Camera off";
        cameraOff = false;
    }else{
        cameraBtn.innerText = "Turn Camera on"
        cameraOff = true
    }
}

function handleCameraChange(){
    console.log(camerasSelect.value)
}

function makeConnection(){
    myPeerConnection = new RTCPeerConnection(); 
    mystream
        .getTracks()
        .forEach(track => myPeerConnection.addTrack(track,mystream));
}

muteBtn.addEventListener("click", handleMuteClick) 
cameraBtn.addEventListener("click", handleCameraClick)
camerasSelect.addEventListener("input", handleCameraChange)

socket.on("welcome", async () => {
    const offer = await myPeerConnection.createOffer();
    myPeerConnection.setLocalDescription(offer);
    socket.emit("offer",offer, roomName);
    console.log(offer)
})

socket.on("offer",async (offer)=>{
    myPeerConnection.setRemoteDescription(offer);
    const answer = await myPeerConnection.createAnswer();
    myPeerConnection.setLocalDescription(answer);
    socket.emit("answer",answer, roomName);
    console.log(offer);
})

socket.on("answer", (answer) => {
    myPeerConnection.setRemoteDescription(answer);
  });

getCameras();
