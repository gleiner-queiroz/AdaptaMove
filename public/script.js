// Função global para gerenciar as abas
window.mostrarAba = function(abaId) {
    console.log(`Tentando mostrar aba: ${abaId}`);
    
    // Oculta todas as abas
    document.querySelectorAll('.aba').forEach(aba => aba.classList.remove('ativa'));
    
    // Mostra a aba selecionada
    const abaAlvo = document.getElementById(abaId);
    if (abaAlvo) {
        console.log(`Aba ${abaId} encontrada, exibindo...`);
        abaAlvo.classList.add('ativa');
        
        // Inicializa componentes específicos
        const inicializadores = {
            'central': () => window.inicializarCentralMetas?.(),
            'nutricao': () => {
                window.initIMCChart?.();
                window.initRCQChart?.();
            },
            'receitas': () => window.carregarReceitas?.()
        };
        
        inicializadores[abaId]?.();
    } else {
        console.error(`Aba com ID ${abaId} não encontrada!`);
    }
    
    // Fecha menus dropdown se abertos
    document.getElementById('dropdownMenu')?.classList.remove('show');
    document.getElementById('mainNav')?.classList.remove('active');
};

// Configuração inicial quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM totalmente carregado e analisado');

    // Configura listeners para abas
    const configurarListenersAba = (selector) => {
        document.querySelectorAll(selector).forEach(aba => {
            aba.addEventListener('click', function(e) {
                e.preventDefault();
                const abaId = this.getAttribute('data-aba');
                window.mostrarAba(abaId);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        });
    };

    configurarListenersAba('[data-aba]');
    configurarListenersAba('#dropdownMenu [data-aba]');

    // Menu do usuário dropdown
    const userMenuButton = document.getElementById('userMenuButton');
    const dropdownMenu = document.getElementById('dropdownMenu');
    
    if (userMenuButton && dropdownMenu) {
        userMenuButton.addEventListener('click', function(e) {
            e.stopPropagation();
            dropdownMenu.classList.toggle('show');
            document.getElementById('mainNav')?.classList.remove('active');
        });
    }

    // Menu mobile
    const mobileMenuButton = document.getElementById('mobileMenuButton');
    const mainNav = document.getElementById('mainNav');
    
    if (mobileMenuButton && mainNav) {
        mobileMenuButton.addEventListener('click', function(e) {
            e.stopPropagation();
            mainNav.classList.toggle('active');
            dropdownMenu?.classList.remove('show');
        });
    }

    // Fechar menus quando clicar fora
    document.addEventListener('click', () => {
        dropdownMenu?.classList.remove('show');
        mainNav?.classList.remove('active');
    });

    // Upload de foto de perfil
    document.getElementById('alterarFotoBtn')?.addEventListener('click', function(e) {
        e.preventDefault();
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        
        input.onchange = function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    const fotoPerfil = document.getElementById('user-photo');
                    const userCircle = document.querySelector('.user-circle');
                    
                    if (fotoPerfil) fotoPerfil.src = event.target.result;
                    
                    const usuario = JSON.parse(localStorage.getItem('usuarioLogado')) || {};
                    usuario.foto = event.target.result;
                    localStorage.setItem('usuarioLogado', JSON.stringify(usuario));
                    
                    if (userCircle) {
                        userCircle.textContent = '';
                        userCircle.style.backgroundImage = `url(${event.target.result})`;
                        userCircle.style.backgroundSize = 'cover';
                    }
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    });

    // Configurações de tema
    const configForm = document.getElementById('configForm');
    if (configForm) {
        configForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const tema = document.getElementById('tema').value;
            
            const usuario = JSON.parse(localStorage.getItem('usuarioLogado')) || {};
            usuario.configuracoes = { tema };
            localStorage.setItem('usuarioLogado', JSON.stringify(usuario));
            
            aplicarTema(tema);
            alert('Configuração de tema salva com sucesso!');
        });
    }

    // Carrega configurações salvas
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado')) || {};
    if (usuarioLogado.configuracoes && document.getElementById('tema')) {
        document.getElementById('tema').value = usuarioLogado.configuracoes.tema || 'claro';
        aplicarTema(usuarioLogado.configuracoes.tema);
    } else {
        aplicarTema('claro');
    }

    // Carrega usuário logado
    carregarUsuarioLogado();
    
    // Mostra a aba padrão
    mostrarAba('inicio');

    // Configura busca de receitas
    document.getElementById('buscar-receitas')?.addEventListener('click', function(e) {
        e.preventDefault();
        carregarReceitas();
    });

    // Configura o botão de definir metas
    document.getElementById('btn-definir-metas')?.addEventListener('click', function() {
        mostrarAba('central');
        document.getElementById('metaGuide').style.display = 'block';
        // O elemento 'metaContent' não existe no HTML atual, então esta linha é redundante.
        // document.getElementById('metaContent').style.display = 'none'; 
        window.scrollTo({ top: document.getElementById('metaGuide').offsetTop, behavior: 'smooth' });
    });

    // Inicializa os gráficos se existirem
    if (document.getElementById('imcChart')) initIMCChart();
    if (document.getElementById('rcqChart')) initRCQChart();
});

// Função para carregar usuário logado
function carregarUsuarioLogado() {
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado')) || {};
    const userCircle = document.querySelector('.user-circle');
    
    if (usuarioLogado.foto) {
        const fotoPerfil = document.getElementById('user-photo');
        if (fotoPerfil) fotoPerfil.src = usuarioLogado.foto;
        
        if (userCircle) {
            userCircle.style.backgroundImage = `url(${usuarioLogado.foto})`;
            userCircle.style.backgroundSize = 'cover';
            userCircle.style.backgroundPosition = 'center';
            userCircle.querySelector('span').textContent = '';
        }
    } else if (userCircle) {
        userCircle.textContent = usuarioLogado.nome ? usuarioLogado.nome.charAt(0).toUpperCase() : 'U';
    }

    // Atualiza informações do usuário
    const atualizarElemento = (id, valor, padrao) => {
        if (document.getElementById(id)) {
            document.getElementById(id).textContent = valor || padrao;
        }
    };

    atualizarElemento('user-name', usuarioLogado.nome, 'Usuário Exemplo');
    atualizarElemento('user-email', usuarioLogado.email, 'usuario@exemplo.com');
    atualizarElemento('user-welcome', usuarioLogado.nome, 'Usuário');

    if (document.getElementById('user-join-date')) {
        const joinDate = usuarioLogado.dataCadastro 
            ? new Date(usuarioLogado.dataCadastro).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) 
            : 'Janeiro 2023';
        document.getElementById('user-join-date').textContent = joinDate;
    }
}

// Função para aplicar tema
function aplicarTema(tema) {
    document.body.classList.remove('dark-theme', 'light-theme');
    
    if (tema === 'auto') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.body.classList.toggle('dark-theme', prefersDark);
    } else {
        document.body.classList.toggle('dark-theme', tema === 'escuro');
    }
    
    // Atualiza variáveis CSS
    const root = document.documentElement;
    if (document.body.classList.contains('dark-theme')) {
        root.style.setProperty('--text-dark', '#f0f0f0');
        root.style.setProperty('--bg-light', '#121212');
        root.style.setProperty('--primary-gradient', 'linear-gradient(135deg, #6a9eff, #0b7dba)');
    } else {
        root.style.setProperty('--text-dark', '#2d3748');
        root.style.setProperty('--bg-light', '#f8fafc');
        root.style.setProperty('--primary-gradient', 'linear-gradient(135deg, #1647d7, #0b7dba)');
    }
}

