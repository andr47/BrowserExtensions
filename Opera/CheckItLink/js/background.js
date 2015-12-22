// background.js
//QaFQnlXXB10tdhzNRmicdYtarpDnG67n6D6kRS7jHYEM66pNjy
var JSOptions;

/**
 * Настройки по-умолчанию
 * @type {Object}
 */
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
	// хранилище для категорий полученных с сервера
	categories: [],
	// запрос уведомлений включен или нет
	notifyFlag: false,
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
	ExportFileName: "Opera_Bookmarks_Export.html",
	// временное хранилище для URL страницы при добавлении изображения
	PAGEURL: 0,
	// флаг кнопки "Добавить" на страницах
	showButton: true
};

chrome.storage.sync.get("_OPTIONS", function (obj) {
	if(obj._OPTIONS){
		JSOptions = new JSOptions(JSON.parse(obj._OPTIONS));
	}
	else{
		JSOptions = new JSOptions(Options);
	}
	//alert(JSON.stringify(JSOptions.getItem("showButton")));
	/**
	 * Устанавливаем ссылку, которая откроется после удаления расширения
	 */
	if(JSOptions.getItem("UninstallURL") === true){
		chrome.runtime.setUninstallURL(JSOptions.getItem("UninstallURL"));
	}
});


/**
 * Создаем пункты в контекстном меню
 * @return {None}
 */
function createMenu(){
	chrome.contextMenus.removeAll(function(){});
	/**
	 * Создаем корневой пункт меню
	 */
	var root = chrome.contextMenus.create({
		title: chrome.i18n.getMessage("addUrlToBookmarks_menu_root"), 
		contexts: ["link", "page"],
		id: "addUrlToBookmarks"
	});
	/**
	 * Создаем вложенные пункты
	 */
	var item1 = chrome.contextMenus.create({
		title: chrome.i18n.getMessage("addUrlToBookmarks_menu_item1"), 
		contexts: ["page"],
		id: "addUrl_item1",
		parentId: root
	});
	/*
	var item2 = chrome.contextMenus.create({
		title: chrome.i18n.getMessage("addUrlToBookmarks_menu_item2"), 
		contexts: ["page"],
		id: "addUrl_item2", 
		parentId: root
	});
	*/
	var item3 = chrome.contextMenus.create({
		title: chrome.i18n.getMessage("addUrlToBookmarks_menu_item4"), 
		contexts: ["image"],
		id: "addUrl_item3",
		parentId: root
	});
	var item4 = chrome.contextMenus.create({
		title: chrome.i18n.getMessage("addUrlToBookmarks_menu_item5"), 
		contexts: ["link"],
		id: "addUrl_item4",
		parentId: root
	});
}

/**
 * Обработчик клика по пункту меню
 * @param {Object} info [Информация о нажатом пункте меню]
 * @param {Object} tab [Информация о текущей вкладке]
 */
