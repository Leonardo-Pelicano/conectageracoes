# CyberSafe — Módulo Integrado V3

## Semana 7 — Sprint 6 (implementação dos ajustes, QA cruzado e consolidação)

A V3 consolida a V2: público principal registrado como **adolescentes de 12 a 17 anos** (texto sem alternar com "crianças"), inclusão do **Helpline da SaferNet** e do link de denúncia online entre os canais oficiais, e revisão geral dos textos. Veja `docs/registro_sprint6.md`, `docs/jornada_do_usuario.md` e `docs/qa_cruzado_checklist.md`. O QA cruzado com outras squads ainda precisa ser executado pelas equipes.

---

## Semana 6 — Sprint 5 (V2, base desta versão)

A V2 corrige os problemas encontrados nos testes da Sprint 5 (veja `docs/relatorio_testes_sprint5.md` e a pasta `testes/`): foco de teclado visível, contraste AA, jogo com feedback textual e foco gerenciado, menu móvel com Esc, funcionamento sem JavaScript, impressão, alvos de toque e fontes maiores, canais oficiais (Disque 100, CVV 188, 190) e referência à Lei nº 14.811/2024. Resultado: 9/24 → 24/24 verificações. Os números de apoio devem ser reconferidos pela equipe antes da publicação.

---

## Semana 5 — Sprint 4 (V1, base desta versão)

Primeira versão integrada do projeto acadêmico **CyberSafe — Cyberbullying e Comportamento Online**.

### Objetivo

Unificar em uma única experiência front-end os conteúdos e decisões visuais já produzidos pelo grupo, mantendo continuidade com o protótipo e com o MVP entregue anteriormente.

### O que foi integrado

- Página inicial e apresentação do projeto.
- Conceitos de bullying e cyberbullying.
- Perfil dos envolvidos.
- Consequências emocionais, comportamentais e escolares.
- Orientações de enfrentamento.
- Jogo educativo "Escolha segura", com 3 perguntas, feedback, progresso e pontuação.
- Área de ajuda com adulto de confiança, escola, canal oficial e apoio psicológico.
- Navegação por âncoras e menu mobile.
- Responsividade para desktop, tablet e celular.
- Identidade visual consolidada pelo Design System.
- Acessibilidade básica: HTML semântico, link para pular conteúdo, foco de teclado, `aria-label`, `aria-live`, barra de progresso acessível e áreas de toque amplas.
- Nenhum cadastro, banco de dados, denúncia real ou armazenamento de relatos.

### Base do projeto

A V1 foi construída sobre o **MVP real da Semana 4**, preservando a abordagem estática em HTML5, CSS3 e JavaScript vanilla e evoluindo a estrutura visual e de conteúdo para a integração da Semana 5.

### Paleta do Design System

- Coral: `#FF7358`
- Coral escuro: `#E85B43`
- Turquesa: `#2DC2B5`
- Turquesa escuro: `#168F87`
- Amarelo: `#FFC83D`
- Creme: `#FFF8E7`
- Azul-noturno: `#20283A`
- Branco: `#FFFFFF`
- Cinza: `#667085`

### Como executar no Windows

#### Opção recomendada

1. Extraia a pasta.
2. Abra a pasta `CyberSafe_Modulo_Integrado_V1`.
3. Execute `start-localhost.bat`.
4. Abra `http://127.0.0.1:8000/` caso o navegador não seja aberto automaticamente.
5. Mantenha a janela do servidor aberta durante a utilização.
6. Pressione `Ctrl+C` para encerrar o servidor.

#### Sem servidor

O `index.html` também pode ser aberto diretamente no navegador. O servidor local é recomendado para reproduzir melhor um ambiente web.

### Estrutura

```text
CyberSafe_Modulo_Integrado_V1/
├── index.html
├── README.md
├── server.py
├── start-localhost.bat
├── css/
│   └── style.css
├── js/
│   └── script.js
├── assets/
│   ├── logo.svg
│   ├── shield.svg
│   ├── respect.svg
│   └── support.svg
└── docs/
    ├── modulo_integrado_v1.md
    └── equipe.txt
```

### Limitações desta versão

Esta é uma V1 acadêmica de front-end. A área de ajuda permanece orientativa; os canais oficiais de apoio e denúncia devem ser conferidos pelo grupo antes da publicação final. Não há processamento real de denúncias, autenticação, banco de dados, chatbot, painel administrativo ou coleta de dados pessoais.

### Equipe — Grupo 12

Giulia Gabriella de Lima Santos  
Kauê Dib de Souza Dias  
Victor Ignacio  
Vinícius Santana Teixeira  
Thiago Henrique Simão Vieira  
Eduardo Rafael de Moraes Juvenasso
