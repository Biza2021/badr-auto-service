"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  authConfigurationReady,
  clearSessionCookie,
  createSessionToken,
  setSessionCookie
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const loginSchema = z.object({
  email: z.string().email("Adresse e-mail invalide."),
  password: z.string().min(1, "Veuillez saisir le mot de passe.")
});

function clean(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export async function loginAction(formData: FormData) {
  if (!authConfigurationReady()) {
    redirect("/admin/login?erreur=Configuration%20AUTH_SECRET%20manquante%20ou%20trop%20courte.");
  }

  const parsed = loginSchema.safeParse({
    email: clean(formData.get("email")).toLowerCase(),
    password: clean(formData.get("password"))
  });

  if (!parsed.success) {
    const message = encodeURIComponent(parsed.error.issues[0]?.message ?? "Veuillez vérifier le formulaire.");
    redirect(`/admin/login?erreur=${message}`);
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email }
  });

  if (!user) {
    redirect("/admin/login?erreur=Identifiants%20incorrects.");
  }

  const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!valid) {
    redirect("/admin/login?erreur=Identifiants%20incorrects.");
  }

  await setSessionCookie(createSessionToken(user.id));
  redirect("/admin");
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/admin/login");
}
