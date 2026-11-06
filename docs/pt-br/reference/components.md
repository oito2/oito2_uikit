🌐 [English](../../en/reference/components.md) | **Português** | 🏠 [Índice](../index.md)

---

# Componentes

Todas as páginas do catálogo do showcase ([`apps/showcase/src/lib/catalog.ts`](../../../apps/showcase/src/lib/catalog.ts)), agrupadas como no showcase: 94 páginas em **Components** e 4 em **Theme**. Cada linha leva à página ao vivo, que tem exemplos, o código-fonte da página e a referência de API dos exports listados aqui. Os títulos das páginas ficam em inglês, como no showcase.

As **tabelas completas de props** estão na referência de API de cada página do showcase, gerada a partir do TSDoc dos pacotes (`pnpm docs:generate` grava [`apps/showcase/src/lib/api/api.json`](../../../apps/showcase/src/lib/api/api.json)). Esta página só lista o que existe e de onde vem.

Como ler os exports:

- Um **componente composto** é um namespace de partes: `Tabs` é usado como `Tabs.Root`, `Tabs.List`, `Tabs.Trigger`, `Tabs.Content`.
- `Autocomplete` é outro nome para `Combobox`, e `ExpansionPanel` para `Accordion`.
- Nomes em minúsculas são funções ou attachments (`toast`, `draggable`, `focusBorder`).

## Components

