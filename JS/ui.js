import { state } from './state.js';
import { CONFIG } from './config.js';
import { formatarNumeroMilhares, obterZona, formatarDataBR, getNota0a10, obterBadge, obterTextoNota, contarPalavras, escapeHtml } from './utils.js';

export function mudarAba(aba) {
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById('tab' + aba.charAt(0).toUpperCase() + aba.slice(1)).classList.add('active');
    document.getElementById('content' + aba.charAt(0).toUpperCase() + aba.slice(1)).classList.add('active');
}

export function toggleResposta(id) {
    document.getElementById('detalhes-' + id).classList.toggle('expanded');
    document.getElementById('chevron-' + id).classList.toggle('rotated');
}

export function atualizarKPIs(totaisGlobais) {
    // 🛡️ Trava de segurança: se os dados ainda estiverem carregando, ele não tenta fazer a conta e evita o erro
    if (!totaisGlobais) return;

    // ========================================================
    // 1. ATUALIZA OS KPIS DO DASHBOARD PRINCIPAL
    // ========================================================
    document.getElementById('kpiTotal').textContent = formatarNumeroMilhares(totaisGlobais.totalRespostas);
    document.getElementById('kpiNPS').textContent = totaisGlobais.npsGeral;
    document.getElementById('kpiPromotores').textContent = totaisGlobais.percentualPromotores.toFixed(1) + '%';
    
    const zona = obterZona(totaisGlobais.npsGeral);
    document.getElementById('kpiZona').textContent = zona.texto;
    document.getElementById('kpiZonaDesc').textContent = zona.desc;

    // ========================================================
    // 2. ATUALIZA OS KPIS DO SLIDE DE EXPORTAÇÃO (Sincronia)
    // ========================================================
    const slideTotal = document.getElementById('slideTotal');
    const slideNPS = document.getElementById('slideNPS');
    const slidePromotores = document.getElementById('slidePromotores');
    const slidePeriodo = document.getElementById('slidePeriodo');
    
    if (slideTotal) slideTotal.textContent = formatarNumeroMilhares(totaisGlobais.totalRespostas);
    if (slideNPS) slideNPS.textContent = totaisGlobais.npsGeral;
    if (slidePromotores) slidePromotores.textContent = totaisGlobais.percentualPromotores.toFixed(1) + '%';
    
    // ========================================================
    // 3. A LÓGICA INTELIGENTE DO MÊS NO SLIDE
    // ========================================================
    const filtroDropdown = document.getElementById('monthFilter');
    if (filtroDropdown && slidePeriodo) {
        const valorFiltro = filtroDropdown.value; 
        const textoFiltro = filtroDropdown.options[filtroDropdown.selectedIndex].text;
        
        if (valorFiltro === "") {
            // Se for "Todos os dados", ele calcula de quando até quando
            const options = Array.from(filtroDropdown.options).filter(opt => opt.value !== "");
            
            if (options.length > 0) {
                const maisRecente = options[0].text; // Ex: Janeiro de 2026
                const maisAntigo = options[options.length - 1].text; // Ex: Janeiro de 2024
                
                if(options.length === 1) {
                    slidePeriodo.textContent = maisRecente;
                } else {
                    const textoCurtoAntigo = maisAntigo.replace(" de ", "/");
                    const textoCurtoRecente = maisRecente.replace(" de ", "/");
                    slidePeriodo.textContent = `${textoCurtoAntigo} a ${textoCurtoRecente}`;
                }
            } else {
                slidePeriodo.textContent = "Sem dados disponíveis";
            }
        } else {
            // Se o analista escolheu um mês específico (Ex: Março de 2025)
            slidePeriodo.textContent = textoFiltro;
        }
    }
}

export function popularFiltroMeses(mesesDisponiveis) {
    const selectMes = document.getElementById('monthFilter');
    selectMes.innerHTML = '<option value="">Todos os dados</option>';
    
    mesesDisponiveis.forEach(mes => {
        // Ignora se vier lixo ou a palavra do cabeçalho
        if (!mes || String(mes).toLowerCase() === 'mês') return;
        
        try {
            // Tenta dividir no formato YYYY-MM
            const partes = String(mes).trim().split('-');
            let textoExibicao = mes; // Por padrão, mostra exatamente o que veio da planilha
            
            // Se veio certinho no formato Ano-Mês (ex: 2024-02)
            if (partes.length === 2 && partes[0].length === 4) {
                const ano = partes[0];
                const mesNum = parseInt(partes[1], 10);
                
                // Array fixo (Zero chance de dar Invalid Date)
                const nomesMeses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
                
                if (mesNum >= 1 && mesNum <= 12) {
                    const nomeMes = nomesMeses[mesNum - 1];
                    // Formata bonitinho: "Fevereiro de 2024"
                    textoExibicao = (nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1)) + ' de ' + ano;
                }
            }
            
            const option = document.createElement('option');
            option.value = mes;
            option.textContent = textoExibicao;
            selectMes.appendChild(option);
            
        } catch(e) {
            console.log("Ignorando erro de formatação de mês:", e);
        }
    });
}
export function atualizarCardsColeta(totais) {
    const totalColetas = totais.totalManuais + totais.totalDigitais;
    const percManuais = totalColetas > 0 ? ((totais.totalManuais / totalColetas) * 100).toFixed(1) : 0;
    const percDigitais = totalColetas > 0 ? ((totais.totalDigitais / totalColetas) * 100).toFixed(1) : 0;

    document.getElementById('coletaManuaisQtd').textContent = formatarNumeroMilhares(totais.totalManuais);
    document.getElementById('coletaManuaisPerc').textContent = percManuais + '%';
    document.getElementById('coletaDigitaisQtd').textContent = formatarNumeroMilhares(totais.totalDigitais);
    document.getElementById('coletaDigitaisPerc').textContent = percDigitais + '%';
}

