const taskForm = document.getElementById('task-form');
const filterCategory = document.getElementById('filter-category');
const filterStatus = document.getElementById('filter-status');
const searchInput = document.getElementById('search');
const taskIdInput = document.getElementById('task-id');
const clearFiltersBtn = document.getElementById('clear-filters');

const kanbanColumns = {
    'Pendente': document.getElementById('kanban-pendente'),
    'Em Progresso': document.getElementById('kanban-emprogresso'),
    'Concluída': document.getElementById('kanban-concluida')
};

let tasks = [];

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasks() {
    const saved = localStorage.getItem('tasks');
    if (saved) {
        tasks = JSON.parse(saved);
    }
}

function clearKanbanColumns() {
    Object.values(kanbanColumns).forEach(column => {
        column.innerHTML = '';
    });
}

function renderTasks() {
    clearKanbanColumns();

    const filteredTasks = tasks.filter(task => {
        const categoryMatch = filterCategory.value === '' || task.category === filterCategory.value;
        const statusMatch = filterStatus.value === '' || task.status === filterStatus.value;
        const searchTerm = searchInput.value.toLowerCase();
        const searchMatch = task.title.toLowerCase().includes(searchTerm) || task.description.toLowerCase().includes(searchTerm);
        return categoryMatch && statusMatch && searchMatch;
    });

    if (filteredTasks.length === 0) {
        Object.values(kanbanColumns).forEach(column => {
            column.innerHTML = '<p>Nenhuma tarefa encontrada.</p>';
        });
        return;
    }

    filteredTasks.forEach(task => {
        const card = document.createElement('div');
        card.className = 'task-card' + (task.status === 'Concluída' ? ' completed' : '');
        card.dataset.id = task.id;
        card.draggable = true;

        card.addEventListener('dragstart', dragStart);
        card.addEventListener('dragend', dragEnd);

        const header = document.createElement('div');
        header.className = 'task-header';

        const title = document.createElement('h3');
        title.className = 'task-title';
        title.textContent = task.title;

        const category = document.createElement('span');
        category.className = 'task-category';
        category.textContent = task.category;

        header.appendChild(title);
        header.appendChild(category);

        const desc = document.createElement('p');
        desc.className = 'task-desc';
        desc.textContent = task.description;

        const footer = document.createElement('div');
        footer.className = 'task-footer';

        const dueDate = document.createElement('span');
        dueDate.textContent = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '';

        const btnComplete = document.createElement('button');
        btnComplete.innerHTML = task.status === 'Pendente' ? '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg> Marcar como Concluída' : '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19 6L10 17l-5-5"/></svg> Marcar como Pendente';
        btnComplete.addEventListener('click', () => toggleComplete(task.id));

        const btnEdit = document.createElement('button');
        btnEdit.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z"/></svg> Editar';
        btnEdit.addEventListener('click', () => editTask(task.id));

        const btnDelete = document.createElement('button');
        btnDelete.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M16 9v10H8V9h8m-1.5-6h-5l-1 1H5v2h14V4h-4.5l-1-1z"/></svg> Excluir';
        btnDelete.addEventListener('click', () => confirmDeleteTask(task.id));

        footer.appendChild(dueDate);
        footer.appendChild(btnComplete);
        footer.appendChild(btnEdit);
        footer.appendChild(btnDelete);

        card.appendChild(header);
        card.appendChild(desc);
        card.appendChild(footer);

        kanbanColumns[task.status].appendChild(card);
    });
}

function addTask(task) {
    tasks.push(task);
    saveTasks();
    renderTasks();
    scrollToTask(task.id);
}

function updateTask(updatedTask) {
    const index = tasks.findIndex(t => t.id === updatedTask.id);
    if (index !== -1) {
        tasks[index] = updatedTask;
        saveTasks();
        renderTasks();
        scrollToTask(updatedTask.id);
    }
}

function confirmDeleteTask(id) {
    if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
        deleteTask(id);
    }
}

function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    renderTasks();
}