// Funções de gráficos
function initIMCChart() {
    const ctx = document.getElementById('imcChart').getContext('2d');
    window.imcChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Seu IMC'],
            datasets: [{
                label: 'IMC',
                backgroundColor: '#4CAF50',
                borderColor: '#4CAF50',
                borderWidth: 1,
                data: [0]
            }]
        },
        options: {
            responsive: true,
            scales: { y: { beginAtZero: true, max: 40 } },
            plugins: {
                legend: { display: false },
                title: { display: true, text: 'Índice de Massa Corporal (IMC)' }
            }
        }
    });
}

function initRCQChart() {
    const ctx = document.getElementById('rcqChart').getContext('2d');
    window.rcqChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Seu RCQ'],
            datasets: [{
                label: 'RCQ',
                backgroundColor: '#2196F3',
                borderColor: '#2196F3',
                borderWidth: 1,
                data: [0]
            }]
        },
        options: {
            responsive: true,
            scales: { y: { beginAtZero: true, max: 1.2 } },
            plugins: {
                legend: { display: false },
                title: { display: true, text: 'Relação Cintura-Quadril (RCQ)' }
            }
        }
    });
}

// Funções para atualizar gráficos
function atualizarIMCChart(imc) {
    if (!window.imcChart) initIMCChart();
    
    const coresIMC = [
        { limite: 18.5, cor: '#2196F3' },
        { limite: 25, cor: '#4CAF50' },
        { limite: 30, cor: '#FFC107' },
        { limite: Infinity, cor: '#F44336' }
    ];
    
    const cor = coresIMC.find(r => imc < r.limite).cor;
    
    window.imcChart.data.datasets[0].data = [imc];
    window.imcChart.data.datasets[0].backgroundColor = cor;
    window.imcChart.update();
}

function atualizarRCQChart(rcq, sexo) {
    if (!window.rcqChart) initRCQChart();
    
    const limiteRCQ = sexo === 'masculino' ? 0.95 : 0.85;
    const cor = rcq > limiteRCQ ? '#F44336' : '#4CAF50';
    
    window.rcqChart.data.datasets[0].data = [rcq];
    window.rcqChart.data.datasets[0].backgroundColor = cor;
    window.rcqChart.update();
}

