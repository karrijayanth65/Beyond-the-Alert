# Detection examples

Five SPL detection templates cover authentication failures, account changes, file hashes, PowerShell and scanning candidates. Deployment requires index/field mapping and baseline validation. Replace `index=windows`, confirm telemetry collection and begin with a five-minute window/schedule. Evaluate overlap and use a stable alert identity per detection window so duplicate handling preserves the intended event grouping.

| Search | Input evidence | Mapping |
|---|---|---|
| [Failed logins](failed-logins.spl) | Security 4625 grouped by host, account and IP | `failed_logins`, `details.count`, subject, source_ip |
| [Account changes](account-changes.spl) | Security 4720/4732 | `account_change`, subject, initiating_user, group SID |
| [File hashes](file-hash.spl) | Sysmon 1 with SHA256 | `file_hash`, sha256, process context |
| [PowerShell](powershell.spl) | Sysmon 1 or Security 4688 | `powershell`, encoded flag and command context |
| [Scan candidates](network-scan.spl) | Security 5157 | `network_scan`, unique_ports/drops, source_ip |

The account-change search returns individual events; correlate the changed account SID with membership events because a group-membership record may identify a member by SID rather than name. Do not treat a group name as the target account. Forwarding rules must collect the required audit categories; 4688 command lines need the relevant audit policy. A 5157 event represents a blocked connection and does not prove a completed scan or successful access.

## Canonical mapping requirements

The searches return investigation fields; they do not themselves construct the complete webhook JSON. A controlled alert adapter must add schema_version=1, source=splunk, a stable alert_id, event_type, source timestamp with timezone, host and HTTPS source_link. Map each selected result into `evidence` with actual event and record IDs plus a bounded summary. Include details and scenario-specific fields. Preserve original UTC/timezone semantics. Use [the input examples](../examples/inputs) and [contract](../docs/contracts.md) to test the adapter.

The stock Splunk webhook body differs from this contract. Do not point it at n8n without the mapping step. Thresholds only select investigation candidates; validate baselines, allowlists, account ownership and business context before changing severity or responding.
