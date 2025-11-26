
import { client_id, client_secret, refresh_token } from "../vars";
import fs from 'fs'
import path from "path";

import nodemailer from "nodemailer";

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
    const data: any = await res.json();
    return data.access_token;
}

// pdfBuffer: Buffer | undefined
export default async (msgHtml: string, para: string, subject: string, pdfBuffer?: Buffer, nombre?: string) => {
    const accessToken = await obtenerAccessToken();

    // Transport con OAuth2 usando accessToken (Nodemailer maneja refresh si pones refresh_token también)
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            type: "OAuth2",
            user: "automatizacion@ilogica-soluciones.cl", // tu cuenta remitente
            clientId: client_id,
            clientSecret: client_secret,
            refreshToken: refresh_token,
            accessToken: accessToken
        },
    });

    const mailOptions: nodemailer.SendMailOptions = {
        from: `"Automatizacion ConeXion Process" <automatizacion@ilogica-soluciones.cl>`,
        to: para,
        subject,
        html: msgHtml,
        attachments: []
    };

    if (pdfBuffer) {
        mailOptions.attachments!.push({
            filename: `${nombre}.pdf`,
            content: pdfBuffer,
            contentType: "application/pdf"
        });
    }

    // enviar
    const info = await transporter.sendMail(mailOptions);
    // opcional: console.log("Sent:", info);
    return info;
};
