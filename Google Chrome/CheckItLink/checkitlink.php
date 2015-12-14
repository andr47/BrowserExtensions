<?php

//http://ok.freelanceronline.ru/checkitlink.php?request={"SECRET_KEY":"U0VDUkVUX0tFWQ","action":"LOGIN"}

/*
*	Включаем отображение ошибок PHP
*/
error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Content-type: application/json; charset=utf-8");


/*
*	Функция пишет запрос в файл.
*	Нужна только для отладки скрипта
*/
function DUMP($str=""){
	$f = fopen("dump.txt", "a+");
	fwrite($f, $str.PHP_EOL);
	fclose($f);
}

DUMP($_REQUEST["request"]);

/*
*	приводит к нормальному виду русские символы в json
*/
function jencoder($json_str){
     $cyr_chars = array (
		'\u0430' => 'а', '\u0410' => 'А', '\u0431' => 'б', '\u0411' => 'Б', '\u0432' => 'в', '\u0412' => 'В',
		'\u0433' => 'г', '\u0413' => 'Г', '\u0434' => 'д', '\u0414' => 'Д', '\u0435' => 'е', '\u0415' => 'Е',
		'\u0451' => 'ё', '\u0401' => 'Ё', '\u0436' => 'ж', '\u0416' => 'Ж', '\u0437' => 'з', '\u0417' => 'З',
		'\u0438' => 'и', '\u0418' => 'И', '\u0439' => 'й', '\u0419' => 'Й', '\u043a' => 'к', '\u041a' => 'К',
		'\u043b' => 'л', '\u041b' => 'Л', '\u043c' => 'м', '\u041c' => 'М', '\u043d' => 'н', '\u041d' => 'Н',
		'\u043e' => 'о', '\u041e' => 'О', '\u043f' => 'п', '\u041f' => 'П', '\u0440' => 'р', '\u0420' => 'Р',
		'\u0441' => 'с', '\u0421' => 'С', '\u0442' => 'т', '\u0422' => 'Т', '\u0443' => 'у', '\u0423' => 'У',
		'\u0444' => 'ф', '\u0424' => 'Ф', '\u0445' => 'х', '\u0425' => 'Х', '\u0446' => 'ц', '\u0426' => 'Ц',
		'\u0447' => 'ч', '\u0427' => 'Ч', '\u0448' => 'ш', '\u0428' => 'Ш', '\u0449' => 'щ', '\u0429' => 'Щ',
		'\u044a' => 'ъ', '\u042a' => 'Ъ', '\u044b' => 'ы', '\u042b' => 'Ы', '\u044c' => 'ь', '\u042c' => 'Ь',
		'\u044d' => 'э', '\u042d' => 'Э', '\u044e' => 'ю', '\u042e' => 'Ю', '\u044f' => 'я', '\u042f' => 'Я',
		'\r' => '', '\n' => '<br />', '\t' => ''
     );
 
     foreach ($cyr_chars as $key => $value) {
         $json_str = str_replace($value, $key, $json_str);
     }
     return $json_str;
}

function isJSON($string){
    return ((is_string($string) && (is_object(json_decode($string)) || is_array(json_decode($string))))) ? true : false;
}

/*
*	Проверяем содержимое переменной $_REQUEST["request"] и если запрос не в формате JSON, то ругаемся и останавливаем скрипт
*/
if(!isJSON($_REQUEST["request"])){
	$response = jencoder(json_encode(array("response"=>array("message"=>"Запрос должен быть в формате JSON!", "code"=>401))));
	echo $response;
	exit;
}

