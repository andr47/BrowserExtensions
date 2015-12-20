(function() {

	/**
	 * Главная функция-объект
	 * @return {object} [Возвращаем ссылку на объект]
	*/
	JSOptions = function (opts){

		var _private = {

			/* ПРИВАТНЫЕ СВОЙСТВА */
			/*************************************************************/
			/**
			 * Приватный объект с настройками по-умолчанию. Доступ к нему через экземпляр объекта не будет.
			 * @type {object}
			 */
			_options: {},
			
			/**
			 * Приватное свойство, содержащее коллбэк функцию. Доступ к нему только через метод установки setCallback.
			 * @param  {string} key [Имя опции]
			 * @param  {mixed} val [Значение опции]
			 * @return {function}     [Коллбэк функция]
			 */
			_callback: function(key, val){},
			/*************************************************************/
			

			/* ПРИВАТНЫЕ МЕТОДЫ */
			/*************************************************************/
			/**
			 * Метод вызывается при инициализации объекта
			 * @param  {object} opts [Объект с настройками вида {"ключ": значение}]
			 */
			_init: function(opts){
				var settings = typeof opts == "object" ? opts : _private._options;
				_private._setAll(settings);
			},

			/**
			 * Метод устанавливает коллбэк функцию, которая будет вызываться каждый раз, когда меняется какая-то опция. В коллбэк будут переданы имя опции и ее значение.
			 * @param {function} callback [function(key, val){}]
			 */
			_setCallback: function(callback){
				var cb = typeof callback == "function" ? callback : _private._callback;
				_private._callback = cb;
			},

			/**
			 * Приватный метод получения ключа объекта настроек. В случае если key не передан, то возвращает ссылку на объект для вызова цепочки методов. В случае если key не найден в настройках, то возвращает undefined.
			 * @param {string} key [Имя ключа в объекте настроек] 
			 * @return {mixed} [Возвращает опцию с ключом key]
			*/
			_getItem: function(key) {
				if(typeof key !== "undefined"){
					if(key in _private._options){
						return _private._options[key];
					}
					return undefined;
				}
				return this;
			},

			/**
			 * Приватный метод устанавливает ключ настройки key в значение переданного аргумента value
			 * @param {string} key [Имя устанавливаемого ключа в объекте настроек]
			 * @param {mixed} value [Значение]
			 * @return {object} [Возвращает ссылку на объект]
			*/
			_setItem: function(key, val) {
				if(typeof val !== "undefined"){
					_private._options[key] = val;
					_private._callback(key, val);
				}
				return this;
			},

			/**
			 * Приватный метод возвращает объект настроек this._options
			 * @return {Object} [Возвращает объект настроек this._options]
			*/
			_getAll: function() {
				return _private._options;
			},

			/**
			 * Приватный метод устанавливает настройки из переданного объекта options
			 * @param {object} options [Объект с настройками вида {"ключ": значение}]
			 * @return {object} [Возвращает ссылку на объект]
			*/
			_setAll: function(options){
				if(options && typeof options == "object"){
					for(opt in options){
						_private._setItem(opt, options[opt]);
					}
				}
				return this;
			}
		};


		/* ИНИЦИАЛИЗАЦИЯ */
		/*************************************************************/
		/**
		 * Производим инициализацию объекта
		 * @param {object or undefined} opts [Объект настроек, переданный при создании объекта]
		 */
		_private._init(opts);
		/*************************************************************/


		/* ПУБЛИЧНЫЙ ИНТЕРФЕЙС */
		/*************************************************************/
		/**
		 * Возвращаем интерфейс для работы с объектом
		 */
		return {
			getItem: 		_private._getItem,
			setItem: 		_private._setItem,
			get: 			_private._getAll,
			set: 			_private._setAll,
			setCallback: 	_private._setCallback
		};
		/*************************************************************/
	};

})();