import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("Please add your JWT_SECRET to .env.local");
}

export interface SessionPayload {
  address: string;
  iat?: number;
  exp?: number;
}

const COOKIE_NAME = "supershares_session";
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds
const isProduction = process.env.NODE_ENV === "production";

export async function createSession(address: string): Promise<string> {
  const token = jwt.sign({ address }, JWT_SECRET as string, {
    expiresIn: "7d",
  });

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });

  return token;
}

export async function getSession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;

    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, JWT_SECRET as string ) as SessionPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