| Página                                                                           | Pacote                          | Exports                                                                                                                 |
| -------------------------------------------------------------------------------- | ------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| [Accordion](https://oito2.github.io/oito2_uikit/accordion)                       | `@oito2/ui`                     | `Accordion`, `ExpansionPanel`                                                                                           |
| [Alert dialog](https://oito2.github.io/oito2_uikit/alert-dialog)                 | `@oito2/ui`                     | `AlertDialog`                                                                                                           |
| [Angle slider](https://oito2.github.io/oito2_uikit/angle-slider)                 | `@oito2/ui`                     | `AngleSlider`                                                                                                           |
| [Animated icon](https://oito2.github.io/oito2_uikit/animated-icon)               | `@oito2/ui`                     | `AnimatedIcon`, `animatedIcons`                                                                                         |
| [Avatar](https://oito2.github.io/oito2_uikit/avatar)                             | `@oito2/ui`                     | `Avatar`, `AvatarGroup`                                                                                                 |
| [Badge](https://oito2.github.io/oito2_uikit/badge)                               | `@oito2/ui`                     | `Badge`                                                                                                                 |
| [Banner](https://oito2.github.io/oito2_uikit/banner)                             | `@oito2/ui`                     | `Banner`                                                                                                                |
| [Border container](https://oito2.github.io/oito2_uikit/border-container)         | `@oito2/ui`                     | `BorderContainer`                                                                                                       |
| [Button](https://oito2.github.io/oito2_uikit/button)                             | `@oito2/ui`                     | `Button`, `IconButton`, `BackButton`, `CloseButton`                                                                     |
| [Calendar](https://oito2.github.io/oito2_uikit/calendar)                         | `@oito2/ui`                     | `Calendar`, `DatePicker`                                                                                                |
| [Card](https://oito2.github.io/oito2_uikit/card)                                 | `@oito2/ui`                     | `Card`                                                                                                                  |
| [Carousel](https://oito2.github.io/oito2_uikit/carousel)                         | `@oito2/ui`                     | `Carousel`, `CarouselController`                                                                                        |
| [Check button](https://oito2.github.io/oito2_uikit/check-button)                 | `@oito2/ui`                     | `CheckButton`                                                                                                           |
| [Checkbox](https://oito2.github.io/oito2_uikit/checkbox)                         | `@oito2/ui`                     | `Checkbox`, `CheckboxListTile`                                                                                          |
| [Chip](https://oito2.github.io/oito2_uikit/chip)                                 | `@oito2/ui`                     | `Chip`                                                                                                                  |
| [Choice chip bar](https://oito2.github.io/oito2_uikit/choice-chip-bar)           | `@oito2/ui`                     | `ChoiceChipBar`                                                                                                         |
| [Code block](https://oito2.github.io/oito2_uikit/code-block)                     | `@oito2/ui-syntax`              | `CodeBlock`, `Highlighter`, `HighlighterTheme`                                                                          |
| [Collections](https://oito2.github.io/oito2_uikit/collections)                   | `@oito2/ui`                     | `ListCollection`, `TreeCollection`, `SelectionController`, `AsyncListController`                                        |
| [Color disk](https://oito2.github.io/oito2_uikit/color-disk)                     | `@oito2/ui`                     | `ColorDisk`                                                                                                             |
| [Color picker](https://oito2.github.io/oito2_uikit/color-picker)                 | `@oito2/ui`                     | `ColorPicker`, `ColorPickerButton`                                                                                      |
| [Combobox](https://oito2.github.io/oito2_uikit/combobox)                         | `@oito2/ui`                     | `Combobox`, `Autocomplete`                                                                                              |
| [Command palette](https://oito2.github.io/oito2_uikit/command-palette)           | `@oito2/ui`                     | `CommandPalette`, `Commands`, `openCommandPalette`                                                                      |
| [Context menu](https://oito2.github.io/oito2_uikit/context-menu)                 | `@oito2/ui`                     | `ContextMenu`                                                                                                           |
| [Copy button](https://oito2.github.io/oito2_uikit/copy-button)                   | `@oito2/ui`                     | `CopyButton`, `CopyField`                                                                                               |
| [Date and time entry](https://oito2.github.io/oito2_uikit/date-time-entry)       | `@oito2/ui`                     | `DateEntry`, `TimeEntry`, `DateTimeEntry`                                                                               |
| [Diagonal clip](https://oito2.github.io/oito2_uikit/diagonal-clip)               | `@oito2/ui`                     | `DiagonalClip`                                                                                                          |
| [Dialog](https://oito2.github.io/oito2_uikit/dialog)                             | `@oito2/ui`                     | `Dialog`                                                                                                                |
| [Download trigger](https://oito2.github.io/oito2_uikit/download-trigger)         | `@oito2/ui-files`               | `DownloadTrigger`, `Downloads`                                                                                          |
| [Draggable](https://oito2.github.io/oito2_uikit/draggable)                       | `@oito2/ui`                     | `draggable`                                                                                                             |
| [Editable label](https://oito2.github.io/oito2_uikit/editable-label)             | `@oito2/ui`                     | `EditableLabel`                                                                                                         |
| [Expandable](https://oito2.github.io/oito2_uikit/expandable)                     | `@oito2/ui`                     | `Expandable`                                                                                                            |
| [Field](https://oito2.github.io/oito2_uikit/field)                               | `@oito2/ui`                     | `Field`, `TextField`, `TextArea`                                                                                        |
| [File upload](https://oito2.github.io/oito2_uikit/file-upload)                   | `@oito2/ui-files`               | `FileUpload`, `FileDropZone`, `FileUploadController`                                                                    |
| [Floating action button](https://oito2.github.io/oito2_uikit/fab)                | `@oito2/ui`                     | `Fab`                                                                                                                   |
| [Floating panel](https://oito2.github.io/oito2_uikit/floating-panel)             | `@oito2/ui`                     | `FloatingPanel`                                                                                                         |
| [Focus border](https://oito2.github.io/oito2_uikit/focus-border)                 | `@oito2/ui`                     | `focusBorder`, `edgeFocus`                                                                                              |
| [Header bar](https://oito2.github.io/oito2_uikit/header-bar)                     | `@oito2/ui`                     | `HeaderBar`                                                                                                             |
| [Highlighted text](https://oito2.github.io/oito2_uikit/highlighted-text)         | `@oito2/ui`                     | `HighlightedText`                                                                                                       |
| [Hover card](https://oito2.github.io/oito2_uikit/hover-card)                     | `@oito2/ui`                     | `HoverCard`                                                                                                             |
| [Image cropper](https://oito2.github.io/oito2_uikit/image-cropper)               | `@oito2/ui-extras`              | `ImageCropper`, `CropPreview`, `CropController`                                                                         |
| [Info box and badge](https://oito2.github.io/oito2_uikit/info)                   | `@oito2/ui`                     | `InfoBox`, `InfoBadge`                                                                                                  |
| [JSON tree view](https://oito2.github.io/oito2_uikit/json-tree-view)             | `@oito2/ui`                     | `JsonTreeView`                                                                                                          |
| [List box](https://oito2.github.io/oito2_uikit/list-box)                         | `@oito2/ui`                     | `ListBox`                                                                                                               |
| [List tile](https://oito2.github.io/oito2_uikit/list-tile)                       | `@oito2/ui`                     | `ListTile`                                                                                                              |
| [Marquee](https://oito2.github.io/oito2_uikit/marquee)                           | `@oito2/ui`                     | `Marquee`                                                                                                               |
| [Master-detail](https://oito2.github.io/oito2_uikit/master-detail)               | `@oito2/ui`                     | `MasterDetail`                                                                                                          |
| [Menu](https://oito2.github.io/oito2_uikit/menu)                                 | `@oito2/ui`                     | `Menu`                                                                                                                  |
| [Navigation bar](https://oito2.github.io/oito2_uikit/navigation-bar)             | `@oito2/ui`                     | `NavigationBar`                                                                                                         |
| [Navigation menu](https://oito2.github.io/oito2_uikit/navigation-menu)           | `@oito2/ui-extras`              | `NavigationMenu`                                                                                                        |
| [Navigation page](https://oito2.github.io/oito2_uikit/navigation-page)           | `@oito2/ui`                     | `NavigationPage`                                                                                                        |
| [Navigation rail](https://oito2.github.io/oito2_uikit/navigation-rail)           | `@oito2/ui`                     | `NavigationRail`                                                                                                        |
| [Number entry](https://oito2.github.io/oito2_uikit/number-entry)                 | `@oito2/ui`                     | `NumberEntry`                                                                                                           |
| [Option button](https://oito2.github.io/oito2_uikit/option-button)               | `@oito2/ui`                     | `OptionButton`                                                                                                          |
| [Page indicator](https://oito2.github.io/oito2_uikit/page-indicator)             | `@oito2/ui`                     | `PageIndicator`                                                                                                         |
| [Pagination](https://oito2.github.io/oito2_uikit/pagination)                     | `@oito2/ui`                     | `Pagination`                                                                                                            |
| [Paned view](https://oito2.github.io/oito2_uikit/paned-view)                     | `@oito2/ui`                     | `PanedView`                                                                                                             |
| [Password field](https://oito2.github.io/oito2_uikit/password-field)             | `@oito2/ui`                     | `PasswordField`                                                                                                         |
| [PIN entry](https://oito2.github.io/oito2_uikit/pin-entry)                       | `@oito2/ui`                     | `PinEntry`                                                                                                              |
| [Placeholder icon](https://oito2.github.io/oito2_uikit/placeholder-icon)         | `@oito2/ui`                     | `PlaceholderIcon`                                                                                                       |
| [Popover](https://oito2.github.io/oito2_uikit/popover)                           | `@oito2/ui`                     | `Popover`, `PopoverController`                                                                                          |
| [Progress](https://oito2.github.io/oito2_uikit/progress)                         | `@oito2/ui`                     | `CircularProgress`, `LinearProgress`                                                                                    |
| [QR code](https://oito2.github.io/oito2_uikit/qr-code)                           | `@oito2/ui-extras`              | `QrCode`                                                                                                                |
| [Radio](https://oito2.github.io/oito2_uikit/radio)                               | `@oito2/ui`                     | `RadioGroup`, `RadioListTile`, `RadioButton`                                                                            |
| [Rating](https://oito2.github.io/oito2_uikit/rating)                             | `@oito2/ui`                     | `Rating`                                                                                                                |
| [Scroll area](https://oito2.github.io/oito2_uikit/scroll-area)                   | `@oito2/ui`                     | `ScrollArea`, `undershoot`                                                                                              |
| [Search field](https://oito2.github.io/oito2_uikit/search-field)                 | `@oito2/ui`                     | `SearchField`, `SearchTitleField`                                                                                       |
| [Section](https://oito2.github.io/oito2_uikit/section)                           | `@oito2/ui`                     | `Section`                                                                                                               |
| [Segment group](https://oito2.github.io/oito2_uikit/segment-group)               | `@oito2/ui`                     | `SegmentGroup`                                                                                                          |
| [Segmented entry](https://oito2.github.io/oito2_uikit/segmented-entry)           | `@oito2/ui`                     | `SegmentedEntry`                                                                                                        |
| [Select](https://oito2.github.io/oito2_uikit/select)                             | `@oito2/ui`                     | `Select`                                                                                                                |
| [Selectable container](https://oito2.github.io/oito2_uikit/selectable-container) | `@oito2/ui`                     | `SelectableContainer`                                                                                                   |
| [Separator](https://oito2.github.io/oito2_uikit/separator)                       | `@oito2/ui`                     | `Separator`                                                                                                             |
| [Sheet](https://oito2.github.io/oito2_uikit/sheet)                               | `@oito2/ui`                     | `Sheet`                                                                                                                 |
| [Shortcuts](https://oito2.github.io/oito2_uikit/shortcuts)                       | `@oito2/ui`                     | `ShortcutLabel`, `ShortcutRecorder`, `Shortcut`, `KeyChord`                                                             |
| [Signature pad](https://oito2.github.io/oito2_uikit/signature-pad)               | `@oito2/ui-extras`              | `SignaturePad`, `SignatureController`                                                                                   |
| [Slider](https://oito2.github.io/oito2_uikit/slider)                             | `@oito2/ui`                     | `Slider`                                                                                                                |
| [Split button](https://oito2.github.io/oito2_uikit/split-button)                 | `@oito2/ui`                     | `SplitButton`                                                                                                           |
| [Splitter](https://oito2.github.io/oito2_uikit/splitter)                         | `@oito2/ui`                     | `Splitter`                                                                                                              |
| [Steps](https://oito2.github.io/oito2_uikit/steps)                               | `@oito2/ui`                     | `Steps`                                                                                                                 |
| [Swap](https://oito2.github.io/oito2_uikit/swap)                                 | `@oito2/ui`                     | `Swap`                                                                                                                  |
| [Switch](https://oito2.github.io/oito2_uikit/switch)                             | `@oito2/ui`                     | `Switch`, `SwitchListTile`, `SwitchButton`                                                                              |
| [Table of contents](https://oito2.github.io/oito2_uikit/table-of-contents)       | `@oito2/ui`                     | `TableOfContents`                                                                                                       |
| [Tabs](https://oito2.github.io/oito2_uikit/tabs)                                 | `@oito2/ui`                     | `Tabs`                                                                                                                  |
| [Tags field](https://oito2.github.io/oito2_uikit/tags-field)                     | `@oito2/ui`                     | `TagsField`                                                                                                             |
| [Tile](https://oito2.github.io/oito2_uikit/tile)                                 | `@oito2/ui`                     | `Tile`, `TileList`                                                                                                      |
| [Timer](https://oito2.github.io/oito2_uikit/timer)                               | `@oito2/ui`                     | `TimerText`, `TimerController`                                                                                          |
| [Title bar](https://oito2.github.io/oito2_uikit/title-bar)                       | `@oito2/ui`, `@oito2/ui-window` | `TitleBar`, `WindowTitleBar`, `DialogTitleBar`, `WindowControl`, `WindowControls`, `WindowScope`, `WindowResizeHandles` |
| [Toast](https://oito2.github.io/oito2_uikit/toast)                               | `@oito2/ui`                     | `Toaster`, `toast`                                                                                                      |
| [Toggle button](https://oito2.github.io/oito2_uikit/toggle-button)               | `@oito2/ui`                     | `ToggleButton`                                                                                                          |
| [Toggle group](https://oito2.github.io/oito2_uikit/toggle-group)                 | `@oito2/ui`                     | `ToggleGroup`                                                                                                           |
| [Tooltip](https://oito2.github.io/oito2_uikit/tooltip)                           | `@oito2/ui`                     | `Tooltip`                                                                                                               |
| [Tour](https://oito2.github.io/oito2_uikit/tour)                                 | `@oito2/ui`                     | `Tour`, `TourController`                                                                                                |
| [Tree view](https://oito2.github.io/oito2_uikit/tree-view)                       | `@oito2/ui`                     | `TreeView`, `TreeController`                                                                                            |
| [Watermark](https://oito2.github.io/oito2_uikit/watermark)                       | `@oito2/ui`                     | `Watermark`                                                                                                             |

## Theme

| Página                                                         | Pacote                            | Exports                                                |
| -------------------------------------------------------------- | --------------------------------- | ------------------------------------------------------ |
| [Colors](https://oito2.github.io/oito2_uikit/colors)           | `@oito2/ui`                       | `ThemeProvider`                                        |
| [Foundation](https://oito2.github.io/oito2_uikit/foundation)   | `@oito2/ui`, `@oito2/ui-settings` | `SystemScope`, `LocaleProvider`, `SystemSettingsScope` |
| [Icons](https://oito2.github.io/oito2_uikit/icons)             | —                                 | —                                                      |
| [Material theme](https://oito2.github.io/oito2_uikit/material) | —                                 | —                                                      |

A página **Icons** lista os ícones Lucide que `@oito2/ui/icons` reexporta, e **Material theme** mostra os primitivos do Material 3 reestilizados como o tema do oito2_ui, com o esquema ativo; nenhuma das duas documenta um export próprio.

## Exports sem página no catálogo

O catálogo documenta os componentes. Os pacotes também exportam funções que não têm página própria, como `useTheme`, `createColorTheme`, `useSystemSettings`, `useLocale`, `Format`, `WindowButtonLayout`, `Platform` e as funções matemáticas dos componentes (`sliderFraction`, `paginationItems`, ...). Os [READMEs dos pacotes](./packages.md) os listam por área.

## Veja também

- [Pacotes](./packages.md) — pontos de entrada e dependências.
- [Exemplos de fluxos](../guides/workflows/examples.md) — telas montadas com estes componentes.
