// Guards the one property the whole signed-download exercise rests on: that CloudFront
// rejects an unsigned request for the CV at the edge.
//
// This is worth a smoke test rather than a unit test because the ways it breaks are all
// in infrastructure, not code. Re-pointing the SPA fallback back at 403 would swallow the
// rejection and serve the app shell with a 200; dropping trusted_key_groups would serve
// the PDF outright. Both look fine from the browser and neither would fail anything else.
//
// Pairs with cv-download-live.cy.js: that one proves a signed URL works, this one proves an
// unsigned one does not. Either alone can pass while the gating is wrong.
describe('Protected CV object', () => {
    it('rejects an unsigned request at the edge', function () {
        const base = Cypress.config('baseUrl') || '';
        if (base.includes('localhost') || base.includes('127.0.0.1')) {
            // vite preview serves public/ straight off disk; there is no edge to test.
            this.skip();
        }

        cy.request({
            // Generated CVs live under a content digest that changes whenever the site does,
            // so there is no stable key to probe. There does not need to be: the signature is
            // checked at the edge before the origin is consulted, so an unsigned request for
            // any key under /files/* has to come back 403 whether or not the object exists.
            // If the gate were ever off, this missing key would instead fall through to the
            // SPA fallback and return the app shell with a 200, which the assertions below
            // reject just as firmly as they would a leaked PDF.
            url: '/files/cv/unsigned-probe/Resume.pdf',
            failOnStatusCode: false,
        }).then((response) => {
            // Assert the body too, not just the status. The failure mode this exists to
            // catch returns 200 with the React shell, which a status-only check on a
            // permissive matcher would wave through.
            expect(response.status).to.eq(403);
            expect(response.headers['content-type'] || '').not.to.contain('text/html');
        });
    });
});
