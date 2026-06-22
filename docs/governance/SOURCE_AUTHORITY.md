# Source Authority

Source authority lives in `contracts/agent-governance/source-authority.json`.

## Authority Classes

| Class | Role |
| --- | --- |
| canonical | Binding contracts, operating rules, and accepted architecture. |
| learned | Reviewed operational guidance derived from evidence. Deferred to Phase 3. |
| supporting | Audit notes, evidence packets, and review material. |
| reference | Imported, legacy, or comparative material. |
| generated | Generated views or context packs. |
| transient | Runtime state or local run artifacts. |

Precedence is:

```text
canonical > learned > supporting > reference > generated > transient
```

Reference, generated, transient, and learned material cannot override canonical contracts. Promotion into canonical truth requires a contract, decision, or audit update.
