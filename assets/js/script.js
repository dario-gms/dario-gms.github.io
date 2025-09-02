// Dark Mode Manager - Gerenciamento de temas
class DarkModeManager {
    constructor() {
        this.storageKey = 'dart-guide-theme';
    }

    init() {
        this.createToggleButton();
        this.loadSavedTheme();
        this.setupEventListeners();
        this.observeSystemTheme();
    }

    createToggleButton() {
        // Verifica se o botão já existe (para evitar duplicação)
        if (document.querySelector('.theme-toggle')) {
            return;
        }

        const logo = document.querySelector('.logo');
        if (!logo) {
            console.warn('Logo element not found. Cannot create theme toggle.');
            return;
        }

        const toggleButton = document.createElement('button');
        toggleButton.className = 'theme-toggle';
        toggleButton.setAttribute('aria-label', 'Alternar tema');
        toggleButton.innerHTML = '<i class="fas fa-moon"></i>';
        
        logo.appendChild(toggleButton);
    }

    setupEventListeners() {
        const toggleButton = document.querySelector('.theme-toggle');
        if (toggleButton) {
            toggleButton.addEventListener('click', () => {
                this.toggleTheme();
            });
        }

        // Keyboard shortcut (Ctrl/Cmd + Shift + D)
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
                e.preventDefault();
                this.toggleTheme();
            }
        });
    }

    toggleTheme() {
        const currentTheme = this.getCurrentTheme();
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }

    setTheme(theme) {
        const html = document.documentElement;
        const toggleButton = document.querySelector('.theme-toggle');
        
        // Remove tema anterior e aplica novo
        html.removeAttribute('data-theme');
        if (theme === 'dark') {
            html.setAttribute('data-theme', 'dark');
        }
        
        // Atualiza ícone do botão
        if (toggleButton) {
            const icon = toggleButton.querySelector('i');
            if (icon) {
                icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            }
            
            // Adiciona feedback visual
            toggleButton.style.transform = 'scale(0.9)';
            setTimeout(() => {
                toggleButton.style.transform = 'scale(1)';
            }, 150);
        }
        
        // Salva preferência
        this.saveTheme(theme);
        
        // Dispara evento customizado para outros componentes
        this.dispatchThemeChangeEvent(theme);
        
        // Atualiza DartPad se estiver aberto
        this.updateDartPadTheme(theme);
    }

    getCurrentTheme() {
        const html = document.documentElement;
        return html.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    }

    saveTheme(theme) {
        try {
            localStorage.setItem(this.storageKey, theme);
        } catch (error) {
            console.warn('Cannot save theme preference:', error);
        }
    }

    loadSavedTheme() {
        try {
            const savedTheme = localStorage.getItem(this.storageKey);
            if (savedTheme && (savedTheme === 'dark' || savedTheme === 'light')) {
                this.setTheme(savedTheme);
                return;
            }
        } catch (error) {
            console.warn('Cannot load saved theme:', error);
        }
        
        // Se não há tema salvo, detecta preferência do sistema
        this.detectSystemTheme();
    }

    detectSystemTheme() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            this.setTheme('dark');
        } else {
            this.setTheme('light');
        }
    }

    observeSystemTheme() {
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            
            // Listener para mudanças na preferência do sistema
            const handleSystemThemeChange = (e) => {
                // Só muda automaticamente se não há preferência salva
                try {
                    const savedTheme = localStorage.getItem(this.storageKey);
                    if (!savedTheme) {
                        this.setTheme(e.matches ? 'dark' : 'light');
                    }
                } catch (error) {
                    // Se não pode acessar localStorage, segue a preferência do sistema
                    this.setTheme(e.matches ? 'dark' : 'light');
                }
            };
            
            if (mediaQuery.addEventListener) {
                mediaQuery.addEventListener('change', handleSystemThemeChange);
            } else {
                // Fallback para navegadores mais antigos
                mediaQuery.addListener(handleSystemThemeChange);
            }
        }
    }

    dispatchThemeChangeEvent(theme) {
        const event = new CustomEvent('themeChanged', {
            detail: { theme: theme }
        });
        document.dispatchEvent(event);
    }

    updateDartPadTheme(theme) {
        // Atualiza DartPad se estiver aberto
        const dartpadIframe = document.querySelector('#dartpad-container iframe');
        if (dartpadIframe) {
            const currentSrc = dartpadIframe.src;
            if (currentSrc.includes('dartpad.dev')) {
                // Atualiza o parâmetro theme na URL
                const url = new URL(currentSrc);
                url.searchParams.set('theme', theme);
                dartpadIframe.src = url.toString();
            }
        }
    }

    // Método público para ser usado por outros módulos
    getTheme() {
        return this.getCurrentTheme();
    }

    // Método para aplicar tema específico (útil para debugging)
    applyTheme(theme) {
        if (theme === 'dark' || theme === 'light') {
            this.setTheme(theme);
        } else {
            console.warn('Invalid theme:', theme);
        }
    }

    // Método para resetar para tema do sistema
    resetToSystemTheme() {
        try {
            localStorage.removeItem(this.storageKey);
            this.detectSystemTheme();
        } catch (error) {
            console.warn('Cannot reset theme:', error);
            this.detectSystemTheme();
        }
    }

    // Método para validar se as cores estão funcionando corretamente
    validateTheme() {
        const html = document.documentElement;
        const computedStyle = getComputedStyle(html);
        
        const textColor = computedStyle.getPropertyValue('--text-primary').trim();
        const backgroundColor = computedStyle.getPropertyValue('--background').trim();
        
        console.log('Current theme colors:', {
            theme: this.getCurrentTheme(),
            textColor: textColor,
            backgroundColor: backgroundColor,
            surfaceColor: computedStyle.getPropertyValue('--surface').trim()
        });
        
        return {
            isValid: textColor && backgroundColor,
            colors: {
                text: textColor,
                background: backgroundColor,
                surface: computedStyle.getPropertyValue('--surface').trim()
            }
        };
    }
}

