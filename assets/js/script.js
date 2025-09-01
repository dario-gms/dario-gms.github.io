class DartGuideApp {
    constructor() {
        this.chapters = [
            { id: 1, title: "Introdução ao Dart", icon: "play-circle", file: "1-introducao.html" },
            { id: 2, title: "Fundamentos e Sintaxe", icon: "code", file: "2-fundamentos.html" },
            { id: 3, title: "Controle de Fluxo", icon: "random", file: "3-controle.html" },
            { id: 4, title: "Funções", icon: "cogs" },
            { id: 5, title: "Coleções", icon: "list" },
            { id: 6, title: "Orientação a Objetos", icon: "object-group" },
            { id: 7, title: "Null Safety", icon: "exclamation-circle" },
            { id: 8, title: "Exceções", icon: "bug" },
            { id: 9, title: "Programação Assíncrona", icon: "bolt" },
            { id: 10, title: "Pacotes", icon: "box" },
            { id: 11, title: "Testes", icon: "vial" },
            { id: 12, title: "Boas Práticas", icon: "thumbs-up" },
            { id: 13, title: "Projetos Práticos", icon: "laptop-code" },
            { id: 14, title: "Próximos Passos", icon: "flag-checkered" }
        ];
        this.init();
    }

    async init() {
        this.loadSidebar();
        this.setupEventListeners();
        this.loadChapter(1);
    }

    loadSidebar() {
        const sidebar = document.getElementById('sidebar');
        sidebar.innerHTML = `
            <div class="logo">
                <i class="fas fa-code"></i>
                <h1>Guia de Dart</h1>
            </div>
            <div class="chapters">
                ${this.chapters.map(chapter => `
                    <div class="chapter-item" data-chapter="${chapter.id}">
                        <i class="fas fa-${chapter.icon}"></i>
                        <span>${chapter.id}. ${chapter.title}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    setupEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('.chapter-item')) {
                const chapterId = e.target.closest('.chapter-item').dataset.chapter;
                this.loadChapter(chapterId);
            }
        });
    }

    async loadChapter(chapterId) {
        try {
            const chapter = this.chapters.find(c => c.id == chapterId);
            const response = await fetch(`chapters/${chapter.file}`);
            const content = await response.text();
            document.getElementById('content-container').innerHTML = content;
            this.setActiveChapter(chapterId);
            this.initChapterFeatures();
        } catch (error) {
            console.error('Erro ao carregar capítulo:', error);
        }
    }

    setActiveChapter(chapterId) {
        document.querySelectorAll('.chapter-item').forEach(item => {
            item.classList.toggle('active', item.dataset.chapter === chapterId);
        });
    }
    
    initChapterFeatures() {
        this.initDartPads();
        this.initTabs();
        this.initSolutionToggle();
        this.initCopyButtons();
        this.initNavigation();
    }

    initDartPads() {
        document.querySelectorAll('.run-button').forEach(button => {
            button.addEventListener('click', () => {
                const codeBlock = button.closest('.dartpad-container').querySelector('.code-block pre code');
                if (codeBlock) {
                    const code = codeBlock.textContent;
                    this.executeDartCode(code);
                }
            });
        });
    }

    executeDartCode(code) {
        // Verificar se é o código padrão e substituir por um mais limpo
        if (code.trim() === "void main() {\n  print('Hello, World!');\n}") {
            code = "// Cole seu código Dart aqui\nvoid main() {\n  // Seu código aqui\n}";
        }
        
        // Criar o modal para o DartPad
        const modal = document.createElement('div');
        modal.className = 'execution-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Executar Código Dart</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div id="dartpad-container"></div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Fechar o modal
        const closeModal = () => {
            document.body.removeChild(modal);
        };
        
        modal.querySelector('.close-modal').addEventListener('click', closeModal);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
        
        // Carregar o DartPad após o modal estar visível
        setTimeout(() => {
            this.loadDartPad(code);
        }, 100);
        
        // Tecla ESC para fechar o modal
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        
        document.addEventListener('keydown', handleEscape);
        
        // Remover o listener quando o modal for fechado
        modal.addEventListener('DOMNodeRemoved', () => {
            document.removeEventListener('keydown', handleEscape);
        });
    }

    loadDartPad(code) {
        // Remover código padrão se estiver vazio ou conter apenas o exemplo básico
        if (!code || code.trim() === "void main() {\n  print('Hello, World!');\n}") {
            code = "// Cole seu código Dart aqui\nvoid main() {\n  // Seu código aqui\n}";
        }
        
        // Codificar o código para URL
        const encodedCode = encodeURIComponent(code);
        
        // Obter o tema atual
        const currentTheme = this.getTheme();
        
        // Criar o HTML do DartPad
        const dartpadHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>DartPad</title>
                <style>
                    body { 
                        margin: 0; 
                        padding: 0; 
                        overflow: hidden;
                        background-color: ${currentTheme === 'dark' ? '#1e293b' : '#f1f5f9'};
                    }
                    iframe { 
                        width: 100%; 
                        height: 100%; 
                        border: none;
                    }
                    .loading {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100%;
                        color: ${currentTheme === 'dark' ? '#cbd5e1' : '#64748b'};
                        font-family: 'Inter', sans-serif;
                    }
                </style>
            </head>
            <body>
                <div id="loading" class="loading">
                    <div>Carregando DartPad...</div>
                </div>
                <iframe 
                    id="dartpad-iframe"
                    src="https://dartpad.dev/embed-dart.html?theme=${currentTheme}&run=true&split=70&code=${encodedCode}"
                    frameborder="0"
                    allowfullscreen
                    onload="document.getElementById('loading').style.display = 'none';"
                ></iframe>
            </body>
            </html>
        `;
        
        // Criar um blob e URL para o HTML
        const blob = new Blob([dartpadHtml], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        
        // Criar iframe para conter o DartPad
        const dartpadIframe = document.createElement('iframe');
        dartpadIframe.src = url;
        dartpadIframe.style.width = '100%';
        dartpadIframe.style.height = '100%';
        dartpadIframe.style.border = 'none';
        dartpadIframe.style.background = 'transparent';
        
        // Adicionar ao container
        const container = document.getElementById('dartpad-container');
        container.innerHTML = '';
        container.appendChild(dartpadIframe);
        
        // Ajustar altura do container baseado no código
        this.adjustContainerHeight(code);
        
        // Limpar a URL quando o modal for fechado
        const modal = document.querySelector('.execution-modal');
        const observer = new MutationObserver(() => {
            if (!document.body.contains(modal)) {
                URL.revokeObjectURL(url);
                observer.disconnect();
            }
        });
        
        observer.observe(document.body, { childList: true });
    }

    adjustContainerHeight(code) {
        const container = document.getElementById('dartpad-container');
        const lineCount = code.split('\n').length;
        
        // Calcular altura baseada no número de linhas do código
        let height = 400; // altura mínima
        
        if (lineCount > 15) {
            height = Math.min(700, 400 + (lineCount - 15) * 20);
        }
        
        container.style.height = `${height}px`;
        
        // Ajustar também a altura do modal
        const modalContent = document.querySelector('.execution-modal .modal-content');
        if (modalContent) {
            modalContent.style.height = `${height + 60}px`; // 60px para o cabeçalho
        }
    }

    getTheme() {
        // Verificar se o tema escuro está ativo
        return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    }
    
    initTabs() {
        document.querySelectorAll('.tab-header').forEach(header => {
            header.addEventListener('click', () => {
                const tabName = header.dataset.tab;                
                
                document.querySelectorAll('.tab-header').forEach(h => h.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));                
                
                header.classList.add('active');
                document.querySelector(`[data-tab="${tabName}"].tab-content`).classList.add('active');
            });
        });
    }
    
    initSolutionToggle() {
        const toggleButton = document.querySelector('.solution-toggle');
        const solutionsDiv = document.querySelector('.solutions');
        
        if (toggleButton && solutionsDiv) {
            toggleButton.addEventListener('click', () => {
                const isVisible = solutionsDiv.style.display !== 'none';
                solutionsDiv.style.display = isVisible ? 'none' : 'block';
                toggleButton.textContent = isVisible ? 'Ver Gabarito dos Exercícios' : 'Ocultar Gabarito';
            });
        }
    }
    
    initCopyButtons() {
        document.querySelectorAll('.copy-button').forEach(button => {
            button.addEventListener('click', async () => {
                const codeBlock = button.closest('.dartpad-container').querySelector('.code-block pre code');
                if (codeBlock) {
                    const code = codeBlock.textContent;
                    
                    try {
                        await navigator.clipboard.writeText(code);                        
                        
                        const originalText = button.innerHTML;
                        button.innerHTML = '<i class="fas fa-check"></i> Copiado!';
                        button.style.background = 'rgba(52, 168, 83, 0.3)';
                        
                        setTimeout(() => {
                            button.innerHTML = originalText;
                            button.style.background = '';
                        }, 2000);
                        
                    } catch (err) {
                        console.error('Erro ao copiar código:', err);                        
                        
                        const textArea = document.createElement('textarea');
                        textArea.value = code;
                        document.body.appendChild(textArea);
                        textArea.select();
                        document.execCommand('copy');
                        document.body.removeChild(textArea);
                        
                        button.innerHTML = '<i class="fas fa-check"></i> Copiado!';
                        setTimeout(() => {
                            button.innerHTML = '<i class="fas fa-copy"></i> Copiar';
                        }, 2000);
                    }
                }
            });
        });
    }
    
    initNavigation() {
        const nextButton = document.querySelector('.next-button');
        const prevButton = document.querySelector('.nav-button:not(.next-button)');
        
        if (nextButton) {
            nextButton.addEventListener('click', () => {                
                const currentChapter = parseInt(document.querySelector('.chapter-item.active').dataset.chapter);
                const nextChapter = currentChapter + 1;
                
                if (nextChapter <= this.chapters.length) {
                    this.loadChapter(nextChapter);
                }
            });
        }
        
        if (prevButton && !prevButton.classList.contains('disabled')) {
            prevButton.addEventListener('click', () => {                
                const currentChapter = parseInt(document.querySelector('.chapter-item.active').dataset.chapter);
                const prevChapter = currentChapter - 1;
                
                if (prevChapter >= 1) {
                    this.loadChapter(prevChapter);
                }
            });
        }
    }
}

// Inicializar a aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    new DartGuideApp();
});
