const test = require("node:test");
const assert = require("node:assert");

test("Basic application test", () => {
  assert.strictEqual(1 + 1, 2);
});

test("Application name test", () => {
  assert.strictEqual("nodejs-devops-project", "nodejs-devops-project");
});
