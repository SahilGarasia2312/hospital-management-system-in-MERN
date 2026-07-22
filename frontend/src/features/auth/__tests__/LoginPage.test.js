// LoginPage.test.js — QA UI Component Test for LoginPage
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LoginPage from "../LoginPage";
import * as authApi from "../../../api/auth.api";

// Mock the custom hooks & api module
const mockLogin = jest.fn();
const mockNavigate = jest.fn();

jest.mock("../../../hooks/useAuth", () => ({
  __esModule: true,
  default: () => ({
    login: mockLogin,
  }),
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

jest.mock("../../../api/auth.api", () => ({
  loginApi: jest.fn(),
}));

describe("QA UI Test: LoginPage Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders portal header, input fields, and quick demo buttons", () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/sign in to portal/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByText(/admin access/i)).toBeInTheDocument();
  });

  test("populates credentials when quick demo button is clicked", () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    const adminDemoBtn = screen.getByText(/admin access/i);
    fireEvent.click(adminDemoBtn);

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);

    expect(emailInput.value).toBe("admin@hpms.com");
    expect(passwordInput.value).toBe("Admin@123");
  });

  test("submits form successfully and navigates to role-specific dashboard", async () => {
    authApi.loginApi.mockResolvedValueOnce({
      data: {
        token: "fake_jwt_token",
        user: { id: "1", role: "admin", name: "System Admin" },
      },
    });

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitBtn = screen.getByRole("button", { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: "admin@hpms.com" } });
    fireEvent.change(passwordInput, { target: { value: "Admin@123" } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(authApi.loginApi).toHaveBeenCalledWith({
        email: "admin@hpms.com",
        password: "Admin@123",
      });
      expect(mockLogin).toHaveBeenCalledWith("fake_jwt_token", {
        id: "1",
        role: "admin",
        name: "System Admin",
      });
      expect(mockNavigate).toHaveBeenCalledWith("/admin", { replace: true });
    });
  });

  test("displays error message on invalid credentials failure", async () => {
    authApi.loginApi.mockRejectedValueOnce({
      response: {
        data: { message: "Invalid email or password" },
      },
    });

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitBtn = screen.getByRole("button", { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: "wrong@hpms.com" } });
    fireEvent.change(passwordInput, { target: { value: "WrongPass" } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Invalid email or password");
    });
  });
});
