type ErrorPayload =
    | string
    | string[]
    | {
        message?: unknown;
        error?: unknown;
        statusCode?: number;
        details?: unknown;
    }
    | null
    | undefined;

const FIELD_LABELS: Record<string, string> = {
    activationToken: 'token de activacion',
    activo: 'estado activo',
    alumnosCotizados: 'alumnos cotizados',
    asistencias: 'asistencias',
    calificacion: 'calificacion',
    calificacion_aprobatoria: 'calificacion aprobatoria',
    certificador: 'certificador',
    contactoDeCotizacion: 'contacto de cotizacion',
    correo: 'correo',
    curso: 'curso',
    cursoArmado: 'curso armado',
    curso_id: 'curso',
    descripcion: 'descripcion',
    direccion: 'direccion',
    duracion: 'duracion',
    email_contacto: 'correo de contacto',
    empresa: 'empresa',
    empresa_id: 'empresa',
    en_clase: 'modalidad en clase',
    encuesta_id: 'encuesta',
    especialidad: 'especialidad',
    estado: 'estado',
    fecha_finalizacion: 'fecha de finalizacion',
    fecha_inicio: 'fecha de inicio',
    firma: 'firma',
    fono_fax: 'telefono',
    foto_perfil: 'foto de perfil',
    id: 'identificador',
    id_suscripcion: 'suscripcion',
    informacionAdicional: 'informacion adicional',
    inicio_contador_certificados: 'inicio del contador de certificados',
    limite_respuestas: 'limite de respuestas',
    lugar_de_realizacion: 'lugar de realizacion',
    nombre: 'nombre',
    nombre_contacto: 'nombre de contacto',
    notas_cotizacion: 'notas de cotizacion',
    opciones: 'opciones',
    password: 'contrasena',
    pregunta_id: 'pregunta',
    preguntas: 'preguntas',
    profesor: 'profesor',
    respondida_en: 'fecha de respuesta',
    requerida: 'campo requerido',
    respuestas: 'respuestas',
    respuesta_id: 'respuesta',
    rol: 'rol',
    rol_enum: 'rol',
    rut: 'RUT',
    suscriptor: 'suscriptor',
    telefono_contacto: 'telefono de contacto',
    temario: 'temario',
    teorica: 'evaluacion teorica',
    tipo: 'tipo',
    titulo: 'titulo',
    titulo_pregunta: 'titulo de la pregunta',
    usuario: 'usuario',
    usuario_id: 'usuario',
    valor: 'valor',
    valorUnitario: 'valor unitario',
};

const DIRECT_MESSAGE_MAP: Record<string, string> = {
    'bad request': 'La solicitud no es valida.',
    'forbidden': 'No tienes permisos para realizar esta accion.',
    'internal server error': 'Ocurrio un error interno del servidor. Intentalo nuevamente.',
    'not found': 'No se encontro el recurso solicitado.',
    'unauthorized': 'Tu sesion expiro o no tienes autorizacion.',
};

function prettifyFieldName(field: string) {
    if (FIELD_LABELS[field]) {
        return FIELD_LABELS[field];
    }

    return field
        .replace(/\.(\d+)\./g, ' ')
        .replace(/\.(\d+)$/g, ' ')
        .replace(/_/g, ' ')
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();
}

function uniqueMessages(messages: string[]) {
    return [...new Set(messages.map((message) => message.trim()).filter(Boolean))];
}

function cleanupMessage(message: string) {
    return message
        .replace(/\s+/g, ' ')
        .replace(/\s*[,;]\s*/g, ', ')
        .trim()
        .replace(/^[a-z]/, (char) => char.toUpperCase());
}

