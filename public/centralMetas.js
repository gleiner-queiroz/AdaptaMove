// Central de Metas - Versão Corrigida

// Objeto com alimentos sugeridos por categoria
const alimentosSugeridos = {
    protein: ["Peito de frango", "Ovos", "Salmão", "Carne magra", "Queijo cottage", "Iogurte grego"],
    carbs: ["Arroz integral", "Batata doce", "Quinoa", "Aveia", "Pão integral", "Banana"],
    fat: ["Abacate", "Nozes", "Azeite de oliva", "Sementes de chia", "Manteiga de amendoim", "Salmão"]
};

// Objeto com conquistas possíveis
const conquistas = [
    { id: "primeiros-passos", nome: "Primeiros Passos", icone: "trophy", descricao: "Definiu sua primeira meta" },
    { id: "meta-diaria", nome: "Meta Diária", icone: "medal", descricao: "Atingiu a meta diária de calorias" },
    { id: "semana-saudavel", nome: "Semana Saudável", icone: "star", descricao: "Atingiu as metas por 7 dias seguidos" },
    { id: "mestre-nutricao", nome: "Mestre da Nutrição", icone: "award", descricao: "Completou todas as conquistas" }
];

// Inicialização da Central de Metas
window.inicializarCentralMetas = function() {
    const usuario = JSON.parse(localStorage.getItem('usuarioLogado')) || {};
    
    // Se não tem GCD calculado, redireciona para nutrição
    if (!usuario.ultimoGCD) {
        document.getElementById('metaGuide').innerHTML = `
            <h3>Complete seus dados nutricionais primeiro</h3>
            <p>Para definir metas precisas, precisamos calcular suas necessidades nutricionais básicas.</p>
            <button class="cta-button" onclick="window.mostrarAba('nutricao')">
                Ir para Nutrição
            </button>
        `;
        document.getElementById('metaGuide').style.display = 'block';
        return;
    }
    
    // Configura listeners
    configurarListeners();
    
    // Se já tem meta definida, mostra os dados
    if (usuario.meta) {
        mostrarMetaAtual(usuario.meta);
        document.getElementById('metaGuide').style.display = 'none';
    } else {
        mostrarOpcoesMeta(usuario.ultimoGCD);
    }
    
    // Inicializa componentes
    carregarAlimentosSugeridos();
    inicializarPlanejadorRefeicoes();
    inicializarAcompanhamentoDiario();
    carregarConquistas();
    atualizarDashboard();
};

// Mostra opções de meta com base no GCD
function mostrarOpcoesMeta(gcd) {
    document.getElementById('metaGuide').innerHTML = `
        <h3>Escolha seu objetivo principal</h3>
        <div class="meta-options">
            <div class="meta-option" data-goal="perda">
                <i class="fas fa-weight"></i>
                <h4>Perda de Peso</h4>
                <p>Déficit calórico de 15-20% (${Math.round(gcd * 0.8)} kcal/dia)</p>
            </div>
            <div class="meta-option" data-goal="manutencao">
                <i class="fas fa-balance-scale"></i>
                <h4>Manutenção</h4>
                <p>Manter seu peso atual (${gcd} kcal/dia)</p>
            </div>
            <div class="meta-option" data-goal="ganho">
                <i class="fas fa-dumbbell"></i>
                <h4>Ganho Muscular</h4>
                <p>Superávit calórico de 10-15% (${Math.round(gcd * 1.1)} kcal/dia)</p>
            </div>
        </div>
    `;
    document.getElementById('metaGuide').style.display = 'block';
    configurarListeners();
}

// Configura listeners para os elementos interativos
function configurarListeners() {
    // Listeners para opções de meta
    document.querySelectorAll('.meta-option').forEach(btn => {
        btn.addEventListener('click', function() {
            const objetivo = this.getAttribute('data-goal');
            definirMeta(objetivo);
        });
    });

    // Listener para gerar plano automático
    document.querySelector('.btn-generate')?.addEventListener('click', gerarPlanoAutomatico);

    // Listeners para arrastar alimentos
    document.querySelectorAll('.food-item').forEach(item => {
        item.addEventListener('dragstart', function(e) {
            e.dataTransfer.setData('text/plain', this.textContent);
        });
    });

    // Listener para soltar alimentos no planejador
    document.getElementById('auto-meal-preview')?.addEventListener('dragover', function(e) {
        e.preventDefault();
    });

    document.getElementById('auto-meal-preview')?.addEventListener('drop', function(e) {
        e.preventDefault();
        const alimento = e.dataTransfer.getData('text/plain');
        adicionarAlimentoPlanejador(alimento);
    });
}

