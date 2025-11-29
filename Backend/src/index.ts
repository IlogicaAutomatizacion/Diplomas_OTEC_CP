import express, { Request } from 'express'
import cors from "cors"
import { FRONT, PORT } from './vars';
import SendGmail from './utility/SendGmail';
import DB from './DB';
import { randomUUID } from 'crypto';

import { Server, Socket } from 'socket.io';
import fs from "fs";

const app = express()

import puppeteer from "puppeteer";

export async function generarCertificadoPDF(url: string) {
    console.log("Cargando URL:", url);

    const browser = await puppeteer.launch({
        headless: true,
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-web-security",
        ]
    });

    const page = await browser.newPage();

    await page.setExtraHTTPHeaders({
        "ngrok-skip-browser-warning": "true"
    });

    await page.setUserAgent("Puppeteer-CertBot/1.0");

    await page.goto(url, { waitUntil: "domcontentloaded" });

    // Esperar un ciclo de render
    await page.evaluate(() => new Promise(requestAnimationFrame));

    await page.waitForFunction(() => {
        const el = document.querySelector("#loading") as HTMLDivElement;
        return !el || el!.style.display === "none" || el.textContent.trim() === "";
    }, { timeout: 15000 });

    await page.waitForFunction(async () => {
        const imgs = Array.from(document.images);
        if (imgs.length === 0) return true;

        const checks = await Promise.all(
            imgs.map(img => {
                if (img.complete && img.naturalWidth > 0) return true;
                return new Promise(resolve => {
                    img.onload = () => resolve(true);
                    img.onerror = () => resolve(true);
                });
            })
        );

        return checks.every(v => v);
    }, { timeout: 15000 });

    const pdfBuffer = await page.pdf({
        format: "A4",
        landscape: true,
        printBackground: true
    });

    fs.writeFileSync("debug.pdf", pdfBuffer);
    await browser.close();
    return pdfBuffer;
}


const allowedOrigins = [
    "http://localhost:5173",
    "https://ilogicaautomatizacion.github.io",
    "https://ilogicaautomatizacion.github.io/Diplomas_OTEC_CP"
];

app.use(cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", 'DELETE'],
}))

app.use(express.json());


app.post('/insertarUsuarios', async (req, res) => {
    console.log(req.body)

    try {
        const usuarios = req.body

        const rows = []

        usuarios.forEach(arrUsuario => {
            rows.push(`(${arrUsuario.id_alumno},'${arrUsuario.rut_alumno}','${arrUsuario['Nombre completo (nombres y apellidos)']}','${arrUsuario.cargo_alumno}','${arrUsuario['E-mail']}',${arrUsuario.telefono_alumno},'${randomUUID()}')`)
        })

        console.log(rows.join(','))

        await DB.query(`INSERT INTO Alumnos (id_alumno,rut_alumno,nombre_alumno,cargo_alumno,correo_alumno,telefono_alumno,token_alumno)
                             VALUES ${rows.join(',')} 
                             ON CONFLICT (id_alumno)
                             DO UPDATE SET
                             rut_alumno = EXCLUDED.rut_alumno,
                             nombre_alumno = EXCLUDED.nombre_alumno,
                             cargo_alumno = EXCLUDED.cargo_alumno,
                             correo_alumno = EXCLUDED.correo_alumno,
                             telefono_alumno = EXCLUDED.telefono_alumno
                             `,

        )

        res.status(200).json(`Se insertaron correctamente los usuarios en la base de datos.`)

    } catch (e) {
        console.log(e)
        res.status(400).json(`Algo salio mal a la hora de insertar los usuarios en la base de datos: ${e}.`)
    }
})

app.post('/insertarCursos', async (req, res) => {
    console.log(req.body)

    try {
        const usuarios = req.body

        const rows = []

        usuarios.forEach(arrCurso => {
            rows.push(`(${arrCurso.id_curso},'${arrCurso.nombre_curso}',${arrCurso['duracion(h)_curso']},'${arrCurso.temario_curso}', '${arrCurso.resumen_temario}')`)
        })

        await DB.query(`INSERT INTO Cursos (id_curso, nombre_curso, duracion_curso,temario_curso,resumen_temario)
                        VALUES ${rows.join(',')}
                        ON CONFLICT (id_curso)
                        DO UPDATE SET
                            id_curso = EXCLUDED.id_curso,
                            nombre_curso = EXCLUDED.nombre_curso,
                            duracion_curso = EXCLUDED.duracion_curso,
                            temario_curso = EXCLUDED.temario_curso,
                            resumen_temario = EXCLUDED.resumen_temario

        `)

        res.status(200).json(`Se insertaron correctamente los cursos en la base de datos.`)

    } catch (e) {
        console.log(e)
        res.status(400).json(`Algo salio mal a la hora de insertar los cursos en la base de datos: ${e}.`)
    }
})

