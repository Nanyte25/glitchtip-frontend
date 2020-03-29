import { seedBackend } from "./utils";
import { user } from "../fixtures/users";

describe("Login", () => {
  it("should show validation errors", () => {
    cy.visit("/login");
    cy.get("#submit").click();
    cy.contains("email is required");
    cy.contains("password should be at least");
  });

  it("should allow logging in", () => {
    seedBackend();

    cy.visit("/login");
    cy.get("input[formcontrolname=email]").type(user.email);
    cy.get("input[formcontrolname=password]").type(user.password);
    cy.get("#submit").click();
    cy.url().should("be", "/");
  });
});