# Setup and controlled integration

## Reproduce without credentials

Install Node.js 24, clone this repository, and run from its root:

```sh
node scripts/build.mjs
node scripts/demo.mjs
node --test tests/core.test.mjs
node scripts/check.mjs
```

No package installation is required. The five examples are explicitly synthetic and use deterministic adapter substitutes. Generated HTML views can be opened directly in a browser. Compare the JSON, not just the screenshots.

## Configure the worker

1. Copy `.env.example` to `.env`. Generate a random token of at least 32 characters for `JAYANTH_WORKER_TOKEN` using an approved secret manager. Never paste production secrets into issues or commit them.
2. Set the model API key and model name. The adapter targets the OpenAI Chat Completions endpoint; confirm the selected model supports this request contract and account access. The model may incur usage charges.
3. Set approved AbuseIPDB and VirusTotal keys for scenarios that need them. Hash lookups may disclose indicators to a third party; obtain permission before sending confidential hashes. Do not substitute a public address for a private address to simulate a successful lookup.
4. Set an HTTPS `IRIS_ORIGIN` with no path, query or embedded credentials, its API key, and the correct positive `IRIS_CUSTOMER_ID`. Map the severity IDs to your deployed IRIS configuration before enabling writes.
5. Set a Slack bot token with `chat:write`, invite it to the approved channel, and set the channel ID. Restrict channel membership to authorized analysts.
6. Keep `JAYANTH_DELIVERY=prepare`. Start with `node --env-file=.env src/server.mjs`. The listener is `127.0.0.1:8080` unless `PORT` is changed. Protect `.state` with OS access controls, backups and a retention policy; it stores evidence and analysis.
7. Place a trusted HTTPS proxy in front of the worker. Use a certificate trusted by n8n and restrict ingress to approved automation hosts. Do not disable certificate validation.

## Configure n8n

Import `workflows/jayanth.json` into a test n8n instance. The export is inactive, has no credentials and has not been service import-tested. Check compatibility with the node versions in the JSON.

- On **Alert intake**, create a Header Auth credential with a distinct intake header and random secret. Configure the Splunk-side adapter to send that header.
- On **Process investigation**, replace `https://worker.example.invalid/v1/triage` with the trusted worker URL. Create an HTTP Header Auth credential named for the worker, using header `x-jayanth-token` and the worker token.
- Test invalid input, unauthorized input, a canonical synthetic input, worker unavailability and a duplicate. Confirm the success and failure branches return receipts, then enable only after review.
- Restrict execution-history access. Set retention for error data according to the lab policy. Do not import untrusted workflow JSON into a privileged environment.

## Configure Splunk and validate services

Review [SPL examples](../detections/README.md), update indexes and field mappings, and verify event collection. Configure a supported custom alert action or controlled adapter to emit the canonical JSON. Build evidence references from actual event IDs and record IDs. Do not hardcode the synthetic identities in real alerts.

Before send mode, verify provider responses and rate limits, a prepared real-lab package, IRIS add/escalate receipts, and Slack delivery in a restricted test channel. Record UTC timestamps, run ID, redacted request/response IDs and screenshots from the actual execution. Review unexpected findings with an analyst. Change delivery to `send` only after these checks and explicit lab authorization; containment is not implemented.
