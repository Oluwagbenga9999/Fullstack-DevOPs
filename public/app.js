const form = document.querySelector('#task-form');
const titleInput = document.querySelector('#task-title');
const taskList = document.querySelector('#task-list');
const taskCount = document.querySelector('#task-count');
const serviceStatus = document.querySelector('#service-status');

async function request(path, options) {
  const response = await fetch(path, options);
  if (!response.ok) throw new Error((await response.json()).error || 'Request failed');
  return response.status === 204 ? null : response.json();
}

function render(tasks) {
  const completed = tasks.filter((task) => task.done).length;
  taskCount.textContent = `${completed}/${tasks.length} complete`;
  taskList.replaceChildren();

  if (!tasks.length) {
    taskList.innerHTML = '<p class="empty">No tasks yet. The runway is clear.</p>';
    return;
  }

  tasks.forEach((task) => {
    const row = document.createElement('article');
    row.className = `task ${task.done ? 'is-done' : ''}`;
    const checkButton = document.createElement('button');
    checkButton.className = 'check';
    checkButton.setAttribute('aria-label', `Mark ${task.done ? 'incomplete' : 'complete'}: ${task.title}`);
    checkButton.textContent = task.done ? '✓' : '';
    checkButton.addEventListener('click', () => updateTask(task.id, !task.done));

    const title = document.createElement('span');
    title.className = 'task-title';
    title.textContent = task.title;

    const removeButton = document.createElement('button');
    removeButton.className = 'remove';
    removeButton.setAttribute('aria-label', `Delete ${task.title}`);
    removeButton.textContent = '×';
    removeButton.addEventListener('click', () => deleteTask(task.id));

    row.append(checkButton, title, removeButton);
    taskList.append(row);
  });
}

async function loadTasks() {
  try {
    const tasks = await request('/api/tasks');
    render(tasks);
    serviceStatus.textContent = 'API online';
  } catch (error) {
    serviceStatus.textContent = 'API offline';
    taskList.innerHTML = `<p class="empty error">${error.message}</p>`;
  }
}

async function updateTask(id, done) {
  await request(`/api/tasks/${id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ done }) });
  loadTasks();
}

async function deleteTask(id) {
  await request(`/api/tasks/${id}`, { method: 'DELETE' });
  loadTasks();
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  await request('/api/tasks', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ title: titleInput.value }) });
  titleInput.value = '';
  titleInput.focus();
  loadTasks();
});

loadTasks();
