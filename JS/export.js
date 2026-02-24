import { state } from './state.js';
import { formatarNumeroMilhares } from './utils.js';

// 1. 🧠 MÁQUINA DO TEMPO
export function calcularNPSRetroativo(mesBase, qtdMeses) {
    if (!state.resumoPorMes) return { nps: 0, pro: 0, pas: 0, det: 0, total: 0 };
    
    const mesesDisponiveis = Object.keys(state.resumoPorMes).sort().reverse();
    if (mesesDisponiveis.length === 0) return { nps: 0, pro: 0, pas: 0, det: 0, total: 0 };

    let startIndex = 0;
    if (mesBase) {
        startIndex = mesesDisponiveis.indexOf(mesBase);
        if (startIndex === -1) startIndex = 0;
    }

    const mesesFatia = mesesDisponiveis.slice(startIndex, startIndex + qtdMeses);

    let pro = 0, pas = 0, det = 0, total = 0;
    mesesFatia.forEach(m => {
        const dados = state.resumoPorMes[m];
        pro += dados.promotores || 0;
        // Pega passivos ou neutros para não quebrar
        pas += (dados.passivos !== undefined ? dados.passivos : (dados.neutros || 0));
        det += dados.detratores || 0;
        total += (dados.promotores + (dados.passivos || dados.neutros || 0) + dados.detratores) || 0;
    });

    if (total === 0) return { nps: 0, pro: 0, pas: 0, det: 0, total: 0 };
    const nps = Math.round(((pro / total) * 100) - ((det / total) * 100));
    
    return { nps, pro, pas, det, total };
}

// 2. 🎛️ ATUALIZA COM FILTRO 
export function atualizarSlideComFiltro() {
    const seletorMes = document.getElementById('monthFilter') || document.getElementById('filtroMes');
    const mesSelecionado = seletorMes ? seletorMes.value : '';
    
    let metricasPeriodo = state.totaisGlobais; 
    
    if (mesSelecionado && state.resumoPorMes && state.resumoPorMes[mesSelecionado]) {
        metricasPeriodo = state.resumoPorMes[mesSelecionado];
    }

    const dados3M = calcularNPSRetroativo(mesSelecionado, 3);
    const dados12M = calcularNPSRetroativo(mesSelecionado, 12);

    const pro = metricasPeriodo.totalPromotores !== undefined ? metricasPeriodo.totalPromotores : (metricasPeriodo.promotores || 0);
    // Tenta ler passivo, se não achar, tenta neutro, se não achar, é 0. BLINDADO.
    const pas = metricasPeriodo.totalPassivos !== undefined ? metricasPeriodo.totalPassivos : 
               (metricasPeriodo.totalNeutros !== undefined ? metricasPeriodo.totalNeutros : 
               (metricasPeriodo.passivos !== undefined ? metricasPeriodo.passivos : 
               (metricasPeriodo.neutros || 0)));
    const det = metricasPeriodo.totalDetratores !== undefined ? metricasPeriodo.totalDetratores : (metricasPeriodo.detratores || 0);
    
    const totalResp = metricasPeriodo.totalRespostas !== undefined ? metricasPeriodo.totalRespostas : (pro + pas + det);
    const npsG = metricasPeriodo.npsGeral !== undefined ? metricasPeriodo.npsGeral : (metricasPeriodo.nps || 0);

    const pctPro = totalResp > 0 ? (pro / totalResp) * 100 : 0;
    const pctPas = totalResp > 0 ? (pas / totalResp) * 100 : 0;
    const pctDet = totalResp > 0 ? (det / totalResp) * 100 : 0;

    const pctPasBackend = metricasPeriodo.percentualPassivos !== undefined ? metricasPeriodo.percentualPassivos : metricasPeriodo.percentualNeutros;

    const metr = {
        totalRespostas: totalResp,
        npsGeral: npsG,
        percentualPromotores: metricasPeriodo.percentualPromotores !== undefined ? metricasPeriodo.percentualPromotores : pctPro,
        percentualPassivos: pctPasBackend !== undefined ? pctPasBackend : pctPas,
        percentualDetratores: metricasPeriodo.percentualDetratores !== undefined ? metricasPeriodo.percentualDetratores : pctDet,
        totalPromotores: pro,
        totalPassivos: pas,
        totalDetratores: det
    };

    atualizarSlideExportacao(metr, dados3M, dados12M);
}

