# Troubleshooting

| Symptom | Check | Safe next step |
|---|---|---|
| Worker 401 | Distinct worker Header Auth credential and `x-jayanth-token` | Correct the secret through the secret manager; do not paste it into logs |
| Invalid alert 400 | Canonical mapping, timezone, fields, event IDs and thresholds | Compare with the synthetic contract examples |
| Worker unavailable | HTTPS URL, certificate trust, proxy routing and process health | Restore the service; keep the alert visible for analyst review |
| `needs_review` after enrichment | Provider identity, response format, key and quota | Inspect protected state; resolve the dependency before controlled recovery |
| Model validation fails | Identities, source quotes, truncation and supported contract | Review source evidence; do not relax checks to force success |
| IRIS add succeeds but escalation fails | Stored alert ID and deployed API response | Inspect the existing alert and reconcile before retrying |
| Case exists but Slack fails | Stored case ID, bot membership, scope and channel | Notify the analyst through the approved fallback; avoid duplicate cases |
| Duplicate returns old result | Stable alert identity and persisted state | Expected behavior; do not delete state to replay uncertain writes |

The state directory is deliberately persistent. An interrupted run can remain `processing`; no background recovery is implemented. Inspect its last attempted stage and reconcile downstream systems before creating a reviewed recovery procedure. Never bulk-remove `.state` as a troubleshooting shortcut.

Loopback HTTP tests and temporary-file replacement require ordinary local networking and filesystem permissions. A restricted execution sandbox may prevent them; rerun the same checks in an authorized local test environment rather than reporting them as passed.