function addUrlToBookmarks(info, tab){
	switch(info.menuItemId){
		/**
		 *	Если нажат пункт меню "Добавить текущую страницу"
		 */
		case "addUrl_item1":
			chrome.windows.getCurrent(function(w){
				chrome.tabs.getSelected(w.id,function(t){
					var height, width;
					var top = String(w.height / 2 - 300);
					var left = String(w.width / 2 - 300);
					JSOptions.setItem("PAGEURL", 0);
					chrome.storage.sync.set({"TITLE": String(t.title), "URL": String(t.url)}, function(){
						var newWin = window.open(
							chrome.extension.getURL('popup.html'), 
							"popup", 
							"width=600,height=600,top="+top+",left="+left+",status=no,scrollbars=yes,resizable=no"
						);
						newWin.focus();
					});
				});
			});
			break;
		/**
		 * Если нажат пункт меню "Экспорт на сайт"
		 */
		/*case "addUrl_item2":
			chrome.windows.getCurrent(function(w){
				chrome.tabs.getSelected(w.id,function(t){
					var height, width;
					var top = String(w.height / 2 - 300);
					var left = String(w.width / 2 - 300);
					JSOptions.setItem("PAGEURL", 0);
					chrome.storage.sync.set({"TITLE": String(t.title), "URL": String(t.url)}, function(){
						var newWin = window.open(
							chrome.extension.getURL('popup.html'), 
							"popup", 
							"width=600,height=600,top="+top+",left="+left+",status=no,scrollbars=yes,resizable=no"
						);
						newWin.focus();
					});
				});
			});
			break;*/
		/**
		 * Если нажат пункт меню "Добавить изображение"
		 */
		case "addUrl_item3":
			chrome.windows.getCurrent(function(w){
				chrome.tabs.getSelected(w.id,function(t){
					var height, width;
					var top = String(w.height / 2 - 250);
					var left = String(w.width / 2 - 300);
					JSOptions.setItem("PAGEURL", info.pageUrl);
					chrome.storage.sync.set({"TITLE": String(t.title), "URL": String(info.srcUrl)}, function(){
						var newWin = window.open(
							chrome.extension.getURL('popup.html'), 
							"popup", 
							"width=600,height=500,top="+top+",left="+left+",status=no,scrollbars=yes,resizable=no"
						);
						newWin.focus();
					});
				});
			});
			break;
		/**
		 * Если нажат пункт меню "Добавить ссылку под курсором"
		 */
		case "addUrl_item4":
			chrome.windows.getCurrent(function(w){
				chrome.tabs.getSelected(w.id,function(t){
					var height, width;
					var top = String(w.height / 2 - 300);
					var left = String(w.width / 2 - 300);
					JSOptions.setItem("PAGEURL", 0);
					chrome.storage.sync.set({"TITLE": String(info.pageUrl), "URL": String(info.linkUrl)}, function(){
						var newWin = window.open(
							chrome.extension.getURL('popup.html'), 
							"popup", 
							"width=600,height=600,top="+top+",left="+left+",status=no,scrollbars=yes,resizable=no"
						);
						newWin.focus();
					});
				});
			});
			break;
	}
}

/**
 * Вешаем обработчик на вызов пункта меню
 */
chrome.contextMenus.onClicked.addListener(addUrlToBookmarks);

/**
 * При обновлении вкладки показываем или скрываем иконку расширения и пункты меню.
 * Разрешаем работу только на страницах с протоколом http, https, ftp
 */
chrome.tabs.onUpdated.addListener(function(id,info,tab){
	var re = new RegExp(/^(https?)|(ftp)\:\/\/.*/i);
	if (re.test(tab.url)){
		chrome.pageAction.show(id);
		createMenu();

	}
	else{
		chrome.pageAction.hide(id);
	}
});


/**
 * Функция отправляет запрос на сервер и показывает уведомления если они есть
 * @return {None}
 */
function getNotify(){
	chrome.storage.sync.get(["notifyFlag", "SECRET_KEY"], function (obj) {
		if(obj.SECRET_KEY){
			if(JSON.parse(obj.notifyFlag) === true){
				var params = {
					SECRET_KEY: obj.SECRET_KEY, 
					action: serverActions.GET_NOTIFICATIONS,
					APPID: JSOptions.getItem("ThisAppID")
				};
				
				$.ajax({
					type: JSOptions.getItem("defaultMethod"),
					url: JSOptions.getItem("defaultURL"),
					dataType: 'json',
					data: {request: JSON.stringify(params)},
					error: function(jqXHR, textStatus, errorThrown){
						//alert(chrome.i18n.getMessage("AJAXError"));
						try {
							console.error(jqXHR.responseText);
						} 
						catch (e) { }
					},
					// перед отправкой проверяем есть ли подключение к интернету и если нет, то запрос не произойдет
					beforeSend: function(jqXHR, settings ){return navigator.onLine;},
					// обработаем ответ сервера
					success: function(res){
						// если код 200, то SECRET_KEY верный и уведомление получено
						if(res.response.code == JSOptions.getItem("response").code.ok){
							// вывод уведомления
							var notification = new Notification(res.response.title, {
								tag : JSOptions.getItem("currentNotifyId"),
								icon: 'img/icon/icon-48.png',
								body: res.response.message
							});

							notification.onclick = function () {
								chrome.tabs.create({url:JSOptions.getItem("baseURL")},function(tab){});     
							};
						}
					}
				});
			}
		}
	});
}

/**
 * По таймеру получаем уведомления с сайта
 */
chrome.storage.sync.get(["notifyInterval", "notifyFlag"], function (obj) {
	if(obj.notifyInterval && obj.notifyFlag){
		chrome.alarms.create("getNotify", {periodInMinutes: JSON.parse(obj.notifyInterval)});
	}
	else{
		chrome.storage.sync.set({"notifyFlag":String(JSOptions.getItem("notifyFlag"))}, function (flag){
			if(JSOptions.getItem("notifyFlag")){
				chrome.alarms.create("getNotify", {periodInMinutes: JSOptions.getItem("notifyInterval")});
			}
		});
	}
});
chrome.alarms.onAlarm.addListener(function(alarm) {
	if(alarm.name == "getNotify"){
		getNotify();
	}
});

