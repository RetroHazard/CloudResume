# Contact form reCAPTCHA

The contact form uses **reCAPTCHA v2 Invisible**. There is no checkbox: the widget runs when the
visitor presses _Dispatch Message_. Most visitors get a token silently, and a suspicious one gets
Google's image challenge first. Google's floating badge is hidden (`.grecaptcha-badge` in
`website/src/assets/css/index.css`), which Google's terms allow only because the form shows the
"Protected by reCAPTCHA" attribution line under the button. Remove that line and the badge has to
come back.

## Where the check actually happens

The widget on the page proves nothing on its own: `POST /contact` is a public endpoint, and a bot
can call it without ever loading the page. The `sendMessage` Lambda checks every submission by
sending its `token` to Google's `siteverify` endpoint before anything reaches SES, and rejects the
request when:

| Condition                                              | Response |
| ------------------------------------------------------ | -------- |
| No token in the body                                   | 403      |
| Google says the token is invalid, expired, or reused   | 403      |
| The token was solved on a hostname other than the site | 403      |
| Google can't be reached within 3s                      | 503      |

It fails closed: if the check can't complete, no email is sent. Tokens are single-use and expire
after two minutes, so the frontend gets a fresh one on every submit.

## Keys

There are two halves, and they must come from the **same** reCAPTCHA registration:

| Half       | Where it lives                                                                      |
| ---------- | ----------------------------------------------------------------------------------- |
| Site key   | `RECAPTCHA_SITE_KEY` repository secret → `VITE_RECAPTCHA_SITE_KEY` at build time    |
| Secret key | SSM SecureString `/CloudResume/recaptcha/secret-key` (`recaptcha_secret_parameter`) |

Terraform only knows the secret's parameter _name_. The Lambda reads the value at runtime, the same
way `downloadResume` reads the CloudFront signing key, so the secret never enters Terraform state.

reCAPTCHA keys belong to one widget type, so a key registered for the **checkbox** won't work with
the invisible widget. Register a new one.

## Setup

1. In the [reCAPTCHA admin console](https://www.google.com/recaptcha/admin), create a key of type
   **reCAPTCHA v2 → "Invisible reCAPTCHA badge"** and add the site's domain. Leave _Verify the
   origin of reCAPTCHA solutions_ on. The Lambda checks the hostname too, but there's no reason to
   turn the console check off.
2. Store the secret key in the deployment region (the same one as `AWS_TF_DEPLOYMENT_REGION`), from
   your own workstation or CloudShell, not CI. Don't pass `--key-id`: the Lambda's `kms:Decrypt`
   grant only covers the AWS-managed `alias/aws/ssm` key.

   ```bash
   aws ssm put-parameter --name /CloudResume/recaptcha/secret-key \
     --type SecureString --value '<secret key>' \
     --description "reCAPTCHA v2 Invisible secret key for sendMessage"
   ```

   To rotate the key later, run the same command with `--overwrite`. A warm Lambda keeps the old
   value until it is recycled, so redeploy the function or wait for its instances to be replaced.

3. Set the `RECAPTCHA_SITE_KEY` repository secret to the new **site** key.
4. Deploy. Do steps 2 and 3 before the deploy that carries this change, because the Lambda refuses
   every submission while the parameter is missing or doesn't match the site key on the page.

## Failure alerts

A submission that fails on our side is emailed to the inbox the form delivers to
(`CONTACT_DESTINATION_EMAIL`), through the `crc-contact-form-alerts` SNS topic. Two alarms
publish to it:

| Alarm                            | Fires when                                                                                          |
| -------------------------------- | --------------------------------------------------------------------------------------------------- |
| `crc-contact-form-failures`      | `sendMessage` logs at ERROR: SES refused the send, or `siteverify` couldn't be reached (500 or 503) |
| `crc-contact-form-lambda-errors` | The Lambda itself errored or timed out, which the handler can't catch or log                        |

The first alarm needs a metric filter because the handler catches its own failures and returns a
response, so the Lambda's `Errors` metric never counts them. Rejections are not failures and
don't alert: a missing or invalid token, or a foreign `Origin`, is logged at INFO or not at all.
`test_sendMessage.py` holds both sides of that line, since anything logged at ERROR now sends an
email.

Each alarm emails once when it goes into alarm, and again only after a quiet five minutes followed
by another failure. The email names the alarm, and the detail is in the
`/aws/lambda/sendMessage` log group.

SNS confirms an email subscription before it delivers anything. The first deploy that creates the
topic sends a confirmation email to that inbox, and alerts only start once its link is followed.
If the destination address changes, the subscription is replaced and needs confirming again.

## Local development

Without `VITE_RECAPTCHA_SITE_KEY`, the widget doesn't render and the form sends no token, so any
backend running this Lambda rejects it with a 403. To exercise the form locally, use Google's
public test key pair (site key `6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI`), which always passes,
against a backend configured with its matching test secret. The Cypress specs stub the reCAPTCHA
script (`cy.mockRecaptcha`) and the `/contact` call, so they need neither.
