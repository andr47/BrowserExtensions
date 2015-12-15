// content.js

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
*	Запускаем импорт
*/
function goImport(){
	var fileInput = document.getElementById('fileImport');
	var file = fileInput.files[0];
	if (typeof file == "undefined"){
		return;
	}

	var reader = new FileReader();
	reader.onloadend = function(){
		ImportBook(reader.result);
	}
	reader.readAsText(file);
}

/*
*	Функция создает папки для закладок при импорте
*/
function addFolder(name,from,to,bookmarks,bookcount,root){
	// Запускаем создание папок и закладок
	// Ищем папку по названию
	chrome.bookmarks.search({title:name}, function(searchFolder)
	{
		//alert(JSON.stringify(searchFolder));
		// Если папки нет
		if(searchFolder.length == 0)
		{
			// Создаем папку
			chrome.bookmarks.create({title:name,parentId:String(root.id)},function(node)
			{
				// Создаем в ней закладки
				for (var z=bookmarks.length-1;z>=0;z--)
				{
					if (bookmarks[z].index > from && bookmarks[z].index < to)
					{
						// Ищем закладку по url
						chrome.bookmarks.search({url:bookmarks[z].url}, function(searchBookmark)
						{
							// Если закладки нет
							if(searchBookmark.length == 0)
							{
								// Создаем ее
								chrome.bookmarks.create({title:bookmarks[z].title,url:bookmarks[z].url,parentId:node.id},function(){});
								bookmarks.splice(z,1);

								if (bookmarks.length == 0)
								{
									//alert(chrome.i18n.getMessage("fileImportSuccess", bookcount));
								}
							}
						});
					}
				}
			});
		}
		// если папка есть
		else
		{
			// создаем в ней закладки
			for (var z=bookmarks.length-1;z>=0;z--)
			{
				if (bookmarks[z].index > from && bookmarks[z].index < to)
				{
					// Ищем закладку по url
					chrome.bookmarks.search({url:bookmarks[z].url}, function(searchBookmark)
					{
						// Если закладки нет
						if(searchBookmark.length == 0)
						{
							// Создаем ее
							chrome.bookmarks.create({title:bookmarks[z].title,url:bookmarks[z].url,parentId:searchFolder[0].id},function(){});
							bookmarks.splice(z,1);

							if (bookmarks.length == 0)
							{
								//alert(chrome.i18n.getMessage("fileImportSuccess", bookcount));
							}
						}
					});
				}
			}
		}
	});
}

/*
*	Функция импортирует из файла экспортированные закладки
*/
function ImportBook(data){
	var bookcount = 0;
	var folders = [ ];
	var bookmarks = [ ];
	var closures = [ ];

	// Ищем закладки
	var regex = /(<dt><a )(.*?)(href=\x22)(.*?)(\x22)(.*?)(>)(.*?)(<\/a>)/ig;
	var match = regex.exec(data);
	while (match != null && match.length > 9)
	{
		bookcount++;
		bookmarks.push({"index":match.index,"title":match[8],"url":match[4]});
		match = regex.exec(data);
	}
	// Сортируем
	bookmarks.sort(function(a,b){ if (a.title>b.title) return -1; if (a.title<b.title) return 1; return 0; });

	// Ищем папки
	var regex = /(<dt><h3)(.*?)(>)(.*?)(<\/h3>)/ig;
	var match = regex.exec(data);
	folders.push({"index":0,"title":"Imported"});
	while (match != null && match.length > 4)
	{
		folders.push({"index":match.index,"title":match[4]});
		match = regex.exec(data);
	}

	var regex = /(<\/dl>)|(<dl>)/ig;
	var match = regex.exec(data);
	var temp = [ ];
	while (match != null && match.length > 0)
	{
		if (match[0] == "<dl>") { temp.push(match.index); }
		if (match[0] == "</dl>") { closures.push({"dlstart":temp.pop(),"dlend":match.index}); }
		match = regex.exec(data);
	}
	// Если передан некорректный файл импорта
	if (temp.length > 0)
	{
		alert(chrome.i18n.getMessage("fileImportError"));
		return;
	}
	closures.sort(function(a,b){return b.dlstart - a.dlstart;});

	// Запускаем импорт
	chrome.bookmarks.search({title:Options.ImportFolderName}, function(search)
	{
		//alert(JSON.stringify(search));
		if(search.length == 0)
		{
			chrome.bookmarks.create({title:Options.ImportFolderName}, function(root)
			{
				//alert(JSON.stringify(root));
				for (var x=folders.length-1;x>=0;x--)
				{
					for (var y=closures.length-1;y>=0;y--)
					{
						if (closures[y].dlstart > folders[x].index)
						{
							addFolder(
									folders[x].title,
									closures[y].dlstart,
									closures[y].dlend,
									bookmarks,
									bookcount,
									root
								);
							closures.splice(y,1);
							break;
						}
					}
					folders.pop();
				}
				$("#my_chrome_app_spinner").hide();
				$('#add_url_alert section:last-child').text(chrome.i18n.getMessage("fileImportSuccess"));
				$("#add_url_alert").removeClass("alert-danger").addClass("alert-success");
				$("#add_url_alert").show();
			});
		}
		else{
			for (var x=folders.length-1;x>=0;x--)
			{
				for (var y=closures.length-1;y>=0;y--)
				{
					if (closures[y].dlstart > folders[x].index)
					{
						addFolder(
								folders[x].title,
								closures[y].dlstart,
								closures[y].dlend,
								bookmarks,
								bookcount,
								search[0]
							);
						closures.splice(y,1);
						break;
					}
				}
				folders.pop();
			}
			$("#my_chrome_app_spinner").hide();
			$('#add_url_alert section:last-child').text(chrome.i18n.getMessage("fileImportSuccess"));
			$("#add_url_alert").removeClass("alert-danger").addClass("alert-success");
			$("#add_url_alert").show();
		}
	});
}

