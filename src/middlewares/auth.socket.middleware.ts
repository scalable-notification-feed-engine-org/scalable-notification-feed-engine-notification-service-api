import * as jwt from "jsonwebtoken";
import webclient from 'jwks-rsa'
import {Socket} from "socket.io";


export interface AuthenticatedSocket extends Socket {
    userId?: string;
    tenantId?: string;
}

const client = webclient({
    jwksUri: process.env.JWKS_URI!,
    cache: true,
    rateLimit: true
});


function getKey(header: jwt.JwtHeader, callback: jwt.SigningKeyCallback) {
    client.getSigningKey(header.kid, (err, key: any) =>{
        if (err) return callback(err);

        const signingKey = key?.publicKey();
        callback(null, signingKey);
    })
}

export const socketKeycloakMiddleware = (socket: AuthenticatedSocket, next: any) =>{

    const token = socket.handshake.auth?.token;

    if (!token) return next(new Error('Authentication error: Token missing'));

    jwt.verify(token, getKey, { algorithms: ['RS256'] }, (err, decoded: any) => {
        if (err) return next(new Error('Authentication failed'));

        socket.userId = decoded.sub;
        socket.tenantId = decoded.tenantId || decoded.group_id;

        next();
    })

}