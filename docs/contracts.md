# Input and analysis contracts

The authoritative rules are [validation.mjs](../src/validation.mjs) and [analysis.mjs](../src/analysis.mjs). [Five JSON examples](../examples/inputs) demonstrate the exact format. Unknown top-level fields are rejected to catch mapping mistakes.

## Canonical alert

| Field | Rule |
|---|---|
| `schema_version`, `source` | `1`, `splunk` |
| `alert_id` | Stable source-scoped ID, 1–128 safe identifier characters |
| `event_type` | `failed_logins`, `account_change`, `file_hash`, `powershell`, `network_scan` |
| `observed_at` | Valid ISO timestamp with timezone; preserved as supplied |
| `host` | Required host identifier |
| `subject`, `initiating_user` | Required for account changes, distinct roles; other scenarios optional |
| `source_ip` | IPv4 where relevant; IPv6 is currently rejected |
| `sha256` | 64 hexadecimal characters, required for file-hash scenario |
| `source_link` | HTTPS investigation link, no embedded credentials; not fetched |
| `evidence` | 1–30 entries with unique `ref`, positive `event_id`, `record_id`, bounded `summary` |
| `details` | Object, serialized size at most 4,000 characters; scenario context and aggregate counts |
| `synthetic` | Optional boolean; all supplied examples set it to true |

Failed-login input requires `details.count >= 3`. Scan input requires `details.unique_ports >= 3` or `details.drops >= 5`. The detector must define the observation window; the worker checks reported counts, not the truth of the underlying aggregation. Event IDs are checked against the scenario. IPv4 filtering excludes private, loopback, shared, link-local, documentation, multicast and reserved ranges before reputation requests.

## Advisory response

The model must return exactly `alert_id`, `host`, `subject`, `initiating_user`, `severity`, `summary`, `evidence_quotes`, `recommended_checks`. Identities must equal the canonical input (or null if absent). Every quote must occur exactly within the referenced evidence summary. Severity is low, medium, high or critical; checks come from the six-item allowlist in source.

The policy floor is High for built-in Administrators membership, encoded PowerShell, an abuse score of at least 75, or at least five malicious hash detections. Other accepted scenarios have a Medium floor. These are explicit lab prioritization rules, not proof of compromise. A model can suggest a higher priority but cannot lower the policy floor.

Schema, identity, quote and prohibited-outcome checks do not verify all natural-language semantics. A plausible but unsupported sentence can still require human correction. The model has no execution tools and no permission to make response decisions.

## Delivery and receipts

`prepared` means a package exists, not that IRIS or Slack received it. `delivered` means configured adapter receipts passed validation. `needs_review` means processing failed or requires intervention; it must not be treated as success. Duplicates return earlier records without replaying writes.

IRIS payloads retain timestamps, identities, evidence, enrichment and analysis inside context and notes. Structured IOC and asset arrays are empty in this version. The code does not claim typed IOC import. Worker responses expose a minimal receipt; the protected state file contains the full package. GET lookups have bounded retries; POST writes are attempted once. An interrupted write is reconciled by an operator before recovery.