// 3. 🎨 DESENHA O SLIDE 
export function atualizarSlideExportacao(metricas, dados3M, dados12M) {
    if (!dados3M) dados3M = calcularNPSRetroativo(null, 3);
    if (!dados12M) dados12M = calcularNPSRetroativo(null, 12);

    function obterCoresEZona(score) {
        if (score >= 76) return { cor: '#10b981', zona: 'Zona de Excelência' }; 
        if (score >= 51) return { cor: '#3b82f6', zona: 'Zona de Qualidade' };  
        if (score >= 1)  return { cor: '#f59e0b', zona: 'Zona de Aperfeiçoamento' }; 
        return { cor: '#ef4444', zona: 'Zona Crítica' }; 
    }

    function obterCorDaPizza(score) {
        return score >= 84 ? '#10b981' : '#ef4444'; 
    }

    const npsAtual = obterCoresEZona(metricas.npsGeral);
    const corPizzaAtual = obterCorDaPizza(metricas.npsGeral);
    const corPizza3M = obterCorDaPizza(dados3M.nps);
    const corPizza12M = obterCorDaPizza(dados12M.nps);

    const slideTotal = document.getElementById('slideTotal');
    if(slideTotal) slideTotal.textContent = formatarNumeroMilhares(metricas.totalRespostas);
    
    const slideProm = document.getElementById('slidePromotores');
    if(slideProm) slideProm.textContent = metricas.percentualPromotores.toFixed(1) + '%';
    
    const slideNpsTot = document.getElementById('slideNPSTotal');
    if(slideNpsTot) slideNpsTot.textContent = formatarNumeroMilhares(metricas.totalRespostas);
    
    const containerNPS = document.getElementById('kpiNpsContainer');
    if (containerNPS) {
        containerNPS.style.background = npsAtual.cor;
        containerNPS.style.borderColor = npsAtual.cor;
        
        const labelNps = document.getElementById('labelNPS');
        if(labelNps) labelNps.style.color = 'rgba(255, 255, 255, 0.9)';
        
        const slideNPS = document.getElementById('slideNPS');
        if(slideNPS) {
            slideNPS.textContent = metricas.npsGeral;
            slideNPS.style.color = '#ffffff';
        }
        
        const slideNPSZona = document.getElementById('slideNPSZona');
        if(slideNPSZona) slideNPSZona.textContent = npsAtual.zona;

        const iconeMeta = document.getElementById('iconeMeta');
        const textoMeta = document.getElementById('textoMeta');
        const statusMeta = document.getElementById('statusMetaInterna');
        
        if(statusMeta) statusMeta.style.color = 'rgba(255, 255, 255, 0.9)';
        
        if (metricas.npsGeral >= 84) {
            if(iconeMeta) iconeMeta.textContent = '🏆';
            if(textoMeta) textoMeta.textContent = 'Meta Atingida (84+)';
            if(statusMeta) {
                statusMeta.style.background = 'rgba(255, 255, 255, 0.2)';
                statusMeta.style.padding = '3px 8px';
                statusMeta.style.borderRadius = '4px';
            }
        } else {
            if(iconeMeta) iconeMeta.textContent = '🎯';
            const pontosFaltando = 84 - metricas.npsGeral;
            if(textoMeta) textoMeta.textContent = `Meta: 84 (Faltam ${pontosFaltando} pts)`;
            if(statusMeta) {
                statusMeta.style.background = 'transparent';
                statusMeta.style.padding = '0';
            }
        }
    }

    const elementoNPSValue = document.getElementById('slideNPSValue');
    if(elementoNPSValue) { elementoNPSValue.textContent = metricas.npsGeral; elementoNPSValue.style.color = corPizzaAtual; }

    const elementoNPSValue3M = document.getElementById('slideNPSValue3M');
    if(elementoNPSValue3M) { elementoNPSValue3M.textContent = dados3M.nps; elementoNPSValue3M.style.color = corPizza3M; }

    const elementoNPSValue12M = document.getElementById('slideNPSValue12M');
    if(elementoNPSValue12M) { elementoNPSValue12M.textContent = dados12M.nps; elementoNPSValue12M.style.color = corPizza12M; }

    gerarDoughnutNPS('slideChartNPS', 'exportNpsAtual', metricas.npsGeral, corPizzaAtual); 
    gerarDoughnutNPS('slideChartNPS3M', 'exportNps3M', dados3M.nps, corPizza3M);              
    gerarDoughnutNPS('slideChartNPS12M', 'exportNps12M', dados12M.nps, corPizza12M);           

    const pctPro3M = dados3M.total > 0 ? (dados3M.pro / dados3M.total) * 100 : 0;
    const pctPas3M = dados3M.total > 0 ? (dados3M.pas / dados3M.total) * 100 : 0;
    const pctDet3M = dados3M.total > 0 ? (dados3M.det / dados3M.total) * 100 : 0;
    
    const leg3MPro = document.getElementById('legenda3MPro');
    if(leg3MPro) leg3MPro.textContent = `${formatarNumeroMilhares(dados3M.pro)} (${pctPro3M.toFixed(1)}%)`;
    
    // Suporta ID legenda3MPas OU legenda3MNeu
    const leg3MPas = document.getElementById('legenda3MPas') || document.getElementById('legenda3MNeu');
    if(leg3MPas) leg3MPas.textContent = `${formatarNumeroMilhares(dados3M.pas)} (${pctPas3M.toFixed(1)}%)`;
    
    const leg3MDet = document.getElementById('legenda3MDet');
    if(leg3MDet) leg3MDet.textContent = `${formatarNumeroMilhares(dados3M.det)} (${pctDet3M.toFixed(1)}%)`;
    
    const leg3MTot = document.getElementById('legenda3MTotal');
    if(leg3MTot) leg3MTot.textContent = formatarNumeroMilhares(dados3M.total);

    const pctPro12M = dados12M.total > 0 ? (dados12M.pro / dados12M.total) * 100 : 0;
    const pctPas12M = dados12M.total > 0 ? (dados12M.pas / dados12M.total) * 100 : 0;
    const pctDet12M = dados12M.total > 0 ? (dados12M.det / dados12M.total) * 100 : 0;
    
    const leg12MPro = document.getElementById('legenda12MPro');
    if(leg12MPro) leg12MPro.textContent = `${formatarNumeroMilhares(dados12M.pro)} (${pctPro12M.toFixed(1)}%)`;
    
    // Suporta ID legenda12MPas OU legenda12MNeu
    const leg12MPas = document.getElementById('legenda12MPas') || document.getElementById('legenda12MNeu');
    if(leg12MPas) leg12MPas.textContent = `${formatarNumeroMilhares(dados12M.pas)} (${pctPas12M.toFixed(1)}%)`;
    
    const leg12MDet = document.getElementById('legenda12MDet');
    if(leg12MDet) leg12MDet.textContent = `${formatarNumeroMilhares(dados12M.det)} (${pctDet12M.toFixed(1)}%)`;
    
    const leg12MTot = document.getElementById('legenda12MTotal');
    if(leg12MTot) leg12MTot.textContent = formatarNumeroMilhares(dados12M.total);

    const totalRec = metricas.totalRespostas;
    const pctPro = totalRec > 0 ? (metricas.totalPromotores / totalRec) * 100 : 0;
    const pctPas = totalRec > 0 ? (metricas.totalPassivos / totalRec) * 100 : 0;
    const pctDet = totalRec > 0 ? (metricas.totalDetratores / totalRec) * 100 : 0;

    const barraPro = document.getElementById('barraRecPromotores');
    if(barraPro) barraPro.style.width = `${pctPro}%`;
    
    // Suporta ID barraRecPassivos OU barraRecNeutros
    const barraPas = document.getElementById('barraRecPassivos') || document.getElementById('barraRecNeutros');
    if(barraPas) barraPas.style.width = `${pctPas}%`;
    
    const barraDet = document.getElementById('barraRecDetratores');
    if(barraDet) barraDet.style.width = `${pctDet}%`;

    const slideRecPro = document.getElementById('slideRecPromotores');
    if(slideRecPro) slideRecPro.textContent = `${formatarNumeroMilhares(metricas.totalPromotores)} (${pctPro.toFixed(1)}%)`;
    
    // Suporta ID slideRecPassivos OU slideRecNeutros
    const slideRecPas = document.getElementById('slideRecPassivos') || document.getElementById('slideRecNeutros');
    if(slideRecPas) slideRecPas.textContent = `${formatarNumeroMilhares(metricas.totalPassivos)} (${pctPas.toFixed(1)}%)`;
    
    const slideRecDet = document.getElementById('slideRecDetratores');
    if(slideRecDet) slideRecDet.textContent = `${formatarNumeroMilhares(metricas.totalDetratores)} (${pctDet.toFixed(1)}%)`;
}

