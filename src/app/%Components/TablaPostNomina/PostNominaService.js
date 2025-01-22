export const PostNominaService = {
    getArchivos() {
        return Promise.resolve([
            { nombreArchivo: '52.xlsx', fechaCarga: '12-04-2024', identificadorDatos: 'BASE - ESTRUCTURA, N8' },
            { nombreArchivo: '52-azcapotzalco.xlsx', fechaCarga: '12-04-2024', identificadorDatos: 'POST - NOMINA BASE, ESTRUCTURA, N8' }
        ]);
    }
};