function toggleComplete(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.status = task.status === 'Pendente' ? 'Concluída' : 'Pendente';
        saveTasks();
        renderTasks();
    }
}

function editTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        taskIdInput.value = task.id;
        document.getElementById('title').value = task.title;
        document.getElementById('description').value = task.description;
        document.getElementById('category').value = task.category;
        document.getElementById('due-date').value = task.dueDate || '';
        taskForm.querySelector('button[type="submit"]').textContent = 'Atualizar Tarefa';
    }
}

taskForm.addEventListener('submit', e => {
    e.preventDefault();
    const id = taskIdInput.value;
    const title = document.getElementById('title').value.trim();
    const description = document.getElementById('description').value.trim();
    const category = document.getElementById('category').value;
    const dueDate = document.getElementById('due-date').value;

    if (!title || !category) {
        showValidationMessage('Por favor, preencha os campos obrigatórios: Título e Categoria.');
        return;
    }

    clearValidationMessage();

    if (id) {
        // Update existing task
        updateTask({ id, title, description, category, dueDate, status: tasks.find(t => t.id === id).status });
        taskIdInput.value = '';
        taskForm.querySelector('button[type="submit"]').textContent = 'Adicionar Tarefa';
    } else {
        // Add new task
        const newTask = {
            id: Date.now().toString(),
            title,
            description,
            category,
            dueDate,
            status: 'Pendente'
        };
        addTask(newTask);
    }

    taskForm.reset();
});

filterCategory.addEventListener('change', renderTasks);
filterStatus.addEventListener('change', renderTasks);
searchInput.addEventListener('input', renderTasks);
clearFiltersBtn.addEventListener('click', () => {
    filterCategory.value = '';
    filterStatus.value = '';
    searchInput.value = '';
    renderTasks();
});

function showValidationMessage(message) {
    let validationEl = document.getElementById('validation-message');
    if (!validationEl) {
        validationEl = document.createElement('div');
        validationEl.id = 'validation-message';
        validationEl.style.color = 'red';
        validationEl.style.marginBottom = '1rem';
        taskForm.insertBefore(validationEl, taskForm.firstChild);
    }
    validationEl.textContent = message;
}

function clearValidationMessage() {
    const validationEl = document.getElementById('validation-message');
    if (validationEl) {
        validationEl.textContent = '';
    }
}

function scrollToTask(id) {
    let taskCard = null;
    for (const column of Object.values(kanbanColumns)) {
        taskCard = column.querySelector(`.task-card[data-id="${id}"]`);
        if (taskCard) break;
    }
    if (taskCard) {
        taskCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        taskCard.classList.add('added');
        setTimeout(() => taskCard.classList.remove('added'), 700);
    }
}

// Drag and Drop handlers
let draggedTaskId = null;

function dragStart(e) {
    draggedTaskId = e.target.dataset.id;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', draggedTaskId);
    e.target.classList.add('dragging');
}

function dragEnd(e) {
    draggedTaskId = null;
    e.target.classList.remove('dragging');
}

function dragOver(e) {
    e.preventDefault();
    if (e.currentTarget.classList.contains('kanban-column')) {
        e.currentTarget.classList.add('drag-over');
    }
}

function dragLeave(e) {
    if (e.currentTarget.classList.contains('kanban-column')) {
        e.currentTarget.classList.remove('drag-over');
    }
}

function drop(e) {
    e.preventDefault();
    if (e.currentTarget.classList.contains('kanban-column')) {
        e.currentTarget.classList.remove('drag-over');
        const newStatus = e.currentTarget.dataset.status;
        const task = tasks.find(t => t.id === draggedTaskId);
        if (task && task.status !== newStatus) {
            task.status = newStatus;
            saveTasks();
            renderTasks();
        }
    }
}

// Attach drag and drop event listeners to columns
Object.values(kanbanColumns).forEach(column => {
    column.addEventListener('dragover', dragOver);
    column.addEventListener('dragleave', dragLeave);
    column.addEventListener('drop', drop);
});

// Initial load
loadTasks();
renderTasks();
