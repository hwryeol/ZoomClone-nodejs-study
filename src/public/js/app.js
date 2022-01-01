const socket = new WebSocket(`ws://${window.location.host}`)
const ul = document.querySelector("ul");
const msg = document.querySelector("#msg");
const nick = document.querySelector("#nick")

function makeMessage(type,payload){
    const msg = {type, payload};
    return JSON.stringify(msg);
}
socket.addEventListener("open",(event) => {
    console.log("Connected to browser");
})
socket.addEventListener("message",(message) => {
    const li = document.createElement("li")
    li.innerText = message.data
    ul.append(li)
})

function handleMsgSubmit(event){
    event.preventDefault();
    const input = msg.querySelector("input")
    const type = "msg"
    const payload = input.value
    socket.send(makeMessage(type,payload))
    input.value = "";
}

function handleNickSubmit(event){
    event.preventDefault();
    const input = nick.querySelector("input")
    const type = "nickname"
    const payload = input.value
    socket.send(makeMessage(type,payload))
}
msg.addEventListener("submit", handleMsgSubmit);
nick.addEventListener("submit",handleNickSubmit);
