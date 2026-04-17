import {Response, Request, NextFunction} from "express";
import jwt from "jsonwebtoken";

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    console.log("🚀 Auth Middleware Started...");

    try {
        const authHeader = req.headers.authorization;
        console.log("📡 Header Received:", authHeader ? "YES" : "NO");

        const token = authHeader?.split(' ')[1];
        if (!token) {
            console.log("❌ No Token Found");
            return res.status(401).json({ message: "Unauthorized" });
        }

        const rawKey = process.env.JWT_PUBLIC_KEY;
        console.log("🔑 Raw Key from ENV:", rawKey ? "LOADED" : "MISSING");

        if (!rawKey) {
            throw new Error("JWT_PUBLIC_KEY is not defined in .env");
        }

        // PEM formatting
        const cleanKey = rawKey.replace(/\s/g, '');
        const keyLines = cleanKey.match(/.{1,64}/g);

        if (!keyLines) {
            throw new Error("Key Formatting failed - Regex match returned null");
        }

        const formattedKey = `-----BEGIN CERTIFICATE-----\n${keyLines.join('\n')}\n-----END CERTIFICATE-----`;

        console.log("⚖️ Attempting JWT Verification...");
        const decoded = jwt.verify(token, formattedKey, { algorithms: ['RS256'] });

        console.log("✅ Verification Success! User ID:", (decoded as any).sub);
        (req as any).user = decoded;
        next();

    } catch (err: any) {

        console.error("🔥 CRITICAL MIDDLEWARE ERROR:", err.message);
        console.error("🔥 FULL ERROR STACK:", err.stack);

        // @ts-ignore
        return res.status(500).json({
            message: "Internal Server Error",
            dev_error: err.message
        });
    }
};