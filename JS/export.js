import { state } from './state.js';
import { formatarNumeroMilhares } from './utils.js';

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