// Função para carregar receitas
function carregarReceitas() {
    const receitasContainer = document.getElementById('receitas-container');
    if (!receitasContainer) return;
    
    const receitas = [
        {
            "nome": "Salada Colorida com Grão-de-Bico",
            "imagem": "https://www.receiteria.com.br/wp-content/uploads/salada-com-grao-de-bico-730x548.jpeg",
            "tempo": "20",
            "calorias": "220",
            "dificuldade": "facil",
            "objetivo": "manutencao",
            "link": "https://www.receiteria.com.br/receita/salada-com-grao-de-bico/"
        },
        {
            "nome": "Salada Colorida com Grão-de-Bico",
            "imagem": "https://www.receiteria.com.br/wp-content/uploads/salada-com-grao-de-bico-730x548.jpeg",
            "tempo": "20",
            "calorias": "220",
            "dificuldade": "facil",
            "objetivo": "manutencao",
            "link": "https://www.receiteria.com.br/receita/salada-com-grao-de-bico/"
        },
        {
            "nome": "Salada Colorida com Grão-de-Bico",
            "imagem": "https://www.receiteria.com.br/wp-content/uploads/salada-com-grao-de-bico-730x548.jpeg",
            "tempo": "20",
            "calorias": "220",
            "dificuldade": "facil",
            "objetivo": "manutencao",
            "link": "https://www.receiteria.com.br/receita/salada-com-grao-de-bico/"
        },
        {
            "nome": "Tapioca com Queijo Branco",
            "imagem": "https://www.receiteria.com.br/wp-content/uploads/tapioca-com-queijo-branco-730x548.jpeg",
            "tempo": "10",
            "calorias": "260",
            "dificuldade": "facil",
            "objetivo": "manutencao",
            "link": "https://www.receiteria.com.br/receita/tapioca-com-queijo-branco/"
        },
        {
            "nome": "Sopa de Abóbora com Gengibre",
            "imagem": "https://www.receiteria.com.br/wp-content/uploads/sopa-de-abobora-com-gengibre-730x548.jpeg",
            "tempo": "30",
            "calorias": "180",
            "dificuldade": "medio",
            "objetivo": "perda",
            "link": "https://www.receiteria.com.br/receita/sopa-de-abobora-com-gengibre/"
        },
        {
            "nome": "Salada Colorida com Grão-de-Bico",
            "imagem": "https://www.receiteria.com.br/wp-content/uploads/salada-com-grao-de-bico-730x548.jpeg",
            "tempo": "20",
            "calorias": "220",
            "dificuldade": "facil",
            "objetivo": "manutencao",
            "link": "https://www.receiteria.com.br/receita/salada-com-grao-de-bico/"
        },
        {
            "nome": "Panqueca de Banana Fit",
            "imagem": "https://www.receiteria.com.br/wp-content/uploads/panqueca-de-banana-fit-730x548.jpeg",
            "tempo": "10",
            "calorias": "210",
            "dificuldade": "facil",
            "objetivo": "perda",
            "link": "https://www.receiteria.com.br/receita/panqueca-de-banana-fit/"
        },
        {
            "nome": "Omelete de Espinafre",
            "imagem": "https://www.receiteria.com.br/wp-content/uploads/omelete-de-espinafre-730x548.jpeg",
            "tempo": "15",
            "calorias": "150",
            "dificuldade": "facil",
            "objetivo": "manutencao",
            "link": "https://www.receiteria.com.br/receita/omelete-de-espinafre/"
        },
        {
            "nome": "Salada Colorida com Grão-de-Bico",
            "imagem": "https://www.receiteria.com.br/wp-content/uploads/salada-com-grao-de-bico-730x548.jpeg",
            "tempo": "20",
            "calorias": "220",
            "dificuldade": "facil",
            "objetivo": "manutencao",
            "link": "https://www.receiteria.com.br/receita/salada-com-grao-de-bico/"
        },
        {
            "nome": "Tapioca com Queijo Branco",
            "imagem": "https://www.receiteria.com.br/wp-content/uploads/tapioca-com-queijo-branco-730x548.jpeg",
            "tempo": "10",
            "calorias": "260",
            "dificuldade": "facil",
            "objetivo": "manutencao",
            "link": "https://www.receiteria.com.br/receita/tapioca-com-queijo-branco/"
        },
        {
            "nome": "Panqueca de Banana Fit",
            "imagem": "https://www.receiteria.com.br/wp-content/uploads/panqueca-de-banana-fit-730x548.jpeg",
            "tempo": "10",
            "calorias": "210",
            "dificuldade": "facil",
            "objetivo": "perda",
            "link": "https://www.receiteria.com.br/receita/panqueca-de-banana-fit/"
        },
        {
            "nome": "Omelete de Espinafre",
            "imagem": "https://www.receiteria.com.br/wp-content/uploads/omelete-de-espinafre-730x548.jpeg",
            "tempo": "15",
            "calorias": "150",
            "dificuldade": "facil",
            "objetivo": "manutencao",
            "link": "https://www.receiteria.com.br/receita/omelete-de-espinafre/"
        },
        {
            "nome": "Panqueca de Banana Fit",
            "imagem": "https://www.receiteria.com.br/wp-content/uploads/panqueca-de-banana-fit-730x548.jpeg",
            "tempo": "10",
            "calorias": "210",
            "dificuldade": "facil",
            "objetivo": "perda",
            "link": "https://www.receiteria.com.br/receita/panqueca-de-banana-fit/"
        },
        {
            "nome": "Salada Colorida com Grão-de-Bico",
            "imagem": "https://www.receiteria.com.br/wp-content/uploads/salada-com-grao-de-bico-730x548.jpeg",
            "tempo": "20",
            "calorias": "220",
            "dificuldade": "facil",
            "objetivo": "manutencao",
            "link": "https://www.receiteria.com.br/receita/salada-com-grao-de-bico/"
        },
        {
            "nome": "Sopa de Abóbora com Gengibre",
            "imagem": "https://www.receiteria.com.br/wp-content/uploads/sopa-de-abobora-com-gengibre-730x548.jpeg",
            "tempo": "30",
            "calorias": "180",
            "dificuldade": "medio",
            "objetivo": "perda",
            "link": "https://www.receiteria.com.br/receita/sopa-de-abobora-com-gengibre/"
        },
        {
            "nome": "Frango Grelhado com Brócolis",
            "imagem": "https://www.receiteria.com.br/wp-content/uploads/frango-com-brocolis-730x548.jpeg",
            "tempo": "25",
            "calorias": "350",
            "dificuldade": "medio",
            "objetivo": "ganho",
            "link": "https://www.receiteria.com.br/receita/frango-com-brocolis/"
        },
        {
            "nome": "Panqueca de Banana Fit",
            "imagem": "https://www.receiteria.com.br/wp-content/uploads/panqueca-de-banana-fit-730x548.jpeg",
            "tempo": "10",
            "calorias": "210",
            "dificuldade": "facil",
            "objetivo": "perda",
            "link": "https://www.receiteria.com.br/receita/panqueca-de-banana-fit/"
        },
        {
            "nome": "Sopa de Abóbora com Gengibre",
            "imagem": "https://www.receiteria.com.br/wp-content/uploads/sopa-de-abobora-com-gengibre-730x548.jpeg",
            "tempo": "30",
            "calorias": "180",
            "dificuldade": "medio",
            "objetivo": "perda",
            "link": "https://www.receiteria.com.br/receita/sopa-de-abobora-com-gengibre/"
        },
        {
            "nome": "Frango Grelhado com Brócolis",
            "imagem": "https://www.receiteria.com.br/wp-content/uploads/frango-com-brocolis-730x548.jpeg",
            "tempo": "25",
            "calorias": "350",
            "dificuldade": "medio",
            "objetivo": "ganho",
            "link": "https://www.receiteria.com.br/receita/frango-com-brocolis/"
        },
        {
            "nome": "Salada Colorida com Grão-de-Bico",
            "imagem": "https://www.receiteria.com.br/wp-content/uploads/salada-com-grao-de-bico-730x548.jpeg",
            "tempo": "20",
            "calorias": "220",
            "dificuldade": "facil",
            "objetivo": "manutencao",
            "link": "https://www.receiteria.com.br/receita/salada-com-grao-de-bico/"
        },
        {
            "nome": "Tapioca com Queijo Branco",
            "imagem": "https://www.receiteria.com.br/wp-content/uploads/tapioca-com-queijo-branco-730x548.jpeg",
            "tempo": "10",
            "calorias": "260",
            "dificuldade": "facil",
            "objetivo": "manutencao",
            "link": "https://www.receiteria.com.br/receita/tapioca-com-queijo-branco/"
        },
        {
            "nome": "Tapioca com Queijo Branco",
            "imagem": "https://www.receiteria.com.br/wp-content/uploads/tapioca-com-queijo-branco-730x548.jpeg",
            "tempo": "10",
            "calorias": "260",
            "dificuldade": "facil",
            "objetivo": "manutencao",
            "link": "https://www.receiteria.com.br/receita/tapioca-com-queijo-branco/"
        },
        {
            "nome": "Tapioca com Queijo Branco",
            "imagem": "https://www.receiteria.com.br/wp-content/uploads/tapioca-com-queijo-branco-730x548.jpeg",
            "tempo": "10",
            "calorias": "260",
            "dificuldade": "facil",
            "objetivo": "manutencao",
            "link": "https://www.receiteria.com.br/receita/tapioca-com-queijo-branco/"
        },
        {
            "nome": "Omelete de Espinafre",
            "imagem": "https://www.receiteria.com.br/wp-content/uploads/omelete-de-espinafre-730x548.jpeg",
            "tempo": "15",
            "calorias": "150",
            "dificuldade": "facil",
            "objetivo": "manutencao",
            "link": "https://www.receiteria.com.br/receita/omelete-de-espinafre/"
        },
        {
            "nome": "Panqueca de Banana Fit",
            "imagem": "https://www.receiteria.com.br/wp-content/uploads/panqueca-de-banana-fit-730x548.jpeg",
            "tempo": "10",
            "calorias": "210",
            "dificuldade": "facil",
            "objetivo": "perda",
            "link": "https://www.receiteria.com.br/receita/panqueca-de-banana-fit/"
        },
        {
            "nome": "Sopa de Abóbora com Gengibre",
            "imagem": "https://www.receiteria.com.br/wp-content/uploads/sopa-de-abobora-com-gengibre-730x548.jpeg",
            "tempo": "30",
            "calorias": "180",
            "dificuldade": "medio",
            "objetivo": "perda",
            "link": "https://www.receiteria.com.br/receita/sopa-de-abobora-com-gengibre/"
        },
        {
            "nome": "Panqueca de Banana Fit",
            "imagem": "https://www.receiteria.com.br/wp-content/uploads/panqueca-de-banana-fit-730x548.jpeg",
            "tempo": "10",
            "calorias": "210",
            "dificuldade": "facil",
            "objetivo": "perda",
            "link": "https://www.receiteria.com.br/receita/panqueca-de-banana-fit/"
        },
        {
            "nome": "Frango Grelhado com Brócolis",
            "imagem": "https://www.receiteria.com.br/wp-content/uploads/frango-com-brocolis-730x548.jpeg",
            "tempo": "25",
            "calorias": "350",
            "dificuldade": "medio",
            "objetivo": "ganho",
            "link": "https://www.receiteria.com.br/receita/frango-com-brocolis/"
        },
        {
            "nome": "Salada Colorida com Grão-de-Bico",
            "imagem": "https://www.receiteria.com.br/wp-content/uploads/salada-com-grao-de-bico-730x548.jpeg",
            "tempo": "20",
            "calorias": "220",
            "dificuldade": "facil",
            "objetivo": "manutencao",
            "link": "https://www.receiteria.com.br/receita/salada-com-grao-de-bico/"
        },
        {
            "nome": "Panqueca de Banana Fit",
            "imagem": "https://www.receiteria.com.br/wp-content/uploads/panqueca-de-banana-fit-730x548.jpeg",
            "tempo": "10",
            "calorias": "210",
            "dificuldade": "facil",
            "objetivo": "perda",
            "link": "https://www.receiteria.com.br/receita/panqueca-de-banana-fit/"
        },
        {
            "nome": "Panqueca de Banana Fit",
            "imagem": "https://www.receiteria.com.br/wp-content/uploads/panqueca-de-banana-fit-730x548.jpeg",
            "tempo": "10",
            "calorias": "210",
            "dificuldade": "facil",
            "objetivo": "perda",
            "link": "https://www.receiteria.com.br/receita/panqueca-de-banana-fit/"
        },
        {
            "nome": "Panqueca de Banana Fit",
            "imagem": "https://www.receiteria.com.br/wp-content/uploads/panqueca-de-banana-fit-730x548.jpeg",
            "tempo": "10",
            "calorias": "210",
            "dificuldade": "facil",
            "objetivo": "perda",
            "link": "https://www.receiteria.com.br/receita/panqueca-de-banana-fit/"
        },
        {
            "nome": "Tapioca com Queijo Branco",
            "imagem": "https://www.receiteria.com.br/wp-content/uploads/tapioca-com-queijo-branco-730x548.jpeg",
            "tempo": "10",
            "calorias": "260",
            "dificuldade": "facil",
            "objetivo": "manutencao",
            "link": "https://www.receiteria.com.br/receita/tapioca-com-queijo-branco/"
        },
        {
            "nome": "Omelete de Espinafre",
            "imagem": "https://www.receiteria.com.br/wp-content/uploads/omelete-de-espinafre-730x548.jpeg",
            "tempo": "15",
            "calorias": "150",
            "dificuldade": "facil",
            "objetivo": "manutencao",
            "link": "https://www.receiteria.com.br/receita/omelete-de-espinafre/"
        },
        {
            "nome": "Frango Grelhado com Brócolis",
            "imagem": "https://www.receiteria.com.br/wp-content/uploads/frango-com-brocolis-730x548.jpeg",
            "tempo": "25",
            "calorias": "350",
            "dificuldade": "medio",
            "objetivo": "ganho",
            "link": "https://www.receiteria.com.br/receita/frango-com-brocolis/"
        },
        {
            "nome": "Sopa de Abóbora com Gengibre",
            "imagem": "https://www.receiteria.com.br/wp-content/uploads/sopa-de-abobora-com-gengibre-730x548.jpeg",
            "tempo": "30",
            "calorias": "180",
            "dificuldade": "medio",
            "objetivo": "perda",
            "link": "https://www.receiteria.com.br/receita/sopa-de-abobora-com-gengibre/"
        },
        {
            "nome": "Salada Colorida com Grão-de-Bico",
            "imagem": "https://www.receiteria.com.br/wp-content/uploads/salada-com-grao-de-bico-730x548.jpeg",
            "tempo": "20",
            "calorias": "220",
            "dificuldade": "facil",
            "objetivo": "manutencao",
            "link": "https://www.receiteria.com.br/receita/salada-com-grao-de-bico/"
        },
        {
            "nome": "Sopa de Abóbora com Gengibre",
            "imagem": "https://www.receiteria.com.br/wp-content/uploads/sopa-de-abobora-com-gengibre-730x548.jpeg",
            "tempo": "30",
            "calorias": "180",
            "dificuldade": "medio",
            "objetivo": "perda",
            "link": "https://www.receiteria.com.br/receita/sopa-de-abobora-com-gengibre/"
        },
        {
            "nome": "Frango Grelhado com Brócolis",
            "imagem": "https://www.receiteria.com.br/wp-content/uploads/frango-com-brocolis-730x548.jpeg",
            "tempo": "25",
            "calorias": "350",
            "dificuldade": "medio",
            "objetivo": "ganho",
            "link": "https://www.receiteria.com.br/receita/frango-com-brocolis/"
        },
        {
            "nome": "Frango Grelhado com Brócolis",
            "imagem": "https://www.receiteria.com.br/wp-content/uploads/frango-com-brocolis-730x548.jpeg",
            "tempo": "25",
            "calorias": "350",
            "dificuldade": "medio",
            "objetivo": "ganho",
            "link": "https://www.receiteria.com.br/receita/frango-com-brocolis/"
        },
        {
            "nome": "Panqueca de Banana Fit",
            "imagem": "https://www.receiteria.com.br/wp-content/uploads/panqueca-de-banana-fit-730x548.jpeg",
            "tempo": "10",
            "calorias": "210",
            "dificuldade": "facil",
            "objetivo": "perda",
            "link": "https://www.receiteria.com.br/receita/panqueca-de-banana-fit/"
        },
        {
            "nome": "Salada Colorida com Grão-de-Bico",
            "imagem": "https://www.receiteria.com.br/wp-content/uploads/salada-com-grao-de-bico-730x548.jpeg",
            "tempo": "20",
            "calorias": "220",
            "dificuldade": "facil",
            "objetivo": "manutencao",
            "link": "https://www.receiteria.com.br/receita/salada-com-grao-de-bico/"
        },
        {
            "nome": "Frango Grelhado com Brócolis",
            "imagem": "https://www.receiteria.com.br/wp-content/uploads/frango-com-brocolis-730x548.jpeg",
            "tempo": "25",
            "calorias": "350",
            "dificuldade": "medio",
            "objetivo": "ganho",
            "link": "https://www.receiteria.com.br/receita/frango-com-brocolis/"
        },
        {
            "nome": "Omelete de Espinafre",
            "imagem": "https://www.receiteria.com.br/wp-content/uploads/omelete-de-espinafre-730x548.jpeg",
            "tempo": "15",
            "calorias": "150",
            "dificuldade": "facil",
            "objetivo": "manutencao",
            "link": "https://www.receiteria.com.br/receita/omelete-de-espinafre/"
        },
        {
            "nome": "Salada Colorida com Grão-de-Bico",
            "imagem": "https://www.receiteria.com.br/wp-content/uploads/salada-com-grao-de-bico-730x548.jpeg",
            "tempo": "20",
            "calorias": "220",
            "dificuldade": "facil",
            "objetivo": "manutencao",
            "link": "https://www.receiteria.com.br/receita/salada-com-grao-de-bico/"
        },
        {
            "nome": "Tapioca com Queijo Branco",
            "imagem": "https://www.receiteria.com.br/wp-content/uploads/tapioca-com-queijo-branco-730x548.jpeg",
            "tempo": "10",
            "calorias": "260",
            "dificuldade": "facil",
            "objetivo": "manutencao",
            "link": "https://www.receiteria.com.br/receita/tapioca-com-queijo-branco/"
        },
        {
            "nome": "Omelete de Espinafre",
            "imagem": "https://www.receiteria.com.br/wp-content/uploads/omelete-de-espinafre-730x548.jpeg",
            "tempo": "15",
            "calorias": "150",
            "dificuldade": "facil",
            "objetivo": "manutencao",
            "link": "https://www.receiteria.com.br/receita/omelete-de-espinafre/"
        },
        {
            "nome": "Salada Colorida com Grão-de-Bico",
            "imagem": "https://www.receiteria.com.br/wp-content/uploads/salada-com-grao-de-bico-730x548.jpeg",
            "tempo": "20",
            "calorias": "220",
            "dificuldade": "facil",
            "objetivo": "manutencao",
            "link": "https://www.receiteria.com.br/receita/salada-com-grao-de-bico/"
        },
        {
            "nome": "Frango Grelhado com Brócolis",
            "imagem": "https://www.receiteria.com.br/wp-content/uploads/frango-com-brocolis-730x548.jpeg",
            "tempo": "25",
            "calorias": "350",
            "dificuldade": "medio",
            "objetivo": "ganho",
            "link": "https://www.receiteria.com.br/receita/frango-com-brocolis/"
        },
        {
            "nome": "Sopa de Abóbora com Gengibre",
            "imagem": "https://www.receiteria.com.br/wp-content/uploads/sopa-de-abobora-com-gengibre-730x548.jpeg",
            "tempo": "30",
            "calorias": "180",
            "dificuldade": "medio",
            "objetivo": "perda",
            "link": "https://www.receiteria.com.br/receita/sopa-de-abobora-com-gengibre/"
        },
        {
            "nome": "Panqueca de Banana Fit",
            "imagem": "https://www.receiteria.com.br/wp-content/uploads/panqueca-de-banana-fit-730x548.jpeg",
            "tempo": "10",
            "calorias": "210",
            "dificuldade": "facil",
            "objetivo": "perda",
            "link": "https://www.receiteria.com.br/receita/panqueca-de-banana-fit/"
        },
        {
            "nome": "Tapioca com Queijo Branco",
            "imagem": "https://www.receiteria.com.br/wp-content/uploads/tapioca-com-queijo-branco-730x548.jpeg",
            "tempo": "10",
            "calorias": "260",
            "dificuldade": "facil",
            "objetivo": "manutencao",
            "link": "https://www.receiteria.com.br/receita/tapioca-com-queijo-branco/"
        },
        {
            "nome": "Sopa de Abóbora com Gengibre",
            "imagem": "https://www.receiteria.com.br/wp-content/uploads/sopa-de-abobora-com-gengibre-730x548.jpeg",
            "tempo": "30",
            "calorias": "180",
            "dificuldade": "medio",
            "objetivo": "perda",
            "link": "https://www.receiteria.com.br/receita/sopa-de-abobora-com-gengibre/"
        },
        {
            "nome": "Frango Grelhado com Brócolis",
            "imagem": "https://www.receiteria.com.br/wp-content/uploads/frango-com-brocolis-730x548.jpeg",
            "tempo": "25",
            "calorias": "350",
            "dificuldade": "medio",
            "objetivo": "ganho",
            "link": "https://www.receiteria.com.br/receita/frango-com-brocolis/"
        },
        {
            "nome": "Sopa de Abóbora com Gengibre",
            "imagem": "https://www.receiteria.com.br/wp-content/uploads/sopa-de-abobora-com-gengibre-730x548.jpeg",
            "tempo": "30",
            "calorias": "180",
            "dificuldade": "medio",
            "objetivo": "perda",
            "link": "https://www.receiteria.com.br/receita/sopa-de-abobora-com-gengibre/"
        },
        {
            "nome": "Frango Grelhado com Brócolis",
            "imagem": "https://www.receiteria.com.br/wp-content/uploads/frango-com-brocolis-730x548.jpeg",
            "tempo": "25",
            "calorias": "350",
            "dificuldade": "medio",
            "objetivo": "ganho",
            "link": "https://www.receiteria.com.br/receita/frango-com-brocolis/"
        },
        {
            "nome": "Sopa de Abóbora com Gengibre",
            "imagem": "https://www.receiteria.com.br/wp-content/uploads/sopa-de-abobora-com-gengibre-730x548.jpeg",
            "tempo": "30",
            "calorias": "180",
            "dificuldade": "medio",
            "objetivo": "perda",
            "link": "https://www.receiteria.com.br/receita/sopa-de-abobora-com-gengibre/"
        },
        {
            "nome": "Salada Colorida com Grão-de-Bico",
            "imagem": "https://www.receiteria.com.br/wp-content/uploads/salada-com-grao-de-bico-730x548.jpeg",
            "tempo": "20",
            "calorias": "220",
            "dificuldade": "facil",
            "objetivo": "manutencao",
            "link": "https://www.receiteria.com.br/receita/salada-com-grao-de-bico/"
        },
        {
            "nome": "Panqueca de Banana Fit",
            "imagem": "https://www.receiteria.com.br/wp-content/uploads/panqueca-de-banana-fit-730x548.jpeg",
            "tempo": "10",
            "calorias": "210",
            "dificuldade": "facil",
            "objetivo": "perda",
            "link": "https://www.receiteria.com.br/receita/panqueca-de-banana-fit/"
        },
        {
            "nome": "Frango Grelhado com Brócolis",
            "imagem": "https://www.receiteria.com.br/wp-content/uploads/frango-com-brocolis-730x548.jpeg",
            "tempo": "25",
            "calorias": "350",
            "dificuldade": "medio",
            "objetivo": "ganho",
            "link": "https://www.receiteria.com.br/receita/frango-com-brocolis/"
        }
    ];
    
    const filtroObjetivo = document.getElementById('filtro-objetivo').value;
    const filtroDificuldade = document.getElementById('filtro-dificuldade').value;
    const filtroTempo = document.getElementById('filtro-tempo').value;
    
    let receitasFiltradas = receitas.filter(r => {
        const passaObjetivo = filtroObjetivo === 'todos' || r.objetivo === filtroObjetivo;
        const passaDificuldade = filtroDificuldade === 'todos' || r.dificuldade === filtroDificuldade;
        
        if (filtroTempo === 'todos') return passaObjetivo && passaDificuldade;
        
        const tempoMin = filtroTempo === 'rapido' ? 0 : filtroTempo === 'medio' ? 15 : 30;
        const tempoMax = filtroTempo === 'rapido' ? 15 : filtroTempo === 'medio' ? 30 : 999;
        const tempoNum = parseInt(r.tempo);
        
        return passaObjetivo && passaDificuldade && tempoNum >= tempoMin && tempoNum <= tempoMax;
    });
    
    receitasContainer.innerHTML = receitasFiltradas.map(receita => `
        <div class="receita-card">
            <img src="${receita.imagem}" alt="${receita.nome}">
            <div class="receita-info">
                <h3>${receita.nome}</h3>
                <p><i class="fas fa-clock"></i> ${receita.tempo}</p>
                <p><i class="fas fa-fire"></i> ${receita.calorias} kcal</p>
                <p><i class="fas fa-signal"></i> ${receita.dificuldade.charAt(0).toUpperCase() + receita.dificuldade.slice(1)}</p>
                <a href="${receita.link}" target="_blank" class="ver-receita">Ver Receita</a>
            </div>
        </div>
    `).join('');
}

