import Link from 'next/link'
import { Button } from "@/components/ui/button"

export default function PublicLayout({children}: Readonly<{
  children: React.ReactNode;
}>){
    return <div className="test">
        <div><h1>Header</h1>
        <Button><Link href={'/dashboard'}>IR a dashboard</Link></Button></div>
        <div className="contiene">
            {children}
        </div>
        <h2>Footer</h2>
    </div>
}