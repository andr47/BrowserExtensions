// с помощью NODEjs и плагина uglify сжимать файл командой:
// 									имя сжатого файла | имя входного файла
// uglifyjs --compress --o bookmarklet.min.js bookmarklet.js
// 
// Содержимое сжатого файла вставить в ссылку по образцу как в файле test.html
// ВСЕ ДВОЙНЫЕ КАВЫЧКИ В КОДЕ bookmarklet.min.js ЗАМЕНИТЬ НА ОДИНАРНЫЕ!!!!!


// создаем нашу переменную, которую будет искать на странице подключаемый скрипт
CHECKITLINK_SECRET_KEY = null;

// подключаем удаленный скрипт
function addCheckitLinkScript() {

	// генерируем PHP кодом на странице пользователя, перед тем как предложить установить закладку
	CHECKITLINK_SECRET_KEY = "7Y0GGFfjhi3Fysa2pyWoDIDV4SiUKWvt";

	// создаем script
	var CHECKITLINK_WIN_SCRIPT = document.createElement("script");

	// установим адрес нашего скрипта
	// по этому адресу выводим файл bookmarklet.php (приложен в текущей папке)
	// CHECKITLINK_WIN_SCRIPT.src = "https://checkitlink.com/browser/bookmarklet/getscript";
	CHECKITLINK_WIN_SCRIPT.src = "https://randomfio.xyz/test/bookmarklet.php?c="+Date.now()+"&getscript";

	// добавляем script в head текущей страницы
	document.head.appendChild(CHECKITLINK_WIN_SCRIPT);
}

addCheckitLinkScript();
