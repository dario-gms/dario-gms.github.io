class DartGuideApp {
    constructor() {
        this.chapters = [
            { id: 1, title: "Introdução ao Dart", icon: "play-circle" },
            { id: 2, title: "Fundamentos e Sintaxe", icon: "code" },
            { id: 3, title: "Controle de Fluxo", icon: "random" },
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
            const response = await fetch(`chapters/${chapterId}-introducao.html`);
            const content = await response.text();
            document.getElementById('content-container').innerHTML = content;
            this.setActiveChapter(chapterId);
            this.initDartPads();
        } catch (error) {
            console.error('Erro ao carregar capítulo:', error);
        }
    }

    setActiveChapter(chapterId) {
        document.querySelectorAll('.chapter-item').forEach(item => {
            item.classList.toggle('active', item.dataset.chapter === chapterId);
        });
    }

    initDartPads() {
        document.querySelectorAll('.run-button').forEach(button => {
            button.addEventListener('click', () => {
                const iframe = button.closest('.dartpad-container').querySelector('iframe');
                iframe.contentWindow.postMessage('run', '*');
            });
        });
    }
}

document.addEventListener('DOMContentLoaded', () => new DartGuideApp());
