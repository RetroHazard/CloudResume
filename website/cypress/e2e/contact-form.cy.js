// Helpers to fill all required fields with valid data.
function fillForm() {
  cy.get('#firstName').type('Cypress');
  cy.get('#lastName').type('Test');
  cy.get('#email').type('cypress@example.com');
  cy.get('#subject').type('Automated E2E test submission');
  cy.get('#message').type('This is a Cypress automated end-to-end test message.');
}

describe('Contact form', () => {
  beforeEach(() => {
    cy.stubVisitorApi();
    cy.mockRecaptcha();
    cy.visit('/contact', { failOnStatusCode: false });
  });

  it('renders all required form fields', () => {
    cy.get('#firstName').should('be.visible');
    cy.get('#lastName').should('be.visible');
    cy.get('#email').should('be.visible');
    cy.get('#subject').should('be.visible');
    cy.get('#message').should('be.visible');
    cy.get('button[type="submit"]').should('contain', 'Send Message');
  });

  it('prevents submission when required fields are empty', () => {
    cy.get('button[type="submit"]').click();
    // The browser's native required validation fires before JS — firstName is first.
    cy.get('#firstName').then(($input) => {
      expect($input[0].validity.valid).to.be.false;
    });
  });

  it('shows reCAPTCHA error when captcha is not completed (site key configured)', () => {
    // This test only applies when VITE_RECAPTCHA_SITE_KEY is set (production build).
    // When the key is absent, reCAPTCHA does not render and the check is skipped.
    cy.get('body').then(($body) => {
      const hasSiteKey = $body.find('[class*="g-recaptcha"], .grecaptcha-badge').length > 0
        || !!Cypress.env('VITE_RECAPTCHA_SITE_KEY');

      if (!hasSiteKey) {
        // No site key — skip this test gracefully.
        cy.log('reCAPTCHA not rendered (no site key). Skipping.');
        return;
      }

      fillForm();
      // Do NOT call cy.completeRecaptcha() — token stays empty.
      cy.get('button[type="submit"]').click();
      cy.contains('Please complete the reCAPTCHA.').should('be.visible');
    });
  });

  it('disables the submit button and shows spinner while sending', () => {
    cy.intercept('POST', '**/contact*', (req) => {
      req.reply({ delay: 200, statusCode: 200, body: {} });
    }).as('contactSubmit');

    fillForm();
    cy.completeRecaptcha();

    cy.get('button[type="submit"]').click();
    cy.get('button[type="submit"]').should('be.disabled');
    cy.get('button[type="submit"]').should('contain', 'Sending...');

    cy.wait('@contactSubmit');
  });

  it('shows success message after valid submission', () => {
    cy.intercept('POST', '**/contact*', { statusCode: 200, body: {} }).as('contactSubmit');

    fillForm();
    cy.completeRecaptcha();

    // cy.clock() must be called before clicking submit so it controls the
    // 5-second minimum-display setTimeout queued inside handleSubmit.
    cy.clock();
    cy.get('button[type="submit"]').click();
    cy.wait('@contactSubmit');
    cy.tick(5001);

    cy.contains('Message sent successfully!').should('be.visible');
    cy.clock().invoke('restore');
  });

  it('shows error message when the API returns an error', () => {
    cy.intercept('POST', '**/contact*', { statusCode: 500, body: {} }).as('contactSubmit');

    fillForm();
    cy.completeRecaptcha();

    cy.clock();
    cy.get('button[type="submit"]').click();
    cy.wait('@contactSubmit');
    cy.tick(5001);

    cy.contains('Failed to send message.').should('be.visible');
    cy.clock().invoke('restore');
  });

  it('resets the form after successful submission', () => {
    cy.intercept('POST', '**/contact*', { statusCode: 200, body: {} }).as('contactSubmit');

    fillForm();
    cy.completeRecaptcha();

    cy.clock();
    cy.get('button[type="submit"]').click();
    cy.wait('@contactSubmit');
    cy.tick(5001);

    cy.get('#firstName').should('have.value', '');
    cy.get('#message').should('have.value', '');
    cy.clock().invoke('restore');
  });
});
