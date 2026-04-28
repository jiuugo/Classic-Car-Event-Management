import PublicHeader from "@/components/public/PublicHeader"
import PublicFooter from "@/components/public/PublicFooter"

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="grow pt-16">{children}</main>
      <PublicFooter />
    </div>
  )
}
