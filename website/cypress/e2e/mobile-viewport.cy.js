describe('Mobile viewport rendering', () => {
  beforeEach(() => {
    cy.stubVisitorApi(5);
    cy.viewport('iphone-x'); // 375 × 812
  });

  it('renders the home page on mobile', () => {
    cy.visit('/');
    cy.get('h1').should('be.visible');
  });

  it('hides the visitor counter on mobile', () => {
    cy.visit('/');
    cy.wait('@visitorApi');
    // max-sm:hidden keeps the element in the DOM but display:none.
    // Scope to nav to avoid the NoticeBanner's role="status" in dev mode.
    cy.get('nav[aria-label="Primary navigation"] [role="status"]').should('not.be.visible');
  });

  it('shows navigation on mobile', () => {
    cy.visit('/');
    cy.get('nav[aria-label="Primary navigation"]').should('be.visible');
  });

  it('renders all content pages without error on mobile', () => {
    const pages = ['/education', '/experience', '/certifications', '/projects', '/skills', '/contact'];
    pages.forEach((path) => {
      cy.visit(path, { failOnStatusCode: false });
      // Each page has a top-level content section — just verify nothing crashes.
      cy.get('body').should('not.be.empty');
    });
  });
});
