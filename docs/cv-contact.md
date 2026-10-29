# CV contact address

The generated CV has to give recruiters a way to reach you, but it is a freely downloadable
document. So it prints neither a phone number nor the real inbox. It prints a random
forwarding alias on the site's own domain, such as `alexander.k7q2mx@<domain>`. Mail sent to
the alias is filtered and relayed to the real inbox. A new alias is issued every month, so
each one dates the CV it was printed on, and any alias can be revoked by hand with one
workflow run.

## How it works

```
recruiter → alexander.k7q2mx@<domain>
  └─ MX (apex) → SES inbound, receipt rule "contact-forward" (spam + virus scanning on)
       ├─ stores the raw message in the private mail bucket (expires after 7 days)
       └─ invokes λ forwardMail
            ├─ drop: virus, spam, DMARC fail with p=reject, or SPF and DKIM both failing
            ├─ drop: recipient isn't an active or retired alias (revoked, unknown, typo)
            └─ SendRawEmail → real inbox
                 From:     "Zoë Recruiter via CV (Nov 2026)" <noreply@<domain>>
                 Reply-To: zoe@recruiter.example   ← so Reply answers the sender directly
                 X-CV-Issued: 2026-11              ← the month their copy of the CV is from
                 (body and every other header byte-for-byte as received)
```

Drops are silent. A bounce to a forged sender is backscatter, and it would confirm the
address is live to whoever is probing it.

### Where the alias comes from

Nothing about the alias lives in the repository or in the site data. `downloadResume` reads
the live alias from the `crc-mail-alias` table on each CV download and prints it in the CV
header. Aliases are your first name plus six random characters, skipping lookalikes such as
`l`/`1` and `o`/`0` since the address may be retyped from paper.

### Monthly rotation

There is one alias per calendar month (UTC). The first CV download of a new month issues a
new alias, records the month on it, and retires the previous one. A retired alias keeps
forwarding, so every CV ever downloaded stays reachable unless you revoke its alias.

Because the address is part of the CV model, a new alias changes the content digest, so the
CV is re-rendered with it on that same click. The rotation is lazy: a month in which nobody
downloads the CV issues no alias, because nobody received one.

That gives you:

- **Which address was valid when:** the `status` view lists each alias with its month.
- **How old a sender's CV is:** forwarded mail says so in its From line and in the
  `X-CV-Issued` header. A message saying "(Mar 2026)" in December came from a CV that has
  been circulating for nine months.

Each alias has one of three states:

| Status | On the CV | Mail forwarded |
| --- | --- | --- |
| `active` | yes, this month's alias | yes |
| `retired` | no, superseded by a later month or rotated by hand | yes, so CVs already sent keep working |
| `revoked` | no | no, dropped silently |

### Abuse alerts

`forwardMail` tallies, per alias per UTC day, the messages it drops as spam, malware or spoofed
mail. When an alias reaches `alias_abuse_alert_threshold` (default 10) in a day, the real inbox
gets one email naming the alias, its month, and a link to the revoke workflow. Nothing is
revoked automatically; that decision is always yours. Set the threshold to 0 to turn alerts
off.

## Managing it

Run the **CV contact address** workflow (Actions → CV contact address → Run workflow):

- **status**: every alias, the month it was issued for, its state (with the reason, if it
  was revoked or rotated by hand), and how much mail it has forwarded and dropped.
- **revoke**: stop an alias outright. It's a single run: leave *address* empty to revoke
  this month's alias (the next CV download issues a replacement), or name any older alias
  from an alert or the status view. *reason* is optional and shows up in `status`.
- **rotate**: retire this month's alias early. It keeps forwarding; the next download issues
  a new one for the same month. Rarely needed now that rotation is monthly.

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
- **Spam scoring is SES's.** Messages SES scores as borderline still get through, and they
  don't count towards an alert. Revoking is the backstop.
- **Anyone can trip an alert.** Someone who knows an alias could send spoofed mail to it on
  purpose. That only produces an email to you, which is why alerts never revoke on their own.

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
