# CV contact address

The generated CV has to give recruiters a way to reach you, but it is a freely downloadable
document. So it prints neither a phone number nor the real inbox. It prints a random
forwarding alias on the site's own domain, such as `alexander.k7q2mx@<domain>`. Mail sent to
the alias is filtered and relayed to the real inbox, and the alias can be retired or revoked
at any time without touching anything else.

## How it works

```
recruiter → alexander.k7q2mx@<domain>
  └─ MX (apex) → SES inbound, receipt rule "contact-forward" (spam + virus scanning on)
       ├─ stores the raw message in the private mail bucket (expires after 7 days)
       └─ invokes λ forwardMail
            ├─ drop: virus, spam, DMARC fail with p=reject, or SPF and DKIM both failing
            ├─ drop: recipient isn't an active or retired alias (revoked, unknown, typo)
            └─ SendRawEmail → real inbox
                 From:     "Zoë Recruiter via CV" <noreply@<domain>>
                 Reply-To: zoe@recruiter.example   ← so Reply answers the sender directly
                 (body and every other header byte-for-byte as received)
```

Drops are silent. A bounce to a forged sender is backscatter, and it would confirm the
address is live to whoever is probing it.

### Where the alias comes from

Nothing about the alias lives in the repository or in the site data. `downloadResume` reads
the live alias from the `crc-mail-alias` table on each CV download and prints it in the CV
header. If there isn't one, it mints a new one (your first name plus six random characters,
skipping lookalikes such as `l`/`1` and `o`/`0`, since the address may be retyped from
paper). Because the address is part of the CV model, a new alias changes the content digest,
and the CV is re-rendered on that same click.

Each alias has one of three states:

| Status | On the CV | Mail forwarded |
| --- | --- | --- |
| `active` | yes, the one live alias | yes |
| `retired` | no | yes, so CVs already sent keep working |
| `revoked` | no | no, dropped silently |

## Managing it

Run the **CV contact address** workflow (Actions → CV contact address → Run workflow):

- **status**: every alias, its state, and how much mail it has forwarded and dropped.
  A climbing `Dropped` count, or forwarded mail you don't recognise, is the sign an address
  has leaked into spam lists.
- **rotate**: retire the live alias. The next CV download prints a fresh one; the old one
  keeps forwarding. Use it for routine freshness.
- **revoke**: stop an alias outright. Leave *address* empty to revoke the live alias (the
  next download prints a replacement), or name an older retired alias that has started
  attracting spam.

The workflow uses the same `AWS_TF_OIDC_ROLE` secret and `AWS_TF_*` variables as the
pipeline, so it needs no extra setup.

To turn the address off on the CV entirely, set `"contactEmail": false` in `cv_data.json`.
Forwarding for aliases already issued keeps working.

## What it does not protect against

- **The address is still public.** Anyone with the CV can write to it. The protection is
  that it is disposable: revoking it costs nothing and exposes nothing.
- **Replying reveals the real inbox.** A reply goes out from your real mail client, so the
  recipient sees your real address. That is a deliberate choice for a CV, where you will
  usually want an ongoing conversation. Sending *as* the alias would need SMTP credentials
  configured in your mail client and is not set up here.
- **Spam scoring is SES's.** Messages SES scores as borderline still get through. Revoking
  is the backstop.

## Prerequisites and caveats

- **Receiving region.** SES only receives mail in some regions. `us-east-1`, where this is
  deployed, is one of them.
- **One active receipt rule set per account.** Applying this activates `CloudResume-Inbound`.
  If the AWS account already had a different active rule set, it is replaced.
- **The apex MX now points at SES.** Every address `@<domain>` lands at the forwarder,
  and anything that isn't a live alias is dropped. If you ever want a real mailbox on the
  domain (Google Workspace, say), this needs to move to a subdomain first.
- **SES sandbox.** If the account is still in the sandbox, SES only sends to verified
  addresses. The destination is already a verified identity (the contact form uses it), so
  forwarding works either way.
- **The real inbox comes from a secret.** The forwarding destination (also the contact
  form's) is the `CONTACT_DESTINATION_EMAIL` repository secret, passed to Terraform as the
  sensitive variable `contact_destination_email`. It isn't in the code, it's masked in logs,
  and it's redacted from the plans the pipeline publishes. That includes the IAM policies
  naming its SES identity, since that ARN embeds the address; review changes to those two
  policies with a local plan. A missing or malformed secret fails the plan rather than
  replacing the SES identity. For local runs, set `TF_VAR_contact_destination_email`.
  The address is still in the repository's git history from before this change. Only
  switching to a different destination address takes it out of circulation.
