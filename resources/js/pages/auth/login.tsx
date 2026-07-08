import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import { Form, Head } from '@inertiajs/react';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
}

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: LoginProps) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <AuthLayout
            title="Ingresá a tu cuenta"
            description="Accedé a ExaDocs para subir, revisar y colaborar con la comunidad académica."
        >
            <Head title="Iniciar sesión" />

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-5">
                            <div className="grid gap-2">
                                <Label htmlFor="email" className="text-muted-foreground font-semibold text-[10px] tracking-wider uppercase">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder="ejemplo@correo.com"
                                    className="bg-background border-input text-foreground focus-visible:ring-ring focus-visible:border-ring rounded-xl h-10 px-3 placeholder:text-muted-foreground/40 transition-all duration-150 shadow-none"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-muted-foreground font-semibold text-[10px] tracking-wider uppercase">Contraseña</Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="text-primary hover:underline text-xs font-medium transition-colors duration-150"
                                            tabIndex={5}
                                        >
                                            ¿Olvidaste la contraseña?
                                        </TextLink>
                                    )}
                                </div>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        required
                                        tabIndex={2}
                                        autoComplete="current-password"
                                        placeholder="••••••••"
                                        className="bg-background border-input text-foreground focus-visible:ring-ring focus-visible:border-ring rounded-xl h-10 pl-3 pr-10 placeholder:text-muted-foreground/40 transition-all duration-150 shadow-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/80 hover:text-foreground focus:outline-none transition-colors"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4.5 w-4.5" />
                                        ) : (
                                            <Eye className="h-4.5 w-4.5" />
                                        )}
                                    </button>
                                </div>
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center space-x-2.5 py-1">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                    className="border-input data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground rounded"
                                />
                                <Label htmlFor="remember" className="text-foreground/80 text-xs font-medium cursor-pointer">
                                    Mantener sesión activa
                                </Label>
                            </div>

                            <Button
                                type="submit"
                                className="mt-2 w-full h-10 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all duration-150"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing && <Spinner className="text-primary-foreground" />}
                                Ingresar
                            </Button>
                        </div>

                        {canRegister && (
                            <div className="text-center text-xs text-muted-foreground pt-2">
                                ¿Todavía no tenés cuenta?{' '}
                                <TextLink href={register()} className="text-primary hover:underline font-semibold" tabIndex={5}>
                                    Crear cuenta
                                </TextLink>
                            </div>
                        )}
                    </>
                )}
            </Form>

            {status && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {status}
                </div>
            )}
        </AuthLayout>
    );
}
