import PublicHeader from "@/components/public/PublicHeader"
import PublicFooter from "@/components/public/PublicFooter"

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div>
      <PublicHeader />
      <main className="pt-16">{children}</main>
      <PublicFooter />
    </div>
  )
}
