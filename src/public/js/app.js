const socket = new WebSocket(`ws://${window.location.host}`)
const ul = document.querySelector("ul");
const form = document.querySelector("form");




socket.addEventListener("open",(event) => {
    console.log("Connected to browser");
})
socket.addEventListener("message",(message) => {
    console.log(message.data);
})

function handleSubmit(event){
    event.preventDefault();
    const input = form.querySelector("input")
    socket.send(input.value)
    input.value = "";
}
form.addEventListener("submit", handleSubmit);