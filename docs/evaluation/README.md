# Supplied evaluation records

The [15-row CSV](reported-runs.csv) is copied byte for byte from the supplied artifact collection. The [recalculated means](recalculated-means.json) use the recorded triage_time_s, action_quality_5, context_quality_5 and analyst_steps fields grouped by pipeline_label.

Manual has five rows, AI No Tools has three and AI Full has seven. Groups have different scenario mixes; their means are unweighted descriptive summaries, not a controlled comparison. Quality scores are reported five-point ratings and must not be relabeled as detection accuracy. The supplied radar chart uses comparison dimensions and remains a reported visual, not a direct numerical plot of these means.

The source Bible and retained dashboard describe total-time explanations for runs 1, 3, 6 and 7 that include detection and pipeline processing. This repository retains the original timestamp and triage_time_s fields and uses the latter for its reported mean. No source rows are rewritten.

These records are not new measurements of the maintained worker. They establish neither its performance nor successful service-connected execution. A future evaluation requires defined boundaries, comparable scenarios, run IDs and review criteria. [Artifact guide](../artifacts.md) and [evidence policy](../evidence-policy.md).
