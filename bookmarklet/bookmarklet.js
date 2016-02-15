// с помощью NODEjs и плагина uglify сжимать файл командой:
// 									имя сжатого файла | имя входного файла
// uglifyjs --compress --o bookmarklet.min.js bookmarklet.js
// 
// Содержимое сжатого файла вставить в ссылку по образцу как в файле test.html
// ВСЕ ДВОЙНЫЕ КАВЫЧКИ В КОДЕ bookmarklet.min.js ЗАМЕНИТЬ НА ОДИНАРНЫЕ!!!!!
function addBookmarkInCheckitLink() {
	// создаем iframe
	var CHECKITLINK_WIN_IFRAME = document.createElement("iframe");
	// установим адрес нашей страницы
	CHECKITLINK_WIN_IFRAME.src = "https://checkitlink.com/testapi.php";
	// установим имя фрейма (потом будем по нему обращаться)
	CHECKITLINK_WIN_IFRAME.name = "CHECKITLINK";
	// установим функцию, которая выполнится после загрузки фрейма
	CHECKITLINK_WIN_IFRAME.onload = timeoutLoad;
	// и размер 0, чтоб не отображался на странице
	CHECKITLINK_WIN_IFRAME.width = 0;
	CHECKITLINK_WIN_IFRAME.height = 0;
	// формируем данные для отправки
	var LINK_DATA_OBJECT = null;
	LINK_DATA_OBJECT = {
					// генерируем PHP кодом на странице пользователя
					SECRET_KEY: "7Y0GGFfjhi3Fysa2pyWoDIDV4SiUKWvt", 
					// ну про action и говорить не стоит ))
					action: "ADDURL", 
					// APPID для идентификации. Можно генерить сюда SECRET_KEY и отслеживать статистику
					APPID: "bookmarklet",
					// собственно данные ссылки
					args: {
						hashtag: [],
						categori_id: 8,
						title: document.title,
						description: "",
						url: document.location.href,
						status: 0
					}
				}
	// добавляем iframe в конец текущей страницы
	console.log("Начинаем отправку...");
	document.body.appendChild(CHECKITLINK_WIN_IFRAME);

	function timeoutLoad(){
		// отправляем данные в наш фрейм
		var CHECKITLINK_WIN = window.frames.CHECKITLINK;
		CHECKITLINK_WIN.postMessage(JSON.stringify(LINK_DATA_OBJECT), "*");
		console.log("Отправлено: %s", JSON.stringify(LINK_DATA_OBJECT));
	}

}