// Define uma nova meta com base no objetivo
function definirMeta(objetivo) {
    const usuario = JSON.parse(localStorage.getItem('usuarioLogado')) || {};
    const gcd = usuario.ultimoGCD || 2000;
    
    const config = {
        perda: { 
            deficit: 20, 
            proteinaPercent: 30, 
            carboPercent: 40, 
            gorduraPercent: 30,
            descricao: "Déficit calórico para perda de peso saudável"
        },
        manutencao: { 
            deficit: 0, 
            proteinaPercent: 25, 
            carboPercent: 50, 
            gorduraPercent: 25,
            descricao: "Manutenção do peso atual com nutrição balanceada"
        },
        ganho: { 
            deficit: -10, 
            proteinaPercent: 35, 
            carboPercent: 45, 
            gorduraPercent: 20,
            descricao: "Superávit calórico para ganho de massa muscular"
        }
    }[objetivo];
    
    const calorias = Math.round(gcd * (1 - config.deficit/100));
    const proteinaG = Math.round((calorias * config.proteinaPercent / 100) / 4);
    const carboG = Math.round((calorias * config.carboPercent / 100) / 4);
    const gorduraG = Math.round((calorias * config.gorduraPercent / 100) / 9);
    
    // Atualiza interface
    atualizarTabelaMacros(calorias, proteinaG, carboG, gorduraG, config);
    atualizarResumoNutricional(calorias, proteinaG, carboG, gorduraG);
    
    // Esconde o guia e mostra o conteúdo
    document.getElementById('metaGuide').style.display = 'none';
    
    // Salva a meta
    usuario.meta = { 
        objetivo,
        calorias,
        proteina: proteinaG,
        carbo: carboG,
        gordura: gorduraG,
        ...config,
        data: new Date().toISOString()
    };
    
    localStorage.setItem('usuarioLogado', JSON.stringify(usuario));
    
    // Mostra sugestões e desbloqueia conquista
    mostrarSugestoes(objetivo);
    desbloquearConquista('primeiros-passos');
    
    // Atualiza planejador de refeições
    atualizarDistribuicaoRefeicoes(calorias);
}

// Atualiza a tabela de macros
function atualizarTabelaMacros(calorias, proteinaG, carboG, gorduraG, config) {
    document.getElementById('meta-proteina-gramas').textContent = proteinaG + 'g';
    document.getElementById('meta-carbo-gramas').textContent = carboG + 'g';
    document.getElementById('meta-gordura-gramas').textContent = gorduraG + 'g';
    document.getElementById('meta-proteina-percent').textContent = config.proteinaPercent + '%';
    document.getElementById('meta-carbo-percent').textContent = config.carboPercent + '%';
    document.getElementById('meta-gordura-percent').textContent = config.gorduraPercent + '%';
    document.getElementById('meta-proteina-calorias').textContent = Math.round(proteinaG * 4) + ' kcal';
    document.getElementById('meta-carbo-calorias').textContent = Math.round(carboG * 4) + ' kcal';
    document.getElementById('meta-gordura-calorias').textContent = Math.round(gorduraG * 9) + ' kcal';
    document.getElementById('meta-total-gramas').textContent = (proteinaG + carboG + gorduraG) + 'g';
    document.getElementById('meta-calorias').textContent = calorias + ' kcal';
    document.getElementById('meta-descricao').textContent = config.descricao;
    
    initMacrosChart(config.proteinaPercent, config.carboPercent, config.gorduraPercent);
}

// Atualiza o resumo nutricional
function atualizarResumoNutricional(calorias, proteinaG, carboG, gorduraG) {
    document.getElementById('meta-calorias').textContent = calorias;
    document.getElementById('meta-proteina').textContent = proteinaG + 'g';
    document.getElementById('meta-carbo').textContent = carboG + 'g';
    document.getElementById('meta-gordura').textContent = gorduraG + 'g';
}

// Carrega alimentos sugeridos
function carregarAlimentosSugeridos() {
    const container = document.getElementById('suggested-foods');
    if (!container) return;
    
    container.innerHTML = '';
    
    Object.entries(alimentosSugeridos).forEach(([tipo, alimentos]) => {
        alimentos.forEach(alimento => {
            const item = document.createElement('div');
            item.className = 'food-item';
            item.setAttribute('data-macros', tipo);
            item.textContent = alimento;
            item.draggable = true;
            container.appendChild(item);
        });
    });
}

