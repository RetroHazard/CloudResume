// The API half of the post-apply smoke test: three routes on the real API Gateway stage,
// exercised without a browser and without mutating anything a human would notice.
//
// Everything else in the suite stubs these endpoints — cy.stubVisitorApi intercepts
// GET /visitors in every spec that loads a page, and contact-form.cy.js intercepts the POST.
// That is correct for testing the frontend and useless for testing the stack: a deleted route,
// a detached request validator, a Lambda whose permission was revoked, or an integration
// pointing at a stale function ARN all look identical from a stubbed test.
//
// These run against a deployed stage or not at all, so they carry the same localhost guard as
// files-locked.cy.js and cv-download-live.cy.js, plus one on the endpoint itself — the PR e2e
// job has no CYPRESS_API_ENDPOINT and must skip rather than fail.
describe('Live API (production)', () => {
    const apiEndpoint = (Cypress.env('apiEndpoint') || '').replace(/\/$/, '');
    const baseUrl = Cypress.config('baseUrl') || '';

    // A stable id, exactly as cv-download-live.cy.js uses for the download uuid. trackVisitors
    // writes a visitor record with a 24h TTL and only increments the counter on a miss, so
    // reusing one id means repeat deploys are absorbed by the dedupe instead of inflating the
    // public count once per push to main.
    const SMOKE_ID = 'ci-smoke-test';

    beforeEach(function () {
        if (!apiEndpoint || baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1')) {
            this.skip();
        }
    });

    describe('GET /visitors', () => {
        it('returns the visitor count as JSON', () => {
            cy.request({
                method: 'GET',
                url: `${apiEndpoint}/visitors?visitorId=${SMOKE_ID}`,
                failOnStatusCode: false,
            }).then((response) => {
                expect(response.status, 'status').to.eq(200);
                expect(response.headers['content-type'] || '').to.contain('application/json');

                // cy.request parses a JSON body for us, so this is the object itself. Asserting
                // the type rather than a value: the count only ever goes up, and pinning it to
                // anything would make the test a clock.
                expect(response.body, 'body').to.have.property('count');
                expect(response.body.count, 'count').to.be.a('number');

                // The Lambda echoes its allowedOrigin env var here rather than '*'
                // (infrastructure/codebase/trackVisitors.py). If that ever drifts from the site
                // origin the counter silently disappears in the browser — the component returns
                // null on a failed fetch — and nothing else in the suite would notice, because
                // every other test stubs this response.
                expect(response.headers['access-control-allow-origin'], 'CORS origin').to.eq(
                    baseUrl.replace(/\/$/, ''),
                );
            });
        });

        // The method declares method.request.querystring.visitorId as required and attaches
        // crc-api-param-validator. trackVisitors indexes straight into queryStringParameters,
        // so if the validator is ever detached this becomes a KeyError and a 500 — which is a
        // Lambda invocation and a CloudWatch error for anyone who curls the endpoint bare.
        it('rejects a request with no visitorId at the gateway', () => {
            cy.request({
                method: 'GET',
                url: `${apiEndpoint}/visitors`,
                failOnStatusCode: false,
            }).then((response) => {
                expect(response.status, 'status').to.eq(400);
            });
        });
    });

    describe('POST /contact', () => {
        // Same validator, on method.request.querystring.uuid.
        it('rejects a request with no uuid at the gateway', () => {
            cy.request({
                method: 'POST',
                url: `${apiEndpoint}/contact`,
                body: {},
                failOnStatusCode: false,
            }).then((response) => {
                expect(response.status, 'status').to.eq(400);
            });
        });

        // The only way to prove the contact route is alive without emailing a human on every
        // deploy. sendMessage compares the Origin header against its allowedOrigin and returns
        // before it ever constructs an SES client, so a deliberately foreign origin exercises
        // the whole path — route, AWS_PROXY integration, lambda:InvokeFunction permission, cold
        // start — and sends nothing.
        //
        // The body assertion is the load-bearing half. API Gateway answers a request for a route
        // that does not exist with its own 403 and {"message":"Missing Authentication Token"},
        // so a status-only check would pass just as happily against a deleted /contact resource.
        it('reaches the Lambda and is refused on origin', () => {
            cy.request({
                method: 'POST',
                url: `${apiEndpoint}/contact?uuid=${SMOKE_ID}`,
                headers: { Origin: 'https://smoke.invalid' },
                body: { firstName: 'CI', lastName: 'Smoke', email: 'ci@smoke.invalid' },
                failOnStatusCode: false,
            }).then((response) => {
                expect(response.status, 'status').to.eq(403);
                expect(JSON.stringify(response.body), 'rejected by the Lambda, not the gateway').to.contain(
                    'Forbidden: Invalid origin',
                );
            });
        });
    });
});