// Função para calcular métricas nutricionais
window.calcular = function() {
    const camposObrigatorios = ['peso', 'altura', 'idade'];
    const valores = {};
    
    // Valida campos obrigatórios
    for (const campo of camposOpositorios) { // Erro de digitação: camposOpositorios -> camposObrigatorios
        valores[campo] = parseFloat(document.getElementById(campo).value);
        if (isNaN(valores[campo])) {
            alert(`Por favor, insira um valor válido para ${campo}`);
            return;
        }
    }
    
    const { peso, altura, idade } = valores;
    const sexo = document.getElementById("sexo").value;
    const nivelAtividade = document.getElementById("nivelAtividade").value;
    const cintura = parseFloat(document.getElementById("circunferencia-cintura").value) || 0;
    const quadril = parseFloat(document.getElementById("circunferencia-quadril").value) || 0;
    const percentualGordura = parseFloat(document.getElementById("percentual-gordura").value) || 0;

    // Cálculo do IMC
    const imc = peso / ((altura / 100) * (altura / 100)); // Altura em metros
    // const statusIMC = [ ... ].find(r => imc < r.limite).status; // Não usado para exibição direta

    // Cálculo da TMB e GCD
    const tmb = sexo === "masculino" 
        ? 10 * peso + 6.25 * altura - 5 * idade + 5 
        : 10 * peso + 6.25 * altura - 5 * idade - 161;
    
    const multiplicadores = {
        sedentario: 1.2,
        leve: 1.375,
        moderado: 1.55,
        intenso: 1.725
    };
    const gcd = tmb * multiplicadores[nivelAtatividade]; // Erro de digitação: nivelAtatividade -> nivelAtividade

    // Cálculo do consumo de água
    const agua = peso * 0.035;

    // Cálculo do RCQ
    let rcq = "";
    // O elemento 'rcq' não existe no HTML atual, então esta linha é redundante.
    // if (cintura > 0 && quadril > 0) {
    //     rcq = (cintura / quadril).toFixed(2);
    //     const rcqLimite = sexo === "masculino" ? 0.95 : 0.85;
    //     const rcqStatus = rcq > rcqLimite 
    //         ? "Risco aumentado para doenças cardiovasculares" 
    //         : "Normal";
    //     document.getElementById("rcq").textContent = `Relação Cintura-Quadril (RCQ): ${rcq} (${rcqStatus})`;
    // }

    // Cálculo de massa magra e gorda
    // Os elementos 'massa-magra' e 'massa-gorda' não existem no HTML atual, então estas linhas são redundantes.
    // if (percentualGordura > 0) {
    //     const massaGorda = (peso * percentualGordura / 100).toFixed(2);
    //     const massaMagra = (peso - massaGorda).toFixed(2);
    //     document.getElementById("massa-magra").textContent = `Massa Magra: ${massaMagra} kg`;
    //     document.getElementById("massa-gorda").textContent = `Massa Gorda: ${massaGorda} kg`;
    // }

    // Atualiza a interface
    document.getElementById("metrica-imc").textContent = imc.toFixed(2);
    document.getElementById("metrica-tmb").textContent = tmb.toFixed(2);
    document.getElementById("metrica-gcd").textContent = gcd.toFixed(2);
    document.getElementById("metrica-agua").textContent = agua.toFixed(2);
    
    // Mostra os resultados
    document.getElementById("resultados").style.display = "block";

    // Salva o GCD para usar na central de metas
    const usuario = JSON.parse(localStorage.getItem('usuarioLogado')) || {};
    usuario.ultimoGCD = gcd;
    localStorage.setItem('usuarioLogado', JSON.stringify(usuario));

    // Atualiza gráficos
    atualizarIMCChart(imc);
    if (rcq) atualizarRCQChart(parseFloat(rcq), sexo);
    // A função 'atualizarDashboard' não é mais necessária, pois os elementos do dashboard foram removidos do HTML.
    // atualizarDashboard(imc, rcq, agua, peso, sexo);
};