app.post('/insertarProfesores', async (req, res) => {
    console.log(req.body)

    try {
        const usuarios = req.body

        const rows = []

        usuarios.forEach(arrProfesores => {
            console.log(arrProfesores)
            rows.push(`(${arrProfesores.id_profesor},'${arrProfesores.relator}','${arrProfesores.rut_profesor}',${arrProfesores['fono/fax_profesor']},'${arrProfesores['e-mail_actualizado_profesor']}','${arrProfesores.direccion_profesor}','${arrProfesores.especialidad_profesor}','${randomUUID()}')`)
        })

        console.log(rows.join(','))

        await DB.query(`INSERT INTO Profesores (id_profesor,relator_profesor,rut_profesor,fono_fax_profesor,correo_profesor,direccion_profesor,especialidad_profesor,token_profesor) VALUES ${rows.join(',')}
                        ON CONFLICT (id_profesor)
                        DO UPDATE SET
                            relator_profesor = EXCLUDED.relator_profesor,
                            rut_profesor = EXCLUDED.rut_profesor,
                            fono_fax_profesor = EXCLUDED.fono_fax_profesor,
                            correo_profesor = EXCLUDED.correo_profesor,
                            direccion_profesor = EXCLUDED.direccion_profesor,
                            especialidad_profesor = EXCLUDED.especialidad_profesor

        `)

        res.status(200).json(`Se insertaron correctamente los cursos en la base de datos.`)

    } catch (e) {
        console.log(e)
        res.status(400).json(`Algo salio mal a la hora de insertar a los profesores en la base de datos: ${e}.`)
    }
})

app.post('/inscribir', async (req, res) => {
    console.log(req.body)

    try {
        const usuarios = req.body

        const rows = []

        usuarios.forEach(arrProfesores => {
            console.log(arrProfesores)
            const asistencias = Number(arrProfesores.asistencias)
            const calificacion = Number(arrProfesores.calificacion)

            rows.push(`(${arrProfesores.id_inscripcion},${arrProfesores.id_alumno},${arrProfesores.id_curso_armado},${isNaN(asistencias) ? null : asistencias},${isNaN(calificacion) ? null : calificacion}   )`)
        })

        console.log(rows.join(','))

        const resP = await DB.query(`INSERT INTO inscripciones (id_inscripcion,id_alumno,id_curso_armado,asistencias,calificacion) VALUES ${rows.join(',')}
                        ON CONFLICT (id_inscripcion) DO NOTHING`)

        res.status(200).json(`Se incribieron correctamente a los usuarios no inscritos.`)

    } catch (e) {
        console.log(e)
        res.status(400).json(`Algo salio mal a la hora de insertar a los usuarios no inscritos: ${e}.`)
    }
})


