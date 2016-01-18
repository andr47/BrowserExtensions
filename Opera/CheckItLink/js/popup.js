// popup.js

// тут будем хранить настройки
var JSOptions;

/*
*	Функция отправляет сообщения в content.js с параметром params, который содержит объект
*/
function sendAction(params){
	chrome.extension.sendMessage(params);
}

/*
*	Запускаем экспорт
*/
function goExport(toFile){
	if(toFile == true){
		ExportBookmarks(toFile);
	}
	else{
		ExportBookmarks();
	}	
}


/*
*	Функция сохраняет в файл экспортированные закладки
*/
function DownloadBookmarks(){
	var bookmarks = JSOptions.getItem("marks").data;
	var folders = JSOptions.getItem("marks").categories;
	// Формируем HTML файл с экспортом закладок
	var htmlCode = "<!DOCTYPE NETSCAPE-Bookmark-file-1>\n<meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\">\n<title>Bookmarks</title>\n<h1>Bookmarks</h1>\n";

	for(var x=0; x < folders.length; x++)
	{
		var findit = folders[x].index;
		var found = false;

		for(var y=0; y < bookmarks.length; y++)
			if(bookmarks[y].parentId == findit) found = true;
		
		if(found == true)
		{
			htmlCode = htmlCode + "<dt><h3 data-id=\"" + folders[x].index + "\" data-parentid=\"" + folders[x].parentId + "\">" + folders[x].name + "</h3>\n<dl><p>\n";

			for(var z=0; z < bookmarks.length; z++)
				if(bookmarks[z].parentId == findit)
					htmlCode = htmlCode + "<dt><a data-id=\"" + bookmarks[z].index + "\" data-parentid=\"" + bookmarks[z].parentId + "\" href=\"" + bookmarks[z].url + "\">" + bookmarks[z].name +"</a></dt>\n";

			htmlCode = htmlCode + "</dl></p>\n</dt>\n";
		}
	}

	var url = "data:text/html;charset=utf-8," + encodeURIComponent(htmlCode);

	chrome.downloads.download({
		url:url,
		filename:JSOptions.getItem("ExportFileName")
	},function(){});

	delete folders, bookmarks, htmlCode, url;
}

/*
*	Функция обхода дерева закладок
*/
function ExportBookmarks(toFile)
{
	/*#TODO*/
	var marks = {data: [], categories: []};
	JSOptions.setItem("marks", marks);

	var bookcount = 0;
	var parentName = "";
	var tempLinks = [];

	function fetch_bookmarks(parentNode, parent)
	{
		parentNode.forEach(function(bookmark)
		{
			var parentname = bookmark.title;
			if (bookmark.children)
			{
				if (typeof bookmark.title != "undefined" && bookmark.title != ""){
					var title = parentname;
					switch(title){
						case "_videos_":
							title = "Видео";
							break;
						case "_reading_list_":
							title = "Список для чтения";
							break;
						case "_shopping_":
							title = "Покупки";
							break;
						case "_travel_":
							title = "Путешествия";
							break;
						default:
							title = title;
							break;
					}
					marks.categories.push({
						"index":bookmark.id,
						"parentId":bookmark.parentId,
						"name":title
					});
				}
				fetch_bookmarks(bookmark.children, title);
			}
			else if(!(typeof bookmark.url == "undefined" || bookmark.url == null))
			{
				bookcount++;
				marks.data.push({
					"index":bookmark.id,
					"parentname":parent,
					"parentId":bookmark.parentId,
					"date":bookmark.dateAdded,
					"name":bookmark.title,
					"url":bookmark.url
				});
			}
		});
		/*#TODO*/
		JSOptions.setItem("marks", marks);
		delete marks;
	}

	chrome.bookmarks.getTree(function(rootNode){
		fetch_bookmarks(rootNode, false);
		if(toFile == true){
			DownloadBookmarks();
			$("#my_chrome_app_spinner").hide();
			$('#add_url_alert section:last-child').text(chrome.i18n.getMessage("fileExportSuccess", JSOptions.getItem("ExportFileName")));
			$("#add_url_alert").removeClass("alert-danger").addClass("alert-success");
			$("#add_url_alert").show();
		}
		else{
			SendAllBookmarks();
		}
	});

}


