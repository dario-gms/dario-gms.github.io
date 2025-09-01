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
        // Sempre inicia com código limpo
        const cleanCode = "";
        
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

        // Carrega o DartPad imediatamente com código limpo
        setTimeout(() => { this.loadDartPad(cleanCode); }, 50);
        
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
        // Sempre força código limpo - ignora qualquer código passado
        const cleanCode = "";
        const currentTheme = this.getTheme();
        
        // Adiciona timestamp único para forçar novo carregamento
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(7);

        const dartpadHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>DartPad</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    html, body { height: 100%; overflow: hidden; }
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
                    iframe { 
                        width: 100%; 
                        height: 100%; 
                        border: none; 
                        display: block;
                        background: transparent;
                    }
                    .loading {
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        font-size: 16px;
                        color: #666;
                        z-index: 10;
                    }
                </style>
            </head>
            <body>
                <div id="loading" class="loading">Carregando DartPad...</div>
                <iframe 
                    id="dartpad-iframe"
                    src="https://dartpad.dev/embed-dart.html?theme=${currentTheme}&run=false&split=50&ga_id=embedded&code=&t=${timestamp}&r=${random}"
                    frameborder="0"
                    scrolling="no"
                    onload="document.getElementById('loading').style.display = 'none';"
                ></iframe>
            </body>
            </html>
        `;

        const blob = new Blob([dartpadHtml], { type: 'text/html' });
        const url = URL.createObjectURL(blob);

        const dartpadIframe = document.createElement('iframe');
        dartpadIframe.src = url;
        dartpadIframe.style.cssText = `
            width: 100% !important;
            height: 100% !important;
            border: none !important;
            display: block !important;
            background: transparent;
        `;

        const container = document.getElementById('dartpad-container');
        container.innerHTML = '';
        container.appendChild(dartpadIframe);

        // Ajusta a altura após carregar
        this.adjustContainerHeight();

        // Cleanup quando modal for removido
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
        const modal = document.querySelector('.execution-modal');
        const modalContent = document.querySelector('.execution-modal .modal-content');
        const modalHeader = document.querySelector('.execution-modal .modal-header');

        if (!container || !modal || !modalContent) return;

        // Dimensões da viewport
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        
        // Calcula altura do header
        const headerHeight = modalHeader ? modalHeader.offsetHeight : 70;
        
        // Define altura baseada na viewport, deixando espaço para respirar
        const availableHeight = viewportHeight * 0.85;
        const containerHeight = availableHeight - headerHeight - 40; // 40px para padding
        
        // Define altura mínima e máxima
        const minHeight = Math.min(500, viewportHeight * 0.6);
        const maxHeight = viewportHeight * 0.8 - headerHeight;
        
        const finalHeight = Math.max(minHeight, Math.min(containerHeight, maxHeight));

        // Aplica as dimensões
        container.style.height = `${finalHeight}px`;
        container.style.minHeight = `${minHeight}px`;
        container.style.overflow = 'hidden';
        
        // Ajusta o modal content
        modalContent.style.height = 'auto';
        modalContent.style.maxHeight = `${viewportHeight * 0.9}px`;
        modalContent.style.overflow = 'hidden';
        modalContent.style.display = 'flex';
        modalContent.style.flexDirection = 'column';
        
        // Garante que o modal body ocupe o espaço restante
        const modalBody = document.querySelector('.execution-modal .modal-body');
        if (modalBody) {
            modalBody.style.flex = '1';
            modalBody.style.overflow = 'hidden';
            modalBody.style.padding = '0';
            modalBody.style.height = `${finalHeight}px`;
        }
        
        // Ajusta o modal principal
        modal.style.padding = viewportWidth < 768 ? '5vh 2vw' : '5vh 5vw';
        modal.style.display = 'flex';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
        
        // Força o iframe a ocupar todo o espaço disponível
        const iframe = container.querySelector('iframe');
        if (iframe) {
            iframe.style.cssText = `
                width: 100% !important;
                height: 100% !important;
                border: none !important;
                display: block !important;
                min-height: ${finalHeight}px !important;
            `;
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