// 4. 🍕 FÁBRICA DE PIZZAS 
function gerarDoughnutNPS(canvasId, instanceKey, npsScore, corPrincipal) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    
    if (state.chartsInstances && state.chartsInstances[instanceKey]) {
        state.chartsInstances[instanceKey].destroy();
    }
    if (!state.chartsInstances) state.chartsInstances = {};

    const validNps = isNaN(npsScore) ? 0 : npsScore;
    const npsNormalizado = (validNps + 100) / 2;

    state.chartsInstances[instanceKey] = new window.Chart(ctx, {
        type: 'doughnut',
        data: { 
            labels: ['NPS', 'Restante'], 
            datasets: [{ 
                data: [npsNormalizado, 100 - npsNormalizado], 
                backgroundColor: [corPrincipal, '#e2e8f0'], 
                borderWidth: 0,
                cutout: '82%'
            }] 
        },
        options: { 
            responsive: true, 
            maintainAspectRatio: false, 
            plugins: { 
                legend: { display: false },
                tooltip: { enabled: false }
            },
            animation: { duration: 0 }
        }
    });
}

// 5. 📸 TIRA A FOTO DO SLIDE 
export async function exportarSlide(event) {
    const elemento = document.getElementById('slideExportacao');
    const botao = event.target.closest('.export-button');
    const textoOriginal = botao.innerHTML;

    botao.innerHTML = 'Gerando...';
    botao.disabled = true;

    try {
        const estiloOriginal = elemento.style.cssText;
        elemento.style.height = 'auto';
        elemento.style.minHeight = '720px';
        
        await new Promise(resolve => setTimeout(resolve, 500));
        const canvas = await html2canvas(elemento, { scale: 2, useCORS: true, backgroundColor: '#ffffff', allowTaint: true });
        elemento.style.cssText = estiloOriginal;

        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = `NPS-Diretoria-${new Date().toISOString().split('T')[0]}.png`;
        link.click();
    } catch (error) {
        console.error('Erro ao exportar:', error);
        alert('Erro ao gerar a imagem.');
    } finally {
        botao.innerHTML = textoOriginal;
        botao.disabled = false;
    }
}
