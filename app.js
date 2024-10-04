document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('todo-form');
    const todoList = document.getElementById('todo-list');

    initializeFlatpickr();
    loadTodos();

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        addTodo();
    });

    function initializeFlatpickr() {
        flatpickr("#todo-datetime", {
            enableTime: true,
            dateFormat: "Y-m-d H:i",
            time_24hr: true,
            onDayCreate: function(dObj, dStr, fp, dayElem) {
                const todos = JSON.parse(localStorage.getItem('todos')) || [];
                const markedDates = todos.map(todo => todo.datetime.split(' ')[0]);
                if (markedDates.includes(dayElem.dateObj.toISOString().split('T')[0])) {
                    dayElem.innerHTML += "<span class='event-dot'></span>";
                }
            }
        });
    }

    function addTodo() {
        const todo = {
            name: document.getElementById('todo-name').value,
            datetime: document.getElementById('todo-datetime').value,
            description: document.getElementById('todo-description').value,
            completed: false
        };
        createTodoElement(todo);
        saveTodo(todo);

        form.reset();
        sortTodos();
        updateTodoStats();
        initializeFlatpickr();
    }

    function createTodoElement(todo) {
        const todoItem = document.createElement('li');
        todoItem.classList.add('todo-item');
        if (todo.completed) todoItem.classList.add('completed');
        
        todoItem.innerHTML = `
            <h3>🎯 ${todo.name}</h3>
            <p>🕒 Tarih ve Saat: ${todo.datetime}</p>
            <p>📝 Açıklama: ${todo.description}</p>
            <div class="buttons">
                <button class="complete-btn" onclick="toggleComplete(this)">
                    ${todo.completed ? 'Geri Al ↩️' : 'Tamamla ✅'}
                </button>
                <button class="edit-btn" onclick="editTodo(this)">Düzenle ✏️</button>
                <button class="delete-btn" onclick="deleteTodo(this)">Sil ❌</button>
            </div>
        `;

        todoList.appendChild(todoItem);
    }

    function saveTodo(todo) {
        let todos = JSON.parse(localStorage.getItem('todos')) || [];
        todos.push(todo);
        localStorage.setItem('todos', JSON.stringify(todos));
    }

    function loadTodos() {
        let todos = JSON.parse(localStorage.getItem('todos')) || [];
        todos.forEach(createTodoElement);
        sortTodos();
        updateTodoStats();
    }
});

function toggleComplete(button) {
    const todoItem = button.closest('.todo-item');
    todoItem.classList.toggle('completed');
    button.textContent = todoItem.classList.contains('completed') ? 'Geri Al ↩️' : 'Tamamla ✅';
    
    if (todoItem.classList.contains('completed')) {
        todoItem.classList.add('fade-out');
        setTimeout(() => {
            todoItem.style.display = 'none';
            updateLocalStorage();
            updateTodoStats();
        }, 15000); // 15 saniye sonra gizle
    } else {
        todoItem.classList.remove('fade-out');
        todoItem.style.display = 'block';
    }
    
    updateLocalStorage();
    updateTodoStats();
}

function deleteTodo(button) {
    const todoItem = button.closest('.todo-item');
    todoItem.remove();
    updateLocalStorage();
    updateTodoStats();
}

function editTodo(button) {
    const todoItem = button.closest('.todo-item');
    const name = todoItem.querySelector('h3').textContent.slice(2);
    const datetime = todoItem.querySelector('p:nth-of-type(1)').textContent.slice(15);
    const description = todoItem.querySelector('p:nth-of-type(2)').textContent.slice(12);

    document.getElementById('todo-name').value = name;
    document.getElementById('todo-datetime').value = datetime;
    document.getElementById('todo-description').value = description;

    todoItem.remove();
    updateLocalStorage();
    updateTodoStats();
}

function updateLocalStorage() {
    const todoItems = document.querySelectorAll('.todo-item');
    const todos = Array.from(todoItems).map(item => ({
        name: item.querySelector('h3').textContent.slice(2),
        datetime: item.querySelector('p:nth-of-type(1)').textContent.slice(15),
        description: item.querySelector('p:nth-of-type(2)').textContent.slice(12),
        completed: item.classList.contains('completed')
    }));
    localStorage.setItem('todos', JSON.stringify(todos));
}

function sortTodos() {
    const todoItems = Array.from(document.querySelectorAll('.todo-item'));
    todoItems.sort((a, b) => {
        const dateA = new Date(a.querySelector('p:nth-of-type(1)').textContent.slice(15));
        const dateB = new Date(b.querySelector('p:nth-of-type(1)').textContent.slice(15));
        return dateA - dateB;
    });
    const todoList = document.getElementById('todo-list');
    todoList.innerHTML = '';
    todoItems.forEach(item => todoList.appendChild(item));
}

function filterTodos(filter) {
    const todoItems = document.querySelectorAll('.todo-item');
    todoItems.forEach(item => {
        switch(filter) {
            case 'all':
                item.style.display = item.classList.contains('completed') && item.style.display === 'none' ? 'none' : 'block';
                break;
            case 'active':
                item.style.display = item.classList.contains('completed') ? 'none' : 'block';
                break;
            case 'completed':
                item.style.display = item.classList.contains('completed') ? 'block' : 'none';
                break;
        }
    });
}

function updateTodoStats() {
    const allTodos = document.querySelectorAll('.todo-item');
    const visibleTodos = Array.from(allTodos).filter(item => item.style.display !== 'none');
    const completedTodos = Array.from(allTodos).filter(item => item.classList.contains('completed'));
    
    document.getElementById('total-todos').textContent = `Toplam: ${allTodos.length}`;
    document.getElementById('completed-todos').textContent = `Tamamlanan: ${completedTodos.length}`;
}