export function renderizarUltimasRespostas() {
    const container = document.getElementById('ultimasRespostas');
    const ultimas = state.dadosGlobais.slice(-10).reverse();

    container.innerHTML = ultimas.map((d, index) => {
        const numero = state.dadosGlobais.length - index;
        const nota = getNota0a10(d);
        const recomendacao = String(d[CONFIG.COLUNAS.RECOMENDACAO]).trim().toUpperCase();
        let badgeRec = recomendacao === 'SIM' ? 'badge-sim' : 'badge-nao';
        let textoRec = recomendacao === 'SIM' ? 'Sim' : 'Não';
        
        return `
            <div class="resposta-card" onclick="window.toggleResposta(${numero})">
                <div class="resposta-header">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-gradient-to-br from-[#003D58] to-[#00A8B0] text-white font-bold text-sm flex items-center justify-center">${numero}</div>
                        <div>
                            <p class="font-bold text-gray-800">Resposta #${numero}</p>
                            <p class="text-xs text-gray-500">${formatarDataBR(d[CONFIG.COLUNAS.TIMESTAMP])}</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-3">
                        <div class="text-right">
                            <p class="text-2xl font-bold text-gray-800">${nota !== null ? nota : 'N/A'}</p>
                            <span class="badge ${obterBadge(nota)}">${obterTextoNota(nota)}</span>
                        </div>
                        <svg id="chevron-${numero}" class="chevron w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>
                <div id="detalhes-${numero}" class="resposta-detalhes">
                    <div class="resposta-item">
                        <span class="text-sm text-gray-700 font-medium">Recomendação</span>
                        <div class="flex items-center gap-2">
                            <span class="text-sm font-bold text-gray-800">${textoRec}</span>
                            <span class="badge ${badgeRec}">${textoRec}</span>
                        </div>
                    </div>
                </div>
            </div>`;
    }).join('');
}

export function renderizarSugestoes() {
    const container = document.getElementById('sugestoesContainer');
    const sugestoesRelevantes = state.dadosGlobais
        .map((d, i) => ({
            numero: i + 1,
            texto: d[CONFIG.COLUNAS.COMENTARIO],
            data: formatarDataBR(d[CONFIG.COLUNAS.TIMESTAMP]),
            palavras: contarPalavras(d[CONFIG.COLUNAS.COMENTARIO])
        }))
        .filter(s => s.texto && s.palavras > 10)
        .reverse()
        .slice(0, 20);
    
    if (sugestoesRelevantes.length === 0) {
        container.innerHTML = `<div class="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">Nenhum comentário detalhado encontrado.</div>`;
        return;
    }
    
    container.innerHTML = sugestoesRelevantes.map(s => `
        <div class="sugestao-card">
            <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-2">
                    <div class="w-7 h-7 rounded-full bg-gradient-to-br from-[#003D58] to-[#00A8B0] text-white font-bold text-xs flex items-center justify-center">${s.numero}</div>
                    <p class="font-bold text-gray-800 text-sm">Resposta #${s.numero}</p>
                </div>
                <p class="text-xs text-gray-500">${s.data}</p>
            </div>
            <div class="bg-gray-50 rounded-lg p-3 mb-3">
                <p class="text-sm text-gray-700 leading-relaxed">${escapeHtml(s.texto)}</p>
            </div>
        </div>`).join('');
}

// ==============================================================================
// SINCRONIZADOR FORÇADO DO SLIDE DE EXPORTAÇÃO
// ==============================================================================
document.addEventListener('DOMContentLoaded', () => {
    const filtroDropdown = document.getElementById('monthFilter');
    
    if (filtroDropdown) {
        filtroDropdown.addEventListener('change', () => {
            const slidePeriodo = document.getElementById('slidePeriodo');
            if (!slidePeriodo) return;

            const index = filtroDropdown.selectedIndex;
            
            if (index > 0) {
                // Se escolheu um mês específico (Ex: "Fevereiro de 2025")
                slidePeriodo.textContent = filtroDropdown.options[index].text;
            } else {
                // Se voltou para "Todos os dados"
                const options = Array.from(filtroDropdown.options);
                if (options.length > 2) {
                    // Pega o mais antigo (último da lista) e o mais novo (posição 1)
                    const maisRecente = options[1].text.replace(" de ", "/");
                    const maisAntigo = options[options.length - 1].text.replace(" de ", "/");
                    slidePeriodo.textContent = `${maisAntigo} a ${maisRecente}`;
                } else {
                    slidePeriodo.textContent = "Histórico Completo";
                }
            }
        });
    }
});