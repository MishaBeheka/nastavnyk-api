import { ProfileError } from "./errors";
import { userRepository, User } from "../users/userRepository";
import { normalizeEmail, validateEmail } from "../validation/email";

export function changeEmail(userId: number, newEmail: string): User {
  const user = userRepository.findById(userId);
  if (!user) throw new ProfileError("USER_NOT_FOUND");

  const email = normalizeEmail(newEmail);
  const emailErrors = validateEmail(email);
  if (emailErrors.length) throw new ProfileError("INVALID_INPUT", { email: emailErrors });

  if (email === user.email) return user;

  const owner = userRepository.findByEmail(email);
  if (owner && owner.id !== user.id) throw new ProfileError("EMAIL_TAKEN");

  return userRepository.updateEmail(user.id, email);
}
