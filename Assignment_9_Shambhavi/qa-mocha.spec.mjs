import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

function findProjectRoot(startDir) {
  const candidates = [
    startDir,
    path.join(startDir, "forensics_cyber_facefinger (2)", "forensics_cyber_facefinger"),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(path.join(candidate, "backend", "server.js"))) {
      return candidate;
    }
  }
  throw new Error(`Could not find project root below ${startDir}`);
}

const workspaceRoot = path.resolve(".");
const root = findProjectRoot(workspaceRoot);
const backendDir = path.join(root, "backend");
const evidenceDir = path.join(root, "qa-artifacts", "evidence");
fs.mkdirSync(evidenceDir, { recursive: true });

const runId = new Date().toISOString().replace(/[:.]/g, "-");
const port = 5600 + Math.floor(Math.random() * 500);
const baseUrl = `http://127.0.0.1:${port}/api`;
const logPath = path.join(evidenceDir, `backend-${runId}.log`);
const jsonPath = path.join(evidenceDir, `results-${runId}.json`);
const htmlDir = path.join(evidenceDir, `ui-${runId}`);
fs.mkdirSync(htmlDir, { recursive: true });

const results = [];
let server;
let investigatorToken;
let analystToken;
let adminToken;

function appendLog(line) {
  fs.appendFileSync(logPath, line, "utf8");
}

function startBackend() {
  server = spawn("node", ["server.js"], {
    cwd: backendDir,
    env: {
      ...process.env,
      PORT: String(port),
      MONGO_URI: `mongodb://127.0.0.1:27017/authdb_qa_${runId.replace(/-/g, "_")}`,
      JWT_SECRET: "qa-secret",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  server.stdout.on("data", (d) => appendLog(`[stdout] ${d}`));
  server.stderr.on("data", (d) => appendLog(`[stderr] ${d}`));
}

async function waitForBackend(timeoutMs = 20000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const res = await fetch(`${baseUrl}/auth/me`);
      if (res.status === 401) return;
    } catch (_err) {
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }
  throw new Error("Backend did not become ready in time");
}

async function api(pathname, options = {}) {
  const res = await fetch(`${baseUrl}${pathname}`, options);
  let body;
  try {
    body = await res.json();
  } catch (_err) {
    body = await res.text();
  }
  return { status: res.status, body };
}

function authHeaders(token) {
  return { Authorization: `Bearer ${token}` };
}

async function signupLogin({ role, email, extra = {} }) {
  const password = "Password123!";
  const signup = await api("/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: `${role} QA`,
      email,
      password,
      role,
      ...extra,
    }),
  });
  assert.equal(signup.status, 201, `signup failed for ${email}: ${JSON.stringify(signup.body)}`);

  const login = await api("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, roleId: signup.body.roleId }),
  });
  assert.equal(login.status, 200, `login failed for ${email}: ${JSON.stringify(login.body)}`);
  return { token: login.body.token, signup };
}

function blob(content, type) {
  return new Blob([content], { type });
}

async function uploadEvidence(token, fields, files = {}) {
  const fd = new FormData();
  Object.entries(fields).forEach(([key, value]) => fd.set(key, value));
  Object.entries(files).forEach(([key, file]) => fd.set(key, file.content, file.name));
  return api("/evidence/upload", {
    method: "POST",
    headers: authHeaders(token),
    body: fd,
  });
}

function record({ id, steps, input, expectedResult, expectedOutcome, actualResult, status, evidence }) {
  const deviation =
    status.toLowerCase() === expectedOutcome.toLowerCase()
      ? "No - actual status matched the known expected outcome."
      : `Yes - actual status was ${status}, expected outcome was ${expectedOutcome}.`;
  const item = {
    "Test Case ID": id,
    Steps: steps,
    Input: input,
    "Expected Result": expectedResult,
    "Actual Result": actualResult,
    "Expected Outcome": expectedOutcome,
    Status: status,
    Deviation: deviation,
    Evidence: evidence,
  };
  results.push(item);
  return item;
}

