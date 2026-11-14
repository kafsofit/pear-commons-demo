# Prototype retention matrix

**Scope:** the local pear walkthrough only. It is not a production retention policy.

| Material | Default location | Retention | Access/sharing | Deletion and limits |
|---|---|---|---|---|
| Fictional scenario and navigation prompts | Embedded in local JavaScript | Part of the concept files | Anyone receiving the local files; no transmission by the app | Change/remove project files; no user-specific content should be present |
| Current typed reflection | Browser memory | Until page/session closes or is reset; no intentional durable write | Current browser document | End session/reset; browser crash/session-restore behaviour is outside the app's complete control |
| Explicitly saved reflection | One namespaced localStorage entry in the current browser profile/origin | Until worker deletes it or browser/profile data is cleared | Anyone or anything with access to that browser profile/storage; no app sharing feature | Delete button removes this key and working state; does not prove physical erasure or erase external/synced copies |
| Export preview | Browser memory | Until dialog/session closes | Visible to the current worker before download | Closing/reset clears the working view; not a durable app copy |
| Downloaded JSON export | Worker/browser-selected download destination | Controlled by filesystem/user, not the app | Anyone with file/access/backup/recipient access | App cannot delete it; export warning must remain explicit |
| Resource review records | Authored markdown/embedded review metadata | Deliberate project documentation | Subject to future repository/governance decision | Correction/withdrawal process must address distributed copies honestly |
| Telemetry, prompts to a model, cloud backups, user accounts, employer records, commons posts | **None implemented** | **None by this prototype** | **No prototype dataflow** | External browser/OS/extension behaviour is not controlled by the app |

## Non-negotiables

- Saving and exporting are separate, explicit actions. Continue without saving is available.
- No automatic contribution from reflection to commons.
- No durable conversational or model memory exists.
- No local-storage encryption or “fully private” claim.
- The prototype does not need or request service-user data.

## Before any real deployment

Define jurisdiction/role-specific retention, access and legal process; encrypted storage and key custody; backups and deletion evidence; export/handoff governance; shared-device behaviour; authentication; operator powers; update/security maintenance; correction and service-user rights; and stop conditions. These are open design and governance requirements, not features supplied by this skeleton.
