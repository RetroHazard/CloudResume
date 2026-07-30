# CloudFront signing keys

`crc-cf-signing-key.pub.pem` is the public half of the RSA key pair CloudFront uses to
validate signed URLs for `/files/*`. It is public by definition, so it lives in the repo:
`aws_cloudfront_public_key` needs it at **plan** time, and committing it makes a rotation
visible in git history.

The private half is **never** committed and **never** touched by Terraform. It lives in SSM
as a SecureString and is read by the `downloadResume` Lambda at cold start. A
`data "aws_ssm_parameter"` would write the decrypted key into `terraform.tfstate` in
cleartext, and the state bucket would then be holding the signing key — hence the
runtime read.

## ⚠️ The committed key is a placeholder

The pair it came from was generated to give `terraform plan` something valid to parse, and
**its private half was destroyed rather than recorded.** Nobody can sign with it.

That is safe only because `signed_downloads_enabled` defaults to `false`, which leaves
`trusted_key_groups` empty and `/files/*` reachable exactly as it is today. Do not flip
that variable until you have completed the bootstrap below, or the CV download will break
with no way to mint a working URL.

## Bootstrap

Run locally. Never in CI, never inside the repo working tree.

```bash
cd "$(mktemp -d)"

openssl genrsa -out crc-cf-signing-key.pem 2048
openssl rsa -in crc-cf-signing-key.pem -pubout -out crc-cf-signing-key.pub.pem

aws ssm put-parameter \
  --name /CloudResume/cloudfront/signing-key \
  --type SecureString \
  --value file://crc-cf-signing-key.pem \
  --description "CloudFront signed-URL private key for /files/*"

# Replace the placeholder, then destroy the private half locally.
cp crc-cf-signing-key.pub.pem /path/to/CloudResume/infrastructure/keys/
shred -u crc-cf-signing-key.pem
```

CloudFront requires RSA-2048. OpenSSL 3 writes PKCS#8 (`BEGIN PRIVATE KEY`), OpenSSL 1.x
writes PKCS#1 (`BEGIN RSA PRIVATE KEY`); the Lambda parses both, so either is fine.

Then, in order:

1. Commit the replaced public key and apply. `signed_downloads_enabled` stays `false`.
2. Confirm `GET /download` returns a URL and that the URL fetches the PDF.
3. Set `signed_downloads_enabled = true` and apply again. The plain path is now gated.
4. Set `CYPRESS_SIGNED_DOWNLOADS=1` on the `web-smoke` job. `files-locked.cy.js` self-skips
   without it, and becomes a real guard against the gating being silently undone once it is
   set. Do this in the same change as step 3, or the check stays dormant forever.

Step 2 is not optional. It is the only point at which a mismatch between the committed
public key and the SSM private key is cheap to discover.

## Rotation

Two-phase, so no signing outage:

1. Generate a new pair. Add the new public PEM as a **second** `aws_cloudfront_public_key`
   and list both ids in the key group's `items`. Apply.
2. Overwrite the SSM SecureString with the new private key. New URLs verify against the new
   key; URLs already issued still verify against the old one.
3. Once the old TTL window has passed, remove the old public key resource and its entry
   from `items`. Apply.

`name_prefix` and `create_before_destroy` on `aws_cloudfront_public_key` exist for this —
`encoded_key` forces replacement, and a fixed name would collide with itself mid-swap.
