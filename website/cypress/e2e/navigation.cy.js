describe('Page navigation', () => {
  beforeEach(() => {
    cy.stubVisitorApi();
  });

  it('loads the home page at /', () => {
    cy.visit('/');
    cy.get('h1').should('be.visible');
  });

  const pages = [
    { label: 'Education',      path: '/education' },
    { label: 'Experience',     path: '/experience' },
    { label: 'Certifications', path: '/certifications' },
    { label: 'Projects',       path: '/projects' },
    { label: 'Skills',         path: '/skills' },
    { label: 'Contact',        path: '/contact' },
  ];

  pages.forEach(({ label, path }) => {
    it(`navigates to ${label} via nav link`, () => {
      cy.visit('/');
      cy.get(`nav[aria-label="Primary navigation"] a[href="${path}"]`).click();
      cy.url().should('include', path);
    });

    it(`marks ${label} link as active when on ${path}`, () => {
      cy.visit(path, { failOnStatusCode: false });
      cy.get(`nav[aria-label="Primary navigation"] a[href="${path}"]`)
        .should('have.class', 'nav-block-active');
    });
  });

  it('marks Home link as active when on /', () => {
    cy.visit('/');
    cy.get('nav[aria-label="Primary navigation"] a[href="/"]')
      .should('have.class', 'nav-block-active');
  });

  it('shows a not-found page for unknown routes', () => {
    cy.visit('/this-does-not-exist', { failOnStatusCode: false });
    cy.contains(/404|not found/i).should('be.visible');
  });
});
