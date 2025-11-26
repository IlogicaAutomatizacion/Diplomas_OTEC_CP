import { client_id, client_secret, refresh_token } from "../vars";

async function obtenerAccessToken() {
    const res = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            client_id,
            client_secret,
            refresh_token,
            grant_type: "refresh_token",
        }),
    });

    const data = await res.json();
    return data.access_token;
}

// Gmail exige MIME perfecto
function encodeBase64Url(str: string) {
    return Buffer.from(str)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
}

export default async function enviarCorreo(
    html: string,
    para: string,
    subject: string,
    pdfBuffer?: Buffer,
    nombre = "archivo"
) {
    let boundary = "----=_Part_123456_7890123456789";

    let mime = "";

    mime += `To: ${para}\r\n`;
    mime += `Subject: ${subject}\r\n`;
    mime += `MIME-Version: 1.0\r\n`;
    mime += `Content-Type: multipart/mixed; boundary="${boundary}"\r\n`;
    mime += `\r\n`;

    // Parte HTML
    mime += `--${boundary}\r\n`;
    mime += `Content-Type: text/html; charset="UTF-8"\r\n`;
    mime += `Content-Transfer-Encoding: 7bit\r\n\r\n`;
    mime += `${html}\r\n\r\n`;

    // Parte PDF (si existe)
    if (pdfBuffer) {
        const pdfB64 = pdfBuffer
            .toString("base64")
            .match(/.{1,76}/g) // ← NECESARIO
            ?.join("\r\n");   // ← NECESARIO

        mime += `--${boundary}\r\n`;
        mime += `Content-Type: application/pdf; name="${nombre}.pdf"\r\n`;
        mime += `Content-Disposition: attachment; filename="${nombre}.pdf"\r\n`;
        mime += `Content-Transfer-Encoding: base64\r\n\r\n`;
        mime += `${pdfB64}\r\n\r\n`;
    }

    mime += `--${boundary}--`;

    const raw = encodeBase64Url(mime);
    const accessToken = await obtenerAccessToken();

    const resp = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ raw }),
    });

    const data = await resp.json();
    return data;
}