/*
*	Функция отправки закладок на сервер
*/
function SendAllBookmarks(){
	// делаем экспорт на сервер
	chrome.storage.sync.get("SECRET_KEY", function (obj){
		$.ajax({
			type: JSOptions.getItem("defaultMethod"),
			url: JSOptions.getItem("defaultURL"),
			dataType: 'json',
			data: {
					request: JSON.stringify(
						{
							SECRET_KEY: obj.SECRET_KEY, 
							action: serverActions.EXPORT, 
							APPID: JSOptions.getItem("ThisAppID"), 
							data: JSOptions.getItem("marks").data, 
							categories: JSOptions.getItem("marks").categories
						}
					)
				},
			error: function(jqXHR, textStatus, errorThrown){
				alert(chrome.i18n.getMessage("AJAXError"));
				try {console.error(jqXHR.responseText);} catch (e) { }
				$("#my_chrome_app_spinner").hide();
				$('#add_url_alert section:last-child').text(chrome.i18n.getMessage("AJAXError"));
				$("#add_url_alert").removeClass("alert-success").addClass("alert-danger");
				$("#add_url_alert").show();
			},
			beforeSend: function(jqXHR, settings ){return navigator.onLine;},
			// обработаем ответ сервера
			success: function(res){
				$("#my_chrome_app_spinner").hide();
				var message = res.response.message.replace(/<br[\s\/]*>/, "\n");
				// если код 200, то экспорт удался
				if(res.response.code == JSOptions.getItem("response").code.ok){
					$("#add_url_alert").removeClass("alert-danger").addClass("alert-success");
					$('#add_url_alert section:last-child').text(message);
				}
				else if(res.response.code == JSOptions.getItem("response").code.error){
					$("#add_url_alert").removeClass("alert-success").addClass("alert-danger");
					$('#add_url_alert section:last-child').text(message);
				}
				$("#add_url_alert").show();
			}
		});
	});
}

/**
 * Thank you, Opera )))
*/ 
function strip_html(html){
	var re = /(<([^>]+)>)/ig;
	return(html.replace(re, ""));
}

