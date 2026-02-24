import { state } from './state.js';
import { fetchResumo, fetchRespostas } from './api.js';
import * as uiLib from './ui.js';
import * as chartsLib from './charts.js';
import * as exportLib from './export.js';

// ==========================================
// 🛠️ SISTEMA DE LOGS PARRUDO
// ==========================================
const logger = {
    info: (msg, data = '') => console.log(`%c 🔵 [INFO] ${msg}`, 'color: #3b82f6; font-weight: bold;', data),
    success: (msg, data = '') => console.log(`%c 🟢 [SUCESSO] ${msg}`, 'color: #10b981; font-weight: bold;', data),
    warn: (msg, data = '') => console.log(`%c 🟠 [AVISO] ${msg}`, 'color: #f59e0b; font-weight: bold;', data),
    error: (msg, err = '') => console.error(`%c 🔴 [ERRO] ${msg}`, 'color: #ef4444; font-weight: bold;', err),
    divisor: () => console.log('%c--------------------------------------------------', 'color: #cbd5e1;')
};

// ==========================================
// FUNÇÃO DE INICIALIZAÇÃO (CARREGA OS DADOS)
// ==========================================
async function init() {
    console.groupCollapsed(`🚀 INICIANDO DASHBOARD: [${state.unidadeAtual.toUpperCase()}]`);
    console.time('⏳ Tempo total de carregamento');
    logger.info('Iniciando ciclo de vida da aplicação...');

    try {
        // UI Setup
        document.getElementById('loading').classList.remove('hidden');
        document.getElementById('dashboard').classList.add('hidden');
        document.getElementById('errorScreen').classList.add('hidden');

        // 1. Fetch Resumo
        logger.info(`Chamando API de Resumo para: ${state.unidadeAtual}...`);
        document.getElementById('loadingStatus').textContent = `Carregando resumo (${state.unidadeAtual === 'operadora' ? 'Operadora' : 'Centro Médico'})...`;
        
        console.time('📡 Tempo API Resumo');
        const resultResumo = await fetchResumo();
        console.timeEnd('📡 Tempo API Resumo');
        
        logger.success('Dados do resumo recebidos!', { 
            meses: resultResumo.mesesDisponiveis.length, 
            totaisGlobais: resultResumo.totais 
        });
        
        state.resumoPorMes = resultResumo.resumoPorMes;
        state.totaisGlobais = resultResumo.totais;
        state.mesesDisponiveis = resultResumo.mesesDisponiveis;

        // 2. Fetch Respostas
        logger.info(`Chamando API de Respostas Brutas para: ${state.unidadeAtual}...`);
        document.getElementById('loadingStatus').textContent = 'Carregando respostas individuais...';
        
        console.time('📡 Tempo API Brutos');
        state.dadosGlobais = await fetchRespostas();
        console.timeEnd('📡 Tempo API Brutos');

        logger.success(`Respostas brutas recebidas!`, `Total de linhas processadas: ${state.dadosGlobais.length}`);

        // 3. Process Data
        logger.info('Enviando dados para os módulos de renderização (UI / Gráficos)...');
        processarDados();

        // Finish
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('dashboard').classList.remove('hidden');
        
        logger.success('✨ Tudo renderizado! Dashboard pronto para uso.');

    } catch (error) {
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('errorScreen').classList.remove('hidden');
        document.getElementById('errorMessage').textContent = error.message;
        
        logger.error('Falha fatal durante o fluxo de inicialização:', error);
    } finally {
        console.timeEnd('⏳ Tempo total de carregamento');
        logger.divisor();
        console.groupEnd();
    }
}

// ==========================================
// FUNÇÃO QUE ORQUESTRA A RENDERIZAÇÃO
// ==========================================
function processarDados() {
    try {
        console.time('🎨 Tempo de Renderização UI');
        
        uiLib.atualizarKPIs(state.totaisGlobais);
        uiLib.popularFiltroMeses(state.mesesDisponiveis);
        logger.info('KPIs e Filtros atualizados.');
        
        chartsLib.gerarGraficoNotaGeral();
        chartsLib.gerarGraficoRecomendacao(state.totaisGlobais);
        logger.info('Gráficos principais desenhados.');
        
        const totaisColeta = chartsLib.gerarColetaComparacao();
        uiLib.atualizarCardsColeta(totaisColeta);
        logger.info('Métricas de coleta (Manual/Digital) renderizadas.');
        
        uiLib.renderizarUltimasRespostas();
        uiLib.renderizarSugestoes();
        logger.info('Listas de respostas e sugestões preenchidas.');
        
        exportLib.atualizarSlideExportacao(state.totaisGlobais);
        logger.info('Slide de diretoria pré-renderizado no DOM invisível.');

        // 🔥 O GATILHO DA NOSSA ABA DE CIDADES 🔥
        renderizarAbaCidades(state.dadosGlobais);
        logger.info('Aba de Cidades renderizada.');

        console.timeEnd('🎨 Tempo de Renderização UI');
    } catch (error) {
        logger.error('Erro na hora de desenhar os dados na tela (processarDados):', error);
        throw error; 
    }
}

