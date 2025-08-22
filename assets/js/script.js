class DartGuideApp {
    constructor() {
        this.chapters = [
            { id: 1, title: "Introdução ao Dart", icon: "play-circle", file: "1-introducao.html" },
            { id: 2, title: "Fundamentos e Sintaxe", icon: "code", file: "2-fundamentos.html" },
            { id: 3, title: "Controle de Fluxo", icon: "random", file: "3-controle.html" },
            { id: 4, title: "Funções", icon: "function" },
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
        
        this.currentTheme = this.getStoredTheme();
        this.syntaxHighlighter = new DartSyntaxHighlighter();
        
        this.init();
    }

    async init() {
        this.loadSidebar();
        this.setupTheme();
        this.setupEventListeners();
        this.loadChapter(1);
        this.addModalStyles();
    }

    // Theme Management
    getStoredTheme() {
        const stored = localStorage.getItem('dart-guide-theme');
        if (stored) return stored;
        
        // Check system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    }

    setupTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        this.updateThemeIcon();
        
        // Listen for system theme changes
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                if (!localStorage.getItem('dart-guide-theme')) {
                    this.currentTheme = e.matches ? 'dark' : 'light';
                    this.applyTheme();
                }
            });
        }
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme();
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        localStorage.setItem('dart-guide-theme', this.currentTheme);
        this.updateThemeIcon();
        
        // Re-apply syntax highlighting with new theme
        setTimeout(() => {
            this.syntaxHighlighter.highlightAll();
        }, 100);
    }

    updateThemeIcon() {
        const themeToggle = document.querySelector('.theme-toggle');
        if (themeToggle) {
            const icon = themeToggle.querySelector('i');
            if (icon) {
                icon.className = this.currentTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
            }
        }
    }

    loadSidebar() {
        const sidebar = document.getElementById('sidebar');
        sidebar.innerHTML = `
            <div class="logo">
                <i class="fas fa-code"></i>
                <h1>Guia de Dart</h1>
                <button class="theme-toggle" title="Alternar tema">
                    <i class="fas fa-${this.currentTheme === 'light' ? 'moon' : 'sun'}"></i>
                </button>
            </div>
            <div class="chapters">
                ${this.chapters.map((chapter, index) => `
                    <div class="chapter-item" data-chapter="${chapter.id}" style="animation-delay: ${index * 0.05}s">
                        <i class="fas fa-${chapter.icon}"></i>
                        <span>${chapter.id}. ${chapter.title}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    setupEventListeners() {
        // Chapter navigation
        document.addEventListener('click', (e) => {
            if (e.target.closest('.chapter-item')) {
                const chapterId = e.target.closest('.chapter-item').dataset.chapter;
                this.loadChapter(chapterId);
            }
            
            // Theme toggle
            if (e.target.closest('.theme-toggle')) {
                this.toggleTheme();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.altKey) {
                switch (e.key) {
                    case 't':
                        e.preventDefault();
                        this.toggleTheme();
                        break;
                    case 'ArrowLeft':
                        e.preventDefault();
                        this.navigateChapter(-1);
                        break;
                    case 'ArrowRight':
                        e.preventDefault();
                        this.navigateChapter(1);
                        break;
                }
            }
        });

        // Smooth scroll for anchor links
        document.addEventListener('click', (e) => {
            if (e.target.matches('a[href^="#"]')) {
                e.preventDefault();
                const target = document.querySelector(e.target.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        });
    }

    async loadChapter(chapterId) {
        try {
            const chapter = this.chapters.find(c => c.id == chapterId);
            if (!chapter) return;

            // Show loading state
            const contentContainer = document.getElementById('content-container');
            contentContainer.innerHTML = this.getLoadingHTML();

            // Simulate loading for better UX
            await new Promise(resolve => setTimeout(resolve, 150));

            let content;
            if (chapter.file) {
                const response = await fetch(`chapters/${chapter.file}`);
                content = await response.text();
            } else {
                content = this.getPlaceholderContent(chapter);
            }

            contentContainer.innerHTML = content;
            this.setActiveChapter(chapterId);
            this.initChapterFeatures();
            
            // Scroll to top smoothly
            contentContainer.scrollTo({ top: 0, behavior: 'smooth' });
            
        } catch (error) {
            console.error('Erro ao carregar capítulo:', error);
            document.getElementById('content-container').innerHTML = this.getErrorHTML();
        }
    }

    getLoadingHTML() {
        return `
            <div class="chapter-content">
                <div class="loading" style="text-align: center; padding: 4rem 0;">
                    <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: var(--primary); margin-bottom: 1rem;"></i>
                    <p>Carregando capítulo...</p>
                </div>
            </div>
        `;
    }

    getErrorHTML() {
        return `
            <div class="chapter-content">
                <div style="text-align: center; padding: 4rem 0;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: var(--danger); margin-bottom: 1rem;"></i>
                    <h2 style="color: var(--danger); margin-bottom: 1rem;">Erro ao carregar capítulo</h2>
                    <p style="color: var(--text-secondary);">Não foi possível carregar o conteúdo. Tente novamente.</p>
                    <button onclick="location.reload()" class="nav-button" style="margin-top: 2rem;">
                        <i class="fas fa-redo"></i> Tentar novamente
                    </button>
                </div>
            </div>
        `;
    }

    getPlaceholderContent(chapter) {
        return `
            <div class="chapter-content">
                <h1><i class="fas fa-${chapter.icon}"></i> ${chapter.title}</h1>
                <div style="text-align: center; padding: 4rem 0; color: var(--text-secondary);">
                    <i class="fas fa-clock" style="font-size: 3rem; margin-bottom: 2rem; opacity: 0.5;"></i>
                    <h2>Em breve</h2>
                    <p>Este capítulo está sendo preparado e estará disponível em breve.</p>
                    <p>Continue explorando os outros capítulos disponíveis!</p>
                </div>
            </div>
        `;
    }

    setActiveChapter(chapterId) {
        document.querySelectorAll('.chapter-item').forEach(item => {
            item.classList.toggle('active', item.dataset.chapter === chapterId);
        });
        
        // Update document title
        const chapter = this.chapters.find(c => c.id == chapterId);
        if (chapter) {
            document.title = `${chapter.title} - Guia de Dart`;
        }
    }

    navigateChapter(direction) {
        const currentChapter = parseInt(document.querySelector('.chapter-item.active')?.dataset.chapter || '1');
        const newChapter = currentChapter + direction;
        
        if (newChapter >= 1 && newChapter <= this.chapters.length) {
            this.loadChapter(newChapter);
        }
    }

    initChapterFeatures() {
        this.initDartPads();
        this.initTabs();
        this.initSolutionToggle();
        this.initCopyButtons();
        this.initNavigation();
        this.syntaxHighlighter.highlightAll();
        this.initInteractiveElements();
    }

    initInteractiveElements() {
        // Add hover effects to interactive elements
        document.querySelectorAll('.use-case, .practice-do, .practice-avoid, .exercise').forEach(el => {
            el.addEventListener('mouseenter', () => {
                el.style.transform = 'translateY(-4px) scale(1.02)';
            });
            
            el.addEventListener('mouseleave', () => {
                el.style.transform = '';
            });
        });

        // Animate elements on scroll
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        document.querySelectorAll('.example, .use-case, .exercise').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });
    }

    initDartPads() {
        document.querySelectorAll('.run-button').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
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
                    <h3><i class="fas fa-play-circle"></i> Simulação de Execução</h3>
                    <button class="close-modal" title="Fechar">&times;</button>
                </div>
                <div class="modal-body">
                    <p><strong>Código a ser executado no DartPad:</strong></p>
                    <pre><code>${this.escapeHtml(code)}</code></pre>
                    <div style="background: var(--info-light); padding: 1.5rem; border-radius: var(--radius); margin-top: 1.5rem; border-left: 4px solid var(--info);">
                        <p><strong><i class="fas fa-lightbulb"></i> Dica:</strong> Copie este código e cole no <a href="https://dartpad.dev" target="_blank" rel="noopener" style="color: var(--primary); font-weight: 600;">DartPad <i class="fas fa-external-link-alt" style="font-size: 0.8em;"></i></a> para executar!</p>
                        <button class="copy-modal-code" style="margin-top: 1rem; padding: 0.75rem 1.5rem; background: var(--primary); color: white; border: none; border-radius: var(--radius); cursor: pointer; font-weight: 600;">
                            <i class="fas fa-copy"></i> Copiar Código
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);

        // Add event listeners
        const closeModal = () => {
            modal.style.opacity = '0';
            setTimeout(() => document.body.removeChild(modal), 300);
        };

        modal.querySelector('.close-modal').addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        // Copy button in modal
        modal.querySelector('.copy-modal-code').addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(code);
                const button = modal.querySelector('.copy-modal-code');
                const originalText = button.innerHTML;
                button.innerHTML = '<i class="fas fa-check"></i> Copiado!';
                button.style.background = 'var(--success)';
                setTimeout(() => {
                    button.innerHTML = originalText;
                    button.style.background = 'var(--primary)';
                }, 2000);
            } catch (err) {
                this.fallbackCopy(code);
            }
        });

        // Escape key to close
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);

        // Animate modal
        modal.style.opacity = '0';
        setTimeout(() => modal.style.opacity = '1', 10);
    }

    initTabs() {
        document.querySelectorAll('.tab-header').forEach(header => {
            header.addEventListener('click', () => {
                const tabName = header.dataset.tab;
                const tabContainer = header.closest('.installation-tabs');
                
                // Remove active from all headers and contents in this container
                tabContainer.querySelectorAll('.tab-header').forEach(h => h.classList.remove('active'));
                tabContainer.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                
                // Add active to clicked header and corresponding content
                header.classList.add('active');
                const content = tabContainer.querySelector(`[data-tab="${tabName}"].tab-content`);
                if (content) {
                    content.classList.add('active');
                }
            });
        });
    }

    initSolutionToggle() {
        const toggleButton = document.querySelector('.solution-toggle');
        const solutionsDiv = document.querySelector('.solutions');
        
        if (toggleButton && solutionsDiv) {
            // Initially hide solutions
            solutionsDiv.style.display = 'none';
            
            toggleButton.addEventListener('click', () => {
                const isVisible = solutionsDiv.style.display !== 'none';
                solutionsDiv.style.display = isVisible ? 'none' : 'block';
                toggleButton.innerHTML = isVisible 
                    ? '<i class="fas fa-eye"></i> Ver Gabarito dos Exercícios' 
                    : '<i class="fas fa-eye-slash"></i> Ocultar Gabarito';
                
                // Smooth scroll to solutions when showing
                if (!isVisible) {
                    setTimeout(() => {
                        solutionsDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 100);
                }
            });
        }
    }

    initCopyButtons() {
        document.querySelectorAll('.copy-button').forEach(button => {
            button.addEventListener('click', async (e) => {
                e.stopPropagation();
                const codeBlock = button.closest('.dartpad-container').querySelector('.code-block pre code');
                if (codeBlock) {
                    const code = codeBlock.textContent;
                    
                    try {
                        await navigator.clipboard.writeText(code);
                        this.showCopySuccess(button);
                    } catch (err) {
                        console.error('Erro ao copiar código:', err);
                        this.fallbackCopy(code);
                        this.showCopySuccess(button);
                    }
                }
            });
        });
    }

    async fallbackCopy(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
        } finally {
            document.body.removeChild(textArea);
        }
    }

    showCopySuccess(button) {
        const originalHTML = button.innerHTML;
        const originalBg = button.style.background;
        
        button.innerHTML = '<i class="fas fa-check"></i> Copiado!';
        button.style.background = 'rgba(16, 185, 129, 0.8)';
        button.style.transform = 'scale(1.05)';
        
        setTimeout(() => {
            button.innerHTML = originalHTML;
            button.style.background = originalBg;
            button.style.transform = '';
        }, 2000);
    }

    initNavigation() {
        const nextButton = document.querySelector('.next-button');
        const prevButton = document.querySelector('.prev-button');
        
        if (nextButton && !nextButton.classList.contains('disabled')) {
            nextButton.addEventListener('click', () => {
                this.navigateChapter(1);
            });
        }
        
        if (prevButton && !prevButton.classList.contains('disabled')) {
            prevButton.addEventListener('click', () => {
                this.navigateChapter(-1);
            });
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    addModalStyles() {
        if (!document.querySelector('#modal-styles')) {
            const style = document.createElement('style');
            style.id = 'modal-styles';
            style.textContent = `
                .execution-modal {
                    transition: opacity 0.3s ease;
                }
                
                .modal-content {
                    animation: modalSlideIn 0.3s ease;
                }
                
                @keyframes modalSlideIn {
                    from {
                        opacity: 0;
                        transform: translateY(-50px) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
                
                .copy-modal-code:hover {
                    background: var(--primary-dark) !important;
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-md);
                }
            `;
            document.head.appendChild(style);
        }
    }
}

// Syntax Highlighter for Dart
class DartSyntaxHighlighter {
    constructor() {
        this.keywords = [
            'abstract', 'as', 'assert', 'async', 'await', 'break', 'case', 'catch', 
            'class', 'const', 'continue', 'default', 'do', 'else', 'enum', 'extends', 
            'external', 'factory', 'false', 'final', 'finally', 'for', 'get', 'if', 
            'implements', 'import', 'in', 'is', 'library', 'new', 'null', 'operator', 
            'part', 'required', 'rethrow', 'return', 'set', 'static', 'super', 'switch', 
            'this', 'throw', 'true', 'try', 'typedef', 'var', 'void', 'while', 'with',
            'int', 'double', 'String', 'bool', 'List', 'Map', 'Set', 'dynamic', 'Object',
            'main', 'print', 'late'
        ];

        this.operators = [
            '+', '-', '*', '/', '%', '~/', '++', '--', '==', '!=', '>', '<', 
            '>=', '<=', '&&', '||', '!', '&', '|', '^', '~', '<<', '>>', 
            '=', '+=', '-=', '*=', '/=', '%=', '~/=', '&=', '|=', '^=', 
            '<<=', '>>='
        ];
    }

    highlightAll() {
        document.querySelectorAll('.code-block pre code').forEach(codeBlock => {
            this.highlight(codeBlock);
        });
    }

    highlight(codeElement) {
        let code = codeElement.textContent;
        
        // Store and replace strings to avoid highlighting inside them
        const strings = [];
        code = code.replace(/(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g, (match) => {
            strings.push(match);
            return `__STRING_${strings.length - 1}__`;
        });

        // Store and replace comments
        const comments = [];
        code = code.replace(/\/\/.*$/gm, (match) => {
            comments.push(match);
            return `__COMMENT_${comments.length - 1}__`;
        });
        
        code = code.replace(/\/\*[\s\S]*?\*\//g, (match) => {
            comments.push(match);
            return `__COMMENT_${comments.length - 1}__`;
        });

        // Highlight keywords
        this.keywords.forEach(keyword => {
            const regex = new RegExp(`\\b${keyword}\\b`, 'g');
            code = code.replace(regex, `<span class="keyword">${keyword}</span>`);
        });

        // Highlight numbers
        code = code.replace(/\b\d+\.?\d*\b/g, '<span class="number">$&</span>');

        // Highlight functions (word followed by parentheses)
        code = code.replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)\s*(?=\()/g, '<span class="function">$1</span>');

        // Highlight class names (PascalCase words)
        code = code.replace(/\b([A-Z][a-zA-Z0-9_]*)\b/g, '<span class="class">$1</span>');

        // Highlight operators
        this.operators.forEach(op => {
            const escapedOp = op.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(escapedOp, 'g');
            code = code.replace(regex, `<span class="operator">${op}</span>`);
        });

        // Restore comments
        comments.forEach((comment, index) => {
            code = code.replace(`__COMMENT_${index}__`, `<span class="comment">${comment}</span>`);
        });

        // Restore strings
        strings.forEach((string, index) => {
            code = code.replace(`__STRING_${index}__`, `<span class="string">${string}</span>`);
        });

        codeElement.innerHTML = code;
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DartGuideApp();
    
    // Add some helpful console messages for developers
    console.log('%c🎯 Dart Guide App iniciado!', 'color: #0175C2; font-size: 16px; font-weight: bold;');
    console.log('%c💡 Atalhos disponíveis:', 'color: #13B9FD; font-weight: bold;');
    console.log('Alt + T: Alternar tema');
    console.log('Alt + ←: Capítulo anterior');
    console.log('Alt + →: Próximo capítulo');
    console.log('Esc: Fechar modal');
});