// Inicializa o planejador de refeições
function inicializarPlanejadorRefeicoes() {
    const usuario = JSON.parse(localStorage.getItem('usuarioLogado')) || {};
    if (usuario.meta) {
        atualizarDistribuicaoRefeicoes(usuario.meta.calorias);
    }
}

// Atualiza a distribuição de calorias nas refeições
function atualizarDistribuicaoRefeicoes(caloriasTotais) {
    const distribuicao = {
        cafeManha: Math.round(caloriasTotais * 0.2),
        lancheManha: Math.round(caloriasTotais * 0.1),
        almoco: Math.round(caloriasTotais * 0.3),
        lancheTarde: Math.round(caloriasTotais * 0.1),
        jantar: Math.round(caloriasTotais * 0.25),
        ceia: Math.round(caloriasTotais * 0.05)
    };
    
    document.querySelectorAll('.macro-card').forEach(card => {
        const nomeRefeicao = card.querySelector('.macro-nome').textContent.toLowerCase();
        let calorias = 0;
        
        if (nomeRefeicao.includes('café')) calorias = distribuicao.cafeManha;
        else if (nomeRefeicao.includes('lanche') && nomeRefeicao.includes('manhã')) calorias = distribuicao.lancheManha;
        else if (nomeRefeicao.includes('almoço')) calorias = distribuicao.almoco;
        else if (nomeRefeicao.includes('lanche') && nomeRefeicao.includes('tarde')) calorias = distribuicao.lancheTarde;
        else if (nomeRefeicao.includes('jantar')) calorias = distribuicao.jantar;
        
        const detalhes = card.querySelector('.macro-detalhes');
        detalhes.innerHTML = `<span>0/${calorias} kcal</span><span>0%</span>`;
    });
}

// Gera plano automático de refeições
function gerarPlanoAutomatico() {
    const preview = document.getElementById('auto-meal-preview');
    preview.innerHTML = '<h5>Sugestão de Plano Diário</h5>';
    
    const refeicoes = [
        { nome: "Café da Manhã", macros: { protein: 30, carbs: 50, fat: 20 } },
        { nome: "Lanche da Manhã", macros: { protein: 20, carbs: 60, fat: 20 } },
        { nome: "Almoço", macros: { protein: 35, carbs: 40, fat: 25 } },
        { nome: "Lanche da Tarde", macros: { protein: 20, carbs: 60, fat: 20 } },
        { nome: "Jantar", macros: { protein: 40, carbs: 30, fat: 30 } }
    ];
    
    refeicoes.forEach(refeicao => {
        const refeicaoDiv = document.createElement('div');
        refeicaoDiv.className = 'auto-meal';
        refeicaoDiv.innerHTML = `<h6>${refeicao.nome}</h6>`;
        
        // Adiciona 2-3 alimentos para cada refeição
        const alimentos = [];
        if (refeicao.macros.protein > 0) {
            alimentos.push(alimentosSugeridos.protein[Math.floor(Math.random() * alimentosSugeridos.protein.length)]);
        }
        if (refeicao.macros.carbs > 0) {
            alimentos.push(alimentosSugeridos.carbs[Math.floor(Math.random() * alimentosSugeridos.carbs.length)]);
        }
        if (refeicao.macros.fat > 0) {
            alimentos.push(alimentosSugeridos.fat[Math.floor(Math.random() * alimentosSugeridos.fat.length)]);
        }
        
        refeicaoDiv.innerHTML += `<ul>${alimentos.map(a => `<li>${a}</li>`).join('')}</ul>`;
        preview.appendChild(refeicaoDiv);
    });
}

// Adiciona alimento ao planejador
function adicionarAlimentoPlanejador(alimento) {
    const preview = document.getElementById('auto-meal-preview');
    const item = document.createElement('div');
    item.className = 'planned-food';
    item.textContent = alimento;
    preview.appendChild(item);
}

// Inicializa o acompanhamento diário
function inicializarAcompanhamentoDiario() {
    const hoje = new Date().toISOString().split('T')[0];
    const diario = JSON.parse(localStorage.getItem('diarioNutricional')) || {};
    
    if (diario[hoje]) {
        atualizarTrackerDiario(diario[hoje]);
    }
}

// Atualiza o tracker diário
function atualizarTrackerDiario(dados) {
    document.querySelector('.tracker-item.protein .tracker-value').textContent = dados.proteina + 'g';
    document.querySelector('.tracker-item.carbs .tracker-value').textContent = dados.carbo + 'g';
    document.querySelector('.tracker-item.fat .tracker-value').textContent = dados.gordura + 'g';
    document.querySelector('.calories-value').textContent = dados.calorias;
}

