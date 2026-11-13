import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

export const runtime = "nodejs";

interface EnquiryPayload {
  name?: string;
  phone?: string;
  email?: string;
  industry?: string;
  requirement?: string;
  message?: string;
  website?: string;
  consent?: boolean;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  gclid?: string;
  fbclid?: string;
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  // Matches Indian 10-digit mobile or international 8-15 digit numbers
  return digits.length >= 8 && digits.length <= 15;
}

export async function POST(request: Request) {
  const clientIp = getClientIp(request);
  const rateLimit = checkRateLimit(`enquiry:${clientIp}`, 8, 10 * 60 * 1000); // 8 submissions per 10 mins

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { message: "Too many enquiries submitted from your network. Please wait a few minutes before trying again." },
      { status: 429 }
    );
  }

  let body: EnquiryPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request data. Please check the form." }, { status: 400 });
  }

  // Honeypot trap: silently return ok without saving spam
  if (body.website) {
    return NextResponse.json({ ok: true });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const industry = typeof body.industry === "string" ? body.industry.trim() : "";
  const requirement = typeof body.requirement === "string" ? body.requirement.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";

  const utm_source = typeof body.utm_source === "string" ? body.utm_source.slice(0, 100) : "";
  const utm_medium = typeof body.utm_medium === "string" ? body.utm_medium.slice(0, 100) : "";
  const utm_campaign = typeof body.utm_campaign === "string" ? body.utm_campaign.slice(0, 150) : "";
  const utm_term = typeof body.utm_term === "string" ? body.utm_term.slice(0, 150) : "";
  const utm_content = typeof body.utm_content === "string" ? body.utm_content.slice(0, 150) : "";
  const gclid = typeof body.gclid === "string" ? body.gclid.slice(0, 200) : "";
  const fbclid = typeof body.fbclid === "string" ? body.fbclid.slice(0, 200) : "";

  if (name.length < 2 || name.length > 120) {
    return NextResponse.json({ message: "Please provide your full name." }, { status: 400 });
  }
  if (!isValidPhone(phone)) {
    return NextResponse.json({ message: "Please enter a valid phone number." }, { status: 400 });
  }
  if (!isEmail(email) || email.length > 254) {
    return NextResponse.json({ message: "Please enter a valid email address." }, { status: 400 });
  }
  if (body.consent !== true) {
    return NextResponse.json({ message: "Please accept the privacy consent to submit." }, { status: 400 });
  }

  try {
    const db = getDb();
    const insertStmt = db.prepare(`
      INSERT INTO leads (
        name, phone, email, industry, requirement, message,
        utm_source, utm_medium, utm_campaign, utm_term, utm_content, gclid, fbclid
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insertStmt.run(
      name,
      phone,
      email,
      industry,
      requirement,
      message,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_term,
      utm_content,
      gclid,
      fbclid
    );

    // Optional webhook forwarding (non-blocking secondary notification)
    const webhookUrl = process.env.ENQUIRY_WEBHOOK_URL;
    if (webhookUrl) {
      fetch(webhookUrl, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(process.env.ENQUIRY_WEBHOOK_TOKEN
            ? { authorization: `Bearer ${process.env.ENQUIRY_WEBHOOK_TOKEN}` }
            : {}),
        },
        body: JSON.stringify({
          leadId: Number(result.lastInsertRowid),
          name,
          phone,
          email,
          industry,
          requirement,
          message,
          utm_source,
          utm_medium,
          utm_campaign,
          utm_term,
          utm_content,
          gclid,
          fbclid,
          submittedAt: new Date().toISOString(),
        }),
        signal: AbortSignal.timeout(5000),
      }).catch((err) => {
        console.error("Secondary webhook forward failed:", err);
      });
    }

    return NextResponse.json({
      ok: true,
      leadId: Number(result.lastInsertRowid),
      message: "Thank you. Your enquiry has been received and our project director will contact you promptly.",
    });
  } catch (error) {
    console.error("Failed to store lead:", error);
    return NextResponse.json(
      { message: "Could not save your enquiry right now. Please try calling directly." },
      { status: 500 }
    );
  }
}
