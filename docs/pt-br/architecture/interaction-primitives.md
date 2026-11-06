🌐 [English](../../en/architecture/interaction-primitives.md) | **Português** | 🏠 [Índice](../index.md)

---

# Primitivas de interação

Os componentes do `@oito2/ui` não reimplementam foco, fechamento ou posicionamento um a um. Eles se apoiam em um pequeno conjunto de primitivas internas em `packages/ui/src/lib/internal/`, em classes públicas de coleção e seleção, e no sistema de atalhos. Esta página as descreve para quem contribui.

As primitivas internas **não são exportadas** pelo pacote: podem mudar sem uma versão major. O comportamento segue o padrão das WAI-ARIA Authoring Practices de cada widget.

## Primitivas internas (`internal/`)

| Arquivo                      | Export                                                                    | Tipo                 | O que faz                                                                                                                                                                                                                                                                               |
| ---------------------------- | ------------------------------------------------------------------------- | -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `focus-scope.ts`             | `focusScope(options)`                                                     | Attachment           | Foco inicial (`autoFocus`), uma armadilha de Tab opcional (`trap`) e restauração do foco (`restoreFocus`) para diálogos, popovers e menus. Os escopos com armadilha se empilham; o último é o ativo.                                                                                    |
| `focus.ts`                   | `isFocusable`, `isTabbable`, `tabbables`, `focusElement`, `activeElement` | Funções              | Regras da ordem de Tab (`tabindex` positivo primeiro, grupos de rádio contam uma vez), foco sem rolagem, o elemento focado através de shadow roots abertas                                                                                                                              |
| `roving-focus.ts`            | `rovingFocus(options)`                                                    | Attachment           | Uma única parada de Tab para um grupo: setas, Home e End movem entre os itens marcados com `data-oito2-roving-item`, pulando os `data-disabled`. `orientation` (`horizontal`, `vertical`, `grid` com `columns`), `loop`, `onFocusItem`. As setas horizontais seguem a direção do texto. |
| `typeahead.ts`               | `Typeahead`                                                               | Classe               | Encontra itens pelas letras digitadas: caracteres em até 600 ms formam uma consulta; repetir um caractere percorre as correspondências                                                                                                                                                  |
| `keyboard.ts`                | `navigationIntent`, `directionOf`, `isEditableTarget`, `isPrintableKey`   | Funções              | Mapeia teclas para `next`/`previous`/`first`/`last` por orientação e direção (RTL troca as setas horizontais); separa digitação de navegação                                                                                                                                            |
| `dismissable-layer.ts`       | `dismissableLayer(options)`                                               | Attachment           | Escape, um clique fora ou (opcionalmente) o foco saindo chama `onDismiss(reason, event)`. As camadas se empilham: só a do topo reage, e uma camada aberta a partir de outra conta como dentro dela, mesmo renderizada em outro lugar.                                                   |
| `floating.ts`                | `floating(reference, options)`                                            | Attachment           | Posiciona um overlay ao lado da âncora com `@floating-ui/dom` (`offset`, `flip`, `shift`, `size`, `arrow`, `autoUpdate`) e `position: fixed`. Define `data-placement` e `--oito2-available-width`/`-height`.                                                                            |
| `Portal.svelte`, `portal.ts` | `Portal`, `setPortalTarget`, `usePortalTarget`                            | Componente, contexto | Renderiza o conteúdo em `to`, senão no hospedeiro do `ThemeProvider` mais próximo, senão no `document.body`, mantendo os contextos de onde é usado                                                                                                                                      |
| `presence.svelte.ts`         | `Presence`                                                                | Classe               | Mantém um elemento montado até sua animação de saída terminar: `present` fica verdadeiro junto com `open`, e falso depois da animação CSS (ou na hora, sem animação ou com movimento reduzido)                                                                                          |
| `scroll-lock.ts`             | `lockScroll()`                                                            | Função               | Impede a página de rolar sob um modal, compensando no body a largura da barra de rolagem escondida. Os bloqueios se aninham; devolve uma função de liberação.                                                                                                                           |
| `live-region.ts`             | `announce(message, politeness)`                                           | Função               | Faz os leitores de tela lerem uma mensagem (`polite` ou `assertive`) sem mover o foco, por regiões live visualmente ocultas                                                                                                                                                             |
| `controllable.svelte.ts`     | `Controllable`                                                            | Classe               | Estado controlado ou não controlado: `current` lê a prop quando dada e o valor próprio caso contrário; atribuir chama `onChange`                                                                                                                                                        |
| `ids.ts`                     | `uniqueId`, `partId`                                                      | Funções              | Ids para elementos criados por script e para as partes de um componente (alvos de `aria-labelledby`); fora isso, os componentes usam `$props.id()`                                                                                                                                      |
| `sets.ts`                    | `snapshotSet`                                                             | Função               | Snapshots imutáveis de conjuntos que as classes reativas trocam inteiros, para que as leituras acompanhem cada mudança                                                                                                                                                                  |
| `ResizeHandle.svelte`        | `ResizeHandle`                                                            | Componente           | Um divisor focável de 8 px que redimensiona os painéis ao lado por arraste, setas e tecnologias assistivas                                                                                                                                                                              |

