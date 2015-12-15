// options.js

var Options = {
	// ID приложения. Будем его отправлять с каждым запросом на сервер, чтобы знать из какого браузера обращаются.
	ThisAppID: chrome.runtime.id,
	// коды ответов сервера. Если решите поменять коды в обработчике, то поменяйте и здесь
	response: {
		code: {
			// успешная операция. При запросе уведомлений означает, что уведомления есть
			ok: 200,
			// ошибочная операция. При запросе уведомлений означает, что уведомлений нет
			error: 401
		}
	},
	// хранилище для экспортируемых закладок. Не спрашивайте "Почему"... Я так вижу )))
	marks: {
		data: [],
		categories: []
	},
	// ID текущего окна уведомления, чтобы не плодить их кучу ))
	currentNotifyId: "checkitlink",
	// url сайта
	baseURL: 'https://checkitlink.com',
	// url страницы пожертвования
	donateURL: 'https://checkitlink.com/donate.html',
	// url страницы справки (можно поменять на страницу на сайте)
	aboutURL: 'https://checkitlink.com/index.php?r=site/faq',
	// хранилище для хэштегов полученных с сервера
	hashtags: [],
	// хэштеги по умолчанию на случай если не удастся получить с сервера
	staticHashtags: [
		"Youtube", 
		"Соцсети", 
		"Всякая херня", 
		"Порно )))", 
		"Картинки", 
		"Игры", 
		"Кино", 
		"Программирование"
	],
	// категории по умолчанию на случай если не удастся получить с сервера
	staticCategories: [
		{id: 1, name: "Youtube"}, 
		{id: 2, name: "Соцсети"}, 
		{id: 3, name: "Всякая херня"}, 
		{id: 4, name: "Порно )))"}, 
		{id: 5, name: "Картинки"}, 
		{id: 6, name: "Игры"}, 
		{id: 7, name: "Кино"}, 
		{id: 8, name: "Программирование"}
	],
	// запрос уведомлений включен или нет
	notifyFlag: true,
	// запрос уведомлений каждые N минут
	notifyInterval: 1,
	// запрос уведомлений минимум каждые N минут
	notifyIntervalMin: 1,
	// запрос уведомлений максимум каждые N минут (1440 минут == сутки)
	notifyIntervalMax: 1440,
	// url обработчика запросов
	// http://ok.freelanceronline.ru/checkitlink.php
	// https://checkitlink.com/index.php?r=newlink/index
	defaultURL: 'https://checkitlink.com/index.php?r=newlink/index',
	// метод отправки запросов к обработчику
	defaultMethod: 'POST',
	// ссылка, куда нужно перейти после удаления расширения
	UninstallURL: false,
	// ссылка, куда нужно перейти после установки расширения
	InstallURL: false,
	// имя файла экспорта закладок
	ExportFileName: "Google_Chrome_Bookmarks_Export.html"
}


function save_options() {
  	var min = Options.notifyIntervalMin;
	var max = Options.notifyIntervalMax;
	var val = parseInt($('#NotifyIntervalInput').val());
	var re = new RegExp(/^[1-9][0-9]?/i);
	if(!re.test(val)){
		val = Options.notifyInterval;
	}
	else if(val > max || val < min){
		val = Options.notifyInterval;
	}
	$('#NotifyIntervalInput').val(String(val));
	chrome.storage.sync.set({"notifyInterval": String(val)});
	chrome.storage.sync.set({"notifyFlag": String($('#NotifyCheckbox').prop("checked"))});
	chrome.alarms.clear("getNotify");
	chrome.alarms.create("getNotify", {periodInMinutes: parseInt(val)});
}

function restore_options() {
	chrome.storage.sync.get(["notifyInterval", "notifyFlag"], function (obj) {
		var interval = obj.notifyInterval;
		var checked = obj.notifyFlag;
		if(interval){
			$('#NotifyIntervalInput').val(String(interval));
		}
		else {
			interval = Options.notifyInterval;
			$('#NotifyIntervalInput').val(String(interval));
			chrome.storage.sync.set({"notifyInterval": String(interval)});
		}
		if(checked){
			if(checked === "true") checked = true;
			else if(checked === "false") checked = false;
			$('#NotifyCheckbox').prop("checked", checked);
		}
		else {
			checked = Options.notifyFlag;
			$('#NotifyCheckbox').prop("checked", checked);
			chrome.storage.sync.set({"notifyFlag": String(checked)});
		}
	});
}


$('#options_page_button_save_options').on('click', function() {
	save_options();
});


/**
 * Обработчик события загрузки страницы настроек
 */
$(document).ready(function(){
	$('#NotifyIntervalInput').attr({"min": String(Options.notifyIntervalMin)});
	$('#NotifyIntervalInput').attr({"max": String(Options.notifyIntervalMax)});
	$('#options_page_NotifyCheckbox').text(chrome.i18n.getMessage("options_page_NotifyCheckbox"));
	$('#options_page_NotifyIntervalInput').text(chrome.i18n.getMessage("options_page_NotifyIntervalInput"));
	$('#options_page_button_save_options_text').text(chrome.i18n.getMessage("options_page_button_save_options"));
	restore_options();
});
