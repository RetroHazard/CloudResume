describe('Resume download', () => {
    beforeEach(() => {
        cy.stubVisitorApi();
        cy.stubDownloadApi();
        cy.visit('/');
        // The component synthesises an anchor and clicks it. Left alone that would start a
        // real navigation mid-test, so stub the click and assert on the element instead.
        cy.window().then((win) => {
            cy.stub(win.HTMLAnchorElement.prototype, 'click').as('anchorClick');
        });
    });

    it('asks the API for a signed URL, tagged with the visitor id', () => {
        cy.contains('button', 'Download CV').click();
        cy.wait('@downloadApi').then((interception) => {
            expect(interception.request.query.visitorId).to.be.a('string').and.not.be.empty;
        });
    });

    it('hands the signed URL to the browser as a download', () => {
        cy.contains('button', 'Download CV').click();
        cy.wait('@downloadApi');
        cy.get('@anchorClick').should('have.been.calledOnce');
        cy.get('@anchorClick').then((stub) => {
            const anchor = stub.thisValues[0];
            expect(anchor.getAttribute('href')).to.contain('Signature=');
            expect(anchor.getAttribute('download')).to.equal('test-cv.pdf');
        });
    });

    it('reports a failure instead of silently doing nothing', () => {
        cy.intercept('GET', '**/download*', { statusCode: 500, body: {} }).as('downloadFail');
        cy.contains('button', 'Download CV').click();
        cy.wait('@downloadFail');
        cy.get('[role="alert"]').should('contain.text', 'Ticket machine offline');
        cy.get('@anchorClick').should('not.have.been.called');
    });
});
