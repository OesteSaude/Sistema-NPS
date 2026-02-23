import { state } from './state.js';
import { getNota0a10 } from './utils.js';

export function gerarGraficoNotaGeral() {
    const ctx = document.getElementById('chartNotaGeral'); // Confirme se o ID do seu canvas é esse
    if (state.chartsInstances.notaGeral) state.chartsInstances.notaGeral.destroy();

    // Puxa o array [qtd0, qtd1, ..., qtd10] que o backend já calculou de TODAS as respostas
    const data = state.totaisGlobais.distribuicaoNotas || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const labels = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

    state.chartsInstances.notaGeral = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{ 
                data: data, 
                backgroundColor: '#00A8B0', // Cor da Oeste Saúde
                borderRadius: 4 
            }]
        },
        options: { 
            responsive: true, 
            maintainAspectRatio: false, 
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, ticks: { precision: 0 } }
            }
        }
    });
}

export function gerarGraficoRecomendacao(metricas) {
    const ctx = document.getElementById('chartRecomendacao');
    if (state.chartsInstances.recomendacao) state.chartsInstances.recomendacao.destroy();

    state.chartsInstances.recomendacao = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Promotores', 'Passivos', 'Detratores'],
            datasets: [{
                data: [metricas.totalPromotores, metricas.totalPassivos, metricas.totalDetratores],
                backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
                borderRadius: 6
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
}

export function gerarColetaComparacao() {
    let totalManuais = 0, totalDigitais = 0;
    Object.values(state.resumoPorMes).forEach(mes => {
        totalManuais += mes.manuais || 0;
        totalDigitais += mes.digitais || 0;
    });

    const ctx = document.getElementById('chartColetaDistribuicao');
    if (state.chartsInstances.coletaDistribuicao) state.chartsInstances.coletaDistribuicao.destroy();

    state.chartsInstances.coletaDistribuicao = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Manual', 'Digital'],
            datasets: [{ data: [totalManuais, totalDigitais], backgroundColor: ['#8b5cf6', '#f97316'], hoverOffset: 4 }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
    });

    return { totalManuais, totalDigitais };
}