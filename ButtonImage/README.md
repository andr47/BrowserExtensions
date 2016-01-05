### Выполнить для включения кнопки:

1. Добавить в manifest.json директиву:
```javascript
"content_scripts": [
        {
            "all_frames": true,
            "matches": ["http://*/*", "https://*/*"],
            "js": [
                "js/jquery.min.js",
                "js/lib.js",
                "js/content.js"
            ],
            "css": [
                "css/content.css"
            ],
            "run_at": "document_end"
        }
    ]
```
2. Выполнить слияние папок js и css в папках расширений с папками в текущем каталоге.
3. В файле background.js найти строчку 
```
/*--CONTENTSCRIPT--*/
```
и раскомментировать выражение if после нее.
4. В файле options.js раскомментировать все строки, которые содержат showButton.