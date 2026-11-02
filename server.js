const { createServer } = require('node:http');
const fs = require('node:fs');
const { text, json } = require('node:stream/consumers');

const hostname = '127.0.0.1';
const port = 3000;

const server = createServer((req, res) => {
    switch(req.url)
    {
        case '/':
        {
            fs.readFile('index.html', 'utf8', (err, data) => {
                if(err){
                    console.error(err);
                    return;
                }
                //    res.statusCode = 200;
                //    res.setHeader('Content-Type', 'text/plain');
                res.end(data);
            })
            break;
        }
        case '/script.js':
        {
            fs.readFile('script.js', 'utf8', (err,data) =>{
                if(err)
                {
                    console.error(err);
                    return;
                }
                res.end(data)
            })
            break;
        }
        case '/style.css':
        {
            fs.readFile('style.css','utf8', (err, data) =>{
                if(err)
                {
                    console.error(err);
                    return;
                }
                res.writeHead(200,{'Content-Type': 'text/css; charset=utf-8'});
                res.end(data);
            })
            break;
        }
        case '/tasks':
        {
            // Если метод GET - отправляем список задач
            if(req.method === 'GET')
            {
                let readedTasks = [];
                if(fs.existsSync('tasks.json'))
                {
                    const fileContent = fs.readFileSync('tasks.json', 'utf8');
                    // Проверка на пустой файл
                    if(fileContent.trim() !== '')
                    {
                        readedTasks = JSON.parse(fileContent);
                    }
                }
                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                res.end(JSON.stringify(readedTasks))
            }
            // Если метод POST - записываем в JSON файл новую задачу.
            else if(req.method === 'POST')
            {
                try
                {
                    let inputText = '';
                    let readedTasks = [];
                    // Проверка на существование файла
                    if(fs.existsSync('tasks.json'))
                    {
                        const fileContent = fs.readFileSync('tasks.json', 'utf8');
                        // Проверка на пустой файл
                        if(fileContent.trim() !== '')
                        {
                            readedTasks = JSON.parse(fileContent);
                        }
                    }
                    req.on('data', chunk=>{
                        inputText += chunk.toString();
                    });
                    // Сбор данных задачи и запись в JSON файл
                    req.on('end', ()=>{
                        const parsedData = JSON.parse(inputText)
                        let newTask = {
                            id: Date.now(),
                            text: parsedData.text.text,
                            details: parsedData.text.details,
                            date: new Date().toLocaleDateString('ru-RU')
                        };
                        readedTasks.push(newTask)
                        fs.writeFile('tasks.json', JSON.stringify(readedTasks, null, 2), (err) =>{
                            if(err)
                            {
                                console.error(err);
                                res.end('Ошибка записи!');
                                return;
                            }
                            res.setHeader('Content-Type', 'application/json');
                            res.end(JSON.stringify({ success: true }))
                        })
                    })
                }
                catch(err)
                {
                    console.error(err)
                }
            }
            break;
        }
        case '/remove':
        {
            try
            {
                // Получаем id задачи
                let taskId = '';
                let newJsonFile = [];
                req.on('data', chunk=>{
                    taskId += chunk.toString();
                })
                req.on('end', ()=>{
                    // Записываем json файл и удаляем искомый id
                    if(fs.existsSync('tasks.json'))
                    {
                        let jsonData = fs.readFileSync('tasks.json', 'utf8');
                        // Проверка на пустой файл
                        if(jsonData.trim() !== '')
                        {
                            newJsonFile = JSON.parse(jsonData);
                        }
                    }
                    // Перезаписываем taskId числом, а не строкой и newJsonFile новый json файлом без искомой задачи
                    taskId = JSON.parse(taskId).text;
                    newJsonFile = newJsonFile.filter(task => Number(task.id) !== taskId)
                    fs.writeFile('tasks.json', JSON.stringify(newJsonFile, null, 2), (err) =>{
                        if (err) {
                            res.statusCode = 500;
                            res.end('Ошибка записи');
                            return;
                        }
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify({ success: true }));
                    })
                })
            }
            catch(err)
            {
                console.error(err)
            }
            break;
        }
    }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});