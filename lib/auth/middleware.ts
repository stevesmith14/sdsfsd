import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "./jwt";

export async function getAuthUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) {
      return null;
    }
    return verifyToken(token);
  } catch (err) {
    console.error("error in getAuthUser : ", err);
    return null;
  }
}

export async function requireAuth(): Promise<{ user: any } | NextResponse> {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json(
      { success: false, error: "Unauthorized. Please log in." },
      { status: 401 },
    );
  }
  return { user };
}
