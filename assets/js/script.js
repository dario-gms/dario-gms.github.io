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

    init() {
        this.loadSidebar();
        this.setupEventListeners();
        this.loadChapter(1);
        // Carrega highlighting depois que tudo estiver funcionando
        setTimeout(() => this.setupSyntaxHighlighting(), 1000);
    }

    setupSyntaxHighlighting() {
        // Aplica syntax highlighting manual imediatamente
        this.applySyntaxHighlighting();
        
        // Tenta carregar Prism como melhoria opcional
        this.loadPrismOptional();
    }

    loadPrismOptional() {
        try {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js';
            script.onload = () => {
                // Re-aplica highlighting com Prism se carregar
                setTimeout(() => this.applySyntaxHighlighting(), 200);
            };
            document.head.appendChild(script);
        } catch (e) {
            // Continua usando highlighting manual se Prism falhar
            console.log('Usando highlighting manual');
        }
    }

    loadSidebar() {
        const sidebar = document.getElementById('sidebar');
        if (!sidebar) return;
        
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
            if (!chapter || !chapter.file) {
                console.log('Capítulo ainda não disponível');
                return;
            }
            
            const response = await fetch(`chapters/${chapter.file}`);
            if (!response.ok) {
                console.error('Erro ao carregar capítulo');
                return;
            }
            
            const content = await response.text();
            const contentContainer = document.getElementById('content-container');
            if (contentContainer) {
                contentContainer.innerHTML = content;
                this.setActiveChapter(chapterId);
                this.initChapterFeatures();
                // Aplica highlighting no novo conteúdo
                setTimeout(() => this.applySyntaxHighlighting(), 100);
            }
        } catch (error) {
            console.error('Erro ao carregar capítulo:', error);
        }
    }

    applySyntaxHighlighting() {
        const codeBlocks = document.querySelectorAll('pre code');
        
        codeBlocks.forEach(block => {
            if (block.classList.contains('highlighted')) return;
            
            const code = block.textContent;
            block.innerHTML = this.highlightDartCode(code);
            block.classList.add('highlighted');
        });
    }

    highlightDartCode(code) {
        let highlighted = this.escapeHtml(code);
        
        // Keywords
        const keywords = ['void', 'main', 'String', 'int', 'double', 'bool', 'List', 'Map', 'var', 'final', 'const', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'return', 'try', 'catch', 'finally', 'throw', 'class', 'extends', 'implements', 'abstract', 'static', 'import', 'library', 'part', 'export', 'dynamic', 'null', 'true', 'false'];
        
        keywords.forEach(keyword => {
            const regex = new RegExp(`\\b(${keyword})\\b`, 'g');
            highlighted = highlighted.replace(regex, `<span class="hl-keyword">$1</span>`);
        });
        
        // Functions
        const functions = ['print', 'length', 'add', 'remove', 'contains', 'toString', 'toStringAsFixed', 'keys', 'values', 'reduce'];
        functions.forEach(func => {
            const regex = new RegExp(`\\b(${func})(?=\\s*\\()`, 'g');
            highlighted = highlighted.replace(regex, `<span class="hl-function">$1</span>`);
        });
        
        // Strings
        highlighted = highlighted.replace(/'([^']*?)'/g, '<span class="hl-string">\'$1\'</span>');
        highlighted = highlighted.replace(/"([^"]*?)"/g, '<span class="hl-string">"$1"</span>');
        
        // Numbers
        highlighted = highlighted.replace(/\b(\d+\.?\d*)\b/g, '<span class="hl-number">$1</span>');
        
        // Comments
        highlighted = highlighted.replace(/\/\/.*$/gm, '<span class="hl-comment">$&</span>');
        
        // Operators
        highlighted = highlighted.replace(/([+\-*\/=<>!&|%])/g, '<span class="hl-operator">$1</span>');
        
        return highlighted;
    }

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, function(m) { return map[m]; });
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
                    <pre><code>${this.highlightDartCode(code)}</code></pre>
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
                const targetTab = document.querySelector(`[data-tab="${tabName}"].tab-content`);
                if (targetTab) targetTab.classList.add('active');
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
                
                // Reaplica highlighting se necessário
                if (!isVisible) {
                    setTimeout(() => this.applySyntaxHighlighting(), 100);
                }
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

const styles = `
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
    background: var(--primary, #007acc);
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
    background: #2d3748;
    padding: 1rem;
    border-radius: 4px;
    border: 1px solid #4a5568;
    overflow-x: auto;
    color: #e2e8f0;
}

.modal-body code {
    font-family: 'Courier New', monospace;
    color: #e2e8f0;
}

/* Syntax highlighting classes */
pre code {
    background: #2d3748 !important;
    color: #e2e8f0 !important;
    border-radius: 8px !important;
    font-family: 'Courier New', monospace !important;
}

.hl-keyword {
    color: #569cd6 !important;
    font-weight: bold;
}

.hl-string {
    color: #ce9178 !important;
}

.hl-number {
    color: #b5cea8 !important;
}

.hl-function {
    color: #dcdcaa !important;
    font-weight: bold;
}

.hl-comment {
    color: #6a9955 !important;
    font-style: italic;
}

.hl-operator {
    color: #d4d4d4 !important;
}
</style>
`;

document.addEventListener('DOMContentLoaded', () => {
    document.head.insertAdjacentHTML('beforeend', styles);
    new DartGuideApp();
});
