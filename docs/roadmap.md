# Engineering improvement backlog

These engineering items remain open. Each item identifies the current boundary and the acceptance evidence needed to close it.

| Priority | Work item | Current boundary | Acceptance evidence |
|---|---|---|---|
| High | Canonical Splunk adapter | Stock webhook envelope is not directly accepted. | Map real source fields/IDs to the contract; test missing/conflicting identities and preserve the original input. |
| High | Service-connected validation | n8n import and actual provider/model/IRIS/Slack calls are not verified. | Pinned service versions and one correlated run ID, source events, n8n execution, worker stages, provider receipts, IRIS IDs and Slack timestamp, plus one failure. |
| High | Canonical duplicate fingerprint | JSON insertion order affects the current fingerprint. | Identical semantic objects with reordered keys deduplicate; meaningful content changes remain visible conflicts. |
| High | Authorized prepare-to-send promotion | An existing prepared alert is returned as a duplicate; there is no explicit promotion transition. | Audited promotion/reconciliation without deleting state or blindly repeating downstream writes. |
| High | Crash/partial-write recovery | Local file state and attempted-stage records require operator reconciliation. | Kill/restart and ambiguous-write tests, retained remote IDs, recovery runbook, backup/restore and stale-state handling. |
| High | Semantic assessment validation | Valid schema and a matching quote do not entail the summary; wording guard can reject observed blocking. | Paired unsupported-claim/legitimate-observation tests, explicit uncertainty and source-linked claims, retained analyst responsibility. |
| High | Detection tuning | SPL and aggregate thresholds are lab starting points. | Representative benign/adversarial lab telemetry, correct mappings/windows, false-positive notes and reproducible queries. |
| Medium | Privacy and deployed controls | Proxy TLS, access, retention, provider disclosure and secrets remain configuration. | Reviewed deployment profile, least-privilege credentials, rotation/retention policy and restricted n8n history/state. |
| Medium | Rate limits and latency | Bounded requests do not establish capacity or full quota handling. | Retry-After/429 tests, queue/latency budget, outage behavior and service-health monitoring. |
| Medium | Structured IOC/asset mapping | IRIS IOC/asset arrays are empty; context is retained in notes. | Deployed-schema mapping, validation and case-field verification. |
| Medium | IPv6 support | Current contract accepts IPv4 only. | Explicit IPv6 normalization, special-range policy and adapter coverage. |
| Medium | New matched evaluation | Historical groups differ in scenario coverage and are not a maintained-worker benchmark. | Matched scenarios, explicit start/stop boundaries, independent scoring, repeated runs and raw receipts. |
