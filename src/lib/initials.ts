import { type Session } from "next-auth";

export function initialsOfUser(data: Session): string {
  const name = data.user.name;
  if (!name) {
    return "";
  }
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("");
  return initials;
}
