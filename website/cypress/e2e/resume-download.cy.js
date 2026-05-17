describe('Resume download', () => {
  beforeEach(() => {
    cy.stubVisitorApi();
    cy.visit('/');
  });

  it('has a Download CV link with the download attribute', () => {
    cy.contains('a', 'Download CV')
      .should('have.attr', 'download');
    cy.contains('a', 'Download CV')
      .invoke('attr', 'href')
      .should('exist')
      .and('not.be.empty');
  });

  it('resume download URL responds successfully', () => {
    cy.contains('a', 'Download CV')
      .invoke('attr', 'href')
      .then((href) => {
        cy.request({ url: href, method: 'HEAD', failOnStatusCode: false })
          .its('status')
          .should('be.oneOf', [200, 301, 302]);
      });
  });
});
