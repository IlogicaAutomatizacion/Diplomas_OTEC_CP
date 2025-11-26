import { client_id, client_secret, refresh_token } from "../vars";
import { google } from "googleapis";

interface Params {
    msgHtml: string;
    para: string;
    subject: string;
    pdfBuffer?: Buffer;
    nombre?: string;
}

export default async (msgHtml:string, para:string, subject:string, pdfBuffer?:Buffer, nombre?:string) => {

    const oauth2Client = new google.auth.OAuth2(
        client_id,
        client_secret,
        "https://developers.google.com/oauthplayground"
    );

    oauth2Client.setCredentials({
        refresh_token: refresh_token,
    });

    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    // --------- ENCODE BUFFERS PARA QUE NO SE CORROMPAN ----------
    const base64Url = (str: Buffer | string) =>
        Buffer.from(str)
            .toString("base64")
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=+$/, "");

    // --------- ESTRUCTURA MIME DEL EMAIL ----------
    let mime = [
        `From: "Automatizacion ConeXion Process" <automatizacion@ilogica-soluciones.cl>`,
        `To: ${para}`,
        `Subject: =?utf-8?B?${Buffer.from(subject).toString("base64")}?=`, // permite tildes
        `MIME-Version: 1.0`,
    ];

    if (!pdfBuffer) {
        // ------------ SIN ADJUNTOS --------------
        mime.push(`Content-Type: text/html; charset="UTF-8"\n`);
        mime.push(msgHtml);
    } else {
        // ------------ CON PDF ADJUNTO --------------
        const boundary = "----=_Part_" + Math.random().toString(36).substring(2);

        mime.push(`Content-Type: multipart/mixed; boundary="${boundary}"\n`);
        mime.push(`--${boundary}`);
        mime.push(`Content-Type: text/html; charset="UTF-8"\n`);
        mime.push(msgHtml);

        mime.push(`\n--${boundary}`);
        mime.push(
            `Content-Type: application/pdf; name="${nombre}.pdf"`
        );
        mime.push(`Content-Disposition: attachment; filename="${nombre}.pdf"`);
        mime.push(`Content-Transfer-Encoding: base64\n`);
        mime.push(pdfBuffer.toString("base64"));

        mime.push(`--${boundary}--`);
    }

    const rawMessage = base64Url(mime.join("\n"));

    // ---------- ENVIAR ----------
    const res = await gmail.users.messages.send({
        userId: "me",
        requestBody: {
            raw: rawMessage
        }
    });

    return res.data;
}
