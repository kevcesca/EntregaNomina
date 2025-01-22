// src/utils/auth.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";

// Función existente
export async function requireAuth(ctx) {
    const session = await getServerSession(ctx.req, ctx.res, authOptions);
    if (!session) {
        ctx.res.writeHead(302, { Location: "/login" });
        ctx.res.end();
        return { props: {} };
    }
    return { props: { session } };
}

// Nueva función para obtener la sesión sin redirigir
export async function getSession(ctx) {
    return await getServerSession(ctx.req, ctx.res, authOptions);
}
