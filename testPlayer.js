import inquirer from "inquirer";
import axios from "axios";
import { io } from "socket.io-client";

export async function checkPin(pin){
    const res = await axios({
        method: 'get',
        url: `http://147.135.76.154:5000/games/${pin}/check`,
    })
    return res.data.data;
}
export async function join(pin, nickname){
    const res = await axios({
        method: 'post',
        url: `http://147.135.76.154:5000/games/${pin}/join`,
        data: {
            displayName: nickname
        }
    })
    return res.data.data;
}
async function main(){
    try{
       while(1){
        console.log("JOIN GAME!!!!")
        const pinAnswer = await inquirer.prompt([
            {
                type: "input",
                name: "pin",
                message: "Enter pin: "
            }
        ]);
        await checkPin(pinAnswer.pin);
        const nicknameAnswer = await inquirer.prompt([
            {
                type: "input",
                name: 'nickname',
                message: "Enter nickname: "
            }
        ])
        const joinRes = await join(pinAnswer.pin, nicknameAnswer.nickname);
        const socket = io('http://147.135.76.154:5000');
        socket.on('connection', () => {
            console.log(socket.id);
        });
        socket.on('onPlayerMessage', (data) => {
            console.log(data);
        })
        socket.emit('playerEvent', {
            event: "HELLO",
            data: {
                pin: pinAnswer.pin,
                displayName: nicknameAnswer.nickname
            }
        })
       }

    } catch(error){
        console.log(error);
    }
}

main();