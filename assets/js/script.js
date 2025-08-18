// Sistema de roteamento e carregamento de conteúdo
class DartGuideApp {
    constructor() {
        this.currentChapter = null;
        this.init();
    }

    async init() {
        await this.loadSidebar();
        this.setupEventListeners();
        this.loadInitialContent();
    }

    async loadSidebar() {
        const sidebar = document.getElementById('sidebar');
        sidebar.innerHTML = `
            <div class="logo">
                <i class="fas fa-code"></i>
                <h1>Guia de Dart</h1>
            </div>
            <div class="chapters">
                ${this.generateChapterLinks()}
            </div>
        `;
    }

    generateChapterLinks() {
        const chapters = [
            { id: 1, title: "Introdução ao Dart", icon: "play-circle" },
            { id: 2, title: "Fundamentos e Sintaxe", icon: "code" },
            // Adicione todos os capítulos aqui
            { id: 14, title: "Próximos Passos", icon: "flag-checkered" }
        ];

        return chapters.map(chapter => `
            <div class="chapter-item" data-chapter="${chapter.id}">
                <i class="fas fa-${chapter.icon}"></i>
                <span>${chapter.id}. ${chapter.title}</span>
            </div>
        `).join('');
    }

    setupEventListeners() {
        document.querySelectorAll('.chapter-item').forEach(item => {
            item.addEventListener('click', () => this.loadChapter(item.dataset.chapter));
        });
    }

    async loadChapter(chapterId) {
        this.currentChapter = chapterId;
        const response = await fetch(`chapters/${chapterId}-introducao.html`);
        const content = await response.text();
        
        document.getElementById('content-container').innerHTML = content;
        this.setActiveChapter();
        this.initDartPads();
    }

    setActiveChapter() {
        document.querySelectorAll('.chapter-item').forEach(item => {
            item.classList.toggle('active', item.dataset.chapter === this.currentChapter);
        });
    }

    initDartPads() {
        // Inicializa todos os DartPads na página
        document.querySelectorAll('.dartpad-container').forEach(container => {
            const runButton = container.querySelector('.run-button');
            const iframe = container.querySelector('iframe.dartpad');
            
            runButton.addEventListener('click', () => {
                iframe.contentWindow.postMessage('run', '*');
            });
        });
    }

    loadInitialContent() {
        // Carrega o primeiro capítulo por padrão
        this.loadChapter('1');
    }
}

// Inicia a aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    new DartGuideApp();
});
