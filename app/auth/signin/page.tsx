import { signIn } from "@/auth"
import { AuthError } from "next-auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default async function SignInPage({
  searchParams,
}: {
  // 2. Wrap the searchParams type in a Promise
  searchParams: Promise<{ callbackUrl?: string; error?: string }>
}) {
  const resolvedParams = await searchParams

  const callbackUrl = resolvedParams.callbackUrl ?? "/dashboard"
  const error = resolvedParams.error

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-10 p-4">
      <Link href="/">
        <Image
          src="/images/logo.png"
          alt="Villa de la Robla Logo"
          className="h-40 w-auto object-contain"
          width={1920}
          height={1080}
        />
      </Link>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Iniciar sesión</CardTitle>
          <CardDescription>
            Introduce tus credenciales de administrador
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action={async (formData) => {
              "use server"
              try {
                await signIn("credentials", {
                  email: formData.get("email") as string,
                  password: formData.get("password") as string,
                  redirectTo: callbackUrl,
                })
              } catch (error) {
                if (error instanceof AuthError) {
                  redirect(
                    `/auth/signin?error=CredentialsSignin&callbackUrl=${encodeURIComponent(callbackUrl)}`
                  )
                }
                throw error
              }
            }}
            className="flex flex-col gap-4"
          >
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="admin@example.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            {error && (
              <p className="text-sm text-red-600">
                Credenciales inválidas. Inténtalo de nuevo.
              </p>
            )}
            <Button type="submit" className="w-full">
              Entrar
            </Button>
          </form>
        </CardContent>
      </Card>
      <Link
        href="/"
        className="text-sm text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
      >
        Volver a Inicio
      </Link>
    </div>
  )
}
