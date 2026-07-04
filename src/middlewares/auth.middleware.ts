import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const authenticate = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const token = authHeader.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const rawKey = process.env.JWT_PUBLIC_KEY;

        if (!rawKey) {
            throw new Error("JWT_PUBLIC_KEY missing in environment");
        }

        const publicKey = rawKey.replace(/\\n/g, "\n");

        const decoded = jwt.verify(token, publicKey, {
            algorithms: ["RS256"],
        });

        (req as any).user = decoded;

        next();
    } catch (err: any) {
        return res.status(401).json({
            message: "Invalid or expired token",
        });
    }
};