const autocannon = require("autocannon");

async function runTest(name, url, connections = 10, duration = 20) {
  console.log(`\n Running: ${name}`);
  console.log(`\n URL: ${url}`);

  const result = await autocannon({
    url,
    connections,
    duration,
    timeout: 100,
  });

  console.log(`\nResults for [${name}]:`);
  console.log(`  Requests/sec:   ${result.requests.average.toFixed(2)}`);
  console.log(`  Latency p50:    ${result.latency.p50}ms`);
  console.log(`  Latency p99:    ${result.latency.p99}ms`);
  console.log(`  Latency p999:   ${result.latency.p999}ms`);
  console.log(`  Total requests: ${result.requests.total}`);
  console.log(`  Errors:         ${result.errors}`);
  console.log(`  Timeouts:       ${result.timeouts}`);
  console.log(`  Non 2xx:        ${result.non2xx}`);

  return result;
}

async function main() {
  console.log(`\n Verifying Server start up`);
  try {
    const check = await autocannon({
      connections: 1,
      timeout: 40,
      duration: 1,
      url: "http://localhost:3000/health",
    });
    if (check.errors > 0) {
      console.error("Server not reachable. Start it first.");
      process.exit(1);
    }
    console.log("Server reachable.\n");
  } catch (error) {
    console.error("Connection failed:", err.message);
    process.exit(1);
  }

  await new Promise((resolved) => setTimeout(resolved, 3000));
  // / TEST 1: Baseline - what does a non-blocking route look like
  const healthResult = await runTest(
    "BASELINE (health - no work)",
    "http://localhost:3000/health",
    10,
    10,
  );

  await new Promise((r) => setTimeout(r, 2000));

  // TEST 2: Blocked - CPU work on main thread
  const blockedResult = await runTest(
    "BLOCKED (CPU on main thread)",
    "http://localhost:3000/blocked",
    10,
    15,
  );

  await new Promise((r) => setTimeout(r, 2000));

  // TEST 3: Non-blocked - CPU work on worker thread
  const nonBlockedResult = await runTest(
    "NON-BLOCKED (CPU on worker thread)",
    "http://localhost:3000/non-blocked",
    10,
    15,
  );

  // COMPARISON SUMMARY
  console.log("\n=");
  console.log("COMPARISON SUMMARY");
  console.log("=");
  console.log(`                     Blocked    Non-Blocked`);
  console.log(
    `Requests/sec:        ${blockedResult.requests.average.toFixed(0).padEnd(10)} ${nonBlockedResult.requests.average.toFixed(0)}`,
  );
  console.log(
    `Latency p50 (ms):    ${String(blockedResult.latency.p50).padEnd(10)} ${nonBlockedResult.latency.p50}`,
  );
  console.log(
    `Latency p99 (ms):    ${String(blockedResult.latency.p99).padEnd(10)} ${nonBlockedResult.latency.p99}`,
  );
  console.log(
    `Errors:              ${String(blockedResult.errors).padEnd(10)} ${nonBlockedResult.errors}`,
  );
  console.log(
    `Timeouts:            ${String(blockedResult.timeouts).padEnd(10)} ${nonBlockedResult.timeouts}`,
  );
}

main().catch((error) => console.error(error));
