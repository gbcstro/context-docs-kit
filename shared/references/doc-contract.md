# The Doc Contract

<!-- context-docs-kit:shared — canonical copy lives in shared/references/. Edit there, then `npm run sync`. -->

Every doc in `context/` carries the same header and the same closing sections.
No exceptions, in any of the three skills.

```markdown
# <Project> — <Doc Title>

**Project version:** v1
**Revision:** 1
**Last updated:** 2026-03-14          <- the real current date, never invented
**Depends on:** [PRODUCT.md](./PRODUCT.md), [ARCHITECTURE.md](./ARCHITECTURE.md)

## 1. Overview
...
## N. Out of Scope for <current version>
## N+1. Open Questions
## N+2. Next Steps
```

## The two version axes

These are different things and they are easy to confuse, which is why they are
named differently.

| Field | Means | Moves when | Moved by |
|---|---|---|---|
| `**Project version:**` | which version of the *product* this doc describes | a version is closed and the next opens | `versioning-context-docs`, only |
| `**Revision:**` | how many times *this doc* has been substantively edited | any decision in it changes | whoever makes the change |

**The letter `v` is reserved for the project version.** `v1`, `PROGRESS_v1.md`,
`CHANGELOG_v1.md` all refer to the same thing. A doc's revision is a bare
integer — `Revision: 3`, never `v3` — so that a number in `context/` is never
ambiguous.

A revision bump **requires** an entry in `context/PROGRESS/CHANGELOG_v<current>.md`.
A revision that is not logged is drift with a timestamp on it. Typo fixes and
formatting passes are not revisions and are not logged.

## The other header fields

- **`Depends on:`** encodes the chain. Decisions flow downhill, and docs are written in that order. `PRODUCT.md` depends on nothing.
- **`Last updated:`** is the real current date. If you do not know today's date, find it — never invent one.

## The closing sections

- **`## Open Questions`** is the escape hatch that makes an honest doc possible. Never omit it, even when empty — write "none currently open".
- **`## Next Steps`** names the next doc to write, so the set is resumable by a future session with no memory of this one.
- **`## Out of Scope for <version>`** is titled with the current project version, not a hardcoded "v1".

## Present tense, always

A doc describes what is decided **now** — never how it got there. No
"previously", no "used to be", no "as of v2 we switched". After an edit the doc
reads as if the new decision had always been the decision, and a reader opening
it cold cannot tell it was ever revised.

The reasons go in `context/PROGRESS/CHANGELOG_v<current>.md`. That is not a
weaker place to put them — it is the *only* place they are findable when someone
asks "why is it like this", because a doc that argues with its own history buries
the one fact a reader needs under the account of how it got there.

Two things are status, not narration, and stay in the doc:

- `## Open Questions` — recording that something is undecided.
- The header fields — metadata.

Full rules, including the banned-phrase check, in `references/history-discipline.md`.

## Migrating a legacy header

Docs written before this contract carry `**Status:** Draft vN` instead of the two
version fields. When you open one:

1. Say what you found and what you are changing it to, in one line.
2. `**Project version:**` becomes the current project version — `v1` if there is no `context/PROGRESS/` yet.
3. `**Revision:**` becomes the old `N` from `Draft vN`.
4. Do not touch the body. A header migration is not a revision and is not logged.