### Como os componentes as combinam

Um overlay ancorado como `Popover.Content` coloca várias primitivas em um elemento:

```svelte
<!-- Simplified: the content element of an anchored overlay -->
<Portal>
	{#if presence.present}
		<div
			role="dialog"
			data-state={open ? 'open' : 'closed'}
			{@attach floating(() => trigger, { placement })}
			{@attach dismissableLayer({ onDismiss: () => (open = false) })}
			{@attach focusScope({ restoreFocus: true })}
		>
			{@render children()}
		</div>
	{/if}
</Portal>
```

| Família de componentes                                            | Primitivas                                                                                                 |
| ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `Dialog`, `Sheet`                                                 | `Portal`, `focusScope` (armadilha; no sheet só quando modal), `dismissableLayer`, `lockScroll`, `Presence` |
| `Popover`, `Menu` (e `ContextMenu`, `Select` pelo painel de menu) | `Portal`, `floating`, `dismissableLayer`, `focusScope`, `Presence`                                         |
| `Combobox`                                                        | `Portal`, `floating`, `dismissableLayer`, `announce`                                                       |
| `Tooltip`                                                         | `Portal`, `floating`, `Presence`                                                                           |
| `Tour`                                                            | `Portal`, `floating`, `focusScope`                                                                         |
| `CommandPalette`                                                  | `Portal`, `dismissableLayer`, `focusScope`, `Presence`                                                     |
| `Tabs.List`, `RadioGroup`, `SegmentGroup`, `ToggleGroup`          | `rovingFocus`                                                                                              |
| `Menu`, `ListBox`                                                 | `Typeahead`                                                                                                |
| `CopyButton`                                                      | `announce`                                                                                                 |
| `PanedView`, `Splitter`, `MasterDetail`                           | `ResizeHandle`                                                                                             |
| Componentes com estado `value`/`open`/`checked`                   | `Controllable`                                                                                             |

O conjunto exato de cada componente está no seu código em `packages/ui/src/lib/components/`.

## Attachments públicos (`attachments/`)

Quatro comportamentos também são exportados para os apps:

| Attachment    | O que faz                                                                                                                            |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `focusBorder` | Um anel de 2 px na cor primária segura para texto enquanto o elemento, ou um elemento dentro dele, tem foco de teclado               |
| `edgeFocus`   | Move o foco com as setas pela posição na tela dentro de um grupo (grades de cards, barras de ferramentas mistas), parando nas bordas |
| `draggable`   | Move um elemento dentro do contêiner posicionado com o ponteiro ou as setas                                                          |
| `undershoot`  | Sombras esmaecidas no estilo GTK nas bordas de um elemento rolável enquanto há mais conteúdo além delas                              |

`focusBorder` e `undershoot` precisam do `base.css` (incluído no `styles.css`).

## Coleções e seleção (`collections/`)

| Export                | Finalidade                                                                                                                                                             |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ListCollection`      | Uma lista imutável com acessores de valor, rótulo, desabilitado e grupo; a navegação pula itens desabilitados. Usada por `Select`, `Combobox`, `ListBox`, `TagsField`. |
| `TreeCollection`      | Uma árvore imutável de nós com valores únicos, com buscas e edições para árvores e menus aninhados                                                                     |
| `SelectionController` | Modos de seleção `none`, `single`, `multiple` com os gestos de desktop: clique, Control/Command+clique para alternar e Shift+clique para um intervalo                  |
| `AsyncListController` | Carrega uma lista página a página com texto de filtro e ordenação; uma carga mais nova substitui a que está em andamento e aborta seu `signal`                         |
| `foldText` (interno)  | Comparação sem diferenciar maiúsculas nem acentos (`Pêra` → `pera`), com offsets de volta ao texto original para destacar                                              |

Os controladores são classes `.svelte.ts` com estado reativo que só muda quando o valor muda de fato.

## Atalhos (`shortcuts/`)

| Export                                                                      | Finalidade                                                                                                                                                                                                                                                |
| --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `KeyChord`, `Shortcut`                                                      | Uma tecla com modificadores, e sequências de acordes. `primary` significa Command nos sistemas Apple e Control nos demais (`usesCommandKey`).                                                                                                             |
| `Commands`                                                                  | Um escopo que executa os atalhos dos seus comandos enquanto o foco está dentro dele (ou em qualquer lugar com `global`); escopos internos substituem comandos externos com o mesmo id; atalhos sem Control, Alt ou Meta são ignorados durante a digitação |
| `useCommands`, `availableCommands`, `isCommandEnabled`, `shortcutConflicts` | Leem os comandos disponíveis em um componente (como o `CommandPalette` os lista) e detectam atalhos em conflito                                                                                                                                           |

## Testando as primitivas

As primitivas têm testes de navegador próprios em `internal/` (`focus.svelte.test.ts`, `layers.svelte.test.ts`) e testes em Node (`internal.test.ts`), executados no Chromium e no WebKit. Os testes de componente então verificam o comportamento resultante por papéis e teclado, e rodam o axe nas galerias.
