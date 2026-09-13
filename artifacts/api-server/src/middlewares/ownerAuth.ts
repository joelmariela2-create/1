import { clerkClient, getAuth } from "@clerk/express";
import type { NextFunction, Request, Response } from "express";

export async function requireOwner(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const configuredEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!configuredEmail) {
    req.log.error("ADMIN_EMAIL is not configured");
    res.status(403).json({ error: "Owner access is not configured" });
    return;
  }

  try {
    const user = await clerkClient.users.getUser(userId);
    const isOwner = user.emailAddresses.some(
      (email) => email.emailAddress.trim().toLowerCase() === configuredEmail,
    );

    if (!isOwner) {
      res.status(403).json({ error: "Owner access required" });
      return;
    }

    next();
  } catch (error) {
    req.log.error({ err: error }, "Unable to verify owner access");
    res.status(403).json({ error: "Owner access could not be verified" });
  }
}