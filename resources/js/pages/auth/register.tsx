import { login } from '@/routes';
import { store } from '@/routes/register';
import { Form, Head } from '@inertiajs/react';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    return (
        <AuthLayout
            title="Crea tu cuenta"
            description="Unite a ExaDocs para compartir, revisar y colaborar con la comunidad académica."
        >
            <Head title="Registro" />
            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-5">
                            <div className="grid gap-2">
                                <Label htmlFor="name" className="text-muted-foreground font-semibold text-[10px] tracking-wider uppercase">Nombre de Usuario</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="name"
                                    name="name"
                                    placeholder="Usuario"
                                    className="bg-background border-input text-foreground focus-visible:ring-ring focus-visible:border-ring rounded-xl h-10 px-3 placeholder:text-muted-foreground/40 transition-all duration-150 shadow-none"
                                />
                                <InputError
                                    message={errors.name}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email" className="text-muted-foreground font-semibold text-[10px] tracking-wider uppercase">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    tabIndex={2}
                                    autoComplete="email"
                                    name="email"
                                    placeholder="ejemplo@correo.com"
                                    className="bg-background border-input text-foreground focus-visible:ring-ring focus-visible:border-ring rounded-xl h-10 px-3 placeholder:text-muted-foreground/40 transition-all duration-150 shadow-none"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password" className="text-muted-foreground font-semibold text-[10px] tracking-wider uppercase">Contraseña</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        tabIndex={3}
                                        autoComplete="new-password"
                                        name="password"
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

                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation" className="text-muted-foreground font-semibold text-[10px] tracking-wider uppercase">
                                    Confirmar contraseña
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="password_confirmation"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        required
                                        tabIndex={4}
                                        autoComplete="new-password"
                                        name="password_confirmation"
                                        placeholder="Repetí la contraseña"
                                        className="bg-background border-input text-foreground focus-visible:ring-ring focus-visible:border-ring rounded-xl h-10 pl-3 pr-10 placeholder:text-muted-foreground/40 transition-all duration-150 shadow-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/80 hover:text-foreground focus:outline-none transition-colors"
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="h-4.5 w-4.5" />
                                        ) : (
                                            <Eye className="h-4.5 w-4.5" />
                                        )}
                                    </button>
                                </div>
                                <InputError
                                    message={errors.password_confirmation}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="mt-2 w-full h-10 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all duration-150"
                                tabIndex={5}
                                data-test="register-user-button"
                            >
                                {processing && <Spinner className="text-primary-foreground" />}
                                Crear cuenta
                            </Button>
                        </div>

                        <div className="text-center text-xs text-muted-foreground pt-2">
                            ¿Ya tenés cuenta?{' '}
                            <TextLink href={login()} className="text-primary hover:underline font-semibold" tabIndex={6}>
                                Iniciar sesión
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}