// Aplicação Principal - Dart Guide
class DartGuideApp {
    constructor() {
        this.chapters = [
            { id: 1, title: "Introdução ao Dart", icon: "play-circle", file: "1-introducao.html" },
            { id: 2, title: "Fundamentos e Sintaxe", icon: "code", file: "2-fundamentos.html" },
            { id: 3, title: "Controle de Fluxo", icon: "random", file: "3-controle.html" },
            { id: 4, title: "Funções", icon: "cogs", file: "4-funcoes.html" },
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
        
        // Inicializa o Dark Mode Manager
        this.darkModeManager = new DarkModeManager();
        
        this.init();
    }

    async init() {
        this.loadSidebar();
        this.setupEventListeners();
        this.setupThemeEventListeners();
        
        // Inicializa o dark mode após carregar sidebar
        this.darkModeManager.init();
        
        this.loadChapter(1);
    }

    loadSidebar() {
        const sidebar = document.getElementById('sidebar');
        sidebar.innerHTML = `
            <div class="logo">
                <i class="fas fa-code"></i>
                <h1>Guia de Dart</h1>
                <!-- O botão será criado automaticamente pelo DarkModeManager -->
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

    setupThemeEventListeners() {
        // Escuta mudanças de tema para atualizar componentes se necessário
        document.addEventListener('themeChanged', (e) => {
            const newTheme = e.detail.theme;
            console.log(`Tema alterado para: ${newTheme}`);
            
            // Aqui você pode adicionar lógica adicional quando o tema mudar
            this.onThemeChanged(newTheme);
        });
    }

    onThemeChanged(theme) {
        // Atualiza qualquer componente específico que precise reagir à mudança de tema
        this.updateCodeHighlighting(theme);
        this.updateModalTheme(theme);
    }

    updateCodeHighlighting(theme) {
        // Se você tiver alguma lógica específica para syntax highlighting
        // baseada no tema, pode implementar aqui
        const codeBlocks = document.querySelectorAll('.code-block');
        codeBlocks.forEach(block => {
            // Adiciona classe específica do tema se necessário
            block.classList.toggle('dark-theme', theme === 'dark');
        });
    }

    updateModalTheme(theme) {
        // Atualiza modais existentes com o novo tema
        const modals = document.querySelectorAll('.execution-modal');
        modals.forEach(modal => {
            modal.setAttribute('data-theme', theme);
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
        
        // Aplica tema atual ao modal
        const currentTheme = this.darkModeManager.getTheme();
        modal.setAttribute('data-theme', currentTheme);
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Executar Código Dart</h3>
                    <button class="close-modal" aria-label="Fechar modal">&times;</button>
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
        modal.addEventListener('click', (e) => { 
            if (e.target === modal) closeModal(); 
        });

        // Carrega o DartPad imediatamente com código limpo
        setTimeout(() => { 
            this.loadDartPad(cleanCode, currentTheme); 
        }, 50);
        
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
        
        // Cleanup quando modal for removido
        modal.addEventListener('DOMNodeRemoved', () => {
            document.removeEventListener('keydown', handleEscape);
        });
    }

    loadDartPad(code, theme = null) {
        // Sempre força código limpo - ignora qualquer código passado
        const cleanCode = "";
        const currentTheme = theme || this.darkModeManager.getTheme();
        
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
                    body { 
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                        background: ${currentTheme === 'dark' ? '#1e293b' : '#ffffff'};
                        color: ${currentTheme === 'dark' ? '#f8fafc' : '#1e293b'};
                    }
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
                        color: ${currentTheme === 'dark' ? '#cbd5e1' : '#666'};
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

    // Método público para acessar o gerenciador de tema
    getThemeManager() {
        return this.darkModeManager;
    }

    // Método para forçar atualização do tema (útil para debugging)
    refreshTheme() {
        const currentTheme = this.darkModeManager.getTheme();
        this.onThemeChanged(currentTheme);
    }
}

// Inicialização e funções globais
document.addEventListener('DOMContentLoaded', () => {
    // Garante que só há uma instância da aplicação
    if (!window.dartGuideApp) {
        window.dartGuideApp = new DartGuideApp();
    }
});

// Adiciona algumas funcionalidades globais para debugging/desenvolvimento
if (typeof window !== 'undefined') {
    window.toggleTheme = () => {
        if (window.dartGuideApp && window.dartGuideApp.darkModeManager) {
            window.dartGuideApp.darkModeManager.toggleTheme();
        }
    };
    
    window.setTheme = (theme) => {
        if (window.dartGuideApp && window.dartGuideApp.darkModeManager) {
            window.dartGuideApp.darkModeManager.applyTheme(theme);
        }
    };
    
    window.validateTheme = () => {
        if (window.dartGuideApp && window.dartGuideApp.darkModeManager) {
            return window.dartGuideApp.darkModeManager.validateTheme();
        }
    };
    
    window.resetTheme = () => {
        if (window.dartGuideApp && window.dartGuideApp.darkModeManager) {
            window.dartGuideApp.darkModeManager.resetToSystemTheme();
        }
    };
}