// Carrega as conquistas do usuário
function carregarConquistas() {
    const usuario = JSON.parse(localStorage.getItem('usuarioLogado')) || {};
    const container = document.querySelector('.conquistas-container');
    
    conquistas.forEach(conquista => {
        const conquistada = usuario.conquistas?.includes(conquista.id) || false;
        const card = document.createElement('div');
        card.className = `conquista-card ${conquistada ? 'conquistada' : ''}`;
        card.innerHTML = `
            <div class="conquista-icon"><i class="fas fa-${conquista.icone}"></i></div>
            <div class="conquista-titulo">${conquista.nome}</div>
            ${conquistada ? `<div class="conquista-descricao">${conquista.descricao}</div>` : ''}
        `;
        container.appendChild(card);
    });
}

// Desbloqueia uma conquista
function desbloquearConquista(id) {
    const usuario = JSON.parse(localStorage.getItem('usuarioLogado')) || {};
    if (!usuario.conquistas) usuario.conquistas = [];
    
    if (!usuario.conquistas.includes(id)) {
        usuario.conquistas.push(id);
        localStorage.setItem('usuarioLogado', JSON.stringify(usuario));
        carregarConquistas();
    }
}

// Atualiza o dashboard
function atualizarDashboard() {
    const usuario = JSON.parse(localStorage.getItem('usuarioLogado')) || {};
    
    if (usuario.ultimoGCD) {
        document.getElementById('meta-calorias').textContent = usuario.ultimoGCD.toFixed(0);
    }
    if (usuario.ultimoIMC) {
        document.getElementById('meta-imc').textContent = usuario.ultimoIMC.toFixed(1);
    }
    if (usuario.ultimaAgua) {
        document.getElementById('meta-agua').textContent = usuario.ultimaAgua.toFixed(0) + ' ml';
    }
    
    carregarProgresso();
}

// Carrega o progresso do usuário
function carregarProgresso() {
    const historico = JSON.parse(localStorage.getItem('historicoNutricional')) || [];
    if (historico.length > 0) {
        atualizarGraficoProgresso(historico);
    }
}

// Atualiza o gráfico de progresso
function atualizarGraficoProgresso(historico) {
    const ctx = document.getElementById('progressoChart')?.getContext('2d');
    if (!ctx) return;
    
    if (window.progressoChart) {
        window.progressoChart.destroy();
    }
    
    historico.sort((a, b) => new Date(a.data) - new Date(b.data));
    
    window.progressoChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: historico.map(item => new Date(item.data).toLocaleDateString('pt-BR')),
            datasets: [{
                label: 'Peso (kg)',
                data: historico.map(item => item.peso),
                borderColor: '#4CAF50',
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Seu Progresso'
                }
            },
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        }
    });
}

// Inicializa gráfico de macros
function initMacrosChart(proteina, carbo, gordura) {
    const ctx = document.getElementById('macrosChart')?.getContext('2d');
    if (!ctx) return;
    
    if (window.macrosChart) {
        window.macrosChart.destroy();
    }
    
    window.macrosChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Proteína', 'Carboidratos', 'Gorduras'],
            datasets: [{
                data: [proteina, carbo, gordura],
                backgroundColor: ['#4CAF50', '#FFC107', '#F44336'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                },
                title: {
                    display: true,
                    text: 'Distribuição de Macronutrientes (%)'
                }
            },
            cutout: '70%'
        }
    });
}
function atualizarResumoNutricional(calorias, proteinaG, carboG, gorduraG) {
    // Verifica se os elementos existem antes de tentar atualizar
    const atualizarSeExistir = (id, valor) => {
        const elemento = document.getElementById(id);
        if (elemento) elemento.textContent = valor;
    };

    atualizarSeExistir('meta-calorias', calorias + ' kcal');
    atualizarSeExistir('meta-proteina', proteinaG + ' g');
    atualizarSeExistir('meta-carbo', carboG + ' g');
    atualizarSeExistir('meta-gordura', gorduraG + ' g');
    
    // Atualiza também a tabela de macros (se existir)
    atualizarSeExistir('meta-proteina-gramas', proteinaG + 'g');
    atualizarSeExistir('meta-carbo-gramas', carboG + 'g');
    atualizarSeExistir('meta-gordura-gramas', gorduraG + 'g');
}