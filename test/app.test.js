const test = require('node:test');
const assert = require('node:assert/strict');
const { app, tasks } = require('../server');

let server;
let baseUrl;

test.before(() => {
  server = app.listen(0);
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

test.after(() => server.close());

test('reports a healthy service', async () => {
  const response = await fetch(`${baseUrl}/health`);
  assert.equal(response.status, 200);
  assert.equal((await response.json()).status, 'ok');
});

test('creates a task through the API', async () => {
  const before = tasks.length;
  const response = await fetch(`${baseUrl}/api/tasks`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ title: 'Run the first deployment' })
  });

  assert.equal(response.status, 201);
  assert.equal((await response.json()).title, 'Run the first deployment');
  assert.equal(tasks.length, before + 1);
});
