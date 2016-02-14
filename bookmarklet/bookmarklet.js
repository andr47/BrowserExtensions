// с помощью NODEjs и плагина uglify сжимать файл командой:
// 									имя сжатого файла | имя входного файла
// uglifyjs --compress --mangle --o bookmarklet.min.js bookmarklet.js
// 
// Содержимое сжатого файла вставить в ссылку по образцу как в файле test.html
// ВСЕ ДВОЙНЫЕ КАВЫЧКИ В КОДЕ bookmarklet.min.js ЗАМЕНИТЬ НА ОДИНАРНЫЕ!!!!!
function addBookmarkInCheckitLink() {
	// формируем данные для отправки
	var data = {
		type: "POST",
		url: "https://checkitlink.com/browser/addlink",
		dataType: 'json',
		data: {
			request: JSON.stringify(
				{
					// генерируем PHP кодом на странице пользователя
					SECRET_KEY: "7Y0GGFfjhi3Fysa2pyWoDIDV4SiUKWvt", 
					action: "ADDURL", 
					APPID: "bookmarklet",
					// собственно данные ссылки
					// я хз как лучше сделать
					// рисовать окошко для ввода не вариант, ибо опять всплывут баги с версткой на разных сайтах
					args: {
						hashtag: ["#добавленоспомощьюбукмарклета"],
						categori_id: 1,
						title: document.title,
						description: "Добавлено с помощью букмарклета",
						url: document.location.href,
						status: 1
					}
				}
			)
		}
	}

	var xmlHttp;

	try {
		xmlHttp = new ActiveXObject("Msxml2.XMLHTTP");
	} catch (e) {
		try {
			xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
		} catch (E) {
			xmlHttp = false;
		};
	};

	if (!xmlHttp && typeof XMLHttpRequest != 'undefined') {
		xmlHttp = new XMLHttpRequest();
	};
 
    xmlHttp.open(data.type, data.url, true);
    // назначаем обработчик ответа от сервера
    xmlHttp.onreadystatechange = function(){
		if (xmlHttp.status != 200) {
			console.log(xmlHttp.status + ': ' + xmlHttp.statusText);
		}
		else {
			console.log(xmlHttp.responseText);
		}
	}
	// отправляем данные
    xmlHttp.send("request=" + data.data.request);
}