/*
*	Функция открытия формы добавления ссылки
*/
function showFormAddURL(){
	$('#form_container section:last-child').children().remove();
	$('#form_container section:last-child').append(extForms.addUrlForm.html);
	
	/**
	 * Если окно открыто для добавления изображения
	 */
	if(JSOptions.getItem("PAGEURL") != 0){
		$('#addurl-form_pageurl').val(JSOptions.getItem("PAGEURL"));
		$('#urlcategoridiv, #titlediv, #addurl-form_go_export_addurl-form').hide();
		JSOptions.setItem("PAGEURL", 0);
	}
	
	$('#addurl-form_description').focus();
	chrome.storage.sync.get(["TITLE", "URL"], function (obj) {
		$('#addurl-form_title').val(obj.TITLE);
		$('#addurl-form_url').val(obj.URL);
	});
	/*
	*	Здесь надо послать запрос серверу для получения списка категорий и вставить список в форму
	*/
	chrome.storage.sync.get("SECRET_KEY", function (obj) {
		/*if(JSOptions.getItem("categories").length == 0){*/
			$.ajax({
				type: JSOptions.getItem("defaultMethod"),
				url: JSOptions.getItem("defaultURL"),
				dataType: 'json',
				data: {
					request: JSON.stringify({
						SECRET_KEY: obj.SECRET_KEY, 
						action: serverActions.GET_CATEGORIES,
						APPID: JSOptions.getItem("ThisAppID")
					})
				},
				error: function(jqXHR, textStatus, errorThrown){
					//alert(chrome.i18n.getMessage("AJAXError"));
					try {console.error(jqXHR.responseText);} catch (e) { }
				},
				beforeSend: function(jqXHR, settings ){return navigator.onLine;},
				// обработаем ответ сервера
				success: function(res){
					// если код 200, то список получен
					if(res.response.code == JSOptions.getItem("response").code.ok){
						var html = '';
						$('#addurl-form_categori_id').children().remove();
						JSOptions.setItem("categories", res.response.categories);
						$.each(JSOptions.getItem("categories"), function(i, val){
							val.id = strip_html(val.id);
							val.cat_name = strip_html(val.cat_name);
							html += '<option value="'+val.id+'">'+val.cat_name+'</option>';
						});
						$('#addurl-form_categori_id').append(html);
					}
				}
			});
		/*}
		else{
			var html = '';
			$('#addurl-form_categori_id').children().remove();
			$.each(JSOptions.getItem("categories"), function(i, val){
				val.id = strip_html(val.id);
				val.cat_name = strip_html(val.cat_name);
				html += '<option value="'+val.id+'">'+val.cat_name+'</option>';
			});
			$('#addurl-form_categori_id').append(html);
		}*/

		/*
		*	Здесь надо послать запрос серверу для получения списка хэштегов и вставить список в Options.hashtags
		*/
		/*if(JSOptions.getItem("hashtags").length == 0){*/
			$.ajax({
				type: JSOptions.getItem("defaultMethod"),
				url: JSOptions.getItem("defaultURL"),
				dataType: 'json',
				data: {
					request: JSON.stringify({
						SECRET_KEY: obj.SECRET_KEY, 
						action: serverActions.GET_HASHTAGS,
						APPID: JSOptions.getItem("ThisAppID")
					})
				},
				error: function(jqXHR, textStatus, errorThrown){
					//alert(chrome.i18n.getMessage("AJAXError"));
					try {console.error(jqXHR.responseText);} catch (e) { }
					JSOptions.setItem("hashtags", []);
				},
				beforeSend: function(jqXHR, settings ){return navigator.onLine;},
				// обработаем ответ сервера
				success: function(res){
					// если код 200, то список получен
					if(res.response.code == JSOptions.getItem("response").code.ok){
						var hashtags = res.response.hashtags;
						JSOptions.setItem("hashtags", []);
						var tags = [];
						$.each(hashtags, function(i, val){
							tags.push(val.name);
						});
						JSOptions.setItem("hashtags", tags);
						delete tags;
						$('#addurl-form_hashtag').meta_input(
							{
								data: JSOptions.getItem("hashtags"), 
								multiple: true, 
								customValues: true, 
								select: false,
								selectPlaceholder: "Input hashtag"
							}
						);
					}
					// если код 401, то ошибка получения списка
					else if(res.response.code == JSOptions.getItem("response").code.error){
						$('#addurl-form_hashtag').meta_input(
							{
								data: JSOptions.getItem("hashtags"), 
								multiple: true, 
								customValues: true, 
								select: false,
								selectPlaceholder: "Input hashtag"
							}
						);
					}
				}
			});
		/*}
		else{
			$('#addurl-form_hashtag').meta_input(
				{
					data: JSOptions.getItem("hashtags"), 
					multiple: true, 
					customValues: true, 
					select: false,
					selectPlaceholder: "Input hashtag"
				}
			);
		}*/


		/*
		*	Вешаем на кнопку "Добавить" обработчик, который отправит форму на сервер
		*/
		$('#addurl-form_submit_addurl-form').on('click', function(){
			var hTags = JSOptions.getItem("hashtags");
			$("#my_chrome_app_spinner").show();
			var fields = $("#addurl-form").serializeArray();
			var pu = $("#addurl-form_pageurl").val();
			pu = $.trim(pu);
			if(pu.length == 0){
				var params = {
					SECRET_KEY: obj.SECRET_KEY, 
					action: serverActions.ADDURL, 
					APPID: JSOptions.getItem("ThisAppID"), 
					args: {
						hashtag: []
					}
				};
				$.each(fields, function(i, val){
					switch(val.name){
						case "categori_id":
							params.args.categori_id = val.value;
							break;
						case "title":
							params.args.title = val.value;
							break;
						case "description":
							params.args.description = val.value;
							break;
						case "url":
							params.args.url = val.value;
							break;
						case "hashtag":
							/*
							*	Здесь обработка хэштегов.
							*/
							var tempVal = $.trim(val.value);
							var tag;
							if(tempVal.length > 0){
								if(tempVal.indexOf(",") != -1){
		                            var tempVals = tempVal.split(",");
		                            $.each(tempVals, function(i) {
		                            	tag = $.trim(tempVals[i]);
		                            	if(tag.length > 0){
		                                	params.args.hashtag.push(tag);
		                                	if(JSOptions.getItem("hashtags").indexOf(tag) === -1){
		                                		hTags.push(tag);
		                                	}
		                                }
		                            });
		                        }
		                        else{
		                        	params.args.hashtag.push(tempVal);
		                        	if(JSOptions.getItem("hashtags").indexOf(tempVal) === -1){
		                        		hTags.push(tempVal);
		                        	}
		                        }
							}
							break;
						case "status":
							params.args.status = val.value;
							break;
						default:
							break;
					}
				});
			}
			else{
				var params = {
					SECRET_KEY: obj.SECRET_KEY, 
					action: serverActions.ADDIMAGE, 
					APPID: JSOptions.getItem("ThisAppID"), 
					args: {
						hashtag: []
					}
				};
				$.each(fields, function(i, val){
					switch(val.name){
						case "categori_id":
							break;
						case "pageurl":
							params.args.pageurl = val.value;
							break;
						case "title":
							params.args.title = val.value;
							break;
						case "description":
							params.args.description = val.value;
							break;
						case "url":
							params.args.src = val.value;
							break;
						case "hashtag":
							/*
							*	Здесь обработка хэштегов.
							*/
							var tempVal = $.trim(val.value);
							var tag;
							if(tempVal.length > 0){
								if(tempVal.indexOf(",") != -1){
		                            var tempVals = tempVal.split(",");
		                            $.each(tempVals, function(i) {
		                            	tag = $.trim(tempVals[i]);
		                            	if(tag.length > 0){
		                                	params.args.hashtag.push(tag);
		                                	if(JSOptions.getItem("hashtags").indexOf(tag) === -1){
		                                		hTags.push(tag);
		                                	}
		                                }
		                            });
		                        }
		                        else{
		                        	params.args.hashtag.push(tempVal);
		                        	if(JSOptions.getItem("hashtags").indexOf(tempVal) === -1){
		                        		hTags.push(tempVal);
		                        	}
		                        }
							}
							break;
						case "status":
							params.args.status = val.value;
							break;
						default:
							break;
					}
				});
			}
			JSOptions.setItem("hashtags", hTags);
			var sendParams = {
				fields: params,
				action: extActions.sendForm
			};
			$("#addurl-form_pageurl").val('');
			/*#TODO*/
			//alert(JSON.stringify(sendParams));
			//return false;
			sendAction(sendParams);
		});
	});

	/*
	*	Вешаем на кнопки "Экспорт" обработчики для запуска экспорта
	*/
	$('#addurl-form_go_export_addurl-form').on('click', function(){
		jConfirm(chrome.i18n.getMessage("confirm_export_to_website_message"), chrome.i18n.getMessage("confirm_export_title"), function(r) {
			if(r){
				$("#my_chrome_app_spinner").show();
				goExport();
			}
		});
	});
	$('#addurl-form_go_export_addurl-file').on('click', function(){
		jConfirm(chrome.i18n.getMessage("confirm_export_to_file_message"), chrome.i18n.getMessage("confirm_export_title"), function(r) {
			if(r){
				$("#my_chrome_app_spinner").show();
				goExport(true);
			}
		});
	});

}

