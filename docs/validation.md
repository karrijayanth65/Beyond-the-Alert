# Validation record

**Implementation verification by Jayanth.** Recorded checks cover processing logic, local authenticated HTTP behavior, five reproducible synthetic examples and the generated workflow structure. The [machine-readable summary](../reports/validation-summary.json) and [TAP results](../reports/tests.tap) record the run date, source hashes and 94 passing behavioral checks.

## Reproduce

```sh
node scripts/build.mjs
node scripts/demo.mjs
node --test tests/core.test.mjs
node scripts/check.mjs
```

The last command checks syntax, generated-file drift, example reproduction, local Markdown targets and filename case, prohibited legacy identities, and common secret patterns. It is a bounded repository check, not a guarantee that secrets cannot exist. The test suite uses deterministic adapters and synthetic evidence. Its local HTTP tests start a real loopback worker with substituted external services.

| Area | Behavior checked |
|---|---|
| Input | Five scenarios, required fields, clocks, event IDs, thresholds, invalid addresses and hashes |
| Interpretation | Exact schema, identity conflicts, quotations, restricted checks and unsupported outcomes |
| Research | Non-public IP skip, source-bound indicators, provider response shape |
| Delivery | Duplicate suppression, identity conflict, partial write retention and notification failure |
| Transport | Timeout, response bound, redirect rejection, bounded GET retry and no POST retry |
| Worker | Missing/wrong authentication, receipt minimization and malformed JSON |
| Workflow | Inactive export, connected routes and execution of generated validation code |
| Reproduction | Five deterministic generated investigation packages |

## Service deployment and verification procedure

To reproduce the service path in a lab, import the export into a pinned n8n instance, run the SPL against the deployed index, and exercise the configured reputation, model, IRIS and Slack contracts. The recorded behavioral suite uses provider substitutes. Document service versions, trusted TLS, quotas, case creation and end-to-end timing alongside each deployed run.

For an integration run, capture a source event, mapped request, n8n execution ID, worker stages, provider receipts, IRIS alert/case IDs and Slack timestamp under a single run ID. Keep secrets out of captured records. Record failures as well as successes. Do not reuse historical benchmark rows or conceptual video frames as evidence for that run.

The reported count measures behavioral checks. A future performance study should define detection ground truth, comparable cases, timing boundaries and analyst-review scoring before reporting accuracy or time savings.