// ==========================================
// FUNÇÃO DO SWITCHER (OPERADORA / CENTRO)
// ==========================================
async function trocarDashboard(novaUnidade) {
    if (state.unidadeAtual === novaUnidade) {
        logger.warn(`Tentativa de trocar para a mesma unidade atual: ${novaUnidade}. Ignorado.`);
        return; 
    }
    
    logger.info(`🔄 SWITCHER ATIVADO: Trocando de [${state.unidadeAtual}] para [${novaUnidade}]`);
    state.unidadeAtual = novaUnidade;
    
    const btnOp = document.getElementById('btnOp');
    const btnCm = document.getElementById('btnCm');
    const subtitulo = document.getElementById('headerSubtitle');
    const tituloSlide = document.querySelector('.slide-header p');
    
    // 1. Limpa o estado ativo dos dois botões
    btnOp.classList.remove('active');
    btnCm.classList.remove('active');

    // 2. Acende o botão correto e muda os textos
    if (novaUnidade === 'operadora') {
        btnOp.classList.add('active');
        subtitulo.textContent = "Operadora Oeste Saúde";
        if(tituloSlide) tituloSlide.textContent = "Operadora Oeste Saúde - Reunião de Diretoria";
    } else {
        btnCm.classList.add('active');
        subtitulo.textContent = "Centro Médico Oeste Saúde";
        if(tituloSlide) tituloSlide.textContent = "Centro Médico Oeste Saúde - Reunião de Diretoria";
    }

    // Resetamos a UI para ter a tela de loading de novo
    await init();
}

// ==========================================
// EXPOR FUNÇÕES PARA O HTML (Escopo Global)
// ==========================================
logger.info('Registrando funções no escopo global (window)...');

window.initApp = init;
window.carregarDados = init;
window.trocarDashboard = trocarDashboard;
window.mudarAba = uiLib.mudarAba;
window.toggleResposta = uiLib.toggleResposta;
window.atualizarSlideComFiltro = exportLib.atualizarSlideComFiltro;
window.exportarSlide = exportLib.exportarSlide;

// Inicializa a brincadeira toda
window.addEventListener('DOMContentLoaded', () => {
    logger.info('DOM carregado. Chamando init()...');
    init();

});

