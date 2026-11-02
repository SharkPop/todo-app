const title = document.getElementById('newTaskTitle');
const details = document.getElementById('newTaskDetails')
const btn = document.getElementById('newTaskBtn');
const list = document.getElementById('taskList');

// Функция сохранения задачи
async function saveTask(task) {
    try
    {
       let res = await fetch('/tasks', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({text: task})
        });
        await loadTasks();
    }
    catch(err)
    {
        console.error(err)
    }
}

// Функция загрузки задач
async function loadTasks() {
    try
    {
        let res = await fetch('/tasks');
        let tasks = await res.json();

        list.innerHTML = '';
        tasks.forEach(task => {
            const li = document.createElement('li');
            const titleSpan = document.createElement('span')
            const detailsSpan = document.createElement('span')
            const deleteBtn = document.createElement('button')
            
            titleSpan.textContent = task.text;
            titleSpan.addEventListener('click', ()=>{
                console.log("хуй")
                switch(li.className)
                {
                    case 'slide-element':
                    {
                        li.className = 'slide-element.slided'
                        break;
                    }
                    case 'slide-element.slided':
                    {
                        li.className = 'slide-element'
                        break;
                    }
                }
            })

            detailsSpan.textContent = task.details;

            deleteBtn.textContent = "Удалить"
            deleteBtn.className = 'deleteBtn'
            deleteBtn.addEventListener('click', (event)=>{
                event.stopPropagation();
                console.log(task.id)
                removeTask(task.id)
            })

            li.className = "slide-element"
            li.appendChild(titleSpan);
            li.appendChild(detailsSpan);
            li.appendChild(deleteBtn);

            list.appendChild(li);
        });
    }
    catch(error)
    {
        console.error(error)
    }
}
async function removeTask(taskId) {
    try
    {
        await fetch('/remove',{
            method:'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({text: taskId})
        })
        await loadTasks();
    }
    catch(err)
    {
        console.error(err)
    }
}
// Событие на кнопку
btn.addEventListener('click', ()=>{
    let taskText = {text: title.value.trim(), details: details.value.trim()}
    if(taskText)
    {
        saveTask(taskText);
        title.value = '';
        details.value = '';
    }
})
loadTasks();