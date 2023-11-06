import inquirer from "inquirer";
import axios from "axios";
import { io } from "socket.io-client";
import select, { Separator } from "@inquirer/select"
export const url = "http://147.135.76.154:5000"

export async function checkPin(pin) {
    const res = await axios({
        method: 'get',
        url: `${url}/games/${pin}/check`,
    })
    return res.data.data;
}
export async function join(pin, nickname) {
    const res = await axios({
        method: 'post',
        url: `${url}/games/${pin}/join`,
        data: {
            displayName: nickname
        }
    })
    return res.data.data;
}
export async function progress(pin, nickname) {
    const res = await axios({
        method: 'get',
        url: `${url}/games/${pin}/progress/${nickname}`
    });
    return res.data.data;
}
export async function submitAnswer(pin, optionId, questionId, displayName) {
    const res = await axios({
        method: 'post',
        url: `${url}/games/${pin}/answer`,
        data: {
            questionId,
            optionId,
            displayName,
            startTime: "2023-10-30T16:22:00Z",
            duration: 5
        }
    })
    return res.data.data;
}
async function main() {
    let status = 0;
    try {
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
        const socket = io(url);
        socket.on('connection', () => {
            console.log(socket.id);
        });
        socket.on('onPlayerMessage', async (data) => {
            console.log(data);
            if (data.data.event === 'PLAY_CHALLENGE') {
                while (true) {
                    const data = await progress(pinAnswer.pin, nicknameAnswer.nickname);
                    if (!data) {
                        console.log("END GAME!");
                        break;
                    }
                    const quiz = await select({
                        message: data.nextQuestion.title,
                        choices: data.nextQuestion.options.map(option => ({
                            name: option.description,
                            value: option._id
                        }))
                    })
                    const submitAnswerRes = await submitAnswer(pinAnswer.pin, quiz, data.nextQuestion.id, nicknameAnswer.nickname);
                    console.log("Result:", submitAnswerRes);
                    const nextQ = await inquirer.prompt([
                        {
                            type: "list",
                            name: "answer",
                            message: "Next Question?",
                            choices: [
                                { name: "Y", value: true },
                                { name: "N", value: false },
                            ],
                        },
                    ])
                    if (!nextQ) {
                        break;
                    }
                }
            } else if(data.data.event === 'PLAY_LIVE' && status === 0) {
                status = 1;
                socket.emit('playerEvent', {
                    event: "PROGRESS",
                    data: {
                        pin: pinAnswer.pin,
                        displayName: nicknameAnswer.nickname
                    }
                })
            }
            if(data.data.event === "START_QUESTION"){
                if (!data) {
                    console.log("END GAME!");
                }
                let quiz = await select({
                    message: data.data.nextQuestion.title,
                    choices: data.data.nextQuestion.options.map(option => ({
                        name: option.description,
                        value: option._id
                    }))
                })
                socket.emit('playerEvent', {
                    event: 'PLAY',
                    data: {
                        pin: pinAnswer.pin, 
                        optionId: quiz, 
                        questionId: data.data.nextQuestion.id, 
                        displayName: nicknameAnswer.nickname
                    }
                })
            }
            if(data.data.event === "END_QUESTION"){
                socket.emit('playerEvent', {
                    event: "PROGRESS",
                    data: {
                        pin: pinAnswer.pin,
                        displayName: nicknameAnswer.nickname
                    }
                })
            }
            if(data.data.event === "GAME_OVER"){
                console.log("END_GAME");
                socket.disconnect();
            }
        })
        socket.emit('playerEvent', {
            event: "HELLO",
            data: {
                pin: pinAnswer.pin,
                displayName: nicknameAnswer.nickname
            }
        })
    } catch (error) {
        console.log(error.message);
    }
}

main();