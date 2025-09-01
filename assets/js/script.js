class DartPadIntegration {
    constructor() {
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.setupDartPadContainers();
        });

        // Se o DOM já estiver carregado
        if (document.readyState !== 'loading') {
            this.setupDartPadContainers();
        }
    }

    setupDartPadContainers() {
        // Encontrar todos os containers de código Dart
        const codeContainers = document.querySelectorAll('.dartpad-container');
        
        codeContainers.forEach(container => {
            const codeBlock = container.querySelector('.code-block pre code');
            if (!codeBlock) return;
            
            const code = codeBlock.textContent;
            const exampleTitle = container.closest('.example').querySelector('h3').textContent;
            
            // Criar container integrado com DartPad
            const dartpadContainer = this.createDartPadContainer(code, exampleTitle);
            
            // Substituir o container original
            container.parentNode.replaceChild(dartpadContainer, container);
        });
    }

    createDartPadContainer(code, title) {
        const container = document.createElement('div');
        container.className = 'dartpad-integrated-container';
        container.setAttribute('data-code', code);
        
        // Determinar o modo baseado no código (Dart ou Flutter)
        const mode = code.includes('package:flutter') ? 'flutter' : 'dart';
        container.setAttribute('data-mode', mode);
        
        container.innerHTML = `
            <div class="dartpad-integrated-header">
                <h3><i class="fas fa-code"></i> ${title}</h3>
                <div class="dartpad-controls">
                    <div class="dartpad-mode-selector">
                        <button class="mode-btn ${mode === 'dart' ? 'active' : ''}" data-mode="dart">Dart</button>
                        <button class="mode-btn ${mode === 'flutter' ? 'active' : ''}" data-mode="flutter">Flutter</button>
                    </div>
                    <button class="dartpad-btn" onclick="DartPadIntegration.openInNewTab(this)">
                        <i class="fas fa-external-link-alt"></i> Abrir DartPad
                    </button>
                    <button class="dartpad-btn" onclick="DartPadIntegration.refreshDartPad(this)">
                        <i class="fas fa-sync"></i> Atualizar
                    </button>
                </div>
            </div>
            <div class="dartpad-iframe-container">
                <div class="dartpad-loading">
                    <div class="spinner"></div>
                    <p>Carregando DartPad...</p>
                </div>
                <iframe class="dartpad-iframe" style="display: none;"></iframe>
            </div>
        `;
        
        // Carregar o DartPad após um pequeno delay
        setTimeout(() => this.loadDartPad(container), 500);
        
        return container;
    }

    loadDartPad(container) {
        const code = container.getAttribute('data-code');
        const mode = container.getAttribute('data-mode') || 'dart';
        const iframe = container.querySelector('.dartpad-iframe');
        const loading = container.querySelector('.dartpad-loading');

        if (!code || !iframe) return;

        // Codifica o código para URL
        const encodedCode = encodeURIComponent(code);
        
        // Determina a URL base baseada no modo
        let baseUrl = 'https://dartpad.dev/';
        if (mode === 'flutter') {
            baseUrl += 'embed-flutter.html?null_safety=true';
        } else {
            baseUrl += 'embed-dart.html?null_safety=true';
        }

        // URL completa com o código
        const dartpadUrl = `${baseUrl}&id=${this.generateTempId()}&code=${encodedCode}`;

        iframe.onload = () => {
            loading.style.display = 'none';
            iframe.style.display = 'block';
        };

        iframe.onerror = () => {
            this.showFallback(container, code);
        };

        // Carrega o DartPad
        iframe.src = baseUrl;
    }

    showFallback(container, code) {
        const iframeContainer = container.querySelector('.dartpad-iframe-container');
        iframeContainer.innerHTML = `
            <div class="dartpad-fallback">
                <h4><i class="fas fa-exclamation-triangle"></i> DartPad não pôde ser carregado</h4>
                <p>Clique no botão "Abrir DartPad" para executar este código:</p>
                <pre style="text-align: left; background: #f8f9fa; padding: 1rem; border-radius: 4px; overflow-x: auto;"><code>${code}</code></pre>
                <button class="dartpad-btn" onclick="DartPadIntegration.openInNewTab(this)" style="color: var(--warning); border-color: var(--warning);">
                    <i class="fas fa-external-link-alt"></i> Abrir no DartPad
                </button>
            </div>
        `;
    }

    static openInNewTab(button) {
        const container = button.closest('.dartpad-integrated-container');
        const code = container.getAttribute('data-code');
        const mode = container.getAttribute('data-mode') || 'dart';
        
        // Cria URL do DartPad com código
        let url = 'https://dartpad.dev/?null_safety=true';
        if (mode === 'flutter') {
            url += '&theme=dark';
        }
        
        // Abre em nova aba
        const newWindow = window.open(url, '_blank');
        
        // Tenta copiar código para clipboard para facilitar
        if (navigator.clipboard) {
            navigator.clipboard.writeText(code).then(() => {
                console.log('Código copiado para clipboard');
            });
        }
    }

    static refreshDartPad(button) {
        const container = button.closest('.dartpad-integrated-container');
        const loading = container.querySelector('.dartpad-loading');
        const iframe = container.querySelector('.dartpad-iframe');
        
        // Mostra loading
        loading.style.display = 'flex';
        iframe.style.display = 'none';
        
        // Recarrega
        setTimeout(() => {
            const integration = new DartPadIntegration();
            integration.loadDartPad(container);
        }, 500);
    }

    generateTempId() {
        return Math.random().toString(36).substring(2, 15);
    }
}

// Inicializar a integração do DartPad
new DartPadIntegration();

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
        
        console.log('Executando código Dart:', code);        
        
        const modal = document.createElement('div');
        modal.className = 'execution-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Simulação de Execução</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <p>Código a ser executado no DartPad:</p>
                    <pre><code>${code}</code></pre>
                    <p><strong>Dica:</strong> Copie este código e cole no <a href="https://dartpad.dev" target="_blank">DartPad</a> para executar!</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);        
        
        modal.querySelector('.close-modal').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
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

const modalStyles = `
<style>
.execution-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-content {
    background: white;
    border-radius: 8px;
    max-width: 600px;
    width: 90%;
    max-height: 80%;
    overflow-y: auto;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.modal-header {
    background: var(--primary);
    color: white;
    padding: 1rem 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.modal-header h3 {
    margin: 0;
}

.close-modal {
    background: none;
    border: none;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.close-modal:hover {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
}

.modal-body {
    padding: 1.5rem;
}

.modal-body pre {
    background: #f8f9fa;
    padding: 1rem;
    border-radius: 4px;
    border: 1px solid var(--border);
    overflow-x: auto;
}

.modal-body code {
    font-family: 'Courier New', monospace;
    color: var(--dark);
}
</style>
`;

document.addEventListener('DOMContentLoaded', () => {
    document.head.insertAdjacentHTML('beforeend', modalStyles);
    new DartGuideApp();
});
