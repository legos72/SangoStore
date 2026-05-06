import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST  || "smtp.gmail.com",
  port:   parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM = `"SangoStore" <${process.env.SMTP_USER || "noreply@sangostore.com"}>`;
const FRONTEND = process.env.FRONTEND_URL || "http://localhost:3000";

async function send(to: string, subject: string, html: string) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return;
  try {
    await transporter.sendMail({ from: FROM, to, subject, html });
  } catch (err) {
    console.error("[Email] Échec d'envoi vers", to, err);
  }
}

export async function sendAccountPendingEmail(to: string, name: string, role: string) {
  const roleLabel = role === "vendeur" ? "vendeur" : "transporteur";
  await send(to, "Votre compte SangoStore est en cours de validation", `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#fff;">
      <div style="text-align:center;margin-bottom:32px;">
        <div style="display:inline-block;background:#f97316;border-radius:16px;padding:12px 16px;">
          <span style="font-size:24px;font-weight:900;color:#fff;">SangoStore</span>
        </div>
      </div>
      <h2 style="color:#111827;font-size:20px;margin-bottom:8px;">Bonjour ${name} 👋</h2>
      <p style="color:#374151;line-height:1.6;">
        Votre demande de compte <strong>${roleLabel}</strong> a bien été reçue.<br/>
        Notre équipe va examiner votre profil et vous recontactera dans les <strong>24 à 48h</strong>.
      </p>
      <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:16px;margin:24px 0;">
        <p style="color:#9a3412;font-size:14px;margin:0;">
          ⏳ <strong>Compte en attente de validation</strong><br/>
          Vous recevrez un email dès que votre compte sera approuvé ou refusé.
        </p>
      </div>
      <p style="color:#6b7280;font-size:13px;">
        En cas de question, répondez à cet email ou contactez-nous via <a href="${FRONTEND}" style="color:#f97316;">${FRONTEND}</a>.
      </p>
    </div>
  `);
}

export async function sendAccountApprovedEmail(to: string, name: string, role: string) {
  const roleLabel = role === "vendeur" ? "vendeur" : "transporteur";
  await send(to, "🎉 Votre compte SangoStore a été approuvé !", `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#fff;">
      <div style="text-align:center;margin-bottom:32px;">
        <div style="display:inline-block;background:#f97316;border-radius:16px;padding:12px 16px;">
          <span style="font-size:24px;font-weight:900;color:#fff;">SangoStore</span>
        </div>
      </div>
      <h2 style="color:#111827;font-size:20px;margin-bottom:8px;">Félicitations ${name} ! 🎉</h2>
      <p style="color:#374151;line-height:1.6;">
        Votre compte <strong>${roleLabel}</strong> a été <span style="color:#16a34a;font-weight:600;">approuvé</span>.<br/>
        Vous pouvez maintenant vous connecter et accéder à toutes les fonctionnalités.
      </p>
      <div style="text-align:center;margin:28px 0;">
        <a href="${FRONTEND}/auth/login"
           style="background:#f97316;color:#fff;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:700;font-size:15px;">
          Se connecter maintenant →
        </a>
      </div>
      <p style="color:#6b7280;font-size:13px;">Bienvenue sur SangoStore !</p>
    </div>
  `);
}

export async function sendAccountRejectedEmail(to: string, name: string, reason?: string) {
  await send(to, "Votre demande de compte SangoStore", `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#fff;">
      <div style="text-align:center;margin-bottom:32px;">
        <div style="display:inline-block;background:#f97316;border-radius:16px;padding:12px 16px;">
          <span style="font-size:24px;font-weight:900;color:#fff;">SangoStore</span>
        </div>
      </div>
      <h2 style="color:#111827;font-size:20px;margin-bottom:8px;">Bonjour ${name},</h2>
      <p style="color:#374151;line-height:1.6;">
        Après examen de votre dossier, nous ne sommes malheureusement pas en mesure de valider votre compte pour le moment.
      </p>
      ${reason ? `
      <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:16px;margin:16px 0;">
        <p style="color:#991b1b;font-size:14px;margin:0;"><strong>Motif :</strong><br/>${reason}</p>
      </div>` : ""}
      <p style="color:#374151;line-height:1.6;">
        Si vous pensez qu'il s'agit d'une erreur, n'hésitez pas à nous contacter en répondant à cet email.
      </p>
      <p style="color:#6b7280;font-size:13px;margin-top:24px;">L'équipe SangoStore</p>
    </div>
  `);
}

export async function sendAccountSuspendedEmail(to: string, name: string) {
  await send(to, "Votre compte SangoStore a été suspendu", `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#fff;">
      <div style="text-align:center;margin-bottom:32px;">
        <div style="display:inline-block;background:#f97316;border-radius:16px;padding:12px 16px;">
          <span style="font-size:24px;font-weight:900;color:#fff;">SangoStore</span>
        </div>
      </div>
      <h2 style="color:#111827;font-size:20px;margin-bottom:8px;">Bonjour ${name},</h2>
      <p style="color:#374151;line-height:1.6;">
        Votre compte a été <strong style="color:#dc2626;">suspendu</strong> par l'administration.
        Vous ne pouvez plus accéder à votre espace jusqu'à levée de la suspension.
      </p>
      <p style="color:#374151;line-height:1.6;">
        Pour contester cette décision, répondez à cet email.
      </p>
      <p style="color:#6b7280;font-size:13px;margin-top:24px;">L'équipe SangoStore</p>
    </div>
  `);
}

export async function sendAdminMessageEmail(to: string, name: string, subject: string, message: string) {
  await send(to, subject, `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#fff;">
      <div style="text-align:center;margin-bottom:32px;">
        <div style="display:inline-block;background:#f97316;border-radius:16px;padding:12px 16px;">
          <span style="font-size:24px;font-weight:900;color:#fff;">SangoStore</span>
        </div>
      </div>
      <h2 style="color:#111827;font-size:20px;margin-bottom:8px;">Bonjour ${name},</h2>
      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin:16px 0;white-space:pre-wrap;color:#374151;line-height:1.6;">
        ${message.replace(/\n/g, "<br>")}
      </div>
      <p style="color:#6b7280;font-size:13px;margin-top:24px;">
        L'équipe SangoStore &mdash; <a href="${FRONTEND}" style="color:#f97316;">${FRONTEND}</a>
      </p>
    </div>
  `);
}
