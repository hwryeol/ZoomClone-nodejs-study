import express from"express";
import http from "http"
import path from "path"
import {Server} from "socket.io";
const __dirname = path.resolve();

const app = express();

app.set("view engine","pug");
app.set("views",__dirname + "/src/views" );
app.use("/public", express.static(__dirname+"/src/public"));
app.get("/",(_,res) => res.render("home"));
app.get("/*",(_,res) => res.redirect("/"));


const handleListen = () => console.log("Listening on http://localhost:3000");

const server = http.createServer(app);
const io = new Server(server);
const sockets = [];

function publicRooms(){
    const {
        sockets: {
            adapter:{sids,rooms},
        },
    } = io;

    const publicRooms = [];
    rooms.forEach((_,key) => {
        if(sids.get(key) === undefined){
            publicRooms.push(key);
        }
    })
    return publicRooms
}

function getRoomUserCount(roomName){
    return io.sockets.adapter.rooms.get(roomName)?.size;
}

io.on('connection', (socket) => {

    let roomName = ""
    socket["nickname"] = "Anon"
    socket.emit("openRooms",publicRooms())
    socket.onAny((event) => {
        console.log(
            `Socket Event:${event}`,
        );
    })
    
    socket.on('room', (roomName,showRoom) => {
        socket.join(roomName); 
        showRoom();
        const notice = "hello world"
        socket.emit('notice',notice);
        socket.to(roomName).emit("printEnterRoomMsg")
        socket.to(roomName).emit("RoomUserCount",getRoomUserCount(roomName))
        socket.emit("RoomUserCount",getRoomUserCount(roomName))
        io.sockets.emit("openRooms",publicRooms())   
    });
    

    socket.on('disconnecting', () => {
        socket.rooms.forEach((room) => {
            socket.to(room).emit("bye")
            socket.to(roomName).emit("RoomUserCount",getRoomUserCount(room)-1)
        });
        
    });
    socket.on('disconnect', () => {
        io.sockets.emit("openRooms",publicRooms())
    })

    socket.on("new_message",(msg,roomName,printMsg) => {
        socket.to(roomName).emit("new_message",`${socket.nickname}: ${msg}`);
        printMsg();
    })

    socket.on("nickname",(nickname) => {socket["nickname"] = nickname})
  });

server.listen(3000,handleListen);



