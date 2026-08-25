const express = require('express');
const path = require('node:path');
const crypto = require('node:crypto');

const app = express();
const port = Number(process.env.PORT) || 3000;
const tasks = [
  { id: crypto.randomUUID(), title: 'Containerize the API', done: true },
  { id: crypto.randomUUID(), title: 'Add a CI pipeline', done: false },
  { id: crypto.randomUUID(), title: 'Ship a monitoring dashboard', done: false }
];

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/health', (request, response) => {
  response.json({ status: 'ok', service: 'shipit-board', timestamp: new Date().toISOString() });
});

app.get('/api/tasks', (request, response) => {
  response.json(tasks);
});

app.post('/api/tasks', (request, response) => {
  const title = typeof request.body?.title === 'string' ? request.body.title.trim() : '';
  if (!title) return response.status(400).json({ error: 'A task title is required.' });

  const task = { id: crypto.randomUUID(), title, done: false };
  tasks.unshift(task);
  return response.status(201).json(task);
});

app.patch('/api/tasks/:id', (request, response) => {
  const task = tasks.find((item) => item.id === request.params.id);
  if (!task) return response.status(404).json({ error: 'Task not found.' });
  if (typeof request.body?.done !== 'boolean') return response.status(400).json({ error: 'done must be a boolean.' });

  task.done = request.body.done;
  return response.json(task);
});

app.delete('/api/tasks/:id', (request, response) => {
  const taskIndex = tasks.findIndex((item) => item.id === request.params.id);
  if (taskIndex === -1) return response.status(404).json({ error: 'Task not found.' });

  tasks.splice(taskIndex, 1);
  return response.status(204).end();
});

if (require.main === module) {
  app.listen(port, () => console.log(`ShipIt Board listening on port ${port}`));
}

module.exports = { app, tasks };
