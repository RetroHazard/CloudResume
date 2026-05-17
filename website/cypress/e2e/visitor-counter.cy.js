describe('Visitor counter', () => {
  // Forces a desktop viewport so the counter (max-sm:hidden) is visible.
  beforeEach(() => {
    cy.viewport('macbook-16');
  });

  it('renders the visitor count returned by the API', () => {
    cy.stubVisitorApi(42);
    cy.visit('/');
    cy.wait('@visitorApi');
    cy.get('nav[aria-label="Primary navigation"] [role="status"]').contains('42').should('be.visible');
  });

  it('sends the visitor ID as a query parameter', () => {
    cy.stubVisitorApi(1);
    cy.visit('/');
    cy.wait('@visitorApi').then((interception) => {
      expect(interception.request.url).to.include('visitorId=');
    });
  });

  it('stores the visitor UUID in localStorage', () => {
    cy.stubVisitorApi(1);
    cy.visit('/');
    cy.wait('@visitorApi');
    cy.getAllLocalStorage().then((storage) => {
      const origin = Object.keys(storage)[0];
      expect(storage[origin]).to.have.property('uuid');
      expect(storage[origin].uuid).to.match(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
      );
    });
  });

  it('hides the counter entirely when the API fails', () => {
    cy.intercept('GET', '**/visitors*', { forceNetworkError: true }).as('visitorApiFail');
    cy.visit('/');
    cy.wait('@visitorApiFail');
    // The component returns null on error — the status element should not exist.
    cy.get('nav[aria-label="Primary navigation"] [role="status"]').should('not.exist');
  });
});
