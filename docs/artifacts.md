# Lab Artifact Guide

This guide maps the main README figures to the supplied `Final Copy of Artifacts` collection and its `Bible for Artifacts and info.MD`. All 14 main PNGs are preserved byte for byte. The full source collection remains unchanged outside this repository.

**Reading sequence:** architecture 07 → topology 13 → lab inventory 04 and network 05 → telemetry 09 → detection 08 and 12 → automation 01 → case 03 → notification 02 → queue 10 → lifecycle 06. Rule inventory 11 and reported comparison 14 qualify coverage and evaluation.

**Provenance:** The supplied collection includes prior display-name and event-date adjustments, as recorded in its source manifest. Existing image footers and technical labels are retained. The release does not treat these screenshots as newly captured evidence, attribute their service actions to the maintained worker, or assert that the images form a correlated execution trace. Names inside source images remain source fields; Beyond the Alert is the project name and Jayanth is the author.

| ID | Source artifact | Interpretation |
|---|---|---|
| 01 | [n8n workflow for alert enrichment, case creation, and analyst notification](../assets/lab/01-n8n-workflow.png) | Workflow configuration; supplied export inactive with pinned examples. |
| 02 | [Slack critical alert for admin account creation with response guidance](../assets/lab/02-slack-notification.png) | Analyst guidance and investigation links; actions are recommendations. |
| 03 | [DFIR-IRIS case 55 documenting admin-account escalation](../assets/lab/03-iris-account-case.png) | Visible open case and priority; no completed containment evidence. |
| 04 | [VMware lab virtual-machine inventory](../assets/lab/04-lab-machines.png) | VM roles; small terminal previews explicitly unreadable. |
| 05 | [VMware VMnet8 NAT network configuration](../assets/lab/05-nat-network.png) | NAT subnet configuration; not proof of full isolation. |
| 06 | [Diagram of the incident-response lifecycle from alert to closure](../assets/lab/06-incident-lifecycle.png) | Intended response lifecycle; not executed containment. |
| 07 | [Diagram of SOC automation architecture and data flow](../assets/lab/07-pipeline-architecture.png) | Conceptual pipeline with two model stages; differs from the maintained worker sequence. |
| 08 | [Splunk failed-logon aggregation for brute-force detection](../assets/lab/08-failed-login-detection.png) | Matched failed-login activity; scheduling is separate. |
| 09 | [Windows Sysmon process-creation telemetry with file hashes](../assets/lab/09-sysmon-telemetry.png) | Process events and displayed hash fields; full hash may be clipped. |
| 10 | [DFIR-IRIS queue of open brute-force and file-hash investigations](../assets/lab/10-iris-case-queue.png) | Open investigation queue; not resolved-incident counts. |
| 11 | [Splunk inventory of five lab detection rules, all displayed as disabled](../assets/lab/11-detection-rule-status.png) | Five saved rules visibly Disabled. |
| 12 | [Splunk detection of account creation and local administrator-group changes](../assets/lab/12-account-change-detection.png) | Account/group event context; intent requires investigation. |
| 13 | [Diagram of lab machine addresses and service communication](../assets/lab/13-network-topology.png) | Documented service addresses and API paths; not current connectivity verification. |
| 14 | [Radar chart comparing reported manual and AI-assisted lab performance](../assets/lab/14-reported-comparison.png) | Reported comparison chart; numerical means are recalculated separately. |

## Relationship to the maintained implementation

The supplied canvas and diagrams describe the lab design. The maintained code instead uses n8n for authenticated routing to a protected worker, performs relevant enrichment before one checked advisory response, and retains explicit preparation/delivery states. See [architecture](architecture.md), [contracts](contracts.md), and [validation](validation.md).

The maintained export and historical lab artifacts have distinct source records. [Evaluation](evaluation/README.md) explains the reported historical results; the current implementation has its own synthetic examples and validation record.

The three standalone terminal previews are not reproduced because their text is unreadable; the main inventory screenshot retains their visible limitation. The source Bible, full original collection and its review records remain preserved locally. [Byte-integrity manifest](../assets/lab/provenance.json) records each published source path and SHA-256.

The repository MIT license applies to the newly maintained code and original documentation. Supplied collection assets retain their source provenance; including them does not establish a transfer of authorship.
