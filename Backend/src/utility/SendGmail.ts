
import { client_id, client_secret, refresh_token } from "../vars";

async function obtenerAccessToken() {

    const res = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            client_id: client_id,
            client_secret: client_secret,
            refresh_token: refresh_token,
            grant_type: "refresh_token"
        })
    });
    const data: any = await res.json();

    console.log(data)
    return data.access_token;
}

export default async (msg: string, para: string, subject: string) => {
    const accesToken = await obtenerAccessToken()

    const subjectEncoded = `=?UTF-8?B?${Buffer.from(subject, "utf8").toString("base64")}?=`;

    const mensaje = [
        "From: Automatizacion ConeXion Process <automatizacion@ilogica-soluciones.cl>",
        `To: ${para}`,
        `Subject: ${subjectEncoded}`,
        'Content-Type: text/html; charset="UTF-8"',
        "Content-Transfer-Encoding: 8bit",
        "",
        `${msg}`
    ].join("\n");

    const raw = Buffer.from(mensaje, "utf-8")
        .toString("base64") 
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");


    const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${accesToken}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ raw })
    });
}