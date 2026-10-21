# Security

Beyond the Alert supports authorized lab investigation and controlled integration. Obtain authorization before submitting confidential telemetry. Provider requests disclose selected indicators and analysis context to the configured services; review data policy, retention and account settings before use.

Use Node.js 24 with security updates. Store secrets in a secret manager or untracked `.env`; configure n8n credentials outside exported JSON. Use distinct intake and worker tokens, trusted TLS, restricted proxy ingress, least-privilege IRIS and Slack access, and protected state storage. Rotate credentials after suspected exposure.

Input validation is not a substitute for SIEM data quality. Model output is advisory. Exact quotes and identity checks do not establish all semantic correctness, detect every prompt injection, or authorize response. No containment tool is available.

The state store supports one worker host and has no automatic partial-write recovery. Review stale or uncertain records with downstream systems before replay. Set retention and backups for state and n8n error history. Do not put evidence or credentials in public issues.

For a suspected vulnerability, use the repository's private vulnerability reporting facility if enabled, or contact the repository owner privately through an existing trusted channel. Submit a minimal synthetic reproduction without credentials or sensitive evidence. No response-time commitment is implied.
