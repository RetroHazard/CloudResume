// Stubs the visitor count API for every test that loads a page.
Cypress.Commands.add('stubVisitorApi', (count = 1) => {
    cy.intercept('GET', '**/visitors*', {
        statusCode: 200,
        body: { count },
    }).as('visitorApi');
});

// Stubs the signed-URL endpoint behind the Download CV button. The real one mints a
// CloudFront signature; the shape is all the frontend cares about.
Cypress.Commands.add('stubDownloadApi', (overrides = {}) => {
    cy.intercept('GET', '**/download*', {
        statusCode: 200,
        body: {
            downloadUrl: '/files/test-cv.pdf?Expires=1&Signature=stub&Key-Pair-Id=K1',
            fileName: 'test-cv.pdf',
            expiresAt: 1,
            count: 1,
            ...overrides,
        },
    }).as('downloadApi');
});

// Intercepts the reCAPTCHA script load and injects a controllable stub.
// Works whether VITE_RECAPTCHA_SITE_KEY is set (production) or not (local dev).
// The form uses the invisible widget, which calls execute() on submit: the stub
// answers with the token cy.completeRecaptcha() set, or with the widget's error
// callback when none was set — standing in for a visitor who fails verification.
Cypress.Commands.add('mockRecaptcha', () => {
    cy.intercept('GET', '**/recaptcha/api.js*', {
        statusCode: 200,
        headers: { 'Content-Type': 'application/javascript' },
        body: [
            'window.grecaptcha = {',
            '  ready: function(cb) { setTimeout(cb, 0); },',
            '  render: function(container, opts) { window.__recaptchaOpts = opts; return 0; },',
            '  execute: function() {',
            '    var opts = window.__recaptchaOpts;',
            '    setTimeout(function() {',
            '      if (window.__recaptchaToken) opts.callback(window.__recaptchaToken);',
            '      else opts["error-callback"]();',
            '    }, 0);',
            '  },',
            '  getResponse: function() { return window.__recaptchaToken || ""; },',
            '  reset: function() {}',
            '};',
        ].join('\n'),
    });
});

// Sets the token the stubbed execute() hands back when the form is submitted.
Cypress.Commands.add('completeRecaptcha', (token = 'test-recaptcha-token') => {
    cy.window().then((win) => {
        win.__recaptchaToken = token;
    });
});
