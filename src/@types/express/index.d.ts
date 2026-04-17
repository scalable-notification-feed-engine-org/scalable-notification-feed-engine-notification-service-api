import  "express";

declare global {
    namespace Express {
        interface Request {
            user?: {
                sub: string;
                email?: string;
                preferred_username?: string;
                tenantId?: string;
                [key: string]: any;
            };
        }
    }
}

export {};