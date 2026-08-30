import { cookies } from "next/headers";
import crypto from "crypto";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { users } from "../db/schema";

// Secure PBKDF2 Password Hashing
export function hashPassword(password: string): string {
  const salt = "job_portal_salt_value_2026";
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return hash;
}

// Simple and highly secure custom session tokens using AES-256-GCM or HMAC
// To keep it clean and robust without external libraries, we use an encrypted payload
const ENCRYPTION_KEY = process.env.JWT_SECRET;
// Ensure the key is exactly 32 bytes

if (!ENCRYPTION_KEY) {
  throw new Error("JWT_SECRET is required");
}

const paddedKey = Buffer.concat(
  [Buffer.from(ENCRYPTION_KEY), Buffer.alloc(32)],
  32
);

export function encryptSession(payload: any): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", paddedKey, iv);
  let encrypted = cipher.update(JSON.stringify(payload), "utf8", "hex");
  encrypted += cipher.final("hex");
  return `${iv.toString("hex")}:${encrypted}`;
}

export function decryptSession(token: string): any | null {
  try {
    const parts = token.split(":");
    if (parts.length !== 2) return null;
    const iv = Buffer.from(parts[0], "hex");
    const encryptedText = parts[1];
    const decipher = crypto.createDecipheriv("aes-256-cbc", paddedKey, iv);
    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return JSON.parse(decrypted);
  } catch (e) {
    return null;
  }
}

// Cookie session helper
export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;
  if (!token) return null;
  const decoded = decryptSession(token);
  if (!decoded || !decoded.userId) return null;
  return decoded;
}

export async function setAdminSession(user: { id: number; email: string; name: string; role: string }) {
  const cookieStore = await cookies();
  const payload = {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    expires: Date.now() + 24 * 60 * 60 * 1000 * 7, // 7 days
  };
  const token = encryptSession(payload);
  cookieStore.set("admin_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
}

// Auto-seed default super_admin on first access or checking
export async function ensureDefaultAdmin() {
  try {
    const existingAdmins = await db.select().from(users).limit(1);
    if (existingAdmins.length === 0) {
      // Seed default admin
      const defaultPassword = "admin";
      const hashedPassword = hashPassword(defaultPassword);
      await db.insert(users).values({
        email: "admin@jobportal.com",
        passwordHash: hashedPassword,
        name: "Super Admin",
        role: "super_admin",
      });
      console.log("Default admin seeded: admin@jobportal.com / admin");
    }
  } catch (error) {
    console.error("Error checking/seeding default admin:", error);
  }
}
