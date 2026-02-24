import { state } from './state.js';
import { formatarNumeroMilhares } from './utils.js';

export function atualizarSlideExportacao(metricas, dados3M, dados12M) {
    // Auto-cura do histórico
    if (!dados3M) dados3M = calcularNPSRetroativo(null, 3);
    if (!dados12M) dados12M = calcularNPSRetroativo(null, 12);

    // 🎯 INTELIGÊNCIA DE ZONAS DO NPS (Padrão de Mercado)
    function obterCoresEZona(score) {
        if (score >= 76) return { cor: '#10b981', zona: 'Zona de Excelência' }; // Verde (Emerald)
        if (score >= 51) return { cor: '#3b82f6', zona: 'Zona de Qualidade' };  // Azul (Blue)
        if (score >= 1)  return { cor: '#f59e0b', zona: 'Zona de Aperfeiçoamento' }; // Amarelo (Amber)
        return { cor: '#ef4444', zona: 'Zona Crítica' }; // Vermelho (Red)
    }

    const npsAtual = obterCoresEZona(metricas.npsGeral);
    const nps3M = obterCoresEZona(dados3M.nps);
    const nps12M = obterCoresEZona(dados12M.nps);

    // 1. Atualizar KPIs do Topo
    document.getElementById('slideTotal').textContent = formatarNumeroMilhares(metricas.totalRespostas);
    document.getElementById('slidePromotores').textContent = metricas.percentualPromotores.toFixed(1) + '%';
    document.getElementById('slideNPSTotal').textContent = formatarNumeroMilhares(metricas.totalRespostas);
    
    // 🔥 INJETANDO COR E ZONA NO CONTAINER DO NPS 🔥
    const containerNPS = document.getElementById('kpiNpsContainer');
    if (containerNPS) {
        // Pinta o background e tira a borda cinza
        containerNPS.style.background = npsAtual.cor;
        containerNPS.style.borderColor = npsAtual.cor;
        
        // Regra de Design: Se o fundo é forte (Verde, Azul, Vermelho), o texto TEM que ser branco para dar alto contraste
        document.getElementById('labelNPS').style.color = 'rgba(255, 255, 255, 0.9)';
        
        const slideNPS = document.getElementById('slideNPS');
        slideNPS.textContent = metricas.npsGeral;
        slideNPS.style.color = '#ffffff';
        
        const slideNPSZona = document.getElementById('slideNPSZona');
        slideNPSZona.textContent = npsAtual.zona;
    }
            // 🎯 AVALIAÇÃO DA META INTERNA DE ATENDIMENTO (84+)
        const iconeMeta = document.getElementById('iconeMeta');
        const textoMeta = document.getElementById('textoMeta');
        const statusMeta = document.getElementById('statusMetaInterna');
        
        // Como o fundo do card é colorido (verde, azul, etc), o texto da meta tem que ser branco/translúcido
        statusMeta.style.color = 'rgba(255, 255, 255, 0.9)';
        
        if (metricas.npsGeral >= 84) {
            iconeMeta.textContent = '🏆';
            textoMeta.textContent = 'Meta Interna Atingida (84+)';
            statusMeta.style.background = 'rgba(255, 255, 255, 0.2)';
            statusMeta.style.padding = '3px 8px';
            statusMeta.style.borderRadius = '4px';
        } else {
            iconeMeta.textContent = '🎯';
            // Mostra quantos pontos faltam para bater a meta interna
            const pontosFaltando = 84 - metricas.npsGeral;
            textoMeta.textContent = `Meta Interna: 84 (Faltam ${pontosFaltando} pts)`;
            statusMeta.style.background = 'transparent';
            statusMeta.style.padding = '0';
        }

    // 2. Textos do Centro das Pizzas
    const elementoNPSValue = document.getElementById('slideNPSValue');
    elementoNPSValue.textContent = metricas.npsGeral;
    elementoNPSValue.style.color = npsAtual.cor; 

    const elementoNPSValue3M = document.getElementById('slideNPSValue3M');
    elementoNPSValue3M.textContent = dados3M.nps;
    elementoNPSValue3M.style.color = nps3M.cor; 

    const elementoNPSValue12M = document.getElementById('slideNPSValue12M');
    elementoNPSValue12M.textContent = dados12M.nps;
    elementoNPSValue12M.style.color = nps12M.cor; 

    // 3. Desenhar as 3 Pizzas de Evolução mantendo a paleta das zonas
    gerarDoughnutNPS('slideChartNPS', 'exportNpsAtual', metricas.npsGeral, npsAtual.cor); 
    gerarDoughnutNPS('slideChartNPS3M', 'exportNps3M', dados3M.nps, nps3M.cor);              
    gerarDoughnutNPS('slideChartNPS12M', 'exportNps12M', dados12M.nps, nps12M.cor);           

    // 4. Mini Legendas (3 Meses e 12 Meses)
    const pctPro3M = dados3M.total > 0 ? (dados3M.pro / dados3M.total) * 100 : 0;
    const pctPas3M = dados3M.total > 0 ? (dados3M.pas / dados3M.total) * 100 : 0;
    const pctDet3M = dados3M.total > 0 ? (dados3M.det / dados3M.total) * 100 : 0;
    document.getElementById('legenda3MPro').textContent = `${formatarNumeroMilhares(dados3M.pro)} (${pctPro3M.toFixed(1)}%)`;
    document.getElementById('legenda3MPas').textContent = `${formatarNumeroMilhares(dados3M.pas)} (${pctPas3M.toFixed(1)}%)`;
    document.getElementById('legenda3MDet').textContent = `${formatarNumeroMilhares(dados3M.det)} (${pctDet3M.toFixed(1)}%)`;
    document.getElementById('legenda3MTotal').textContent = formatarNumeroMilhares(dados3M.total);

    const pctPro12M = dados12M.total > 0 ? (dados12M.pro / dados12M.total) * 100 : 0;
    const pctPas12M = dados12M.total > 0 ? (dados12M.pas / dados12M.total) * 100 : 0;
    const pctDet12M = dados12M.total > 0 ? (dados12M.det / dados12M.total) * 100 : 0;
    document.getElementById('legenda12MPro').textContent = `${formatarNumeroMilhares(dados12M.pro)} (${pctPro12M.toFixed(1)}%)`;
    document.getElementById('legenda12MPas').textContent = `${formatarNumeroMilhares(dados12M.pas)} (${pctPas12M.toFixed(1)}%)`;
    document.getElementById('legenda12MDet').textContent = `${formatarNumeroMilhares(dados12M.det)} (${pctDet12M.toFixed(1)}%)`;
    document.getElementById('legenda12MTotal').textContent = formatarNumeroMilhares(dados12M.total);

    // 5. Barra Horizontal do Mês Atual (CSS)
    const totalRec = metricas.totalRespostas;
    const pctPro = totalRec > 0 ? (metricas.totalPromotores / totalRec) * 100 : 0;
    const pctPas = totalRec > 0 ? (metricas.totalPassivos / totalRec) * 100 : 0;
    const pctDet = totalRec > 0 ? (metricas.totalDetratores / totalRec) * 100 : 0;

    document.getElementById('barraRecPromotores').style.width = `${pctPro}%`;
    document.getElementById('barraRecPassivos').style.width = `${pctPas}%`;
    document.getElementById('barraRecDetratores').style.width = `${pctDet}%`;

    document.getElementById('slideRecPromotores').textContent = `${formatarNumeroMilhares(metricas.totalPromotores)} (${pctPro.toFixed(1)}%)`;
    document.getElementById('slideRecPassivos').textContent = `${formatarNumeroMilhares(metricas.totalPassivos)} (${pctPas.toFixed(1)}%)`;
    document.getElementById('slideRecDetratores').textContent = `${formatarNumeroMilhares(metricas.totalDetratores)} (${pctDet.toFixed(1)}%)`;
}
// 
// 🧠 MÁQUINA DO TEMPO: Calcula o NPS voltando X meses a partir do mês filtrado
// 
function calcularNPSRetroativo(mesBase, qtdMeses) {
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

export function atualizarSlideComFiltro() {
    const mesSelecionado = document.getElementById('monthFilter').value;
    let metricasPeriodo = !mesSelecionado ? state.totaisGlobais : state.resumoPorMes[mesSelecionado];

    // Agora recebemos o pacote completo das viagens no tempo
    const dados3M = calcularNPSRetroativo(mesSelecionado, 3);
    const dados12M = calcularNPSRetroativo(mesSelecionado, 12);

    const metr = mesSelecionado ? {
        totalRespostas: (metricasPeriodo.promotores + metricasPeriodo.passivos + metricasPeriodo.detratores) || 0,
        npsGeral: metricasPeriodo.nps,
        percentualPromotores: metricasPeriodo.percentualPromotores,
        percentualPassivos: metricasPeriodo.percentualPassivos,
        percentualDetratores: metricasPeriodo.percentualDetratores,
        totalPromotores: metricasPeriodo.promotores,
        totalPassivos: metricasPeriodo.passivos,
        totalDetratores: metricasPeriodo.detratores
    } : metricasPeriodo;

    atualizarSlideExportacao(metr, dados3M, dados12M);
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