function writeUiEvidence(item) {
  const safeId = item["Test Case ID"].toLowerCase();
  const htmlPath = path.join(htmlDir, `${safeId}.html`);
  const statusClass = item.Status === "Pass" ? "pass" : "fail";
  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${item["Test Case ID"]} Evidence</title>
  <style>
    body { margin: 0; font-family: Arial, sans-serif; background: #101820; color: #eef4fb; }
    main { padding: 34px; max-width: 1080px; }
    h1 { margin: 0 0 8px; font-size: 34px; }
    .badge { display: inline-block; padding: 8px 14px; border-radius: 8px; font-weight: 700; }
    .pass { background: #0f766e; }
    .fail { background: #b91c1c; }
    section { margin-top: 18px; padding: 18px; border: 1px solid #334155; border-radius: 8px; background: #17212b; }
    dt { color: #9fb3c8; font-weight: 700; margin-top: 12px; }
    dd { margin: 5px 0 0; white-space: pre-wrap; line-height: 1.45; }
    code { color: #bfdbfe; }
  </style>
</head>
<body>
  <main>
    <h1>${item["Test Case ID"]}</h1>
    <span class="badge ${statusClass}">Status: ${item.Status}</span>
    <section>
      <dl>
        <dt>Steps</dt><dd>${item.Steps}</dd>
        <dt>Input</dt><dd>${item.Input}</dd>
        <dt>Expected Result</dt><dd>${item["Expected Result"]}</dd>
        <dt>Actual Result</dt><dd>${item["Actual Result"]}</dd>
        <dt>Expected Outcome</dt><dd>${item["Expected Outcome"]}</dd>
        <dt>Deviation</dt><dd>${item.Deviation}</dd>
        <dt>Backend Evidence</dt><dd>${item.Evidence}</dd>
      </dl>
    </section>
  </main>
</body>
</html>`;
  fs.writeFileSync(htmlPath, html, "utf8");
  const pngPath = path.join(htmlDir, `${safeId}.png`);
  const chrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  if (fs.existsSync(chrome)) {
    spawnSync(chrome, [
      "--headless=new",
      "--disable-gpu",
      "--no-sandbox",
      "--window-size=1280,900",
      `--screenshot=${pngPath}`,
      `file:///${htmlPath.replace(/\\/g, "/")}`,
    ], { stdio: "ignore" });
  }
  item.Evidence = `${item.Evidence}; UI screenshot: ${fs.existsSync(pngPath) ? pngPath : htmlPath}`;
}

describe("Forensics Cyber FaceFinger QA test cases", function () {
  this.timeout(90000);

  before(async () => {
    startBackend();
    await waitForBackend();
    const stamp = Date.now();
    investigatorToken = (await signupLogin({
      role: "Investigator",
      email: `investigator.${stamp}@qa.local`,
      extra: { department: "Digital Forensics" },
    })).token;
    analystToken = (await signupLogin({
      role: "Analyst",
      email: `analyst.${stamp}@qa.local`,
      extra: { specialization: "Biometrics" },
    })).token;
    adminToken = (await signupLogin({
      role: "Administrator",
      email: `admin.${stamp}@qa.local`,
    })).token;
  });

  after(() => {
    for (const item of results) writeUiEvidence(item);
    fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2), "utf8");
    appendLog(`\n[qa] results: ${jsonPath}\n`);
    if (server) server.kill();
  });

  it("TC1: Duplicate Record Detection (Known Bug)", async () => {
    const image = blob("fake image bytes", "image/png");
    const fields = {
      evidenceType: "biometric identity evidence",
      caseId: "FACE-DUP-001",
      description: "duplicate face upload",
    };
    const first = await uploadEvidence(investigatorToken, fields, { file: { content: image, name: "face.png" } });
    const second = await uploadEvidence(investigatorToken, fields, { file: { content: image, name: "face.png" } });
    const functionalPass = second.status >= 400;
    const item = record({
      id: "TC1",
      steps: "1. Login as Investigator. 2. Upload face image. 3. Upload same face image again.",
      input: "Same PNG face file uploaded twice with caseId FACE-DUP-001.",
      expectedResult: "System flags duplicate entry.",
      actualResult: `First upload HTTP ${first.status}; second upload HTTP ${second.status}. Duplicate was ${functionalPass ? "flagged/rejected" : "accepted"}.`,
      expectedOutcome: "Fail",
      status: functionalPass ? "Pass" : "Fail",
      evidence: `Backend log: ${logPath}`,
    });
    assert.equal(item.Status, item["Expected Outcome"]);
  });

  it("TC2: Duplicate Evidence Number (Known Bug)", async () => {
    const fields = {
      evidenceType: "wearable biometric evidence",
      caseId: "EVID-DUP-001",
      description: "duplicate evidence number",
      wearableTimestamp: "2026-04-27T19:30",
      heartRate: "72",
      bloodOxygen: "98",
      bodyTemperature: "36.7",
      respiratoryRate: "16",
      stepsCount: "4500",
      activity: "Walking",
    };
    const first = await uploadEvidence(investigatorToken, fields);
    const second = await uploadEvidence(investigatorToken, fields);
    const functionalPass = second.status >= 400;
    const item = record({
      id: "TC2",
      steps: "1. Login as Investigator. 2. Upload wearable evidence with evidence/case number. 3. Repeat with same evidence/case number.",
      input: "Two wearable submissions with caseId EVID-DUP-001.",
      expectedResult: "System rejects duplicate.",
      actualResult: `First upload HTTP ${first.status}; second upload HTTP ${second.status}. Duplicate number was ${functionalPass ? "rejected" : "accepted"}.`,
      expectedOutcome: "Fail",
      status: functionalPass ? "Pass" : "Fail",
      evidence: `Backend log: ${logPath}`,
    });
    assert.equal(item.Status, item["Expected Outcome"]);
  });

  it("TC3: Admin Limit Validation (Known Bug)", async () => {
    const statuses = [];
    const stamp = Date.now();
    for (let i = 1; i <= 4; i += 1) {
      const res = await api("/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `Admin Limit ${i}`,
          email: `admin.limit.${stamp}.${i}@qa.local`,
          password: "Password123!",
          role: "Administrator",
        }),
      });
      statuses.push(res.status);
    }
    const functionalPass = statuses[3] >= 400;
    const item = record({
      id: "TC3",
      steps: "1. Submit four Administrator signup requests. 2. Check whether the fourth is blocked.",
      input: "Four Administrator users.",
      expectedResult: "Restrict beyond 3 admins.",
      actualResult: `Signup HTTP statuses: ${statuses.join(", ")}. Fourth admin was ${functionalPass ? "restricted" : "created"}.`,
      expectedOutcome: "Fail",
      status: functionalPass ? "Pass" : "Fail",
      evidence: `Backend log: ${logPath}`,
    });
    assert.equal(item.Status, item["Expected Outcome"]);
  });

  it("TC4: File Type Validation", async () => {
    const csvFile = blob("UrlLength,NumDots,NoHttps,IpAddress,NumDash,NumSensitiveWords,PopUpWindow,PctExtHyperlinks\n20,1,0,0,0,0,0,0\n", "text/csv");
    const pngFile = blob("png", "image/png");
    const cyberBase = {
      evidenceType: "cybercrime evidence",
      caseId: "CYBER-FILE-001",
      description: "file type validation",
      inputMethod: "csv",
    };
    const cyberValid = await uploadEvidence(investigatorToken, cyberBase, { featuresCsv: { content: csvFile, name: "features.csv" } });
    const cyberInvalid = await uploadEvidence(investigatorToken, { ...cyberBase, caseId: "CYBER-FILE-002" }, { featuresCsv: { content: pngFile, name: "features.png" } });
    const bioBase = {
      evidenceType: "biometric identity evidence",
      caseId: "BIO-FILE-001",
      description: "file type validation",
    };
    const bioPng = await uploadEvidence(investigatorToken, bioBase, { file: { content: pngFile, name: "face.png" } });
    const bioJpeg = await uploadEvidence(investigatorToken, { ...bioBase, caseId: "BIO-FILE-002" }, { file: { content: blob("jpg", "image/jpeg"), name: "face.jpeg" } });
    const bioCsv = await uploadEvidence(investigatorToken, { ...bioBase, caseId: "BIO-FILE-003" }, { file: { content: csvFile, name: "face.csv" } });
    const functionalPass = cyberValid.status === 201 && cyberInvalid.status >= 400 && bioPng.status === 201 && bioJpeg.status === 201 && bioCsv.status >= 400;
    const item = record({
      id: "TC4",
      steps: "1. Upload cybercrime CSV. 2. Upload cybercrime PNG as CSV input. 3. Upload biometric PNG/JPEG. 4. Upload biometric CSV.",
      input: "Cybercrime: .csv valid, .png invalid. Fingerprint/biometric: .png/.jpeg valid, .csv invalid.",
      expectedResult: "Only valid file types accepted.",
      actualResult: `Cyber CSV ${cyberValid.status}; cyber PNG ${cyberInvalid.status}; biometric PNG ${bioPng.status}; biometric JPEG ${bioJpeg.status}; biometric CSV ${bioCsv.status}.`,
      expectedOutcome: "Pass",
      status: functionalPass ? "Pass" : "Fail",
      evidence: `Backend log: ${logPath}`,
    });
    assert.equal(item.Status, item["Expected Outcome"]);
  });

  it("TC5: Empty Field Validation", async () => {
    const res = await uploadEvidence(investigatorToken, {
      evidenceType: "wearable biometric evidence",
      caseId: "EMPTY-001",
      description: "empty wearable fields",
    });
    const functionalPass = res.status >= 400;
    const item = record({
      id: "TC5",
      steps: "1. Login as Investigator. 2. Submit wearable evidence with required wearable fields blank.",
      input: "Wearable form with caseId only and no biometric readings.",
      expectedResult: "Submission blocked.",
      actualResult: `Upload returned HTTP ${res.status} with response ${JSON.stringify(res.body)}.`,
      expectedOutcome: "Pass",
      status: functionalPass ? "Pass" : "Fail",
      evidence: `Backend log: ${logPath}`,
    });
    assert.equal(item.Status, item["Expected Outcome"]);
  });

  it("TC6: Numeric Field Validation", async () => {
    const res = await uploadEvidence(investigatorToken, {
      evidenceType: "wearable biometric evidence",
      caseId: "NUMERIC-001",
      description: "non numeric wearable fields",
      wearableTimestamp: "2026-04-27T19:30",
      heartRate: "abc",
      bloodOxygen: "xyz",
      bodyTemperature: "hot",
      respiratoryRate: "fast",
      stepsCount: "many",
      activity: "Walking",
    });
    const functionalPass = res.status >= 400;
    const item = record({
      id: "TC6",
      steps: "1. Login as Investigator. 2. Submit non-numeric strings in wearable numeric fields.",
      input: "heartRate=abc, bloodOxygen=xyz, bodyTemperature=hot, respiratoryRate=fast, stepsCount=many.",
      expectedResult: "Rejected.",
      actualResult: `Upload returned HTTP ${res.status} with response ${JSON.stringify(res.body)}.`,
      expectedOutcome: "Pass",
      status: functionalPass ? "Pass" : "Fail",
      evidence: `Backend log: ${logPath}`,
    });
    assert.equal(item.Status, item["Expected Outcome"]);
  });

  it("TC7: Role-Based Access Control", async () => {
    const res = await uploadEvidence(analystToken, {
      evidenceType: "wearable biometric evidence",
      caseId: "RBAC-001",
      description: "analyst should not upload",
      wearableTimestamp: "2026-04-27T19:30",
      heartRate: "72",
      bloodOxygen: "98",
      bodyTemperature: "36.7",
      respiratoryRate: "16",
      stepsCount: "4500",
      activity: "Walking",
    });
    const functionalPass = res.status === 403;
    const item = record({
      id: "TC7",
      steps: "1. Login as Analyst. 2. Attempt to submit investigator-only evidence upload.",
      input: "Analyst token calling POST /api/evidence/upload.",
      expectedResult: "Access denied.",
      actualResult: `Upload returned HTTP ${res.status} with response ${JSON.stringify(res.body)}.`,
      expectedOutcome: "Pass",
      status: functionalPass ? "Pass" : "Fail",
      evidence: `Backend log: ${logPath}`,
    });
    assert.equal(item.Status, item["Expected Outcome"]);
  });

  it("TC8: Deterministic Output Check", async () => {
    const body = { datasetPath: "frontend/public/datasets/forensic-biometric-wearable-dataset.csv" };
    const calls = [];
    for (let i = 0; i < 3; i += 1) {
      calls.push(await api("/ml/wearable/status", {
        method: "GET",
        headers: authHeaders(adminToken),
      }));
    }
    const normalized = calls.map((r) => JSON.stringify(r.body));
    const functionalPass = calls.every((r) => r.status === 200) && normalized.every((v) => v === normalized[0]);
    const item = record({
      id: "TC8",
      steps: "1. Login as Administrator. 2. Request same ML status endpoint three times. 3. Compare response bodies.",
      input: JSON.stringify(body),
      expectedResult: "Same output every time.",
      actualResult: `HTTP statuses ${calls.map((r) => r.status).join(", ")}; response bodies were ${functionalPass ? "identical" : "different"}.`,
      expectedOutcome: "Pass",
      status: functionalPass ? "Pass" : "Fail",
      evidence: `Backend log: ${logPath}`,
    });
    assert.equal(item.Status, item["Expected Outcome"]);
  });
});