const mandarCertificadoPorGmail = async (token_alumno, nombre_alumno, nombre_curso, correo_alumno, rut_alumno, token_curso) => {
    const urlCertificado = `${FRONT}/Diplomas_OTEC_CP/certificados/${token_alumno}/${token_curso}`;

    const qr = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`${FRONT}/Diplomas_OTEC_CP/certificados/${token_alumno}/${token_curso}`)}`

    // const pdfPath = await generarCertificadoPDF(urlCertificado);

    await SendGmail(`
                    <p>Buen dia ${nombre_alumno} ha acreditado el curso ${nombre_curso}</p

                    <p>Este es el pdf de su certificado: </p>

                    <archivo pdf con nombre del rut alumno>

                    <p>Puede escanear este código QR para poder ver su certificado en la web oficial:</p>

                    <img src=${qr}" width="200" height="200" alt="QR" style="display:block; margin-top:10px;"/>

                    <p>También puede verlo accediendo a este <a href="${urlCertificado}">link</a></p>
                    `, correo_alumno, `Acreditacion del curso ${nombre_curso}`
    )

    console.log("Certificado editado correctamente:");
}

app.post('/armarCurso', async (req, res) => {
    console.log(req.body)

    try {
        const usuarios = req.body;

        const toFinalize = [];
        const toProgram = [];

        for (const u of usuarios) {
            if (u.finalizado) {
                toFinalize.push(u);
            } else if (u.programado) {
                toProgram.push(u);
            }
        }


        let finalizados = { rows: [] };

        if (toFinalize.length > 0) {
            const rows = toFinalize
                .map(u => `(${u.id_curso_armado},${u.id_curso},${u.id_profesor},TRUE)`)
                .join(',');

            finalizados = await DB.query(`
            INSERT INTO cursos_armados (id_curso_armado, id_curso, id_profesor, finalizado)
            VALUES ${rows}
            ON CONFLICT (id_curso_armado)
            DO UPDATE SET
                finalizado = EXCLUDED.finalizado
            WHERE cursos_armados.finalizado = FALSE 
            RETURNING id_curso_armado
        `);
        }

        if (finalizados.rows.length > 0) {
            const alumnosFinalizados = await DB.query(`
            SELECT i.id_inscripcion, a.nombre_alumno, a.correo_alumno, a.token_alumno,
                   a.rut_alumno, c.nombre_curso, x.token_curso
            FROM inscripciones i
            JOIN alumnos a ON a.id_alumno = i.id_alumno
            JOIN cursos_armados x ON x.id_curso_armado = i.id_curso_armado
            JOIN cursos c ON c.id_curso = x.id_curso
            WHERE i.id_curso_armado = ANY($1)
              AND x.finalizado = TRUE
        `, [finalizados.rows.map(r => r.id_curso_armado)]);

            for (const al of alumnosFinalizados.rows) {
                await mandarCertificadoPorGmail(
                    al.token_alumno,
                    al.nombre_alumno,
                    al.nombre_curso,
                    al.correo_alumno,
                    al.rut_alumno,
                    al.token_curso
                );
            }
        }


        const toProgramFiltered = toProgram.filter(u =>
            !toFinalize.some(f => f.id_curso_armado === u.id_curso_armado)
        );

        let programados = { rows: [] };

        if (toProgramFiltered.length > 0) {
            const rows = toProgramFiltered
                .map(u => `(${u.id_curso_armado},${u.id_curso},${u.id_profesor},TRUE)`)
                .join(',');

            programados = await DB.query(`
            INSERT INTO cursos_armados (id_curso_armado, id_curso, id_profesor, programado)
            VALUES ${rows}
            ON CONFLICT (id_curso_armado)
            DO UPDATE SET
                programado = EXCLUDED.programado
            WHERE cursos_armados.programado = FALSE
              AND cursos_armados.finalizado = FALSE  
            RETURNING id_curso_armado
        `);
        }

        if (programados.rows.length > 0) {
            const ids = programados.rows.map(r => r.id_curso_armado);

            const alumnos = await DB.query(`
            SELECT i.id_inscripcion, a.nombre_alumno, a.correo_alumno, a.token_alumno,
                   c.nombre_curso, c.duracion_curso, c.temario_curso
            FROM inscripciones i
            JOIN alumnos a ON a.id_alumno = i.id_alumno
            JOIN cursos_armados x ON x.id_curso_armado = i.id_curso_armado
            JOIN cursos c ON c.id_curso = x.id_curso
            WHERE i.id_curso_armado = ANY($1)
              AND x.programado = TRUE
        `, [ids]);

            const profesores = await DB.query(`
            SELECT DISTINCT ON (p.id_profesor)
                   i.id_inscripcion, p.relator_profesor, p.correo_profesor,
                   p.token_profesor, c.nombre_curso
            FROM inscripciones i
            JOIN cursos_armados x ON x.id_curso_armado = i.id_curso_armado
            JOIN profesores p ON p.id_profesor = x.id_profesor
            JOIN cursos c ON c.id_curso = x.id_curso
            WHERE i.id_curso_armado = ANY($1)
              AND x.programado = TRUE
        `, [ids]);

            for (const al of alumnos.rows) {
                const qr = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                    `${FRONT}/Diplomas_OTEC_CP/${al.token_alumno}`
                )}`;

                const mensaje = `
                <p>Buen día ${al.nombre_alumno}, ha sido inscrito al curso ${al.nombre_curso}.</p>
                <p>Duración: ${al.duracion_curso} horas.</p>

                <a href="${FRONT}/Diplomas_OTEC_CP/${al.token_alumno}"><p>Presione aquí para acceder a su panel</p></a>

                <p>QR para ingresar a su panel:</p>
                <img src="${qr}" width="200" height="200" />
            `;

                SendGmail(mensaje, al.correo_alumno, `Inscripción al curso ${al.nombre_curso}`);
            }

            for (const prof of profesores.rows) {
                const qr = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                    `${FRONT}/Diplomas_OTEC_CP/profesor/${prof.token_profesor}`
                )}`;

                const mensajeProfesor = `
                <p>Buen día ${prof.relator_profesor}, el curso ${prof.nombre_curso} ha sido programado.</p>

                <a href="${FRONT}/Diplomas_OTEC_CP/profesor/${prof.token_profesor}"><p>Presione aquí para acceder a su panel</p></a>

                <p>Código QR para acceder a su panel:</p>
                <img src="${qr}" width="200" height="200" />
            `;

                SendGmail(mensajeProfesor, prof.correo_profesor, `Nuevo curso programado: ${prof.nombre_curso}`);
            }
        }

        return res.status(200).json(`Se procesaron correctamente los cursos.`);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Error interno" });
    }

})

const obtenerUsuario = async (req: Request<{
    token: string,
    token_curso: string
}>, res) => {
    const { token, token_curso } = req.params

    try {

        const re = await DB.query(`SELECT 
                                        i.id_inscripcion,
                                        i.calificacion,
                                        a.nombre_alumno,
                                        a.token_alumno,
                                        a.rut_alumno,
                                        c.nombre_curso,
                                        c.duracion_curso,
                                        c.temario_curso,
                                        c.resumen_temario,
                                        x.token_curso,
                                        x.finalizado,
                                        p.relator_profesor
                                       FROM inscripciones i
                                        JOIN alumnos a ON a.id_alumno = i.id_alumno
                                        JOIN cursos_armados x ON x.id_curso_armado = i.id_curso_armado
                                        JOIN cursos c ON c.id_curso = x.id_curso
                                        JOIN profesores p ON p.id_profesor = x.id_profesor 
                                       WHERE a.token_alumno = $1 and (x.programado = TRUE OR (x.finalizado = TRUE AND i.calificacion >= 75)) AND ($2::uuid IS NULL OR x.token_curso = $2::uuid)`, [token, token_curso && token_curso.trim() !== "" ? token_curso : null])

        const alumno = re.rows

        res.status(200).json({
            alumno,
            msg: 'Alumno encontrado.'
        })
    } catch (e) {
        console.log(e)
        res.status(400).json({
            msg: 'Algo salió mal a la hora de buscar el alumno.'
        })

    }

}

app.get('/usuario/:token/:token_curso', obtenerUsuario)
app.get('/usuario/:token', obtenerUsuario)

app.get('/profesor/:token', async (req: Request<{
    token: string
}>, res) => {
    const { token } = req.params

    try {

        const re = await DB.query(`SELECT
                                    p.relator_profesor,
                                    p.token_profesor,

                                    json_agg(
                                        json_build_object(
                                            'id_curso', sub.id_curso,
                                            'nombre_curso', sub.nombre_curso,
                                            'duracion_curso', sub.duracion_curso,
                                            'temario_curso', sub.temario_curso,
                                            'token_curso',sub.token_curso,
                                            'clases',sub.clases,
                                            'programado', sub.programado,
                                            'finalizado',sub.finalizado,
                                            'alumnos', COALESCE(sub.alumnos, '[]')
                                        )
                                    ) AS cursos

                                FROM profesores p

                                JOIN (

                                    SELECT 
                                        ca.id_profesor,
                                        ca.id_curso_armado,
                                        ca.id_curso,
                                        ca.clases,
                                        ca.programado,
                                        ca.finalizado,
                                        ca.token_curso,

                                        c2.nombre_curso,
                                        c2.duracion_curso,
                                        c2.temario_curso,
                                        (
                                            SELECT json_agg(
                                                DISTINCT jsonb_build_object(
                                                    'id_alumno', a.id_alumno,
                                                    'nombre_alumno', a.nombre_alumno,
                                                    'correo_alumno', a.correo_alumno,
                                                    'token_alumno',a.token_alumno,
                                                    'asistencias', i.asistencias,
                                                    'calificacion', i.calificacion
                                                )
                                            )
                                            FROM inscripciones i
                                            JOIN alumnos a ON a.id_alumno = i.id_alumno
                                            WHERE i.id_curso_armado = ca.id_curso_armado
                                        ) AS alumnos

                                    FROM cursos_armados ca
                                    JOIN cursos c2 ON c2.id_curso = ca.id_curso
                                    WHERE ca.programado = TRUE OR ca.finalizado = TRUE

                                ) sub ON sub.id_profesor = p.id_profesor

                                WHERE p.token_profesor = $1
                                GROUP BY p.id_profesor, p.relator_profesor, p.token_profesor;

            `, [token])

        const profesor = re.rows

        res.status(200).json({
            profesor,
            msg: 'Profesor encontrado.'
        })
    } catch (e) {
        console.log(e)
        res.status(400).json({
            msg: 'Algo salió mal a la hora de buscar el profesor.'
        })

    }

})

app.get('/certificado/:alumno/:curso', async (req: Request<{
    alumno: string,
    curso: string
}>, res) => {
    try {
        const { alumno, curso } = req.params;

        const urlCertificado = `${FRONT}/Diplomas_OTEC_CP/certificados/${alumno}/${curso}`;

        const pdfBuffer = await generarCertificadoPDF(urlCertificado);

        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename=certificado_${alumno}.pdf`,
            "Content-Length": pdfBuffer.length,
        });

        res.send(pdfBuffer);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "No se pudo generar el PDF" });
    }
})

