import { google, drive_v3 } from "googleapis";
import { GOOGLE_CREDENTIALS } from "../vars";

const credentials = JSON.parse(GOOGLE_CREDENTIALS);

const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/drive"]
});

const drive: drive_v3.Drive = google.drive({
    version: "v3",
    auth
});

export default async function driveHelper(
    nombre: string,
    carpetaId: string
): Promise<[drive_v3.Schema$File | null, drive_v3.Drive]> {

    const res = await drive.files.list({
        q: `'${carpetaId}' in parents and name='${nombre}' and trashed=false`,
        fields: "files(id, name, mimeType)",
        includeItemsFromAllDrives: true,
        supportsAllDrives: true,
    });

    const archivo = res.data.files?.[0] ?? null;

    return [archivo, drive];
}
