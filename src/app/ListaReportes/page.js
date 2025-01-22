'use client';

import React, { useState } from 'react';
import { Alert } from '@mui/material'; // Importar Alert de Material-UI
import ReporteTipoPago from "../%Components/ReporteTipoPago/ReporteTipoPago";
import ReporteAltaBajas from "../%Components/ReporteAltasBajas/ReporteAltasBajas";
import ReporteNominaNumCuenta from "../%Components/ReporteNominaNumCuenta/ReporteNominaNumCuenta";
import ReporteDiferenciasLiquidoConLpad from "../%Components/ReporteDiferenciasLiquidoConLpad/ReporteDiferenciasLiquidoConLpad";
import ReporteAbonoPorConceptoMovimientoQuincenas from "../%Components/ReporteAbonoPorConceptoMovimientoQuincenas/ReporteAbonoPorConceptoMovimientoQuincenas";
import Reporte04 from "../%Components/Reporte04/Reporte04";
import HeaderSeccion from "../%Components/HeaderSeccion/HeaderSeccion";
import ReporteNominaHistoricoPorMontoTipoDeNominaYEjercido from "../%Components/ReporteNominaHistoricoPorMontoTipoDeNominaYEjercido/ReporteNominaHistoricoPorMontoTipoDeNominaYEjercido";
import ReporteDeNominaCuentaPorLiquidarPagoPorCheque from "../%Components/ReporteDeNominaCuentaPorLiquidarPagoPorCheque/ReporteDeNominaCuentaPorLiquidarPagoPorCheque";
import ReporteDeNominasExtraordinarias from "../%Components/ReporteDeNominasExtraordinarias/ReporteDeNominasExtraordinarias";
import ReporteEmisionDeCheques from "../%Components/ReporteEmisionDeCheques/ReporteEmisionDeCheques";
import ReporteDeAltas from "../%Components/ReporteDeAltas/ReporteDeAltas";
import ReporteSaldoDiarioEnBanco from "../%Components/ReporteSaldoDiarioEnBanco/ReporteSaldoDiarioEnBanco";
import ReporteDeHonorariosPorFecha from "../%Components/ReporteDeHonorariosPorFecha/ReporteDeHonorariosPorFecha";
import ReporteDeMovimientoPorQuincena from "../%Components/ReporteDeMovimientoPorQuincena/ReporteDeMovimientoPorQuincena";

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

            {/* Encabezado y ReporteTipoPago */}
            <HeaderSeccion
                titulo="Reporte: Tipo de Pago"
                isOpen={showTipoPago}
                onToggle={() => setShowTipoPago(!showTipoPago)}
            />
            {showTipoPago && <ReporteTipoPago />}

            {/* Encabezado y ReporteAltaBajas */}
            <HeaderSeccion
                titulo="Reporte: Altas y Bajas"
                isOpen={showAltaBajas}
                onToggle={() => setShowAltaBajas(!showAltaBajas)}
            />
            {showAltaBajas && <ReporteAltaBajas />}

            {/* Encabezado y ReporteNominaNumCuenta */}
            <HeaderSeccion
                titulo="Reporte: Números de Cuenta en Nómina"
                isOpen={showNominaNumCuenta}
                onToggle={() => setShowNominaNumCuenta(!showNominaNumCuenta)}
            />
            {showNominaNumCuenta && <ReporteNominaNumCuenta />}

            {/* Encabezado y ReporteDiferenciasLiquidoConLpad */}
            <HeaderSeccion
                titulo="Reporte: Diferencias de Líquido con Lpad"
                isOpen={showDiferenciasLiquido}
                onToggle={() => setShowDiferenciasLiquido(!showDiferenciasLiquido)}
            />
            {showDiferenciasLiquido && <ReporteDiferenciasLiquidoConLpad />}

            {/* Encabezado y ReporteAbonoPorConceptoMovimientoQuincenas */}
            <HeaderSeccion
                titulo="Reporte: Abono por Concepto y Movimiento por Quincenas"
                isOpen={showAbonoConcepto}
                onToggle={() => setShowAbonoConcepto(!showAbonoConcepto)}
            />
            {showAbonoConcepto && <ReporteAbonoPorConceptoMovimientoQuincenas />}

            {/* Encabezado y Reporte04 */}
            <HeaderSeccion
                titulo="Reporte: 04"
                isOpen={showReporte04}
                onToggle={() => setShowReporte04(!showReporte04)}
            />
            {showReporte04 && <Reporte04 />}

            <HeaderSeccion
                titulo="Reporte: Nómina Histórico por Monto, Tipo de Nómina y Ejercido"
                isOpen={showHistorico}
                onToggle={() => setShowHistorico(!showHistorico)}
            />
            {showHistorico && <ReporteNominaHistoricoPorMontoTipoDeNominaYEjercido />}

            <HeaderSeccion
                titulo="Reporte: Nómina Cuenta por Liquidar Pago por Cheque"
                isOpen={showCuentaCheque}
                onToggle={() => setShowCuentaCheque(!showCuentaCheque)}
            />
            {showCuentaCheque && <ReporteDeNominaCuentaPorLiquidarPagoPorCheque />}

            <HeaderSeccion
                titulo="Reporte: Nóminas Extraordinarias"
                isOpen={showNominasExtraordinarias}
                onToggle={() => setShowNominasExtraordinarias(!showNominasExtraordinarias)}
            />
            {showNominasExtraordinarias && <ReporteDeNominasExtraordinarias />}

            <HeaderSeccion
                titulo="Reporte: Emisión de Cheques"
                isOpen={showEmisionCheques}
                onToggle={() => setShowEmisionCheques(!showEmisionCheques)}
            />
            {showEmisionCheques && <ReporteEmisionDeCheques />}

            <HeaderSeccion
                titulo="Reporte: Altas de Empleados"
                isOpen={showAltas}
                onToggle={() => setShowAltas(!showAltas)}
            />
            {showAltas && <ReporteDeAltas />}

            <HeaderSeccion
                titulo="Reporte: Saldos Diarios en Banco"
                isOpen={showSaldoDiario}
                onToggle={() => setShowSaldoDiario(!showSaldoDiario)}
            />
            {showSaldoDiario && <ReporteSaldoDiarioEnBanco />}

            <HeaderSeccion
                titulo="Reporte: Honorarios por Fecha"
                isOpen={showHonorarios}
                onToggle={() => setShowHonorarios(!showHonorarios)}
            />
            {showHonorarios && <ReporteDeHonorariosPorFecha />}

            <HeaderSeccion
                titulo="Reporte: Movimientos por Quincena"
                isOpen={showMovimientoQuincena}
                onToggle={() => setShowMovimientoQuincena(!showMovimientoQuincena)}
            />
            {showMovimientoQuincena && <ReporteDeMovimientoPorQuincena />}
        </div>
    );
}
