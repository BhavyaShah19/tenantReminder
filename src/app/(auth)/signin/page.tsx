'use client'
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Building2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { signInSchema } from '@/schemas/signInSchema';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from "next/navigation"
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { User } from 'next-auth';
type SignInFormData = z.infer<typeof signInSchema>;

const SignIn = () => {
    const router = useRouter();
    const { toast } = useToast();
    const { data: session } = useSession()
    const user: User = session?.user as User

    const form = useForm<SignInFormData>({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            identifier: '',
            password: ''
        }
    })

    const onSubmit = async (data: z.infer<typeof signInSchema>) => {
        const result = await signIn('credentials', {
            redirect: false,
            identifier: data.identifier,
            password: data.password
        })
        if (result?.error) {
            if (result.error === 'CredentialsSignin') {
                toast({
                    title: 'Login Failed',
                    description: 'Incorrect username or password',
                    variant: 'destructive',
                });
            } else {
                toast({
                    title: 'Sorry!',
                    description: result.error,
                    variant: 'destructive',
                });
            }
        }
        if (result?.url) {
            toast({
                title: 'Success',
                description: `Welcome! ${user?.name}`,
            });
            router.replace(`/dashboard`)
        }
    }

    const handleGoogleSignIn = async () => {
        const res = await signIn('google');
        if (res?.error) {
            toast({
                title: 'Error',
                description: `${res.error}`,
                variant: 'destructive',
            });
        }
        else {
            toast({
                title: 'Success',
                description: `Welcome back owner!`,
            });
            router.replace(`/dashboard`)
        }
    }
    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center">
                            <Building2 className="h-8 w-8 text-primary-foreground" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl">Sign In</CardTitle>
                    <CardDescription>Sign in to your Tenant Alert Pro account</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="identifier"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="your@email.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="Enter password" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button type="submit" className="w-full">Sign In</Button>
                        </form>
                    </Form>

                    <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                        </div>
                    </div>

                    <Button
                        type="button"
                        className="w-full"
                        onClick={handleGoogleSignIn}
                    >
                        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            />
                        </svg>
                        Continue with Google
                    </Button>

                    <div className="mt-4 text-center text-sm">
                        Don't have an account?{' '}
                        <Link href="/signup" className="text-primary hover:underline">
                            Sign Up
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default SignIn;