/*
*	Функция открытия формы ввода SECRET_KEY
*/
function showFormSecretKey(){
	$('#form_container section:last-child').children().remove();
	$('#form_container section:last-child').append(extForms.addSecretKeyForm.html);
	$('#secret_key-form_SECRET_KEY').focus();
	/*
	*	Вешаем обработчик на кнопку "Показать пароль"
	*/
	$('#show_password').on('mousedown', function(){
		$('#secret_key-form_SECRET_KEY').attr({"type": "text"});
	});
	$('#show_password').on('mouseup', function(){
		$('#secret_key-form_SECRET_KEY').attr({"type": "password"});
		$('#secret_key-form_SECRET_KEY').focus();
	});
	/*
	*	Вешаем обработчик на кнопку Запомнить
	*/
	$('#secret_key-form_submit_secret_key-form').on('click', function(){
		$("#my_chrome_app_spinner").show();
		var fields = $("#secret_key-form").serializeArray();
		var params = {
			SECRET_KEY: "",
			action: serverActions.LOGIN,
			APPID: JSOptions.getItem("ThisAppID")
		};
		$.each(fields, function(i, val){
			switch(val.name){
				case "SECRET_KEY":
					params.SECRET_KEY = val.value;
					break;
				default:
					break;
			}
		});
		var sendParams = {
			fields: params,
			action: extActions.sendFormSecretKey
		};
		sendAction(sendParams);
	});
}

