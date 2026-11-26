import { changeEmail } from "./changeEmail";
import { REGISTRATION_MESSAGES } from "../registration/errors";
import { userRepository } from "../users/userRepository";

const john = { id: 1, email: "john@example.com", username: "John_Doe" };
const olena = { id: 2, email: "olena@example.com", username: "olena_m" };

function profileError(expected: object) {
  return expect.objectContaining({ name: "ProfileError", ...expected });
}

beforeEach(() => {
  userRepository.reset();
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("changeEmail", () => {
  // AC1
  it("changes email to a free valid address", () => {
    const updated = { ...john, email: "john.new@example.com" };

    expect(changeEmail(1, "john.new@example.com")).toEqual(updated);
    expect(userRepository.findById(1)).toEqual(updated);
    expect(userRepository.findByEmail("john.new@example.com")?.id).toBe(1);
    expect(userRepository.findByEmail("john@example.com")).toBeUndefined();
  });

  // AC2
  it("rejects an invalid email with the registration validation error", () => {
    expect(() => changeEmail(1, "not-an-email")).toThrow(
      profileError({
        code: "INVALID_INPUT",
        message: REGISTRATION_MESSAGES.INVALID_INPUT,
        fields: { email: ["must be a valid email"] },
      }),
    );
    expect(userRepository.findById(1)).toEqual(john);
  });

  // AC3
  it("rejects an email owned by another user", () => {
    expect(() => changeEmail(1, "olena@example.com")).toThrow(
      profileError({ code: "EMAIL_TAKEN", message: REGISTRATION_MESSAGES.EMAIL_TAKEN }),
    );
    expect(userRepository.findById(1)).toEqual(john);
    expect(userRepository.findById(2)).toEqual(olena);
  });

  // AC4
  it("does nothing when the new email equals the current one", () => {
    const updateEmail = jest.spyOn(userRepository, "updateEmail");

    expect(changeEmail(1, "john@example.com")).toEqual(john);
    expect(userRepository.findById(1)).toEqual(john);
    expect(updateEmail).not.toHaveBeenCalled();
  });

  // AC5
  it("treats a differently cased/padded current email as unchanged", () => {
    const updateEmail = jest.spyOn(userRepository, "updateEmail");

    expect(changeEmail(1, "  John@Example.COM  ")).toEqual(john);
    expect(userRepository.findById(1)).toEqual(john);
    expect(updateEmail).not.toHaveBeenCalled();
  });

  // AC6
  it("rejects another user's email regardless of case", () => {
    expect(() => changeEmail(1, "Olena@Example.com")).toThrow(
      profileError({ code: "EMAIL_TAKEN" }),
    );
    expect(userRepository.findById(1)).toEqual(john);
    expect(userRepository.findById(2)).toEqual(olena);
  });

  // AC7
  it("throws USER_NOT_FOUND for an unknown user id", () => {
    expect(() => changeEmail(999, "x@example.com")).toThrow(
      profileError({ code: "USER_NOT_FOUND" }),
    );
    expect(userRepository.findByEmail("x@example.com")).toBeUndefined();
  });
});
