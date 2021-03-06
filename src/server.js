import express from"express";
import https from "https"
import path from "path"
import {Server} from "socket.io";
import { instrument } from "@socket.io/admin-ui";
import fs from "fs";

const __dirname = path.resolve();

const app = express();

const options = {
    key:fs.readFileSync('./private.pem'),
    cert: fs.readFileSync("./public.pem"),
}

app.set("view engine","pug");
app.set("views",__dirname + "/src/views" );
app.use("/public", express.static(__dirname+"/src/public"));
app.get("/",(_,res) => res.render("home"));
app.get("/*",(_,res) => res.redirect("/"));


const handleListen = () => console.log("Listening on https://localhost:3000");

const server = https.createServer(options, app);
const io = new Server(server,{
    cors:{
        origin: ["https://admin.socket.io"],
        credentials: true,
    }});

instrument(io,{
    auth:false,
})

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
    socket.on("join_room",(roomName) => {
        socket.join(roomName);
        socket.to(roomName).emit("welcome")
    })
    socket.on("offer",(offer,roomName) => {
        socket.to(roomName).emit("offer",offer);
    })
    
    socket.on("answer", (answer, roomName) => {
        socket.to(roomName).emit("answer", answer);
      });
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
            socket.to(room).emit("RoomUserCount",getRoomUserCount(room)-1)
            console.log(getRoomUserCount(room)-1)
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

    socket.on("ice",(ice,roomName) => {
        socket.to(roomName).emit("ice",ice);
    })
  });

server.listen(3000,handleListen);



