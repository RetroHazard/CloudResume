// Stubs the visitor count API for every test that loads a page.
Cypress.Commands.add('stubVisitorApi', (count = 1) => {
  cy.intercept('GET', '**/visitors*', {
    statusCode: 200,
    body: { count },
  }).as('visitorApi');
});

// Intercepts the reCAPTCHA script load and injects a controllable stub.
// Works whether VITE_RECAPTCHA_SITE_KEY is set (production) or not (local dev).
Cypress.Commands.add('mockRecaptcha', () => {
  cy.intercept('GET', '**/recaptcha/api.js*', {
    statusCode: 200,
    headers: { 'Content-Type': 'application/javascript' },
    body: [
      'window.grecaptcha = {',
      '  ready: function(cb) { setTimeout(cb, 0); },',
      '  render: function(container, opts) { window.__recaptchaOpts = opts; return 0; },',
      '  getResponse: function() { return window.__recaptchaToken || ""; },',
      '  reset: function() { window.__recaptchaToken = ""; }',
      '};',
    ].join('\n'),
  });
});

// Sets a fake reCAPTCHA token so the form's captchaRef.current.getValue() returns it.
Cypress.Commands.add('completeRecaptcha', (token = 'test-recaptcha-token') => {
  cy.window().then((win) => {
    win.__recaptchaToken = token;
    if (win.__recaptchaOpts && win.__recaptchaOpts.callback) {
      win.__recaptchaOpts.callback(token);
    }
  });
});
