import { SignJWT, jwtVerify } from "jose";

export const COOKIE_NAME = "lentera_token";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "lentera-fallback-secret-change-in-production"
);

export interface AuthPayload {
  id: string;
  email: string;
  name: string;
  role: "SUPER_ADMIN" | "ADMIN" | "USER";
}

export async function createToken(payload: AuthPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secret);
}

export async function verifyToken(token: string): Promise<AuthPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as AuthPayload;
  } catch {
    return null;
  }
}
