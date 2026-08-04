// The origin half of the CloudFront-only policy.
//
// files-locked.cy.js proves the *edge* rejects an unsigned /files/* request. This proves the
// bucket behind it rejects an anonymous request outright, which is a different property and
// currently rests on one thing: the OAC bucket policy in modules/frontend. There is no
// aws_s3_bucket_public_access_block on the prod bucket, so a policy that ever grew a
// Principal: "*" statement — or lost the aws:SourceArn condition tying it to the distribution
// — would serve the whole site straight off S3, bypassing the CDN, the signed-download gate on
// /files/*, and the access logging. Terraform would report that apply as a clean success.
describe('Website bucket origin', () => {
    // Verbatim after the CYPRESS_ prefix is stripped — see the note in api-live.cy.js.
    // As 's3Bucket'/'awsRegion' these never resolved and the test always skipped itself.
    const bucket = Cypress.env('S3_BUCKET');
    const region = Cypress.env('AWS_REGION');

    it('refuses an anonymous request to the S3 endpoint', function () {
        if (!bucket || !region) {
            // No bucket name locally, and nothing to point this at — see files-locked.cy.js.
            this.skip();
        }

        cy.request({
            // The regional endpoint, not the global one: the bucket is created under the root
            // provider's var.deployment_region, and s3.amazonaws.com answers a request for a
            // bucket outside us-east-1 with a 301 PermanentRedirect rather than the 403 this
            // is looking for.
            url: `https://${bucket}.s3.${region}.amazonaws.com/index.html`,
            failOnStatusCode: false,
            // A redirect must surface as a redirect. Following one would let this assert
            // against whatever it landed on instead of against the bucket.
            followRedirect: false,
        }).then((response) => {
            expect(response.status, 'anonymous read of the origin').to.eq(403);
            // Status alone is ambiguous — 403 is also what a redirect chain or a fronting proxy
            // could produce. The S3 error document names the reason.
            expect(String(response.body), 'S3 AccessDenied document').to.contain('AccessDenied');
        });
    });
});