// Função para salvar dados
window.salvarDados = function() {
    const dadosUsuario = {
        peso: document.getElementById("peso").value,
        altura: document.getElementById("altura").value,
        idade: document.getElementById("idade").value,
        sexo: document.getElementById("sexo").value,
        nivelAtividade: document.getElementById("nivelAtividade").value,
        cintura: document.getElementById("circunferencia-cintura").value || null,
        quadril: document.getElementById("circunferencia-quadril").value || null,
        percentualGordura: document.getElementById("percentual-gordura").value || null,
        data: new Date().toISOString()
    };
    
    let historico = JSON.parse(localStorage.getItem('historicoNutricional')) || [];
    historico.push(dadosUsuario);
    localStorage.setItem('historicoNutricional', JSON.stringify(historico));
    
    alert('Dados salvos com sucesso!');
};

// Atualize a função inicializarCentralMetas
window.inicializarCentralMetas = function() {
    const usuario = JSON.parse(localStorage.getItem('usuarioLogado')) || {};
    
    // Se não tem GCD calculado, redireciona para nutrição
    if (!usuario.ultimoGCD) {
        document.getElementById('metaGuide').innerHTML = `
            <div class="meta-guide">
                <h3>Complete seus dados nutricionais primeiro</h3>
                <p>Para definir metas precisas, precisamos calcular suas necessidades nutricionais básicas.</p>
                <button class="cta-button" onclick="window.mostrarAba('nutricao')">
                    Ir para Nutrição
                </button>
            </div>
        `;
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

// Adicione esta função para mostrar a meta atual
function mostrarMetaAtual(meta) {
    atualizarTabelaMacros(meta.calorias, meta.proteina, meta.carbo, meta.gordura, meta);
    atualizarResumoNutricional(meta.calorias, meta.proteina, meta.carbo, meta.gordura);
    atualizarDistribuicaoRefeicoes(meta.calorias);
}

// Atualize a função atualizarResumoNutricional
function atualizarResumoNutricional(calorias, proteinaG, carboG, gorduraG) {
    const elementos = {
        'meta-calorias': calorias + ' kcal',
        'meta-proteina': proteinaG + 'g',
        'meta-carbo': carboG + 'g',
        'meta-gordura': gorduraG + 'g'
    };

    for (const [id, valor] of Object.entries(elementos)) {
        const elemento = document.getElementById(id);
        if (elemento) elemento.textContent = valor;
    }
}

// Atualize a função atualizarDistribuicaoRefeicoes
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
        if (detalhes) {
            detalhes.innerHTML = `<span>0/${calorias} kcal</span><span>0%</span>`;
        }
    });
}