/**
 * Устанавливаем ссылку, которая откроется после установки расширения
 */
chrome.runtime.onInstalled.addListener(function(details){
	chrome.runtime.openOptionsPage();
	/**
	 * При установке сохраним APPID расширения
	 */
	JSOptions.setItem("ThisAppID", details.id);

	if(JSOptions.getItem("InstallURL") === true){
		chrome.tabs.create({url:JSOptions.getItem("InstallURL")},function(tab){}); 
	}
	/**
	 * Сообщаем на сервер, что установка произошла
	 */
	chrome.runtime.getPlatformInfo(function(info){
		var params = { 
						action: serverActions.INSTALLED, 
						data: {
							info: info, 
							previousVersion: details.previousVersion, 
							reason: details.reason
						},
						APPID: JSOptions.getItem("ThisAppID")
					};

		/*#TODO*/
		//alert(JSON.stringify(params));

		$.ajax({
			type: JSOptions.getItem("defaultMethod"),
			url: JSOptions.getItem("defaultURL"),
			dataType: 'json',
			data: {
				request: JSON.stringify(params)
			},
			// обработаем ответ сервера
			success: function(res){
				//console.log("INSTALLED info send by server!");
			}
		});

	});
});

/**
 * Обработчик изменения localStorage
 */
chrome.storage.onChanged.addListener(function(changes, namespace){
	for (key in changes){
		var storageChange = changes[key];
		try {
			JSOptions.setItem(key, JSON.parse(storageChange.newValue));
		} 
		catch (e) {
			JSOptions.setItem(key, storageChange.newValue);
		}
		// если была отключена кнопка в настройках
		if(key == "showButton"){
			var info = {
				"sender": "backgroundScript",
				"status": 1,
				"showButton": JSON.parse(storageChange.newValue)
			}
			// то отправим в content.js сигнал, что кнопку надо скрыть
			sendMessageToContentScript(info);
		}
	}
});

/**
 * Обработчик закрытия расширения
 */
chrome.runtime.onSuspend.addListener(function() {
	var opts = JSOptions.get();
	opts.marks = Options.marks;
	chrome.storage.sync.set(
		{
			"_OPTIONS": JSON.stringify(opts)
		}, 
		function (obj){}
	);
});

/**
 * Обработчик команд при использовании хоткеев.
 * Пока хоткей только 1 - Ctrl+Shift+A (вызов окна расширения)
 * Но на будущее пусть будет ))
 */
chrome.commands.onCommand.addListener(function(command) {
	if (command == 'test') {
		alert('Keyboard shortcut from extension worked!');
	}
});


function ListenButtonOnPage(imgInfo){
	/*#TODO*/
	//alert(JSON.stringify(imgInfo));
	var top = String(imgInfo.windowSize.height / 2 - 250);
	var left = String(imgInfo.windowSize.width / 2 - 300);
	JSOptions.setItem("PAGEURL", imgInfo.pageUrl);
	chrome.storage.sync.set({"TITLE": imgInfo.pageTitle, "URL": imgInfo.srcUrl}, function(){
		var newWin = window.open(
			chrome.extension.getURL('popup.html'), 
			"popup", 
			"width=600,height=500,top="+top+",left="+left+",status=no,scrollbars=yes,resizable=no"
		);
		newWin.focus();
	});

	var Info = {
		"sender": "backgroundScript",
		"status": 1
	}

	sendMessageToContentScript(Info);

}

/**
 * Слушаем сообщения от content.js
 */
chrome.extension.onMessage.addListener(function(msg, sender, sendResponse){
	if (msg.sender == 'contentScript'){
		if (msg.action == 'ADDIMAGE'){
			ListenButtonOnPage(msg);
		}
		if (msg.action == 'GETOPTIONS'){
			var params = {
				"sender": "backgroundScript",
				"status": 1,
				"opts": JSOptions.get()
			}
			sendMessageToContentScript(params);
		}
	}
});

function sendMessageToContentScript(params){
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
		chrome.tabs.sendMessage(tabs[0].id, params, function(response) {});
	});
}