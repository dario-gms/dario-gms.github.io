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
        // Sempre limpa o código se estiver vazio ou for o exemplo padrão
        if (!code || !code.trim() || code.trim() === "void main() {\n  print('Hello, World!');\n}") {
            code = "";
        }
        
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
        
        const closeModal = () => {
            document.body.removeChild(modal);
        };
        modal.querySelector('.close-modal').addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

        setTimeout(() => { this.loadDartPad(code); }, 100);
        
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
        modal.addEventListener('DOMNodeRemoved', () => {
            document.removeEventListener('keydown', handleEscape);
        });
    }

    loadDartPad(code) {
        // Força a limpeza do código para sempre iniciar limpo
        const cleanCode = code && code.trim() ? code.trim() : "";
        const encodedCode = encodeURIComponent(cleanCode);
        const currentTheme = this.getTheme();
        
        // Adiciona um timestamp para forçar o reload e evitar cache
        const timestamp = Date.now();

        const dartpadHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>DartPad</title>
                <style>
                    body { margin: 0; padding: 0; overflow: hidden; }
                    iframe { width: 100%; height: 100%; border: none; }
                    .loading {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 400px;
                        font-family: 'Inter', sans-serif;
                        background: #f5f5f5;
                    }
                </style>
            </head>
            <body>
                <div id="loading" class="loading">Carregando DartPad...</div>
                <iframe 
                    id="dartpad-iframe"
                    src="https://dartpad.dev/embed-dart.html?theme=${currentTheme}&run=false&split=70&code=${encodedCode}&t=${timestamp}"
                    onload="document.getElementById('loading').style.display = 'none';"
                ></iframe>
            </body>
            </html>
        `;

        const blob = new Blob([dartpadHtml], { type: 'text/html' });
        const url = URL.createObjectURL(blob);

        const dartpadIframe = document.createElement('iframe');
        dartpadIframe.src = url;
        dartpadIframe.style.width = '100%';
        dartpadIframe.style.height = '100%';
        dartpadIframe.style.border = 'none';
        dartpadIframe.style.background = 'transparent';

        const container = document.getElementById('dartpad-container');
        container.innerHTML = '';
        container.appendChild(dartpadIframe);

        // Ajusta a altura do container baseada no conteúdo, não na viewport
        this.adjustContainerHeight();

        const modal = document.querySelector('.execution-modal');
        const observer = new MutationObserver(() => {
            if (!document.body.contains(modal)) {
                URL.revokeObjectURL(url);
                observer.disconnect();
            }
        });
        observer.observe(document.body, { childList: true });
    }

    adjustContainerHeight() {
        const container = document.getElementById('dartpad-container');
        const modalContent = document.querySelector('.execution-modal .modal-content');
        const modalHeader = document.querySelector('.execution-modal .modal-header');

        // Calcula uma altura mais apropriada baseada no conteúdo
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        
        // Define altura mínima e máxima mais apropriadas
        const minHeight = 400;
        const maxHeight = Math.min(viewportHeight * 0.85, 800);
        
        // Ajusta baseado no tamanho da tela
        let height;
        if (viewportWidth < 768) {
            // Mobile
            height = Math.min(viewportHeight * 0.7, 500);
        } else if (viewportWidth < 1200) {
            // Tablet
            height = Math.min(viewportHeight * 0.75, 600);
        } else {
            // Desktop
            height = Math.min(viewportHeight * 0.8, 700);
        }
        
        height = Math.max(height, minHeight);
        height = Math.min(height, maxHeight);

        container.style.height = `${height}px`;
        
        if (modalContent) {
            const headerHeight = modalHeader ? modalHeader.offsetHeight : 60;
            modalContent.style.height = `${height + headerHeight + 20}px`;
            modalContent.style.maxHeight = `${maxHeight + headerHeight + 20}px`;
        }
        
        // Adiciona estilos para melhor responsividade
        const modal = document.querySelector('.execution-modal');
        if (modal) {
            modal.style.padding = viewportWidth < 768 ? '10px' : '20px';
        }
    }

    getTheme() {
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

document.addEventListener('DOMContentLoaded', () => {
    new DartGuideApp();
});