function translateTechnicalFragments(message: string) {
    let translated = message.trim();
    const lower = translated.toLowerCase();

    if (DIRECT_MESSAGE_MAP[lower]) {
        return DIRECT_MESSAGE_MAP[lower];
    }

    translated = translated
        .replace(/^Internal Server Error$/i, 'Ocurrio un error interno del servidor. Intentalo nuevamente.')
        .replace(/^Bad Request Exception$/i, 'La solicitud no es valida.')
        .replace(/^Bad Request$/i, 'La solicitud no es valida.')
        .replace(/^Validation failed\s*/i, 'La informacion enviada no es valida. ')
        .replace(/property\s+([A-Za-z0-9_.[\]]+)\s+should not exist/gi, (_, field: string) =>
            `El campo ${prettifyFieldName(field)} no esta permitido.`
        )
        .replace(/([A-Za-z0-9_.[\]]+)\s+must be an email/gi, (_, field: string) =>
            `El campo ${prettifyFieldName(field)} debe ser un correo valido.`
        )
        .replace(/([A-Za-z0-9_.[\]]+)\s+must be a string/gi, (_, field: string) =>
            `El campo ${prettifyFieldName(field)} debe ser un texto.`
        )
        .replace(/([A-Za-z0-9_.[\]]+)\s+must be a boolean value/gi, (_, field: string) =>
            `El campo ${prettifyFieldName(field)} debe ser verdadero o falso.`
        )
        .replace(/([A-Za-z0-9_.[\]]+)\s+must be a number conforming to the specified constraints/gi, (_, field: string) =>
            `El campo ${prettifyFieldName(field)} debe ser un numero valido.`
        )
        .replace(/([A-Za-z0-9_.[\]]+)\s+must be a number/gi, (_, field: string) =>
            `El campo ${prettifyFieldName(field)} debe ser un numero.`
        )
        .replace(/([A-Za-z0-9_.[\]]+)\s+must be an integer number/gi, (_, field: string) =>
            `El campo ${prettifyFieldName(field)} debe ser un numero entero.`
        )
        .replace(/([A-Za-z0-9_.[\]]+)\s+must be longer than or equal to (\d+) characters/gi, (_, field: string, value: string) =>
            `El campo ${prettifyFieldName(field)} debe tener al menos ${value} caracteres.`
        )
        .replace(/([A-Za-z0-9_.[\]]+)\s+must be shorter than or equal to (\d+) characters/gi, (_, field: string, value: string) =>
            `El campo ${prettifyFieldName(field)} debe tener como maximo ${value} caracteres.`
        )
        .replace(/([A-Za-z0-9_.[\]]+)\s+should not be empty/gi, (_, field: string) =>
            `El campo ${prettifyFieldName(field)} no puede estar vacio.`
        )
        .replace(/([A-Za-z0-9_.[\]]+)\s+must be one of the following values:\s*(.+)/gi, (_, field: string, values: string) =>
            `El campo ${prettifyFieldName(field)} debe ser uno de estos valores: ${values}.`
        )
        .replace(/Validation failed \(numeric string is expected\)/gi, 'El valor enviado debe ser numerico.')
        .replace(/dto/gi, 'datos')
        .replace(/entity/gi, 'registro');

    return cleanupMessage(translated);
}

function flattenMessages(payload: ErrorPayload): string[] {
    if (!payload) {
        return [];
    }

    if (typeof payload === 'string') {
        return [translateTechnicalFragments(payload)];
    }

    if (Array.isArray(payload)) {
        return payload.flatMap((item) => flattenMessages(item));
    }

    return [
        ...flattenMessages(payload.message as ErrorPayload),
        ...flattenMessages(payload.error as ErrorPayload),
        ...flattenMessages(payload.details as ErrorPayload),
    ];
}

export function normalizeErrorMessage(payload: ErrorPayload, fallback = 'Ocurrio un error inesperado. Intentalo nuevamente.') {
    const messages = uniqueMessages(flattenMessages(payload));

    if (messages.length === 0) {
        return fallback;
    }

    if (messages.length === 1) {
        return messages[0];
    }

    return messages.map((message) => `- ${message}`).join('\n');
}
