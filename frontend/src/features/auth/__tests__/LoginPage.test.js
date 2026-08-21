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

  test("renders portal header, input fields, and bot protection check", () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/sign in to portal/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByText(/i am not a bot/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  test("toggles password visibility when eye icon button is clicked", () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    const passwordInput = screen.getByLabelText(/^password$/i);
    const toggleEyeBtn = screen.getByRole("button", { name: /show password/i });

    expect(passwordInput.type).toBe("password");
    fireEvent.click(toggleEyeBtn);
    expect(passwordInput.type).toBe("text");
    fireEvent.click(toggleEyeBtn);
    expect(passwordInput.type).toBe("password");
  });

  test("requires bot protection check before submitting", async () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const submitBtn = screen.getByRole("button", { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: "admin@hpms.com" } });
    fireEvent.change(passwordInput, { target: { value: "admin123" } });
    fireEvent.click(submitBtn);

    expect(screen.getByRole("alert")).toHaveTextContent(/please complete the bot protection security check/i);
    expect(authApi.loginApi).not.toHaveBeenCalled();
  });

  test("submits form successfully when bot check is verified", async () => {
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
    const passwordInput = screen.getByLabelText(/^password$/i);
    const botCheckbox = screen.getByLabelText(/i am not a bot/i);
    const submitBtn = screen.getByRole("button", { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: "admin@hpms.com" } });
    fireEvent.change(passwordInput, { target: { value: "admin123" } });
    fireEvent.click(botCheckbox);
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(authApi.loginApi).toHaveBeenCalledWith({
        email: "admin@hpms.com",
        password: "admin123",
        website_hp: "",
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
    const passwordInput = screen.getByLabelText(/^password$/i);
    const botCheckbox = screen.getByLabelText(/i am not a bot/i);
    const submitBtn = screen.getByRole("button", { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: "wrong@hpms.com" } });
    fireEvent.change(passwordInput, { target: { value: "WrongPass" } });
    fireEvent.click(botCheckbox);
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Invalid email or password");
    });
  });
});