// Atualize a função inicializarAcompanhamentoDiario
function inicializarAcompanhamentoDiario() {
    const hoje = new Date().toISOString().split('T')[0];
    const diario = JSON.parse(localStorage.getItem('diarioNutricional')) || {};
    
    if (diario[hoje]) {
        atualizarTrackerDiario(diario[hoje]);
    } else {
        // Inicializa com valores zerados
        atualizarTrackerDiario({
            proteina: 0,
            carbo: 0,
            gordura: 0,
            calorias: 0
        });
    }
}

// Adicione esta função para salvar dados diários
function salvarConsumoDiario() {
    const hoje = new Date().toISOString().split('T')[0];
    const diario = JSON.parse(localStorage.getItem('diarioNutricional')) || {};
    
    diario[hoje] = {
        proteina: parseInt(document.querySelector('.tracker-item.protein .tracker-value').textContent) || 0,
        carbo: parseInt(document.querySelector('.tracker-item.carbs .tracker-value').textContent) || 0,
        gordura: parseInt(document.querySelector('.tracker-item.fat .tracker-value').textContent) || 0,
        calorias: parseInt(document.querySelector('.calories-value').textContent) || 0,
        data: new Date().toISOString()
    };
    
    localStorage.setItem('diarioNutricional', JSON.stringify(diario));
    verificarConquistas();
}

// Adicione esta função para verificar conquistas
function verificarConquistas() {
    const diario = JSON.parse(localStorage.getItem('diarioNutricional')) || {};
    const usuario = JSON.parse(localStorage.getItem('usuarioLogado')) || {};
    
    // Verifica meta diária
    if (usuario.meta) {
        const hoje = new Date().toISOString().split('T')[0];
        const consumoHoje = diario[hoje];
        
        if (consumoHoje && Math.abs(consumoHoje.calorias - usuario.meta.calorias) < 50) {
            desbloquearConquista('meta-diaria');
        }
    }
    
    // Verifica semana saudável (7 dias seguidos atingindo meta)
    const datas = Object.keys(diario).sort();
    let diasConsecutivos = 0;
    
    for (const data of datas) {
        if (diario[data].calorias >= usuario.meta?.calorias * 0.9 && 
            diario[data].calorias <= usuario.meta?.calorias * 1.1) {
            diasConsecutivos++;
            if (diasConsecutivos >= 7) {
                desbloquearConquista('semana-saudavel');
                break;
            }
        } else {
            diasConsecutivos = 0;
        }
    }
    
    // Verifica mestre da nutrição (todas conquistas)
    if (usuario.conquistas?.length >= 3) {
        desbloquearConquista('mestre-nutricao');
    }
}

