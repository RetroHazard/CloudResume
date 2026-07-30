// The one check that exercises signing for real, end to end, against production.
//
// Everything else in the suite stubs GET /download — necessarily, since neither vitest nor
// a local preview can mint a CloudFront signature. That left a gap wide enough to ship a
// completely broken Download CV button green: if the SSM private key is missing, or has
// drifted out of sync with the public key CloudFront trusts, the endpoint 500s or the URL
// 403s at the edge, and no other test would notice.
//
// The final cy.request is the point of the whole spec. Asserting the API returned *a* URL
// proves nothing; fetching it is what proves the two halves of the key pair agree.
describe('CV download (live)', () => {
    it('mints a signed URL that actually fetches the PDF', function () {
        const base = Cypress.config('baseUrl') || '';
        if (base.includes('localhost') || base.includes('127.0.0.1')) {
            // vite preview serves public/ off disk — no API, no edge, nothing to prove.
            this.skip();
        }

        cy.visit('/', {
            onBeforeLoad(win) {
                // A stable visitor id so the 24h dedupe absorbs repeat deploys instead of
                // adding a phantom download to the counter on every push to main.
                win.localStorage.setItem('uuid', 'ci-smoke-test');
            },
        });

        cy.window().then((win) => {
            cy.stub(win.HTMLAnchorElement.prototype, 'click').as('anchorClick');
        });

        cy.contains('button', 'Download CV').click();

        cy.get('@anchorClick').should('have.been.calledOnce');
        cy.get('[role="alert"]').should('not.exist');

        cy.get('@anchorClick')
            .then((stub) => stub.thisValues[0].getAttribute('href'))
            .then((href) => {
                expect(href, 'signed URL').to.contain('Signature=');
                expect(href, 'signed URL').to.contain('Key-Pair-Id=');

                cy.request({ url: href, failOnStatusCode: false }).then((response) => {
                    expect(response.status, 'signed URL is accepted at the edge').to.eq(200);
                    expect(response.headers['content-type']).to.contain('application/pdf');
                    expect(response.headers['content-disposition'] || '').to.contain('attachment');
                });
            });
    });
});
