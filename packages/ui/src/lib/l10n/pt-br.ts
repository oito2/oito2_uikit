// Copyright (C) 2026  OITO2
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import type { Localizations, TimeUnit } from './localizations.js';

const units: Readonly<Record<TimeUnit, readonly [string, string]>> = {
	second: ['segundo', 'segundos'],
	minute: ['minuto', 'minutos'],
	hour: ['hora', 'horas'],
	day: ['dia', 'dias'],
	week: ['semana', 'semanas'],
	month: ['mês', 'meses'],
	year: ['ano', 'anos']
};

// Returns the count followed by the singular or plural Portuguese unit.
function unit(count: number, name: TimeUnit): string {
	const [one, many] = units[name];
	return count === 1 ? `1 ${one}` : `${count} ${many}`;
}

/** The Brazilian Portuguese strings. */
export const ptBR: Localizations = {
	locale: 'pt-BR',
	minimizeWindow: 'Minimizar',
	maximizeWindow: 'Maximizar',
	restoreWindow: 'Restaurar',
	closeWindow: 'Fechar',
	resizePane: 'Redimensionar painel',
	moreOptions: 'Mais opções',
	scrollBack: 'Rolar para trás',
	scrollForward: 'Rolar para frente',
	justNow: 'agora',
	commandPaletteHint: 'Digite um comando',
	noCommandsFound: 'Nenhum comando encontrado',
	pressShortcut: 'Pressione um atalho',
	noShortcut: 'Sem atalho',
	clearShortcut: 'Limpar atalho',
	noResults: 'Nenhum resultado',
	close: 'Fechar',
	dismiss: 'Dispensar',
	notifications: 'Notificações',
	resizeSheet: 'Redimensionar painel',
	tourBack: 'Voltar',
	tourNext: 'Próximo',
	tourDone: 'Concluir',
	tourSkip: 'Pular tour',
	showPassword: 'Mostrar senha',
	hidePassword: 'Ocultar senha',
	capsLockOn: 'Caps Lock está ativado',
	increase: 'Aumentar',
	decrease: 'Diminuir',
	editText: 'Pressione Enter para editar',
	hue: 'Matiz',
	saturation: 'Saturação',
	brightness: 'Brilho',
	lightness: 'Luminosidade',
	opacity: 'Opacidade',
	red: 'Vermelho',
	green: 'Verde',
	blue: 'Azul',
	saturationAndBrightness: 'Saturação e brilho',
	weekNumberHeading: 'Sem',
	copied: 'Copiado',
	copyFailed: 'Não foi possível copiar',
	moveWithArrowKeys: 'Use as setas do teclado para mover',
	mainMenu: 'Menu principal',
	moveUp: 'Mover para cima',
	moveDown: 'Mover para baixo',
	moveLeft: 'Mover para a esquerda',
	moveRight: 'Mover para a direita',
	itemsPerPage: 'Itens por página',
	stepCompleted: 'Concluído',
	stepCurrent: 'Atual',
	stepError: 'Requer atenção',
	removeTagHint: 'Pressione Delete para remover',
	hexColor: 'Hex',
	infoInformation: 'Informação',
	infoSuccess: 'Sucesso',
	infoWarning: 'Aviso',
	infoDanger: 'Erro',
	infoImportant: 'Importante',
	loading: 'Carregando',
	statusOnline: 'Online',
	statusAway: 'Ausente',
	statusBusy: 'Ocupado',
	statusOffline: 'Offline',
	qrCode: 'Código QR',
	qrTooLong: 'Dados demais para um código QR',
	signature: 'Assinatura',
	signHere: 'Assine aqui',
	signed: 'Assinado',
	empty: 'Vazio',
	undo: 'Desfazer',
	clear: 'Limpar',
	imageCropper: 'Recorte de imagem',
	rotateLeft: 'Girar à esquerda',
	rotateRight: 'Girar à direita',
	flipHorizontally: 'Espelhar horizontalmente',
	zoomIn: 'Ampliar',
	zoomOut: 'Reduzir',
	reset: 'Redefinir',
	dropFilesHere: 'Solte os arquivos aqui',
	chooseFiles: 'Escolher arquivos',
	chooseFile: 'Escolher um arquivo',
	download: 'Baixar',
	downloadUnavailable: 'Downloads não estão disponíveis neste dispositivo',
	pageOf: (page, count) => `Página ${page} de ${count}`,
	partOf: (part, count) => `Parte ${part} de ${count}`,
	timeAgo: (count, timeUnit) => `há ${unit(count, timeUnit)}`,
	timeFromNow: (count, timeUnit) => `em ${unit(count, timeUnit)}`,
	resultCount: (count) => (count === 1 ? '1 resultado' : `${count} resultados`),
	tourProgress: (step, total) => `Passo ${step} de ${total}`,
	codeEntry: (length) => `Código de ${length} caracteres`,
	ratingValue: (value, max) => `${value} de ${max} estrelas`,
	removeItem: (label) => `Remover ${label}`,
	weekNumber: (week) => `Semana ${week}`,
	pageNumber: (page) => `Página ${page}`,
	stepOf: (step, count) => `Passo ${step} de ${count}`,
	dateRange: (start, end) => `${start} – ${end}`,
	moreCount: (count) => `Mais ${count}`,
	acceptedFileTypes: (types) => `Aceitos: ${types}`,
	maxFileSizeHint: (size) => `Até ${size} cada`,
	fileTypeNotAccepted: (name) => `${name}: este tipo de arquivo não é aceito`,
	fileTooLarge: (name, size) => `${name}: maior que ${size}`,
	tooManyFiles: (name, max) =>
		max === 1
			? `${name}: só é possível adicionar 1 arquivo`
			: `${name}: só é possível adicionar ${max} arquivos`,
	folderNotAccepted: (name) => `${name}: pastas não são aceitas`
};
