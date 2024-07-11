import { Button } from "@/components/ui/button"
import Link from 'next/link'

export default function Home() {
  return (
    <div>
      <Button>買家</Button>
      <Button>賣家</Button>
      <Button>司機</Button>
      <Link href="/seller">test change page</Link>
    </div>
  );
}

