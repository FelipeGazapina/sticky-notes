<p align="center">
  <img src="assets/icons/icon.png" alt="Sticky Notes" width="128" height="128">
</p>

<h1 align="center">Sticky Notes</h1>

<p align="center">
  Uma alternativa local e open-source ao Notas Autoadesivas do Windows 11, com editor rico e imagens inline.
</p>

<p align="center">
  <a href="https://github.com/FelipeGazapina/sticky-notes/releases/latest">
    <img src="https://img.shields.io/github/v/release/FelipeGazapina/sticky-notes?style=flat-square&color=FFD54F" alt="Latest Release">
  </a>
  <a href="https://github.com/FelipeGazapina/sticky-notes/releases/latest">
    <img src="https://img.shields.io/github/downloads/FelipeGazapina/sticky-notes/total?style=flat-square&color=4CAF50" alt="Downloads">
  </a>
  <a href="https://github.com/FelipeGazapina/sticky-notes/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/FelipeGazapina/sticky-notes?style=flat-square" alt="License">
  </a>
</p>

---

## Por que este app existe?

O **Notas Autoadesivas** nativo do Windows 11 tem limitações que incomodam no dia a dia:

- **Imagens ficam no topo da nota**, nunca inline com o texto. Você não consegue colar uma imagem no meio de um parágrafo.
- **Depende de conta Microsoft e sincronização na nuvem**, o que adiciona latência para abrir e criar notas.
- **Não é extensível** — se você quer uma funcionalidade nova, precisa esperar a Microsoft implementar.

O **Sticky Notes** resolve isso:

- **Imagens inline** — cole com `Ctrl+V` ou arraste uma imagem direto no texto. Ela aparece exatamente onde você colocou.
- **100% local** — sem conta, sem nuvem, sem latência. Abre instantaneamente, cria notas em milissegundos.
- **Open-source e extensível** — construído com Electron + Quill.js, fácil de customizar e adicionar funcionalidades.

---

## Download e Instalacao

### Baixar o executavel

Acesse a pagina de releases no GitHub:

**[github.com/FelipeGazapina/sticky-notes/releases](https://github.com/FelipeGazapina/sticky-notes/releases/latest)**

Escolha uma das opcoes:

| Arquivo | O que e |
|---|---|
| `Sticky Notes Setup X.X.X.exe` | **Instalador** — instala no computador com atalho na area de trabalho e menu iniciar |
| `Sticky Notes Portable X.X.X.exe` | **Portatil** — roda direto, sem instalar nada. Ideal para pen drive |

> **Nota:** O Windows pode exibir um aviso de "aplicativo nao reconhecido" porque o executavel nao e assinado digitalmente. Clique em **"Mais informacoes"** e depois **"Executar assim mesmo"**.

### Instalar via Setup

1. Baixe o `Sticky Notes Setup X.X.X.exe`
2. Execute o instalador
3. Escolha o diretorio de instalacao (ou deixe o padrao)
4. Pronto — o app aparece na area de trabalho e no menu iniciar

### Usar a versao portatil

1. Baixe o `Sticky Notes Portable X.X.X.exe`
2. Execute diretamente — nao precisa instalar
3. Os dados ficam salvos localmente na pasta do usuario

---

## Funcionalidades

### Editor rico com Quill.js

- **Negrito**, *italico*, <u>sublinhado</u>, ~~tachado~~
- Listas com marcadores
- Atalhos de teclado: `Ctrl+B`, `Ctrl+I`, `Ctrl+U`

### Imagens inline

- **Colar imagens** com `Ctrl+V` — a imagem aparece exatamente na posicao do cursor
- **Arrastar e soltar** imagens direto na nota
- As imagens sao salvas dentro da propria nota, sem dependencia de arquivos externos

### 7 cores de nota

Amarelo, verde, rosa, roxo, azul, carvao e branco — igual ao Sticky Notes original do Windows.

### Tema claro e escuro

Detecta automaticamente o tema do sistema ou permite escolha manual.

### Fixar no topo

Qualquer nota pode ser fixada acima de todas as janelas com o botao de pin.

### Tudo local

- Sem conta Microsoft, sem login, sem internet
- Dados salvos localmente via `electron-store`
- Zero latencia para abrir, criar ou editar notas

---

## Para desenvolvedores

Se voce quer rodar o projeto do codigo-fonte, adicionar funcionalidades ou contribuir:

### Pre-requisitos

- [Node.js](https://nodejs.org/) v18 ou superior
- [Git](https://git-scm.com/)

### Clonar e rodar

```bash
git clone https://github.com/FelipeGazapina/sticky-notes.git
cd sticky-notes
npm install
npm start
```

### Scripts disponiveis

| Comando | O que faz |
|---|---|
| `npm start` | Abre o app em modo normal |
| `npm run dev` | Abre o app em modo de desenvolvimento |
| `npm run build` | Gera o instalador + portatil na pasta `dist/` |
| `npm run build:portable` | Gera apenas o executavel portatil |

### Estrutura do projeto

```
sticky-notes/
├── main.js                      # Processo principal do Electron
├── preload/
│   ├── noteListPreload.js       # Bridge de API para a lista de notas
│   └── notePreload.js           # Bridge de API para cada nota
├── src/
│   ├── main/
│   │   ├── store.js             # Persistencia local (electron-store)
│   │   ├── windowManager.js     # Gerenciamento de janelas
│   │   ├── ipcHandlers.js       # Comunicacao entre processos
│   │   └── menuBuilder.js       # Menu do app
│   └── renderer/
│       ├── note/                # Interface da nota individual
│       ├── noteList/            # Interface da lista de notas
│       └── shared/              # Temas e estilos compartilhados
└── assets/
    └── icons/                   # Icones do app
```

### Stack tecnica

- **Electron** — framework desktop multiplataforma
- **Quill.js v2** — editor de texto rico
- **electron-store** — persistencia local em JSON
- **Vanilla JS** — sem frameworks frontend, leve e rapido
- **electron-builder** — empacotamento para Windows

---

## Roadmap

Funcionalidades planejadas para versoes futuras:

- [ ] Suporte a tabelas no editor
- [ ] Exportar notas como PDF ou Markdown
- [ ] Backup e restauracao de notas
- [ ] Atalhos globais para criar nota rapida
- [ ] Busca global em todas as notas

---

## Contribuindo

Contribuicoes sao bem-vindas! Abra uma [issue](https://github.com/FelipeGazapina/sticky-notes/issues) para reportar bugs ou sugerir funcionalidades, ou envie um pull request.

---

## Licenca

Este projeto e open-source. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
