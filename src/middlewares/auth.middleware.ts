import * as jwt from "jsonwebtoken";
import webclient from 'jwks-rsa'
import {Socket} from "socket.io";


export interface AuthenticatedSocket extends Socket {
    userId?: string;
    tenantId?: string;
}

const client = webclient({
    jwksUri: process.env.JWKS_URI!,
});


function getKey(header: any, callback: any) {
    client.getSigningKey(header.key, (err, key: any) =>{
        const signingKey = key.publicKey || key.rsaPublicKey;
        callback(null, signingKey);
    })
}

export const socketKeycloakMiddleware = (socket: AuthenticatedSocket, next: any) =>{

    const token = socket.handshake.auth?.token;

    if (!token) return next(new Error('Authentication error: Token missing'));

    jwt.verify(token, getKey, { algorithms: ['RS256'] }, (err, decoded: any) => {
        if (err) return next(new Error('Authentication failed'));

        socket.userId = decoded.sub;
        socket.tenantId = decoded.tenantId;

        next();
    })

}