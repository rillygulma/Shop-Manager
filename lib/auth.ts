import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export interface AuthUser {
  userId: string;
  role: "admin" | "sales";
  iat?: number;
  exp?: number;
}

function isAuthUser(payload: unknown): payload is AuthUser {
  if (typeof payload !== "object" || payload === null) {
    return false;
  }

  const typedPayload = payload as { userId?: unknown; role?: unknown };
  return (
    typeof typedPayload.userId === "string" &&
    (typedPayload.role === "admin" || typedPayload.role === "sales")
  );
}

// ✅ SIGN TOKEN (works in Node)
export async function signToken(payload: Record<string, unknown>) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1d")
    .setIssuedAt()
    .sign(secret);
}

// ✅ VERIFY TOKEN (works in Edge 🚀)
export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret);

    if (!isAuthUser(payload)) {
      return null;
    }

    return payload;
  } catch (error) {
    console.log("JWT ERROR:", error);
    return null;
  }
}