function definirMeta(objetivo) {
    const usuario = JSON.parse(localStorage.getItem('usuarioLogado')) || {};
    const gcd = usuario.ultimoGCD || 2000;
    
    // Configurações baseadas no objetivo
    const config = {
        perda: { 
            deficit: 20, 
            proteina: 30, 
            carbo: 40, 
            gordura: 30,
            descricao: "Déficit calórico para perda de peso saudável"
        },
        manutencao: { 
            deficit: 0, 
            proteina: 25, 
            carbo: 50, 
            gordura: 25,
            descricao: "Manutenção do peso atual"
        },
        ganho: { 
            deficit: -10, 
            proteina: 35, 
            carbo: 45, 
            gordura: 20,
            descricao: "Superávit calórico para ganho muscular"
        }
    }[objetivo] || config.manutencao;

    // Calcula valores finais
    const calorias = Math.round(gcd * (1 - config.deficit/100));
    const proteinaG = Math.round((calorias * config.proteina / 100) / 4);
    const carboG = Math.round((calorias * config.carbo / 100) / 4);
    const gorduraG = Math.round((calorias * config.gordura / 100) / 9);

    // Atualiza a tabela de macros
    document.getElementById('meta-calorias').textContent = calorias;
    document.getElementById('meta-proteina-gramas').textContent = proteinaG + 'g';
    document.getElementById('meta-carbo-gramas').textContent = carboG + 'g';
    document.getElementById('meta-gordura-gramas').textContent = gorduraG + 'g';
    document.getElementById('meta-proteina-percent').textContent = config.proteina + '%';
    document.getElementById('meta-carbo-percent').textContent = config.carbo + '%';
    document.getElementById('meta-gordura-percent').textContent = config.gordura + '%';

    // Atualiza gráfico
    initMacrosChart(config.proteina, config.carbo, config.gordura);

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
    localStorage.setItem('objetivosNutricionais', JSON.stringify([usuario.meta]));

    // Atualiza sugestões
    mostrarSugestoes(objetivo);
}

function calcularMacros(objetivo) {
    const usuario = JSON.parse(localStorage.getItem('usuarioLogado')) || {};
    const gcd = usuario.ultimoGCD || 2000;
    
    const configs = {
        perda: { deficit: 15, proteina: 30, carbo: 40, gordura: 30 },
        ganho: { deficit: -10, proteina: 35, carbo: 45, gordura: 20 },
        manutencao: { deficit: 0, proteina: 25, carbo: 50, gordura: 25 }
    };
    
    const config = configs[objetivo] || configs.manutencao;
    const calorias = Math.round(gcd * (1 - config.deficit/100));
    
    // Atualiza os valores no dashboard
    document.getElementById('meta-calorias').textContent = `${calorias} kcal`;
    
    // Calcula e atualiza os macros em gramas
    const proteinaG = Math.round((calorias * config.proteina / 100) / 4);
    const carboG = Math.round((calorias * config.carbo / 100) / 4);
    const gorduraG = Math.round((calorias * config.gordura / 100) / 9);

    document.getElementById('meta-proteina').textContent = `${proteinaG} g`;
    document.getElementById('meta-carbo').textContent = `${carboG} g`;
    document.getElementById('meta-gordura').textContent = `${gorduraG} g`;

    // Atualiza gráficos
    initMacrosChart(config.proteina, config.carbo, config.gordura);
    // initCaloriasChart(usuario.ultimoGCD || 2000, calorias); // Gráfico de calorias não está no HTML
}

// Funções de gráficos da Central de Metas
function initMacrosChart(proteina, carbo, gordura) {
    const ctx = document.getElementById('macrosChart')?.getContext('2d');
    if (!ctx) return;
    
    if (window.macrosChart) window.macrosChart.destroy();
    
    window.macrosChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Proteína', 'Carboidratos', 'Gorduras'],
            datasets: [{
                data: [proteina, carbo, gordura],
                backgroundColor: ['#4CAF50', '#FFC107', '#F44336']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom' },
                title: { display: true, text: 'Distribuição de Macronutrientes (%)' }
            }
        }
    });
}


function carregarProgresso() {
    const historico = JSON.parse(localStorage.getItem('historicoNutricional')) || [];
   
    
    atualizarGraficoProgresso();
}

function atualizarGraficoProgresso() {
    const historico = (JSON.parse(localStorage.getItem('historicoNutricional')) || [])
        .sort((a, b) => new Date(a.data) - new Date(b.data));
    
    const ctx = document.getElementById('progressoChart')?.getContext('2d');
    if (!ctx) return;
    
    if (window.progressoChart) window.progressoChart.destroy();
    
    window.progressoChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: historico.map(entry => 
                new Date(entry.data).toLocaleDateString('pt-BR', {month: 'short', day: 'numeric'})
            ),
            datasets: [{
                label: 'Peso (kg)',
                data: historico.map(entry => entry.peso),
                borderColor: '#4CAF50',
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: { title: { display: true, text: 'Seu Progresso' } },
            scales: { y: { beginAtZero: false } }
        }
    });
}
// script.js

// Função global para gerenciar abas
window.mostrarAba = function(abaId) {
    document.querySelectorAll('.aba').forEach(aba => aba.classList.remove('ativa'));
    const abaAlvo = document.getElementById(abaId);
    if (abaAlvo) {
        abaAlvo.classList.add('ativa');
        const inicializadores = {
            'central': () => window.inicializarCentralMetas?.(),
            'nutricao': () => {
                window.initIMCChart?.();
                window.initRCQChart?.();
            },
        };
        inicializadores[abaId]?.();
    }
};

// Cálculo Nutricional
window.calcular = function() {
    const peso = parseFloat(document.getElementById("peso").value);
    const altura = parseFloat(document.getElementById("altura").value);
    const idade = parseInt(document.getElementById("idade").value);
    const sexo = document.getElementById("sexo").value;
    const nivelAtividade = document.getElementById("nivelAtividade").value;

    if (!peso || !altura || !idade) {
        alert("Preencha todos os campos obrigatórios.");
        return;
    }

    const imc = peso / ((altura / 100) ** 2);
    const tmb = sexo === "masculino"
        ? 10 * peso + 6.25 * altura - 5 * idade + 5
        : 10 * peso + 6.25 * altura - 5 * idade - 161;
    const mult = { sedentario: 1.2, leve: 1.375, moderado: 1.55, intenso: 1.725 };
    const gcd = tmb * mult[nivelAtividade];
    const agua = peso * 0.035;

    // Exibir resultados
    document.getElementById("metrica-imc").textContent = imc.toFixed(2);
    document.getElementById("metrica-tmb").textContent = tmb.toFixed(0);
    document.getElementById("metrica-gcd").textContent = gcd.toFixed(0);
    document.getElementById("metrica-agua").textContent = agua.toFixed(1);
    document.getElementById("resultados").style.display = "block";

    // Atualizar gráfico
    atualizarIMCChart(imc);

    // Salvar para Central de Metas
    const usuario = JSON.parse(localStorage.getItem('usuarioLogado')) || {};
    usuario.ultimoGCD = gcd;
    usuario.ultimoIMC = imc;
    usuario.ultimaAgua = agua;
    localStorage.setItem('usuarioLogado', JSON.stringify(usuario));
};

