import { client_id, client_secret, refresh_token } from "../vars";
import { google } from "googleapis";

export default async (msgHtml: string, para: string, subject: string, pdfBuffer?: Buffer, nombre?: string) => {

    const oauth2Client = new google.auth.OAuth2(
        client_id,
        client_secret,
        "https://developers.google.com/oauthplayground"
    );

    oauth2Client.setCredentials({ refresh_token });

    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    const boundary = "boundary_" + Math.random().toString(36).substring(2);

    // construir MIME
    let mimeParts = [
        `From: Automatización <automatizacion@ilogica-soluciones.cl>`,
        `To: ${para}`,
        `Subject: =?UTF-8?B?${Buffer.from(subject).toString("base64")}?=`,
        `MIME-Version: 1.0`,
    ];

    if (!pdfBuffer) {
        // SIN adjunto
        mimeParts.push(
            `Content-Type: text/html; charset="UTF-8"`,
            ``,
            msgHtml
        );
    } else {
        // CON adjunto
        mimeParts.push(
            `Content-Type: multipart/mixed; boundary="${boundary}"`,
            ``,
            `--${boundary}`,
            `Content-Type: text/html; charset="UTF-8"`,
            ``,
            msgHtml,
            ``,
            `--${boundary}`,
            `Content-Type: application/pdf; name="${nombre}.pdf"`,
            `Content-Disposition: attachment; filename="${nombre}.pdf"`,
            `Content-Transfer-Encoding: base64`,
            ``,
            pdfBuffer.toString("base64"), // 👈 NO LO TOQUES, base64 normal
            ``,
            `--${boundary}--`
        );
    }

    // IMPORTANTE: CRLF
    const mimeMessage = mimeParts.join("\r\n");

    // SOLO el mensaje completo va en base64url
    const base64urlMessage = Buffer
        .from(mimeMessage)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

    const res = await gmail.users.messages.send({
        userId: "me",
        requestBody: { raw: base64urlMessage }
    });

    return res.data;
}
