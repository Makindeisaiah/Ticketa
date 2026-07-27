import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import twilio from "twilio";
import cors from "cors";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cors());

  // API Routes
  app.post("/api/send-sms", async (req, res) => {
    try {
      const { to, message } = req.body;
      
      if (!to || !message) {
        return res.status(400).json({ error: "Missing 'to' or 'message' field" });
      }

      // Sanitize recipient phone number
      let rawPhone = String(to).trim();
      // Replace placeholder 'X' or 'x' characters with digits if present
      if (/x/i.test(rawPhone)) {
        rawPhone = rawPhone.replace(/x/gi, "0");
      }

      const hasPlus = rawPhone.startsWith("+");
      const digitsOnly = rawPhone.replace(/\D/g, "");

      if (digitsOnly.length < 7) {
        return res.status(400).json({ error: `Invalid recipient phone number '${to}'. Must contain at least 7 valid digits.` });
      }

      // Format E.164 phone number
      let formattedTo = hasPlus 
        ? `+${digitsOnly}` 
        : (digitsOnly.startsWith("0") ? `+234${digitsOnly.slice(1)}` : `+1${digitsOnly}`);

      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const fromNumber = process.env.TWILIO_PHONE_NUMBER;

      if (!accountSid || !authToken || !fromNumber) {
        return res.status(400).json({ 
          error: "Twilio credentials are not configured in the server environment. Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER." 
        });
      }

      const client = twilio(accountSid, authToken);
      const result = await client.messages.create({
        body: message,
        from: fromNumber,
        to: formattedTo
      });

      return res.json({ success: true, sid: result.sid });
    } catch (err: any) {
      console.warn("SMS dispatch error:", err?.message || err);
      // Clean handling for Twilio RestExceptions (e.g. Code 21211: Invalid 'To' Phone Number)
      if (err.code === 21211 || (err.message && err.message.includes("Invalid 'To' Phone Number"))) {
        return res.status(400).json({ 
          error: `Invalid 'To' Phone Number provided (${req.body.to}). Please provide a valid phone number in international E.164 format.` 
        });
      }
      return res.status(400).json({ error: err.message || "Failed to send SMS" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