const io = new Server(app.listen(PORT, () => {
    console.log(`Servidor corriendo en PORT ${PORT}`);
}), {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
    },
});

const sockets_cursos = {}
const cursos: Record<string, {
    alumnos: Record<string, {
        asistenciaHabilitada: boolean
    }>
    listoParaFinalizar: boolean,
    asistenciasHabilitadas: boolean,
    finalizado: boolean
}> = {}

interface AuthSocket extends Socket {
    userId?: string;
}

io.use((socket: AuthSocket, next) => {
    socket.userId = socket.handshake.auth.token;
    next();
});

io.on('connection', (socket: AuthSocket) => {

    socket.on('unirse_curso', async (token, callback) => {
        socket.join(token);

        if (!cursos[token]) {

            let listoParaFinalizar = false

            try {
                const statusRes = await DB.query(`
                SELECT
                (COUNT(*) FILTER (WHERE calificacion IS NULL) = 0) AS todos_calificados
                FROM inscripciones
                WHERE id_curso_armado = (
                SELECT id_curso_armado FROM cursos_armados WHERE token_curso = $1
                );
             `, [token]);

                console.log(statusRes.rows)

                listoParaFinalizar = statusRes.rows[0].todos_calificados
            } catch (e) {
                console.log(e)
            }

            cursos[token] = {
                alumnos: {},
                listoParaFinalizar,
                finalizado: false,
                asistenciasHabilitadas: false,
            };
        }


        const curso = cursos[token];

        // Crear alumno si no existía
        if (!curso.alumnos[socket.userId]) {
            curso.alumnos[socket.userId] = {
                asistenciaHabilitada: false
            };
        }

        callback({
            token,
            asistenciasHabilitadas: curso.asistenciasHabilitadas,
            listoParaFinalizar: curso.listoParaFinalizar,
            finalizado: curso.finalizado,
            alumno: curso.alumnos[socket.userId]
        });
    });

    socket.on('habilitarAsistencias', async (data: {
        token: string,
        profesor: string,
        asistenciaHabilitada: boolean
    }, callback) => {
        const { profesor, token, asistenciaHabilitada } = data

        console.log('aaaaa')
        const curso = cursos[token]

        if (!curso) { callback(null); return }

        if (asistenciaHabilitada) {
            curso.asistenciasHabilitadas = true

            try {

                const clases = await DB.query(`
                UPDATE cursos_armados ca
                SET clases = clases + 1
                FROM profesores p
                WHERE p.id_profesor = ca.id_profesor AND p.token_profesor = $1 AND ca.token_curso = $2
                RETURNING ca.clases
            `, [profesor, token])

                if (clases.rows[0]) {
                    io.to(token).emit('asistenciasHabilitadas', {
                        token,
                        asistenciasHabilitadas: curso.asistenciasHabilitadas,
                        listoParaFinalizar: curso.listoParaFinalizar,
                        finalizado: cursos[token].finalizado
                    })

                    callback(clases.rows[0].clases)

                }

            } catch (e) {
                callback(null)
                console.log(e)
            }
        } else {
            curso.asistenciasHabilitadas = false


            Object.keys(curso.alumnos).map((token_al) => {
                curso.alumnos[token_al].asistenciaHabilitada = false
            })

            io.to(token).emit('asistenciasHabilitadas', {
                token,
                finalizado: cursos[token].finalizado,
                listoParaFinalizar: curso.listoParaFinalizar,
                asistenciasHabilitadas: curso.asistenciasHabilitadas,
            })


            // Object.values(asistencias).forEach(as => {
            //     Object.keys(as.cursos).forEach(token => {
            //         as.cursos[token].asistenciasHabilitadas = false
            //     })
            // })

            callback(null)
        }

        io.to(token).emit('asistenciasActualizadas', token)
    })

    socket.on('obtenerUsuario', (data: {
        token_alumno: string,
        token_curso: string
    }) => {
        const { token_alumno, token_curso } = data
        console.log(cursos, token_alumno, token_curso, cursos[token_curso])
        if (data && data && cursos?.[token_curso]?.alumnos?.[token_alumno]) {

            socket.emit('asistenciasHabilitadas', {
                token: token_curso,
                finalizado: cursos?.[token_curso]?.finalizado,
                asistenciasHabilitadas: cursos?.[token_curso]?.asistenciasHabilitadas,
                listoParaFinalizar: cursos?.[token_curso]?.listoParaFinalizar,
                alumno: cursos?.[token_curso]?.alumnos?.[token_alumno]
            })
        }
    })

    socket.on('marcarAsistencia', async (data: {
        alumno: string,
        token: string
    }) => {
        const { alumno, token } = data
        const curso = cursos[token]

        if (!curso) { return }
        if (curso.finalizado) { return }

        if (!curso.alumnos[alumno].asistenciaHabilitada) {
            curso.alumnos[alumno].asistenciaHabilitada = true

            console.log(alumno, token)
            await DB.query(`
                    UPDATE inscripciones i
                    SET asistencias = asistencias + 1
                    FROM alumnos a,cursos_armados ca
                    WHERE a.token_alumno = $1 
                        AND a.id_alumno = i.id_alumno
                        AND ca.token_curso = $2
                        AND ca.id_curso_armado = i.id_curso_armado
                    
                `, [alumno, token])

            socket.emit('asistenciasHabilitadas', {
                token,
                asistenciasHabilitadas: curso.asistenciasHabilitadas,
                finalizado: cursos[token].finalizado,
                listoParaFinalizar: curso.listoParaFinalizar,
                alumno: curso.alumnos[socket.userId]
            })

            console.log('marcando asistencia')
        }
    })

    socket.on('actualizarCalificacion', async (data: {
        token: string,
        alumno: string,
        calificacion: number
    }, callback) => {
        console.log(data)
        if (!data || isNaN(data.calificacion)) { callback(null); return }

        const { token } = data
        if (!cursos.hasOwnProperty(token)) { callback(null); console.log('bruh', token, cursos); return }

        const curso = cursos[token]

        try {
            await DB.query(`
                WITH updated AS (
                    UPDATE inscripciones
                    SET calificacion = $1
                    WHERE id_alumno = (
                        SELECT id_alumno
                        FROM alumnos
                        WHERE token_alumno = $2
                    )
                    AND id_curso_armado = (
                        SELECT id_curso_armado
                        FROM cursos_armados
                        WHERE token_curso = $3
                    )
                    RETURNING id_curso_armado
                )
                SELECT NOT EXISTS (
                    SELECT 1 
                    FROM inscripciones
                    WHERE id_curso_armado = (SELECT id_curso_armado FROM updated)
                    AND calificacion IS NULL
                ) AS todos_calificados;
                           `, [data.calificacion, data.alumno, data.token]);

            const statusRes = await DB.query(`
                SELECT
                (COUNT(*) FILTER (WHERE calificacion IS NULL) = 0) AS todos_calificados
                FROM inscripciones
                WHERE id_curso_armado = (
                SELECT id_curso_armado FROM cursos_armados WHERE token_curso = $1
                );
             `, [data.token]);

            curso.listoParaFinalizar = statusRes.rows[0].todos_calificados

            console.log(curso, 'CURSOOOOOOOOOOOOOOOOOOOOOOOOOOO')

            io.to(token).emit('asistenciasHabilitadas', {
                token,
                asistenciasHabilitadas: curso.asistenciasHabilitadas,
                listoParaFinalizar: curso.listoParaFinalizar,
                alumno: curso.alumnos[socket.userId]
            })

            callback(true)

        } catch (e) {
            callback(null)
        }
    })

    socket.on('finalizarCurso', async (data: {
        profesor: string,
        token: string
    }, callback) => {
        const { profesor, token } = data;
        try {
            if (cursos.hasOwnProperty(token) && !cursos[token].finalizado) {
                cursos[token].finalizado = true
                io.to(token).emit('asistenciasHabilitadas', {
                    token,
                    asistenciasHabilitadas: cursos[token].asistenciasHabilitadas,
                    listoParaFinalizar: cursos[token].listoParaFinalizar,
                    alumno: cursos[token].alumnos[socket.userId],
                    finalizado: cursos[token].finalizado
                })

                const exist = await DB.query(`
                                        SELECT
                                        p.relator_profesor,
                                        p.token_profesor,
                                        json_build_object(
                                            'id_curso', sub.id_curso,
                                            'nombre_curso', sub.nombre_curso,
                                            'duracion_curso', sub.duracion_curso,
                                            'temario_curso', sub.temario_curso,
                                            'token_curso', sub.token_curso,
                                            'finalizado',sub.finalizado,
                                            'clases', sub.clases,
                                            'programado', sub.programado,
                                            'alumnos', COALESCE(sub.alumnos, '[]')
                                        ) AS curso
                                    FROM profesores p
                                    JOIN (
                                        SELECT 
                                            ca.id_profesor,
                                            ca.id_curso_armado,
                                            ca.id_curso,
                                            ca.clases,
                                            ca.programado,
                                            ca.finalizado,
                                            ca.token_curso,

                                            c2.nombre_curso,
                                            c2.duracion_curso,
                                            c2.temario_curso,

                                            (
                                                SELECT json_agg(
                                                    DISTINCT jsonb_build_object(
                                                        'id_alumno', a.id_alumno,
                                                        'rut_alumno',a.rut_alumno,
                                                        'nombre_alumno', a.nombre_alumno,
                                                        'correo_alumno', a.correo_alumno,
                                                        'token_alumno', a.token_alumno,
                                                        'asistencias', i.asistencias,
                                                        'calificacion', i.calificacion
                                                    )
                                                )
                                                FROM inscripciones i
                                                JOIN alumnos a ON a.id_alumno = i.id_alumno
                                                WHERE i.id_curso_armado = ca.id_curso_armado
                                            ) AS alumnos

                                        FROM cursos_armados ca
                                        JOIN cursos c2 ON c2.id_curso = ca.id_curso
                                        WHERE ca.token_curso = $1               
                                    ) sub ON sub.id_profesor = p.id_profesor
                                    WHERE p.token_profesor = $2;  
                `, [token, profesor]);

                if (!exist.rows[0]) { callback(null); return }

                if (exist.rows[0].curso.finalizado) { callback(null); return }

                for (const { nombre_alumno, rut_alumno, correo_alumno, token_alumno } of exist.rows[0].curso.alumnos) {
                    mandarCertificadoPorGmail(token_alumno, nombre_alumno, exist.rows[0].curso.nombre_curso, correo_alumno, rut_alumno, exist.rows[0].curso.token_curso)
                }

                await DB.query(`
                    UPDATE cursos_armados 
                    SET finalizado = true
                    WHERE token_curso = $1
                    `, [token])

                callback(true)

                cursos[token].finalizado = false
            } else {
                console.log('IMPOSIBLE', cursos?.token, cursos, token)
            }
        } catch (e) {
            callback(null)
            console.log("Error generando certificado:", e);
        }
    })
})

app.listen(PORT, async () => {
    console.log('escuchadno')
})