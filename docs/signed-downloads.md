# Signed CV downloads

The CV is the one object on the site that is not served as a plain static file. Requests to
`/files/*` carry a CloudFront signature; unsigned ones are rejected at the edge. The
signature is minted per click by a Lambda that also records the download in DynamoDB.

## What this is and is not

It is not a confidentiality control. The PDF is committed to a public repository and can be
pulled from GitHub without touching AWS at all. Nothing here changes that, and it was never
meant to.

What it does buy:

- **Links expire.** Previously the CV sat at a permanent, guessable path — a URL handed out
  two years ago still worked. Signatures are good for 60 seconds.
- **Downloads are countable.** There was no way to measure them short of an Athena query
  over the CloudFront access logs.
- **Egress has a chokepoint.** An unsigned request is refused before any of the body is
  transferred, so the only way to pull the PDF at volume is through `GET /download` — which
  is throttled, and which counts what it hands out.

## Request flow

```
Download CV click
  └─> GET https://api.<domain>/<stage>/download?visitorId=<uuid>
        └─> λ downloadResume
              ├─ crc-download-record   dedupe on visitorId (24h TTL), bump download_count
              ├─ ssm:GetParameter      private key, cached for the life of the container
              └─ returns { downloadUrl, fileName, expiresAt, count }
  └─> browser downloads https://<domain>/files/<cv>.pdf?Expires=…&Signature=…&Key-Pair-Id=…
        └─> CloudFront validates against the trusted key group, then serves from cache
```

## Design notes worth keeping

**The URL is built on the site apex, not the distribution domain.** Browsers only honour a
link's `download` attribute same-origin. Signing `*.cloudfront.net` would make the PDF open
in a viewer instead of saving, and nothing would log an error.

**The object key comes from configuration, never the request.** A handler that signed a
caller-supplied key would be a signing oracle for the whole bucket.

**Telemetry never blocks the download.** The table is provisioned at 1 WCU. A throttled
counter write is logged and swallowed; the URL is still issued.

**The policy JSON is serialised with no spaces.** CloudFront reconstructs the exact string
to verify against, so a stray space fails every URL as an unexplained 403 with nothing in
any log. See `separators=(',', ':')` in `infrastructure/codebase/downloadResume.py`.

**The signer is hand-rolled, and deliberately so.** CloudFront requires RSA-SHA1, the Lambda
python3.12 runtime does not bundle `cryptography`, and every function in this repo is
packaged as a single bare `.py` by `data.archive_file`. Introducing a layer for one modexp
would mean either committing a binary manylinux wheel tree to a public repo or adding a
build step Terraform cannot perform. The padding is EMSA-PKCS1-v1_5, fully deterministic,
with no attacker-controlled input. `CvDownloadButton` covers the frontend; the signer itself
should be cross-checked against OpenSSL whenever it is touched:

```bash
openssl dgst -sha1 -verify keys/crc-cf-signing-key.pub.pem -signature sig.bin policy.txt
```

## Two things that had to be fixed to make this work

**The SPA fallback used to map 403.** Without `s3:ListBucket`, S3 reports a missing key as
`403 AccessDenied` rather than `404 NoSuchKey`, so the distribution mapped 403 → `/index.html`
at 200 to make deep links work. A `custom_error_response` is distribution-wide and cannot be
scoped to one behavior, so that mapping also swallowed the 403 CloudFront returns for a bad
signature — a rejected request would have come back as the React shell with a 200. The bucket
policy now grants `ListBucket` to the distribution (CloudFront never calls it; nothing becomes
publicly listable), which lets the fallback key off 404 and leaves real 403s intact. WAF
blocks were masked the same way and now surface properly too.

**The API deployment never redeployed.** `aws_api_gateway_deployment.triggers.redeployment`
hashed `aws_api_gateway_rest_api.body`, which is only set for OpenAPI-defined APIs and is
null here — so it hashed a constant, and `depends_on` only orders creation. A newly added
route would have been created but never deployed to the stage. The trigger now hashes the
route surface itself; **any new resource, method or integration has to be added to that list
or it will not go live.**

## Operations

Key generation, rotation and the staged rollout are in
[`infrastructure/keys/README.md`](../../infrastructure/keys/README.md).

Throttling is set by `api_throttle_*` in `infrastructure/variables.tf`: 10 rps / 20 burst
across every method, 2 rps / 5 burst on `download/GET`. These are the only bound on what the
API can be made to cost — `api.<domain>` is an edge-optimized endpoint with its own internal
CloudFront distribution, and the `CloudResume-WebACL` is `CLOUDFRONT`-scoped, so WAF never
covered it. Pair them with an AWS Budgets alarm.

Rough costs per million downloads: ~$35 API Gateway, ~$0.41 Lambda, ~$1 CloudFront requests,
~$11 egress at 133 KB/download. Egress dominates and was already being paid.