/*#READY*/
$(document).ready(function(){


	chrome.runtime.getBackgroundPage(function(b){
		JSOptions = b.JSOptions;

		$('#open_options_page').attr({"title": chrome.i18n.getMessage("open_options_page_title")});
		$('#open_donate_page').attr({"title": chrome.i18n.getMessage("open_donate_page_title")});
		$('#open_about_page').attr({"title": chrome.i18n.getMessage("open_about_page_title")});
		$('#open_home_page').attr({"title": chrome.i18n.getMessage("open_home_page_title", JSOptions.getItem("baseURL"))});
		$('#change_key_button').attr({"title": chrome.i18n.getMessage("change_key_button_title")});
	});


	/*
	*	Когда страница открывается в новом окне (по клику в меню), то скролим ее вверх
	*	ХЗ почему так, баг какой-то
	*/
	$("html, body").animate({ scrollTop: 0 }, 600);
	$("title").text(chrome.i18n.getMessage("extension_name"));

	chrome.windows.getCurrent(function(w){
		chrome.tabs.getSelected(w.id,function(t){
			//alert(JSON.stringify(w));
			//alert(JSON.stringify(t));
			switch(w.type){
				case "popup":
					/*
					*	Страница открыта в новом окне (по клику в меню)
					*/
					break;
				case "normal":
					chrome.storage.sync.set({"TITLE": String(t.title)});
					chrome.storage.sync.set({"URL": String(t.url)});
					break;
				default:
					break;
			}
			/*
			*	Проверяем есть ли подключение к Интернету
			*/
			if (!navigator.onLine){
				$('#form_container section:last-child').children().remove();
				$('#form_container section:last-child').append(extForms.NetStatusAlert.html);
			}
			else{
				/*
				*	Если SECRET_KEY есть, то показываем форму для добавления ссылки
				*/
				chrome.storage.sync.get("SECRET_KEY", function (obj) {
					if(obj.SECRET_KEY){
						showFormAddURL();
					}
					/*
					*	Если SECRET_KEY нет, то показываем форму для ввода SECRET_KEY
					*/
					else{
						showFormSecretKey();
					}
				});
			}
		});
	});

	/*
	*	Обработчики кнопок тулбара в popup
	*/

	// Настройки
	$("#open_options_page").on('click', function(){
		chrome.runtime.openOptionsPage();
	});

	// Пожертвовать
	$("#open_donate_page").on('click', function(){
		chrome.tabs.create({url:JSOptions.getItem("donateURL")},function(tab){}); 
	});

	// Информация
	$("#open_about_page").on('click', function(){
		chrome.tabs.create({url:JSOptions.getItem("aboutURL")}, function(tab){});
	});

	// Сайт
	$("#open_home_page").on('click', function(){
		chrome.tabs.create({url:JSOptions.getItem("baseURL")}, function(tab){});
	});

	// Сменить SECRET_KEY
	$("#change_key_button").on('click', function(){
		chrome.storage.sync.remove("SECRET_KEY");
		showFormSecretKey();
	});
	
	/*
	*	Перехватываем событие submit для наших форм
	*/
	$("#addurl-form, #secret_key-form").on('submit', function(){
		return false;
	});


	/* 
	*	Обработчик ответа на переданный action
	*/
	chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse){
		//alert(JSON.stringify(msg));
		//alert(JSON.stringify(sender));
		//alert(JSON.stringify(sendResponse));
		switch (msg.action) {
			/*
			*	Отправляем ссылку на сервер
			*/
			case extActions.sendForm:
				/*
				*	Отправляем форму добавления ссылки на сервер
				*/
				var fields = msg.fields;

				$.ajax({
					type: JSOptions.getItem("defaultMethod"),
					url: JSOptions.getItem("defaultURL"),
					dataType: 'json',
					data: {request: JSON.stringify(fields)},
					error: function(jqXHR, textStatus, errorThrown){
						//alert(chrome.i18n.getMessage("AJAXError"));
						try {console.error(jqXHR.responseText);} catch (e) { }
						sendAction({
							action: extActions.sendFormError, 
							message: chrome.i18n.getMessage("AJAXError")
						});
					},
					beforeSend: function(jqXHR, settings ){return navigator.onLine;},
					// обработаем ответ сервера
					success: function(res){
						// если код 200, то ссылка добавлена
						if(res.response.code == JSOptions.getItem("response").code.ok){
							sendAction({
								action: extActions.sendFormSuccess, 
								message: res.response.message
							});
						}
						// если код 401, то ошибка добавления ссылки
						else if(res.response.code == JSOptions.getItem("response").code.error){
							sendAction({
								action: extActions.sendFormError, 
								message: res.response.message
							});
						}
					}
				});
				break;
			/*
			*	Отправляем SECRET_KEY на сервер
			*/
			case extActions.sendFormSecretKey:
				/*
				*	Отправляем форму ввода SECRET_KEY на сервер
				*/
				var fields = msg.fields;
				
				$.ajax({
					type: JSOptions.getItem("defaultMethod"),
					url: JSOptions.getItem("defaultURL"),
					dataType: 'json',
					data: {request: JSON.stringify(fields)},
					error: function(jqXHR, textStatus, errorThrown){
						//alert(chrome.i18n.getMessage("AJAXError"));
						try {console.error(jqXHR.responseText);} catch (e) { }
						sendAction({
							action: extActions.sendFormSecretKeyError, 
							message: chrome.i18n.getMessage("AJAXError")
						});
					},
					beforeSend: function(jqXHR, settings ){return navigator.onLine;},
					// обработаем ответ сервера
					success: function(res){
						// если код 200, то SECRET_KEY верный
						if(res.response.code == JSOptions.getItem("response").code.ok){
							chrome.storage.sync.set({"SECRET_KEY": String(fields.SECRET_KEY)});
							sendAction({
								action: extActions.sendFormSecretKeySuccess, 
								message: res.response.message
							});
						}
						// если код 401, то ошибка SECRET_KEY
						else if(res.response.code == JSOptions.getItem("response").code.error){
							sendAction({
								action: extActions.sendFormSecretKeyError, 
								message: res.response.message
							});
						}
					}
				});
				break;
			/*
			*	Выводим уведомление об успешном добавлении ссылки
			*/
			case extActions.sendFormSuccess:
				var message = msg.message.replace(/<br[\s\/]*>/, "\n");
				$("#my_chrome_app_spinner").hide();
				$('#add_url_alert section:last-child').text(message);
				$("#add_url_alert").show();
				$("#add_url_alert").removeClass("alert-danger").addClass("alert-success");
				break;
			/*
			*	Выводим уведомление об ошибке добавления ссылки
			*/
			case extActions.sendFormError:
				var message = msg.message.replace(/<br[\s\/]*>/, "\n");
				$("#my_chrome_app_spinner").hide();
				$('#add_url_alert section:last-child').text(message);
				$("#add_url_alert").show();
				$("#add_url_alert").removeClass("alert-success").addClass("alert-danger");
				break;
			/*
			*	Выводим уведомление об успешном вводе SECRET_KEY
			*/
			case extActions.sendFormSecretKeySuccess:
				var message = msg.message.replace(/<br[\s\/]*>/, "\n");
				$("#my_chrome_app_spinner").hide();
				$('#secret_key_alert section:last-child').text(message);
				$("#secret_key_alert").show();
				$("#secret_key_alert").removeClass("alert-danger").addClass("alert-success");
				/*
				*	Ну а коли у нас SECRET_KEY передан верно, то не грех и показать форму добавления ссылки ))
				*	Через три секунды после того, как прошла авторизация
				*/
				chrome.alarms.create("AuthorizeSuccess", {when: Date.now()+3000});
				chrome.alarms.onAlarm.addListener(function(alarm){
					if(alarm.name == "AuthorizeSuccess"){
						showFormAddURL();
						chrome.alarms.clear("AuthorizeSuccess");
					}
				});
				break;
			/*
			*	Выводим уведомление об ошибке ввода SECRET_KEY
			*/
			case extActions.sendFormSecretKeyError:
				var message = msg.message.replace(/<br[\s\/]*>/, "\n");
				$("#my_chrome_app_spinner").hide();
				$('#secret_key_alert section:last-child').text(message);
				$("#secret_key_alert").show();
				$("#secret_key_alert").removeClass("alert-success").addClass("alert-danger");
				break;
			/*
			*	Обработаем неизвестный action на всякий случай
			*/
			default:
				//alert(msg.action+', '+chrome.i18n.getMessage("error_action"));
				break;
		}
	});

});
