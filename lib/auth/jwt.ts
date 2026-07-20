import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET!;

export function signToken(payload: object): string {
  return jwt.sign(payload, SECRET, {
    expiresIn: "7d",
  });
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, SECRET);
  } catch (err) {
    console.error("error in verify route :", err);
  }
}
