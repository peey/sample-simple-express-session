/// <reference types="cypress" />

const URL = process.env.APP_URL?? "localhost:3000";

describe('example to-do app', () => {

  beforeEach(() => {
    cy.visit(URL)
  })

  it('displays two todo items by default', () => {
    cy.get('#visit-no').should('have.text', 1)
  })

  it('can add new todo items', () => {
    cy.get('#visit-no').should('have.text', 1);
    cy.reload();
    cy.get('#visit-no').should('have.text', 2);
  })
})
