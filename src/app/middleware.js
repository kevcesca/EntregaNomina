// middleware.js
import { NextResponse } from 'next/server';

export default function middleware(req) {
    const token = req.cookies.get('access_token');
    const url = req.nextUrl.clone();

    if (!token && url.pathname !== '/Login') {
        return NextResponse.redirect(new URL('/Login', req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/Calendario', '/CambioContra', '/CargarLogo', '/context', '/CrearNomina', '/GenerarCheque', '/Perfil', '/Reportes', '/SubirEvidencia', '/Usuarios', '/Validacion'],
};