/*
*	И вот тот самый момент когда наконец-то удалось получить правильный запрос )))
*	Предлагаю нахуяриться по этому поводу. Всем коньяка за мой счет!!!
*	Гхм-хм... Мда... О чем это я? Ах, да, запрос же )))
*	Итак запрос содержит строку вида: {SECRET_KEY: "VlRCV1JGVnJWbFZZTUhSR1YxRTlQUT09", action: "LOGIN"}
*	Перекодируем из JSON в array:
*/
$request = json_decode($_REQUEST["request"], TRUE);
/*
*	Теперь обрабатываем запрос и в зависимости от $request["action"] делаем выборку или вставляем данные в БД.
*/

	/*
	*	В текущем примере нам нужно проверить есть ли пользователь с $request["SECRET_KEY"] в таблице.
	*	Для примера сделаю поиск по массиву. В реале нужно делать выборку в БД.
	*/
	if($request["action"] == "LOGIN"){
		$BD = array(
			array("user_id"=>1, "SECRET_KEY"=>"123456789"),
			array("user_id"=>2, "SECRET_KEY"=>"987654321")
		);

		foreach($BD as $row){
			if($row["SECRET_KEY"] == $request["SECRET_KEY"]){
				$response = jencoder(json_encode(array("response"=>array("message"=>"Вы успешно авторизованы!", "code"=>200))));
				echo $response;
				exit;
			}
		}
		
		$response = jencoder(json_encode(array("response"=>array("message"=>"SECRET_KEY не найден в БД!", "code"=>401))));
		echo $response;
	}

	/*
	*	В текущем примере нам нужно проверить есть ли пользователь с $request["SECRET_KEY"] в таблице.
	*	Для примера сделаю просто вывод ответа сервера. В реале нужно делать вставку и выборку в БД.
	*/
	if($request["action"] == "ADDURL"){
		$response = jencoder(json_encode(array("response"=>array("message"=>"Ссылка успешно добавлена!", "code"=>200))));
		//$response = jencoder(json_encode(array("response"=>array("message"=>"Ошибка добавления ссылки!", "code"=>401))));
		echo $response;
	}

	/*
	*	В текущем примере нам нужно проверить есть ли пользователь с $request["SECRET_KEY"] в таблице.
	*	Для примера сделаю просто вывод ответа сервера. В реале нужно делать вставку и выборку в БД.
	*/
	if($request["action"] == "GET_CATEGORIES"){
		$CATEGORIES = array(
			array("id"=>1, "cat_name"=>"Youtube"),
			array("id"=>2, "cat_name"=>"Соцсети"),
			array("id"=>3, "cat_name"=>"Игры"),
			array("id"=>4, "cat_name"=>"Кино"),
			array("id"=>5, "cat_name"=>"Порно )))"),
			array("id"=>6, "cat_name"=>"Картинки"),
			array("id"=>7, "cat_name"=>"Всякая херня")
		);
		$response = jencoder(json_encode(array("response"=>array("categories"=>$CATEGORIES, "code"=>200))));
		echo $response;
	}

	/*
	*	В текущем примере нам нужно проверить есть ли пользователь с $request["SECRET_KEY"] в таблице.
	*	Для примера сделаю просто вывод ответа сервера. В реале нужно делать вставку и выборку в БД.
	*/
	if($request["action"] == "GET_HASHTAGS"){
		$top = array("россия","russia","vk","vkpost","кот","котик","котэ","любовь","москва","осень","фото","снег","порусски","зима","питер","девушка","путешествие","небо","ночь","утро","красота","вечер","девушки","дождь","красиво","ледянойдождь","метро","мода","дом","город","","лето","фотоног","еда","стиль");
		$HASHTAGS = array();
		for($i = 0; $i < count($top); $i++){
			$HASHTAGS[$i] = array("id"=>$i, "name"=>$top[$i]);
		}
		$response = jencoder(json_encode(array("response"=>array("hashtags"=>$HASHTAGS, "code"=>200))));
		echo $response;
	}

	/*
	*	В текущем примере нам нужно проверить есть ли пользователь с $request["SECRET_KEY"] в таблице.
	*	Для примера сделаю просто вывод ответа сервера. В реале нужно делать вставку и выборку в БД.
	*/
	if($request["action"] == "EXPORT"){
		$response = jencoder(json_encode(array("response"=>array("message"=>"Экспорт успешно произведен!<br />Экспортировано закладок: ".count($request["data"]), "code"=>200, "count"=>count($request["data"])))));
		//$response = jencoder(json_encode(array("response"=>array("message"=>"Ошибка экспорта!", "code"=>401, "count"=>count($request["data"])))));
		echo $response;
	}

	/*
	*	В текущем примере нам нужно проверить есть ли пользователь с $request["SECRET_KEY"] в таблице.
	*	Для примера сделаю просто вывод ответа сервера. В реале нужно делать вставку и выборку в БД.
	*/
	if($request["action"] == "GET_NOTIFICATIONS"){
		$response = jencoder(json_encode(array("response"=>array("title"=>"Длина заголовка до 35 символов ))))", "message"=>"Текст уведомления до 195 символов. Ниже отображается имя расширения (не убрать никак).", "code"=>200))));
		echo $response;
	}

