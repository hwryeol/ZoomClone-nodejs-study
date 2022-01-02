const socket = io();

const welcome = document.getElementById("welcome")
const form =  welcome.querySelector("form");

const room = document.getElementById("room")

room.hidden = true

let roomName = ""

function addMessage(message){
    const ul = room.querySelector("ul");
    const li = document.createElement("li");
    li.innerText = message
    ul.appendChild(li)
}
function showRoom(){
    welcome.hidden = true;
    room.hidden = false;
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName}`
}

form.addEventListener("submit",(event)=>{
    event.preventDefault();
    const input = form.querySelector("input");
    roomName = input.value;
    socket.emit("room",roomName,showRoom);
    input.value = ""
});

socket.on("welcome",()=>{
    addMessage("hello");
})
