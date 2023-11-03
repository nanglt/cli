import inquirer from "inquirer";
import axios from "axios";
import { io } from "socket.io-client";

export async function createGame(token, data){
    const res = await axios({
        method: 'post',
        url: 'http://147.135.76.154:5000/games/',
        headers: {
            Authorization: `Bearer ${token}`
        },
        data: data
    })
    return res.data.data;
}
export async function main(){
    let tokenId;
    const data = {
        "type": "CHALLENGE",
        "startTime": "2023-10-30T10:20:00Z",
        "endTime": "2023-11-30T10:20:10Z",
        "title": "game title1",
        "questions": [
            "653731edea515effb91d5979",
            "653731edea515effb91d597e",
            "653731edea515effb91d5983",
            "65373e30bbb3df44fd05ada0"
        ]
    };
    try{
        const token = await inquirer.prompt([
            {
                type: "input",
                name: "tokenId",
                message: "Enter token: "
            }
        ])
        tokenId = token.tokenId;
        const createAnswer = await inquirer.prompt([
            {
                type: "list",
                name: "answer",
                message: "Create new game?",
                choices: [
                  { name: "Y", value: true },
                  { name: "N", value: false },
                ],
              },
        ]);
        if(createAnswer.answer){
            const res = await createGame(tokenId, data);
            console.log("PIN: ", res.pin);
            const socket = io('http://147.135.76.154:5000');
            socket.on('connection', () => {
                console.log(socket.id);
            });
            socket.on('managerEvent', (data) => {
                console.log(data);
            })
        } else{
            console.log("END!")
        }
    } catch(error){
        console.log("Something went wrong!", error);
    }
}


main();