import { state } from './state.js';
import { formatarNumeroMilhares } from './utils.js';

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
        pas += dados.passivos || 0;
        det += dados.detratores || 0;
        total += (dados.promotores + dados.passivos + dados.detratores) || 0;
    });

    if (total === 0) return { nps: 0, pro: 0, pas: 0, det: 0, total: 0 };
    const nps = Math.round(((pro / total) * 100) - ((det / total) * 100));
    
    return { nps, pro, pas, det, total };
}

export function atualizarSlideExportacao(metricas, dados3M, dados12M) {
    // Auto-cura do histórico caso alguém chame a função direto
    if (!dados3M) dados3M = calcularNPSRetroativo(null, 3);
    if (!dados12M) dados12M = calcularNPSRetroativo(null, 12);

    // 🎯 1. REGRA DE MERCADO (Para o Card Principal de KPI)
    function obterCoresEZona(score) {
        if (score >= 76) return { cor: '#10b981', zona: 'Zona de Excelência' }; // Verde
        if (score >= 51) return { cor: '#3b82f6', zona: 'Zona de Qualidade' };  // Azul
        if (score >= 1)  return { cor: '#f59e0b', zona: 'Zona de Aperfeiçoamento' }; // Amarelo
        return { cor: '#ef4444', zona: 'Zona Crítica' }; // Vermelho
    }

    // 🍕 2. REGRA DAS PIZZAS IMPLACÁVEIS (Meta Interna: 84)
    function obterCorDaPizza(score) {
        return score >= 84 ? '#10b981' : '#ef4444'; // Bateu 84 = Verde. Não bateu = Vermelho sangue.
    }

    const npsAtual = obterCoresEZona(metricas.npsGeral);
    
    // Cores exclusivas para as pizzas e seus números centrais
    const corPizzaAtual = obterCorDaPizza(metricas.npsGeral);
    const corPizza3M = obterCorDaPizza(dados3M.nps);
    const corPizza12M = obterCorDaPizza(dados12M.nps);

    // Atualizar IPs do Topo
    const slideTotal = document.getElementById('slideTotal');
    if(slideTotal) slideTotal.textContent = formatarNumeroMilhares(metricas.totalRespostas);
    
    const slideProm = document.getElementById('slidePromotores');
    if(slideProm) slideProm.textContent = metricas.percentualPromotores.toFixed(1) + '%';
    
    const slideNpsTot = document.getElementById('slideNPSTotal');
    if(slideNpsTot) slideNpsTot.textContent = formatarNumeroMilhares(metricas.totalRespostas);
    
    // 🔥 INJETANDO COR DE MERCADO NO CONTAINER DO NPS 🔥
    const containerNPS = document.getElementById('kpiNpsContainer');
    if (containerNPS) {
        containerNPS.style.background = npsAtual.cor;
        containerNPS.style.borderColor = npsAtual.cor;
        
        document.getElementById('labelNPS').style.color = 'rgba(255, 255, 255, 0.9)';
        
        const slideNPS = document.getElementById('slideNPS');
        slideNPS.textContent = metricas.npsGeral;
        slideNPS.style.color = '#ffffff';
        
        const slideNPSZona = document.getElementById('slideNPSZona');
        slideNPSZona.textContent = npsAtual.zona;

        // O TERMÔMETRO DA META INTERNA (84+)
        const iconeMeta = document.getElementById('iconeMeta');
        const textoMeta = document.getElementById('textoMeta');
        const statusMeta = document.getElementById('statusMetaInterna');
        
        statusMeta.style.color = 'rgba(255, 255, 255, 0.9)';
        
        if (metricas.npsGeral >= 84) {
            iconeMeta.textContent = '🏆';
            textoMeta.textContent = 'Meta Atingida (84+)';
            statusMeta.style.background = 'rgba(255, 255, 255, 0.2)';
            statusMeta.style.padding = '3px 8px';
            statusMeta.style.borderRadius = '4px';
        } else {
            iconeMeta.textContent = '🎯';
            const pontosFaltando = 84 - metricas.npsGeral;
            textoMeta.textContent = `Meta: 84 (Faltam ${pontosFaltando} pts)`;
            statusMeta.style.background = 'transparent';
            statusMeta.style.padding = '0';
        }
    }

    // 🔥 TEXTOS CENTRAIS DAS PIZZAS (Usando a regra implacável)
    const elementoNPSValue = document.getElementById('slideNPSValue');
    if(elementoNPSValue) { elementoNPSValue.textContent = metricas.npsGeral; elementoNPSValue.style.color = corPizzaAtual; }

    const elementoNPSValue3M = document.getElementById('slideNPSValue3M');
    if(elementoNPSValue3M) { elementoNPSValue3M.textContent = dados3M.nps; elementoNPSValue3M.style.color = corPizza3M; }

    const elementoNPSValue12M = document.getElementById('slideNPSValue12M');
    if(elementoNPSValue12M) { elementoNPSValue12M.textContent = dados12M.nps; elementoNPSValue12M.style.color = corPizza12M; }

    // 🔥 DESENHO DAS BORDAS DAS PIZZAS (Usando a regra implacável)
    gerarDoughnutNPS('slideChartNPS', 'exportNpsAtual', metricas.npsGeral, corPizzaAtual); 
    gerarDoughnutNPS('slideChartNPS3M', 'exportNps3M', dados3M.nps, corPizza3M);              
    gerarDoughnutNPS('slideChartNPS12M', 'exportNps12M', dados12M.nps, corPizza12M);           

    // Mini Legendas (3 Meses e 12 Meses)
    const pctPro3M = dados3M.total > 0 ? (dados3M.pro / dados3M.total) * 100 : 0;
    const pctPas3M = dados3M.total > 0 ? (dados3M.pas / dados3M.total) * 100 : 0;
    const pctDet3M = dados3M.total > 0 ? (dados3M.det / dados3M.total) * 100 : 0;
    
    const leg3MPro = document.getElementById('legenda3MPro');
    if(leg3MPro) leg3MPro.textContent = `${formatarNumeroMilhares(dados3M.pro)} (${pctPro3M.toFixed(1)}%)`;
    
    const leg3MPas = document.getElementById('legenda3MPas');
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
    
    const leg12MPas = document.getElementById('legenda12MPas');
    if(leg12MPas) leg12MPas.textContent = `${formatarNumeroMilhares(dados12M.pas)} (${pctPas12M.toFixed(1)}%)`;
    
    const leg12MDet = document.getElementById('legenda12MDet');
    if(leg12MDet) leg12MDet.textContent = `${formatarNumeroMilhares(dados12M.det)} (${pctDet12M.toFixed(1)}%)`;
    
    const leg12MTot = document.getElementById('legenda12MTotal');
    if(leg12MTot) leg12MTot.textContent = formatarNumeroMilhares(dados12M.total);

    // Barra Horizontal do Mês Atual (CSS)
    const totalRec = metricas.totalRespostas;
    const pctPro = totalRec > 0 ? (metricas.totalPromotores / totalRec) * 100 : 0;
    const pctPas = totalRec > 0 ? (metricas.totalPassivos / totalRec) * 100 : 0;
    const pctDet = totalRec > 0 ? (metricas.totalDetratores / totalRec) * 100 : 0;

    const barraPro = document.getElementById('barraRecPromotores');
    if(barraPro) barraPro.style.width = `${pctPro}%`;
    
    const barraPas = document.getElementById('barraRecPassivos');
    if(barraPas) barraPas.style.width = `${pctPas}%`;
    
    const barraDet = document.getElementById('barraRecDetratores');
    if(barraDet) barraDet.style.width = `${pctDet}%`;

    const slideRecPro = document.getElementById('slideRecPromotores');
    if(slideRecPro) slideRecPro.textContent = `${formatarNumeroMilhares(metricas.totalPromotores)} (${pctPro.toFixed(1)}%)`;
    
    const slideRecPas = document.getElementById('slideRecPassivos');
    if(slideRecPas) slideRecPas.textContent = `${formatarNumeroMilhares(metricas.totalPassivos)} (${pctPas.toFixed(1)}%)`;
    
    const slideRecDet = document.getElementById('slideRecDetratores');
    if(slideRecDet) slideRecDet.textContent = `${formatarNumeroMilhares(metricas.totalDetratores)} (${pctDet.toFixed(1)}%)`;
}
// 
// 🍕 FÁBRICA DE PIZZAS (Cria os 3 gráficos redondos do Slide)
// 
function gerarDoughnutNPS(canvasId, instanceKey, npsScore, corPrincipal) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    
    if (state.chartsInstances && state.chartsInstances[instanceKey]) {
        state.chartsInstances[instanceKey].destroy(); // Mata o gráfico velho pra não encavalar
    }
    if (!state.chartsInstances) state.chartsInstances = {};

    const validNps = isNaN(npsScore) ? 0 : npsScore;
    const npsNormalizado = (validNps + 100) / 2; // Converte a escala -100/100 para 0-100% (Mágica do Chart.js)

    state.chartsInstances[instanceKey] = new Chart(ctx, {
        type: 'doughnut',
        data: { 
            labels: ['NPS', 'Restante'], 
            datasets: [{ 
                data: [npsNormalizado, 100 - npsNormalizado], 
                backgroundColor: [corPrincipal, '#e2e8f0'], 
                borderWidth: 0,
                cutout: '82%' // Furo no meio gigante (deixa a borda fininha e super elegante)
            }] 
        },
        options: { 
            responsive: true, 
            maintainAspectRatio: false, 
            plugins: { 
                legend: { display: false },
                tooltip: { enabled: false } // Desliga pra não sair quadrado preto no PNG
            },
            animation: { duration: 0 } // Desativa animação pro html2canvas tirar o print instantâneo
        }
    });
}

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


















