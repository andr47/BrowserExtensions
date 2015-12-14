// background.js

/*
*	Создаем пункты в контекстном меню
*/
function createMenu(){
	chrome.contextMenus.removeAll(function(){});
	/*
	*	создаем корневой пункт меню
	*/
	var root = chrome.contextMenus.create({
		title: chrome.i18n.getMessage("addUrlToBookmarks_menu_root"), 
		contexts: ["link", "page"],
		id: "addUrlToBookmarks"
	});
	/*
	*	создаем вложенные пункты
	*/
	var item1 = chrome.contextMenus.create({
		title: chrome.i18n.getMessage("addUrlToBookmarks_menu_item1"), 
		contexts: ["page"],
		id: "addUrl_item1",
		parentId: root
	});
	var item2 = chrome.contextMenus.create({
		title: chrome.i18n.getMessage("addUrlToBookmarks_menu_item2"), 
		contexts: ["page"],
		id: "addUrl_item2", 
		parentId: root
	});
	var item3 = chrome.contextMenus.create({
		title: chrome.i18n.getMessage("addUrlToBookmarks_menu_item3"), 
		contexts: ["page"],
		id: "addUrl_item3", 
		parentId: root
	});
	var item6 = chrome.contextMenus.create({
		title: chrome.i18n.getMessage("addUrlToBookmarks_menu_item6"), 
		contexts: ["link"],
		id: "addUrl_item6",
		parentId: root
	});
}

/*
*	Обработчик клика по пункту меню
*/
function addUrlToBookmarks(info, tab){
	//alert("info: " + JSON.stringify(info));
	//alert("tab: " + JSON.stringify(tab));
	switch(info.menuItemId){
		/*
		*	если нажат пункт меню "Добавить текущую страницу"
		*/
		case "addUrl_item1":
			chrome.windows.getCurrent(function(w){
				chrome.tabs.getSelected(w.id,function(t){
					var height, width;
					var top = String(w.height / 2 - 300);
					var left = String(w.width / 2 - 300);
					chrome.storage.sync.set({"TITLE": String(t.title), "URL": String(t.url)}, function(){
						var newWin = window.open(chrome.extension.getURL('popup.html'), "window", "width=600,height=600,top="+top+",left="+left+",status=no,scrollbars=yes,resizable=no");
						newWin.focus();
					});
				});
			});
			break;
		/*
		*	если нажат пункт меню "Экспорт на сайт"
		*/
		case "addUrl_item2":
			chrome.windows.getCurrent(function(w){
				chrome.tabs.getSelected(w.id,function(t){
					var height, width;
					var top = String(w.height / 2 - 300);
					var left = String(w.width / 2 - 300);
					chrome.storage.sync.set({"TITLE": String(t.title), "URL": String(t.url), "tempData": "export"}, function(){
						var newWin = window.open(chrome.extension.getURL('popup.html'), "window", "width=600,height=600,top="+top+",left="+left+",status=no,scrollbars=yes,resizable=no");
						newWin.focus();
					});
				});
			});
			break;
		/*
		*	если нажат пункт меню "Экспорт в файл"
		*/
		case "addUrl_item3":
			chrome.windows.getCurrent(function(w){
				chrome.tabs.getSelected(w.id,function(t){
					var height, width;
					var top = String(w.height / 2 - 300);
					var left = String(w.width / 2 - 300);
					chrome.storage.sync.set({"TITLE": String(t.title), "URL": String(t.url), "tempData": "exportToFile"}, function(){
						var newWin = window.open(chrome.extension.getURL('popup.html'), "window", "width=600,height=600,top="+top+",left="+left+",status=no,scrollbars=yes,resizable=no");
						newWin.focus();
					});
				});
			});
			break;
		/*
		*	если нажат пункт меню "Добавить ссылку под курсором"
		*/
		case "addUrl_item6":
			chrome.windows.getCurrent(function(w){
				chrome.tabs.getSelected(w.id,function(t){
					var height, width;
					var top = String(w.height / 2 -300);
					var left = String(w.width / 2 - 300);
					chrome.storage.sync.set({"TITLE": String(info.linkUrl), "URL": String(info.linkUrl)}, function(){
						var newWin = window.open(chrome.extension.getURL('popup.html'), "window", "width=600,height=600,top="+top+",left="+left+",status=no,scrollbars=yes,resizable=no");
						newWin.focus();
					});
				});
			});
			break;
	}
}

/*
*	вешаем обработчик на вызов пункта меню
*/
chrome.contextMenus.onClicked.addListener(addUrlToBookmarks);

/*
*	При обновлении вкладки показываем или скрываем иконку расширения и пункты меню.
*	Разрешаем работу только на страницах с протоколом http, https, ftp
*/
chrome.tabs.onUpdated.addListener(function(id,info,tab){
	var re = new RegExp(/^(https?)|(ftp)\:\/\/.*/i);
	if (re.test(tab.url)){
		chrome.pageAction.show(id);
		createMenu();

	}
	else{
		chrome.pageAction.hide(id);
		//chrome.contextMenus.removeAll(function(){});
	}
});


/*
*	Функция отправляет запрос на сервер и показывает уведомления если они есть
*/
function getNotify(){
	chrome.storage.sync.get(["notifyFlag", "SECRET_KEY"], function (obj) {
		if(obj.notifyFlag){
			var params = {
				SECRET_KEY: obj.SECRET_KEY, 
				action: serverActions.GET_NOTIFICATIONS,
				APPID: Options.ThisAppID
			};
			
			$.ajax({
				type: Options.defaultMethod,
				url: Options.defaultURL,
				dataType: 'json',
				data: {request: JSON.stringify(params)},
				error: function(jqXHR, textStatus, errorThrown){
					alert(chrome.i18n.getMessage("AJAXError"));
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
					if(res.response.code == Options.response.code.ok){
						// вывод уведомления
						var notification = new Notification(res.response.title, {
							tag : Options.currentNotifyId,
							icon: 'img/icon/icon-48.png',
							body: res.response.message
						});

						notification.onclick = function () {
							chrome.tabs.create({url:Options.baseURL},function(tab){});     
						};
					}
				}
			});
		}
	});
}

/*
*	По таймеру получаем уведомления с сайта
*/
chrome.storage.sync.get("notifyInterval", function (obj) {
	chrome.alarms.create("getNotify", {periodInMinutes: parseInt(obj.notifyInterval)});
});
chrome.alarms.onAlarm.addListener(function(alarm) {
	if(alarm.name == "getNotify"){
		getNotify();
	}
});

/*
*	Устанавливаем ссылку, которая откроется после установки расширения
*/
chrome.runtime.onInstalled.addListener(function(details){
	if(Options.InstallURL === true){
		chrome.tabs.create({url:Options.InstallURL},function(tab){}); 
	}
});

/*
*	Устанавливаем ссылку, которая откроется после удаления расширения
*/
if(Options.UninstallURL === true){
	chrome.runtime.setUninstallURL(Options.UninstallURL);
}