export function renderizarAbaCidades(respostasBrutas) {
    const grid = document.getElementById('gridCardsCidades');
    const ctx = document.getElementById('chartNPSCidades');

    // 1. Rastreador no Console (Aperte F12 para ver)
    console.log("🏙️ [CIDADES] Dados recebidos para processar:", respostasBrutas);

    // Trava de segurança 1: Dados vazios
    if (!respostasBrutas || !Array.isArray(respostasBrutas) || respostasBrutas.length === 0) {
        console.warn("🟠 [CIDADES] Nenhum dado recebido. Abortando renderização.");
        if (grid) grid.innerHTML = '<div class="col-span-full py-10 text-center text-amber-500 font-bold">Nenhuma resposta encontrada no servidor.</div>';
        return;
    }

    const cidadesStats = {};
    let cidadesValidasEncontradas = 0;

    respostasBrutas.forEach((item, index) => {
        // Tenta achar a cidade de qualquer jeito que a API mandar
        let cidadeBruta = item.cidade || item.Cidade || item.municipio || "Não Informada";
        
        // Limpa espaços em branco e padroniza
        let cidade = typeof cidadeBruta === 'string' ? cidadeBruta.trim() : "Não Informada";

        if (index === 0) {
            console.log("🔍 [CIDADES] Estrutura da Primeira Linha:", item);
            console.log("📍 [CIDADES] Cidade identificada como:", cidade);
        }

        // Se for vazia ou Não informada, pula sem quebrar
        if (cidade === "Não Informada" || cidade === "") return;

        cidadesValidasEncontradas++;

        if (!cidadesStats[cidade]) {
            cidadesStats[cidade] = { promotores: 0, passivos: 0, detratores: 0, total: 0 };
        }

        // Garante que a nota é um número válido
        const nota = parseInt(item.nota || item.nps || item["Nota 0 a 10"] || -1);
        if (nota < 0 || nota > 10) return; // Pula notas inválidas

        cidadesStats[cidade].total++;
        if (nota >= 9) cidadesStats[cidade].promotores++;
        else if (nota >= 7) cidadesStats[cidade].passivos++;
        else cidadesStats[cidade].detratores++;
    });

    // Trava de segurança 2: Nenhuma cidade nas respostas
    if (cidadesValidasEncontradas === 0) {
        console.warn("🟠 [CIDADES] As respostas existem, mas a coluna de cidades está vazia.");
        if (grid) grid.innerHTML = '<div class="col-span-full py-10 text-center text-gray-500 font-medium">Nenhuma cidade foi registrada nas avaliações recentes.</div>';
        return;
    }

    // 2. Prepara os Arrays
    const nomesCidades = [];
    const npsCidades = [];
    let htmlCards = '';

    const arrayCidades = Object.keys(cidadesStats).map(cidade => {
        const stats = cidadesStats[cidade];
        const pctPro = (stats.promotores / stats.total) * 100;
        const pctDet = (stats.detratores / stats.total) * 100;
        const nps = Math.round(pctPro - pctDet);
        return { cidade, ...stats, nps };
    });

    arrayCidades.sort((a, b) => b.nps - a.nps);

    // 3. Monta o Visual
    arrayCidades.forEach(dados => {
        nomesCidades.push(dados.cidade);
        npsCidades.push(dados.nps);

        const pctPro = ((dados.promotores / dados.total) * 100).toFixed(0);
        const pctPas = ((dados.passivos / dados.total) * 100).toFixed(0);
        const pctDet = ((dados.detratores / dados.total) * 100).toFixed(0);

        let corBorda = 'bg-slate-300', corNps = 'text-slate-600';
        if (dados.nps >= 76) { corBorda = 'bg-emerald-500'; corNps = 'text-emerald-600'; }
        else if (dados.nps >= 51) { corBorda = 'bg-[#00A8B0]'; corNps = 'text-[#00A8B0]'; }
        else if (dados.nps >= 1) { corBorda = 'bg-amber-500'; corNps = 'text-amber-500'; }
        else { corBorda = 'bg-red-500'; corNps = 'text-red-500'; }

        htmlCards += `
            <article class="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                <div class="absolute top-0 left-0 w-full h-1 ${corBorda}"></div>
                <h3 class="text-lg font-bold text-gray-800 mb-1 truncate" title="${dados.cidade}">${dados.cidade}</h3>
                <p class="text-xs text-gray-500 mb-4">${dados.total} avaliações coletadas</p>
                <div class="flex items-end gap-2 mb-4">
                    <div class="text-4xl font-black ${corNps}">${dados.nps}</div>
                    <div class="text-xs font-semibold text-gray-400 mb-1 uppercase">NPS Score</div>
                </div>
                <div class="w-full bg-gray-100 rounded-full h-2 flex overflow-hidden mb-2">
                    <div style="width: ${pctPro}%" class="bg-emerald-500"></div>
                    <div style="width: ${pctPas}%" class="bg-amber-500"></div>
                    <div style="width: ${pctDet}%" class="bg-red-500"></div>
                </div>
                <div class="flex justify-between text-[10px] font-bold uppercase">
                    <span class="text-emerald-600">${pctPro}% PRO</span>
                    <span class="text-amber-600">${pctPas}% PAS</span>
                    <span class="text-red-600">${pctDet}% DET</span>
                </div>
            </article>`;
    });

    if (grid) grid.innerHTML = htmlCards;

    // 4. Desenha o Gráfico
    if (!ctx) return;
    if (window.graficoCidades) window.graficoCidades.destroy();

    window.graficoCidades = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: nomesCidades,
            datasets: [{
                label: 'NPS Score',
                data: npsCidades,
                backgroundColor: npsCidades.map(nps => nps >= 50 ? '#00A8B0' : (nps >= 0 ? '#f59e0b' : '#ef4444')),
                borderRadius: 6,
                barThickness: 30
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { min: -100, max: 100, grid: { borderDash: [4, 4] } }, x: { grid: { display: false } } }
        }
    });
    
    console.log("✅ [CIDADES] Renderização concluída com sucesso!");
}


