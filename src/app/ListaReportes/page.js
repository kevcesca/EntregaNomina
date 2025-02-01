'use client';

import React, { useState } from 'react';
import { Alert } from '@mui/material'; // Importar Alert de Material-UI
import HeaderSeccion from "../%Components/HeaderSeccion/HeaderSeccion";
import ReporteNominaHistoricoPorMontoTipoDeNominaYEjercido from "../%Components/ReporteNominaHistoricoPorMontoTipoDeNominaYEjercido/ReporteNominaHistoricoPorMontoTipoDeNominaYEjercido";
import ReporteDeNominaCuentaPorLiquidarPagoPorCheque from "../%Components/ReporteDeNominaCuentaPorLiquidarPagoPorCheque/ReporteDeNominaCuentaPorLiquidarPagoPorCheque";
import ReporteDeNominasExtraordinarias from "../%Components/ReporteDeNominasExtraordinarias/ReporteDeNominasExtraordinarias";
import ReporteEmisionDeCheques from "../%Components/ReporteEmisionDeCheques/ReporteEmisionDeCheques";
import ReporteDeAltas from "../%Components/ReporteDeAltas/ReporteDeAltas";
import ReporteSaldoDiarioEnBanco from "../%Components/ReporteSaldoDiarioEnBanco/ReporteSaldoDiarioEnBanco";

export default function Page() {
    const [showTipoPago, setShowTipoPago] = useState(false);
    const [showAltaBajas, setShowAltaBajas] = useState(false);
    const [showNominaNumCuenta, setShowNominaNumCuenta] = useState(false);
    const [showDiferenciasLiquido, setShowDiferenciasLiquido] = useState(false);
    const [showAbonoConcepto, setShowAbonoConcepto] = useState(false);
    const [showReporte04, setShowReporte04] = useState(false);
    const [showHistorico, setShowHistorico] = useState(false);
    const [showCuentaCheque, setShowCuentaCheque] = useState(false);
    const [showNominasExtraordinarias, setShowNominasExtraordinarias] = useState(false);
    const [showEmisionCheques, setShowEmisionCheques] = useState(false);
    const [showAltas, setShowAltas] = useState(false);
    const [showSaldoDiario, setShowSaldoDiario] = useState(false);
    const [showHonorarios, setShowHonorarios] = useState(false);
    const [showMovimientoQuincena, setShowMovimientoQuincena] = useState(false);

    return (
        <div>
            {/* Mensaje de advertencia */}
            <Alert severity="info" sx={{ margin: '1rem' }}>
                Presiona un click encima de la sección que deseas verificar .
            </Alert>

            {/* Se queda el reporte de historico de nómina */}
            <HeaderSeccion
                titulo="Reporte: Nómina Histórico por Monto, Tipo de Nómina y Ejercido"
                isOpen={showHistorico}
                onToggle={() => setShowHistorico(!showHistorico)}
            />
            {showHistorico && <ReporteNominaHistoricoPorMontoTipoDeNominaYEjercido />}

            {/* Se queda el reporte de cuenta de nómina por liquidar pago por cheque */}
            <HeaderSeccion
                titulo="Reporte: Nómina Cuenta por Liquidar Pago por Cheque"
                isOpen={showCuentaCheque}
                onToggle={() => setShowCuentaCheque(!showCuentaCheque)}
            />
            {showCuentaCheque && <ReporteDeNominaCuentaPorLiquidarPagoPorCheque />}

            {/* Se queda el reporte de nóminas extraordinarias */}
            <HeaderSeccion
                titulo="Reporte: Nóminas Extraordinarias"
                isOpen={showNominasExtraordinarias}
                onToggle={() => setShowNominasExtraordinarias(!showNominasExtraordinarias)}
            />
            {showNominasExtraordinarias && <ReporteDeNominasExtraordinarias />}

            {/* Se queda el reporte de emisión de cheques */}
            <HeaderSeccion
                titulo="Reporte: Emisión de Cheques"
                isOpen={showEmisionCheques}
                onToggle={() => setShowEmisionCheques(!showEmisionCheques)}
            />
            {showEmisionCheques && <ReporteEmisionDeCheques />}

            {/* Se queda el reporte de altas de empleados */}
            <HeaderSeccion
                titulo="Reporte: Altas de Empleados"
                isOpen={showAltas}
                onToggle={() => setShowAltas(!showAltas)}
            />
            {showAltas && <ReporteDeAltas />}

            {/* Se queda el reporte de saldos diarios en banco */}
            <HeaderSeccion
                titulo="Reporte: Saldos Diarios en Banco"
                isOpen={showSaldoDiario}
                onToggle={() => setShowSaldoDiario(!showSaldoDiario)}
            />
            {showSaldoDiario && <ReporteSaldoDiarioEnBanco />}
        </div>
    );
}
