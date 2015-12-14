// Actions.js

// список actions для обмена сообщениями между расширением и сервером
var serverActions = {
	/*
	*	action для авторизации по SECRET_KEY
	*/
	LOGIN: 'LOGIN',
	/*
	*	action для запроса списка категорий
	*/
	GET_CATEGORIES: 'GET_CATEGORIES',
	/*
	*	action для запроса списка популярных хэштегов
	*/
	GET_HASHTAGS: 'GET_HASHTAGS',
	/*
	*	action для добавления ссылки
	*/
	ADDURL: 'ADDURL',
	/*
	*	action для экспорта закладок из браузера
	*/
	EXPORT: 'EXPORT',
	/*
	*	action для запроса уведомлений с сайта
	*/
	GET_NOTIFICATIONS: 'GET_NOTIFICATIONS'
}

// список actions для обмена сообщениями между content.js и background.js
var extActions = {
	/*
	*	action для вызова формы добавления ссылки	
	*/
	showForm: 'showForm',
	/*
	*	action для отправки формы добавления ссылки на сервер
	*/
	sendForm: 'sendForm',
	/*
	*	action для вызова уведомления об успешном добавлении ссылки
	*/
	sendFormSuccess: 'sendFormSuccess',
	/*
	*	action для вызова уведомления об ошибке добавления ссылки
	*/
	sendFormError: 'sendFormError',
	/*
	*	action для вызова формы ввода SECRET_KEY
	*/
	showFormSecretKey: 'showFormSecretKey',
	/*
	*	action для отправки формы ввода SECRET_KEY на сервер
	*/
	sendFormSecretKey: 'sendFormSecretKey',
	/*
	*	action для вызова уведомления об успешной отправке SECRET_KEY
	*/
	sendFormSecretKeySuccess: 'sendFormSecretKeySuccess',
	/*
	*	action для вызова уведомления об ошибке отправки SECRET_KEY
	*/
	sendFormSecretKeyError: 'sendFormSecretKeyError'
}