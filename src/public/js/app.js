const socket = io();

const roomEnterForm = document.getElementById("roomEnter").querySelector("form")
const room = document.getElementById("room")

room.hidden = true

let roomName = ""
let count = 0

function addMessage(message){
    const ul = room.querySelector("ul");
    const li = document.createElement("li");
    li.innerText = message
    ul.appendChild(li)
}

function submitNicknameForm(event){
    event.preventDefault();
    const nicknameForm = document.querySelector("#nickname")
    const nickname = nicknameForm.querySelector("input").value;
    socket.emit("nickname",nickname);
}

function submitMsgForm(event){
    event.preventDefault();
    const msgForm = document.querySelector("#message")
    const input = msgForm.querySelector("input");
    const newMessage = input.value;
    socket.emit("new_message", newMessage, roomName, () => {
        addMessage(`You: ${newMessage}`);
    })
    input.value = "";
}

function enterRoom(){
    roomEnter.hidden = true;
    room.hidden = false;

    const msgForm = room.querySelector("#message");
    const nicknameForm = room.querySelector("#nickname");
    
    nicknameForm.addEventListener("submit",submitNicknameForm)
    msgForm.addEventListener("submit",submitMsgForm)    
}


roomEnterForm.addEventListener("submit",event=>{
    event.preventDefault();
    const input = roomEnterForm.querySelector("input");
    roomName = input.value;
    socket.emit("room",roomName,enterRoom);

})

socket.on("RoomUserCount",(roomCount)=> {
    const h3 = room.querySelector("h3");
    count = roomCount
    h3.innerText = `Room ${roomName}(${count})`
});

socket.on("printEnterRoomMsg",() => {
    addMessage("hello New User");
})

socket.on("openRooms", (openRooms) => {
    const h4 = document.querySelector("#roomEnter")
    const ul = h4.querySelector("ul");

    // if(openRooms.length === 0){
    //     ul.innerText = "";
    //     return;
    // }
    const li = document.createElement("li");
    
    openRooms.forEach(element => {
        console.log(element)
        li.innerText = element
        ul.appendChild(li)   
    });
})
socket.on("new_message", (msg) => {addMessage(msg)});
socket.on("notice",(notice)=>{addMessage(notice)});