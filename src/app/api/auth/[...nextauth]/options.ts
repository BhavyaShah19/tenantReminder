import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import {Provider} from '@prisma/client';

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        CredentialsProvider({
            id: 'credentials',
            name: 'CREDENTIALS',
            credentials: {
                identifier: { label: 'Email', type: 'text' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials: any): Promise<any> { 
                if (!credentials?.identifier || !credentials?.password) {
                    return null;
                }
                try {
                    const user = await prisma.owner.findUnique({
                        where: {
                            email:credentials.identifier
                        },
                    });
                    if (!user || !user.password) {
                        throw new Error('No user found');
                    }
                    const isPasswordCorrect = await bcrypt.compare(
                        credentials.password,
                        user.password
                    );
                    if (isPasswordCorrect) {
                        return user;
                    } else {
                        throw new Error('Incorrect password');
                    }
                } catch (err: any) {
                    console.error('Credentials authorize error:', err); 
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            if (account?.provider === 'google' && profile?.email) {
                let existingOwner = await prisma.owner.findFirst({
                    where: {
                        email: profile.email,
                    },
                });
                if (!existingOwner) {
                    existingOwner = await prisma.owner.create({
                        data: {
                            email: profile.email,
                            username: profile.email,
                            provider: Provider.GOOGLE,
                        },
                    });
                }
                user.id =existingOwner.id;
                return true;
            }
            if(account?.provider === 'credentials'){
                return true; 
            }
            return false;
        },
        async jwt({ token, user }) {
            if (user) {
                token._id = user.id?.toString();
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token._id;
            }
            return session;
        },
    },
    session: {
        strategy: 'jwt',
    },
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: '/signin',
    },
};