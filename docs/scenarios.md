# Scenario coverage and ATT&CK interpretation

This guide distinguishes supplied lab scenarios from the maintained detector examples and input contract. Technique labels are investigation context, not a finding of malicious intent. All maintained example packages are synthetic.

| Scenario | Candidate behavior | Maintained evidence contract | Investigation required |
|---|---|---|---|
| Failed logins | [T1110 Brute Force](https://attack.mitre.org/techniques/T1110/) | 4625; source IPv4; reported count at least 3 | Rule out stale credentials/user error; examine window, account distribution, source, successful logons and asset context. |
| File/hash | [T1204.002 Malicious File](https://attack.mitre.org/techniques/T1204/002/) only when user execution is established | Sysmon 1 and a valid SHA-256 | A hash or process event alone does not establish a particular execution technique. Check parent, command, signer, file origin, user action and reputation. |
| Scanning candidate | [T1046 Network Service Discovery](https://attack.mitre.org/techniques/T1046/) | 5157; source IPv4; at least 3 distinct ports or 5 drops | Check authorized scanners, time window, destination scope and related telemetry. A blocked event is not proof of successful access. |
| Account/group change | [T1136.001 Local Account](https://attack.mitre.org/techniques/T1136/001/) and [T1098.007 Additional Local or Domain Groups](https://attack.mitre.org/techniques/T1098/007/) when context supports them | 4720/4732; subject and initiating identity | Separate actor/subject and creation/group addition. Verify approval, SID, host/time, initiating logon and subsequent activity. Creation alone does not establish Valid Accounts use. |
| PowerShell | [T1059.001 PowerShell](https://attack.mitre.org/techniques/T1059/001/) | Sysmon 1 or Windows 4688 | Review command, parent, identity, script content and related network/file activity. Encoded syntax alone is not proof of compromise. |

[Input contract](contracts.md) is authoritative for the worker. [SPL examples](../detections/README.md) are starting points; collection policy, field extraction, scheduling and tuning remain deployment work. The worker checks reported aggregate values, not the underlying search's correctness.

## Supplied comparison coverage

Manual has five rows, LLM-only has three, and Integrated has seven. LLM-only covers brute force, hash and scanning in the supplied CSV; it has no reported account-change or PowerShell rows. Integrated includes two failed-login rows, two file-hash rows and one row for each remaining scenario. Do not imply all three configurations ran every scenario equally.

The source notes describe substituted public indicators for reputation testing. These are supplied test inputs, not evidence of malicious public-IP traffic originating inside the private subnet. The maintained worker instead skips reputation lookups for non-public IPv4 addresses.

## Measures and interpretation

Action/context quality are supplied 1-5 ratings. They are not risk, CVSS or accuracy scores. Per-scenario times and action ratings in the README are descriptive means over the supplied Integrated rows. The source CSV and its dashboard-attributed total-time explanations are unchanged. [Evaluation details](evaluation/README.md).
