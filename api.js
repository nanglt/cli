import axios from "axios";

export async function createGame(token, data){
    const res = await axios({
        method: 'post',
        url: 'http://147.135.76.154:5000/games/',
        headers: {
            Authorization: `Bearer ${token}`
        },
        data: data
    })
    console.log(res);
    return res;
}