import inquirer from "inquirer";
import axios from "axios";
import { io } from "socket.io-client";
export const url = "http://147.135.76.154:5000"
export async function createGame(token, data){
    const res = await axios({
        method: 'post',
        url: `${url}/games/`,
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
            "6548b7f83e784544bcc7dd2d",
            "6548b7f83e784544bcc7dd2e",
            "6548b7f83e784544bcc7dd2f",
            "6548b7f83e784544bcc7dd30"
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
            const socket = io(url);
            socket.on('connection', () => {
                console.log(socket.id);
            });
            socket.on('onManagerMessage', (data) => {
                console.log(data);
                if(data.data.event === 'PLAYER_ANSWERED'){
                    console.log(data.data.statistic)
                }
                if(data.data.event === 'SHOW_RANKED_BOARD'){
                    console.log(data.data.scoreboard)
                }
            })
            socket.emit('managerEvent', {
                event: "HELLO",
                data: {
                    pin: res.pin
                }
            })
            const startGameAnswer = await inquirer.prompt([
                {
                    type: "list",
                    name: "answer",
                    message: "Start game with?",
                    choices: [
                      { name: "API", value: true },
                      { name: "SOCKET", value: false },
                    ],
                  },
            ])
            if(startGameAnswer.answer){
                socket.emit('managerEvent', {
                    event: "START",
                    data: {
                        pin: res.pin,
                        type: "API"
                    }
                })
            } else{
                socket.emit('managerEvent', {
                    event: "START",
                    data: {
                        pin: res.pin,
                        type: "API"
                    }
                })
            }
            const endGameAnswer = await inquirer.prompt([
                {
                    type: "list",
                    name: "answer",
                    message: "End game?",
                    choices: [
                      { name: "Y", value: true },
                      { name: "N", value: false },
                    ],
                }
            ])
            if(endGameAnswer.answer){
                socket.emit('managerEvent', {
                    event: "END_GAME",
                    data: {
                        pin: res.pin
                    }
                })
                const leaveGameAnswer = await inquirer.prompt([
                    {
                        type: "list",
                        name: "answer",
                        message: "Exit?",
                        choices: [
                          { name: "Y", value: true },
                          { name: "N", value: false },
                        ],
                    }
                ])
                if(leaveGameAnswer.answer){
                    socket.emit('managerEvent', {
                        event: "LEAVE_GAME",
                        data: {
                            pin: res.pin
                        }
                    })
                    socket.disconnect();
                }
            }
        } else{
            console.log("END!")
        }
    } catch(error){
        console.log(error)
        console.log("Something went wrong!", error.message);
    }
}


main();