/*
*	Функция сохраняет в файл экспортированные закладки
*/
function DownloadBookmarks(){
	var bookmarks = Options.marks.data;
	var folders = Options.marks.categories;
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
		filename:Options.ExportFileName
	},function(){});

	delete folders, bookmarks, htmlCode, url;
}

/*
*	Функция обхода дерева закладок
*/
function ExportBookmarks(toFile)
{
	Options.marks.data = [];
	Options.marks.categories = [];

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
					Options.marks.categories.push({
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
				Options.marks.data.push({
					"index":bookmark.id,
					"parentname":parent,
					"parentId":bookmark.parentId,
					"date":bookmark.dateAdded,
					"name":bookmark.title,
					"url":bookmark.url
				});
			}
		});
	}

	chrome.bookmarks.getTree(function(rootNode){
		fetch_bookmarks(rootNode, false);
		if(toFile == true){
			DownloadBookmarks();
			$("#my_chrome_app_spinner").hide();
			$('#add_url_alert section:last-child').text(chrome.i18n.getMessage("fileExportSuccess", Options.ExportFileName));
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
	//alert(JSON.stringify(Options.marks.data, null, '\t'));
	//alert(JSON.stringify(Options.marks.categories, null, '\t'));

	// делаем экспорт на сервер
	chrome.storage.sync.get("SECRET_KEY", function (obj){
		$.ajax({
			type: Options.defaultMethod,
			url: Options.defaultURL,
			dataType: 'json',
			data: {
					request: JSON.stringify(
						{
							SECRET_KEY: obj.SECRET_KEY, 
							action: serverActions.EXPORT, 
							APPID: Options.ThisAppID, 
							data: Options.marks.data, 
							categories: Options.marks.categories
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
				var message = res.response.message.replace("<br />", "\n");
				// если код 200, то экспорт удался
				if(res.response.code == Options.response.code.ok){
					$("#add_url_alert").removeClass("alert-danger").addClass("alert-success");
					$('#add_url_alert section:last-child').text(message);
				}
				else if(res.response.code == Options.response.code.error){
					$("#add_url_alert").removeClass("alert-success").addClass("alert-danger");
					$('#add_url_alert section:last-child').text(message);
				}
				$("#add_url_alert").show();
			}
		});
	});
}

/*
*	Функция открытия формы добавления ссылки
*/
function showFormAddURL(){
	$('#form_container section:last-child').children().remove();
	$('#form_container section:last-child').append(extForms.addUrlForm.html);
	$('#addurl-form_description').focus();
	chrome.storage.sync.get(["TITLE", "URL"], function (obj) {
		$('#addurl-form_title').val(obj.TITLE);
		$('#addurl-form_url').val(obj.URL);
	});
	/*
	*	Здесь надо послать запрос серверу для получения списка категорий и вставить список в форму
	*/
	chrome.storage.sync.get("SECRET_KEY", function (obj) {
		$.ajax({
			type: Options.defaultMethod,
			url: Options.defaultURL,
			dataType: 'json',
			data: {
				request: JSON.stringify({
					SECRET_KEY: obj.SECRET_KEY, 
					action: serverActions.GET_CATEGORIES,
					APPID: Options.ThisAppID
				})
			},
			error: function(jqXHR, textStatus, errorThrown){
				//alert(chrome.i18n.getMessage("AJAXError"));
				try {console.error(jqXHR.responseText);} catch (e) { }
				var html = '';
				$('#addurl-form_categori_id').children().remove();
				$.each(Options.staticCategories, function(i, val){
					html += '<option value="'+val.id+'">'+val.name+'</option>';
				});
				$('#addurl-form_categori_id').append(html);
			},
			beforeSend: function(jqXHR, settings ){return navigator.onLine;},
			// обработаем ответ сервера
			success: function(res){
				// если код 200, то список получен
				if(res.response.code == Options.response.code.ok){
					var html = '';
					$('#addurl-form_categori_id').children().remove();
					$.each(res.response.categories, function(i, val){
						html += '<option value="'+val.id+'">'+val.cat_name+'</option>';
					});
					$('#addurl-form_categori_id').append(html);
				}
				// если код 401, то ошибка получения списка
				else if(res.response.code == Options.response.code.error){
					var html = '';
					$('#addurl-form_categori_id').children().remove();
					$.each(Options.staticCategories, function(i, val){
						html += '<option value="'+val.id+'">'+val.name+'</option>';
					});
					$('#addurl-form_categori_id').append(html);
				}
			}
		});


		/*
		*	Здесь надо послать запрос серверу для получения списка хэштегов и вставить список в Options.hashtags
		*/
		$.ajax({
			type: Options.defaultMethod,
			url: Options.defaultURL,
			dataType: 'json',
			data: {
				request: JSON.stringify({
					SECRET_KEY: obj.SECRET_KEY, 
					action: serverActions.GET_HASHTAGS,
					APPID: Options.ThisAppID
				})
			},
			error: function(jqXHR, textStatus, errorThrown){
				//alert(chrome.i18n.getMessage("AJAXError"));
				try {console.error(jqXHR.responseText);} catch (e) { }
				Options.hashtags = [];
			},
			beforeSend: function(jqXHR, settings ){return navigator.onLine;},
			// обработаем ответ сервера
			success: function(res){
				// если код 200, то список получен
				if(res.response.code == Options.response.code.ok){
					var hashtags = res.response.hashtags;
					Options.hashtags = [];
					$.each(hashtags, function(i, val){
						Options.hashtags.push(val.name);
					});
					$('#addurl-form_hashtag').meta_input(
						{
							data: Options.hashtags, 
							multiple: true, 
							customValues: true, 
							select: false,
							selectPlaceholder: "Input hashtag"
						}
					);
				}
				// если код 401, то ошибка получения списка
				else if(res.response.code == Options.response.code.error){
					$('#addurl-form_hashtag').meta_input(
						{
							data: Options.staticHashtags, 
							multiple: true, 
							customValues: true, 
							select: false,
							selectPlaceholder: "Input hashtag"
						}
					);
				}
			}
		});


		/*
		*	Вешаем на кнопку "Добавить" обработчик, который отправит форму на сервер
		*/
		$('#addurl-form_submit_addurl-form').on('click', function(){
			$("#my_chrome_app_spinner").show();
			var fields = $("#addurl-form").serializeArray();
			var params = {
				SECRET_KEY: obj.SECRET_KEY, 
				action: serverActions.ADDURL, 
				APPID: Options.ThisAppID, 
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
						*	Можно обработать строку, если она содержит запятые и занести каждый элемент в массив.
						*	Но мне лень )))
						*/
						var tempVal = $.trim(val.value);
						if(tempVal.length > 0){
							if(tempVal.indexOf(",") != -1){
	                            var tempVals = tempVal.split(",");
	                            $.each(tempVals, function(i) {
	                            	if(tempVals[i].length > 0){
	                                	params.args.hashtag.push($.trim(tempVals[i]));
	                                }
	                            });
	                        }
	                        else{
	                        	params.args.hashtag.push(tempVal);
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
			var sendParams = {
				fields: params,
				action: extActions.sendForm
			};
			//alert(JSON.stringify(sendParams));
			sendAction(sendParams);
		});
	});

	/*
	*	Вешаем на кнопки "Экспорт" обработчики для запуска экспорта
	*/
	$('#addurl-form_go_export_addurl-form').on('click', function(){
		$("#my_chrome_app_spinner").show();
		goExport();
	});
	$('#addurl-form_go_export_addurl-file').on('click', function(){
		$("#my_chrome_app_spinner").show();
		goExport(true);
	});

	/*
	*	Вешаем на изменение поля выбора файла обработчик для запуска импорта
	*/
	$('#fileImport').on('change', function(){
		$("#my_chrome_app_spinner").show();
		goImport();
	});

	/*
	*	Вешаем на кнопку "Импорт" обработчик для клика по скрытому пункту выбора файла
	*/
	$('#addurl-form_go_import_addurl-file').on('click', function(){
		$("#fileImport").click();
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
			APPID: Options.ThisAppID
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

$(document).ready(function(){

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
	$("#open_options_page").on('click', function(){
		chrome.runtime.openOptionsPage();
	});

	$("#open_donate_page").on('click', function(){
		chrome.tabs.create({url:Options.donateURL},function(tab){}); 
	});

	$("#open_about_page").on('click', function(){
		chrome.tabs.create({url:Options.aboutURL}, function(tab){});
	});

	$("#open_home_page").on('click', function(){
		chrome.tabs.create({url:Options.baseURL}, function(tab){});
	});

	$("#change_key_button").on('click', function(){
		chrome.storage.sync.remove("SECRET_KEY");
		showFormSecretKey();
	});

	$('#open_options_page').attr({"title": chrome.i18n.getMessage("open_options_page_title")});
	$('#open_donate_page').attr({"title": chrome.i18n.getMessage("open_donate_page_title")});
	$('#open_about_page').attr({"title": chrome.i18n.getMessage("open_about_page_title")});
	$('#open_home_page').attr({"title": chrome.i18n.getMessage("open_home_page_title", Options.baseURL)});
	$('#change_key_button').attr({"title": chrome.i18n.getMessage("change_key_button_title")});
	
	/*
	*	Перехватываем событие submit для наших форм
	*/
	$("#addurl-form").on('submit', function(){
		return false;
	});
	$("#secret_key-form").on('submit', function(){
		return false;
	});
	
	/*
	*	Если существует localStorage["tempData"], значит нажат пункт меню "Экспорт на сайт" или "Экспорт в файл"
	*	Поэтому нажимаем на соответствующую кнопку
	*/
	chrome.storage.sync.get("tempData", function (obj) {
		if(obj.tempData && obj.tempData === "export"){
			setTimeout(function() { $('#addurl-form_go_export_addurl-form').click() }, 1000);
		}
		else if(obj.tempData && obj.tempData === "exportToFile"){
			setTimeout(function() { $('#addurl-form_go_export_addurl-file').click() }, 1000);
		}
	});
	chrome.storage.sync.remove("tempData");

	/* 
	*	Обработчик ответа от background.js
	*/
	chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse){
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
					type: Options.defaultMethod,
					url: Options.defaultURL,
					dataType: 'json',
					data: {request: JSON.stringify(fields)},
					error: function(jqXHR, textStatus, errorThrown){
						alert(chrome.i18n.getMessage("AJAXError"));
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
						if(res.response.code == Options.response.code.ok){
							sendAction({
								action: extActions.sendFormSuccess, 
								message: res.response.message
							});
						}
						// если код 401, то ошибка добавления ссылки
						else if(res.response.code == Options.response.code.error){
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
					type: Options.defaultMethod,
					url: Options.defaultURL,
					dataType: 'json',
					data: {request: JSON.stringify(fields)},
					error: function(jqXHR, textStatus, errorThrown){
						alert(chrome.i18n.getMessage("AJAXError"));
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
						if(res.response.code == Options.response.code.ok){
							chrome.storage.sync.set({"SECRET_KEY": String(fields.SECRET_KEY)});
							sendAction({
								action: extActions.sendFormSecretKeySuccess, 
								message: res.response.message
							});
						}
						// если код 401, то ошибка SECRET_KEY
						else if(res.response.code == Options.response.code.error){
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
				//alert("Передан action:"+msg.action+"\r\nУведомление об успешном добавлении ссылки: "+msg.message);
				$("#my_chrome_app_spinner").hide();
				$('#add_url_alert section:last-child').text(msg.message);
				$("#add_url_alert").show();
				$("#add_url_alert").removeClass("alert-danger").addClass("alert-success");
				break;
			/*
			*	Выводим уведомление об ошибке добавления ссылки
			*/
			case extActions.sendFormError:
				//alert("Передан action:"+msg.action+"\r\nУведомление об ошибке добавления ссылки: "+msg.message);
				$("#my_chrome_app_spinner").hide();
				$('#add_url_alert section:last-child').text(msg.message);
				$("#add_url_alert").show();
				$("#add_url_alert").removeClass("alert-success").addClass("alert-danger");
				break;
			/*
			*	Выводим уведомление об успешном вводе SECRET_KEY
			*/
			case extActions.sendFormSecretKeySuccess:
				//alert("Передан action:"+msg.action+"\r\nУведомление об успешном вводе SECRET_KEY: "+msg.message);
				$("#my_chrome_app_spinner").hide();
				$('#secret_key_alert section:last-child').text(msg.message);
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
				//alert("Передан action:"+msg.action+"\r\nУведомление об ошибке ввода SECRET_KEY: "+msg.message);
				$("#my_chrome_app_spinner").hide();
				$('#secret_key_alert section:last-child').text(msg.message);
				$("#secret_key_alert").show();
				$("#secret_key_alert").removeClass("alert-success").addClass("alert-danger");
				break;
			/*
			*	Обработаем неизвестный action на всякий случай
			*/
			default:
				alert(msg.action+', '+chrome.i18n.getMessage("error_action"));
				break;
		}
	});

});