function atualizarIMCChart(imc) {
    const ctx = document.getElementById("imcChart").getContext("2d");
    if (window.imcChart) window.imcChart.destroy();
    window.imcChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["Seu IMC"],
            datasets: [{
                label: "IMC",
                data: [imc],
                backgroundColor: ["#4CAF50"]
            }]
        },
        options: {
            responsive: true,
            scales: { y: { beginAtZero: true, max: 40 } }
        }
    });
}
// Adicione estas funções no script.js

// Funções para gráficos nutricionais adicionais
function initBodyFatChart() {
    const ctx = document.getElementById('bodyFatChart').getContext('2d');
    window.bodyFatChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Gordura', 'Massa Magra'],
            datasets: [{
                data: [0, 100],
                backgroundColor: ['#F44336', '#4CAF50']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: { display: true, text: 'Composição Corporal' }
            }
        }
    });
}

function initWaterIntakeChart() {
    const ctx = document.getElementById('waterChart').getContext('2d');
    window.waterChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Água Consumida', 'Meta Diária'],
            datasets: [{
                label: 'ml',
                data: [0, 2000],
                backgroundColor: ['#2196F3', '#BBDEFB']
            }]
        },
        options: {
            responsive: true,
            scales: { y: { beginAtZero: true } },
            plugins: {
                title: { display: true, text: 'Consumo de Água' }
            }
        }
    });
}

// Atualize a função calcular() para incluir novos cálculos
window.calcular = function() {
    // Campos obrigatórios
    const camposObrigatorios = ['peso', 'altura', 'idade'];
    const valores = {};
    
    // Valida campos obrigatórios
    for (const campo of camposObrigatorios) {
        valores[campo] = parseFloat(document.getElementById(campo).value);
        if (isNaN(valores[campo])) {
            alert(`Por favor, insira um valor válido para ${campo}`);
            return;
        }
    }
    
    const { peso, altura, idade } = valores;
    const sexo = document.getElementById("sexo").value;
    const nivelAtividade = document.getElementById("nivelAtividade").value;
    const cintura = parseFloat(document.getElementById("circunferencia-cintura").value) || 0;
    const quadril = parseFloat(document.getElementById("circunferencia-quadril").value) || 0;
    const percentualGordura = parseFloat(document.getElementById("percentual-gordura").value) || 0;

    // Cálculo do IMC
    const imc = peso / ((altura / 100) ** 2);
    
    // Cálculo da TMB (Taxa Metabólica Basal)
    const tmb = sexo === "masculino" 
        ? 10 * peso + 6.25 * altura - 5 * idade + 5 
        : 10 * peso + 6.25 * altura - 5 * idade - 161;
    
    // Cálculo do GCD (Gasto Calórico Diário)
    const multiplicadores = {
        sedentario: 1.2,
        leve: 1.375,
        moderado: 1.55,
        intenso: 1.725
    };
    const gcd = tmb * multiplicadores[nivelAtividade];

    // Cálculo do consumo de água (ml)
    const agua = peso * 35;

    // Cálculo do RCQ (Relação Cintura-Quadril)
    let rcq = 0;
    if (cintura > 0 && quadril > 0) {
        rcq = (cintura / quadril).toFixed(2);
    }

    // Cálculo de massa magra e gorda
    let massaGorda = 0;
    let massaMagra = peso;
    if (percentualGordura > 0) {
        massaGorda = (peso * percentualGordura / 100);
        massaMagra = peso - massaGorda;
    }

    // Atualiza a interface
    document.getElementById("metrica-imc").textContent = imc.toFixed(2);
    document.getElementById("metrica-tmb").textContent = tmb.toFixed(0);
    document.getElementById("metrica-gcd").textContent = gcd.toFixed(0);
    document.getElementById("metrica-agua").textContent = agua.toFixed(0) + " ml";
    document.getElementById("metrica-rcq").textContent = rcq > 0 ? rcq : "-";
    
    // Mostra os resultados
    document.getElementById("resultados").style.display = "block";

    // Salva os dados para usar na central de metas
    const usuario = JSON.parse(localStorage.getItem('usuarioLogado')) || {};
    usuario.ultimoGCD = gcd;
    usuario.ultimoIMC = imc;
    usuario.ultimoRCQ = rcq;
    usuario.ultimaAgua = agua;
    usuario.ultimaMassaMagra = massaMagra;
    usuario.ultimaMassaGorda = massaGorda;
    localStorage.setItem('usuarioLogado', JSON.stringify(usuario));

    // Atualiza gráficos
    atualizarIMCChart(imc);
    if (rcq > 0) atualizarRCQChart(parseFloat(rcq), sexo);
    atualizarBodyFatChart(massaGorda, massaMagra);
    atualizarWaterChart(0, agua); // Assume que ainda não consumiu água
    
    // Se estiver na central de metas, atualiza também
    if (document.getElementById('central').classList.contains('ativa')) {
        window.inicializarCentralMetas?.();
    }
};

// Funções para atualizar os novos gráficos
function atualizarBodyFatChart(gorda, magra) {
    if (!window.bodyFatChart) initBodyFatChart();
    
    window.bodyFatChart.data.datasets[0].data = [gorda, magra];
    window.bodyFatChart.update();
}

function atualizarWaterChart(consumido, meta) {
    if (!window.waterChart) initWaterIntakeChart();
    
    window.waterChart.data.datasets[0].data = [consumido, meta];
    window.waterChart.update();
}

// Modifique a função DOMContentLoaded para inicializar os novos gráficos
document.addEventListener('DOMContentLoaded', function() {
    // ... código existente ...
    
    // Inicializa gráficos adicionais
    if (document.getElementById('bodyFatChart')) initBodyFatChart();
    if (document.getElementById('waterChart')) initWaterIntakeChart();
});
function adicionarConsumo() {
    const alimento = prompt("Qual alimento você consumiu?");
    const calorias = parseInt(prompt("Quantas calorias?"));
    const proteina = parseInt(prompt("Quantos gramas de proteína?"));
    const carbo = parseInt(prompt("Quantos gramas de carboidratos?"));
    const gordura = parseInt(prompt("Quantos gramas de gordura?"));
    
    if (alimento && !isNaN(calorias)) {
        const hoje = new Date().toISOString().split('T')[0];
        const diario = JSON.parse(localStorage.getItem('diarioNutricional')) || {};
        
        if (!diario[hoje]) {
            diario[hoje] = {
                proteina: 0,
                carbo: 0,
                gordura: 0,
                calorias: 0,
                alimentos: []
            };
        }
        
        diario[hoje].proteina += proteina || 0;
        diario[hoje].carbo += carbo || 0;
        diario[hoje].gordura += gordura || 0;
        diario[hoje].calorias += calorias || 0;
        diario[hoje].alimentos.push({
            nome: alimento,
            calorias: calorias || 0,
            proteina: proteina || 0,
            carbo: carbo || 0,
            gordura: gordura || 0
        });
        
        localStorage.setItem('diarioNutricional', JSON.stringify(diario));
        atualizarTrackerDiario(diario[hoje]);
        verificarConquistas();
        alert("Consumo registrado com sucesso!");
    }
}