/*
	Имеем 6 основных запросов:
		1. Авторизация по SECRET_KEY
		2. Запрос списка категорий
		3. Запрос списка категорий
		4. Добавление ссылки
		5. Экспорт закладок из браузера
		6. Запрос уведомлений с сайта

	Примеры запросов:
		1. Авторизация по SECRET_KEY:
			Запрос от клиента:
				{
					SECRET_KEY: "строка SECRET_KEY", 
					action: "LOGIN"
				}

			Ответ от сервера: 
				Если успешно: 
					{
						response: 
						{
							message: "Текст сообщения о том, что верификация пройдена", 
							code: 200
						}
					}
				Если ошибка: 
					{
						response: 
						{
							message: "Текст сообщения о том, что верификация не пройдена", 
							code: 401
						}
					}
				
		2. Запрос списка категорий:
			Запрос от клиента: 
				{
					SECRET_KEY: "строка SECRET_KEY", 
					action: "GET_CATEGORIES"
				}
				
			Ответ от сервера: 
				Если успешно: 
					{
						response: 
						{
							categories: 
							{
								массив категорий вида {cat_name: "Имя категории", id: %ID категории%}
							}, 
							code: 200
						}
					}
				Если ошибка: 
					{
						response: 
						{
							categories: false, 
							code: 401
						}
					}
				
		3. Запрос списка популярных хэштегов:
			Запрос от клиента: 
				{
					SECRET_KEY: "строка SECRET_KEY", 
					action: "GET_HASHTAGS"
				}
				
			Ответ от сервера: 
				Если успешно: 
					{
						response: 
						{
							hashtags: 
							{
								массив хэштегов вида {name: "хэштег", id: %ID хэштега%}
							}, 
							code: 200
						}
					}
				Если ошибка: 
					{
						response: 
						{
							hashtags: false, 
							code: 401
						}
					}
				
		4. Добавление ссылки:
			Запрос от клиента: 
				{
					SECRET_KEY: "строка SECRET_KEY", 
					action: "ADDURL", 
					args: 
						{
							title: "Заголовок ссылки",
							url: "http://example.com",
							categories_id: "ID выбранной категории",
							status: "приватная или общая (0 или 1)",
							description: "Описание или пустая строка если не заполнено поле",
							hashtag: ["хэштэг", "хэштег2", ...] или []
						}
				}
				
			Ответ от сервера: 
				Если успешно: 
					{
						response: 
						{
							message: "Текст сообщения о том, что ссылка добавлена", 
							code: 200
						}
					}
				Если ошибка:
					{
						response: 
						{
							message: "Текст сообщения о том, что ссылка не добавлена", 
							code: 401
						}
					}

				
		5. Экспорт закладок из браузера
			Запрос от клиента: 
				{
					SECRET_KEY: "строка SECRET_KEY", 
					action: "EXPORT", 
					data: 
						[
							{
								parentname: "Экспорт из Google Chrome->%название категории%[, ->%название категории%]",
								date: %дата добавления в формате timestamp%,
								name: "%заголовок страницы%",
								url: "url страницы"
							}
						]
				}
				
			Ответ от сервера: 
				Если успешно:
					{
						response: 
							{
								message: "Текст сообщения о том, что экспорт выполнен", 
								code: 200,
								count: %Количество добавленных ссылок%
							}
					}
				Если ошибка: 
					{
						response: 
							{
								message: "Текст сообщения о том, что экспорт не выполнен", 
								code: 401
							}
					}
		
		6. Запрос уведомлений с сайта
			Запрос от клиента:
				{
					SECRET_KEY: "строка SECRET_KEY", 
					action: "GET_NOTIFICATIONS"
				}

			Ответ от сервера: 
				Если есть текущие уведомления: 
					{
						response: 
						{
							title: "Длина заголовка до 35 символов ))))",
							message: "Текст уведомления до 195 символов. Ниже текста отображается имя расширения (не убрать никак). В html формате нельзя! Только текст.", 
							code: 200
						}
					}
				Если уведомлений нет: 
					{
						response: 
						{ 
							code: 401
						}
					}

*/

?>