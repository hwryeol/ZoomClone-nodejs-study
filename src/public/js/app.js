const socket = io();

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute")
const cameraBtn = document.getElementById("camera")

let mystream;
let muted = false;
let cameraOff = false;

async function getMedia(){
    try {
        mystream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true,
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

muteBtn.addEventListener("click", handleMuteClick) 
cameraBtn.addEventListener("click", handleCameraClick)

getMedia();