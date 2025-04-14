import { Button } from "@/components/ui/button"
import { Bitcoin } from "lucide-react"
import Link from "next/link"

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F7931A] text-white">
            <Bitcoin className="h-5 w-5" />
          </div>
          <span>BitGive</span>
        </Link>

        <nav className="hidden md:flex">
          <ul className="flex items-center gap-6">
            <li>
              <Link href="/" className="text-sm font-medium hover:text-[#F5A623]">
                Home
              </Link>
            </li>
            <li>
              <Link href="#charities" className="text-sm font-medium hover:text-[#F5A623]">
                Charities
              </Link>
            </li>
            <li>
              <Link href="#nfts" className="text-sm font-medium hover:text-[#F5A623]">
                Your NFTs
              </Link>
            </li>
            <li>
              <Link href="#about" className="text-sm font-medium hover:text-[#F5A623]">
                About
              </Link>
            </li>
          </ul>
        </nav>

        <Button className="flex items-center gap-2">
          <Bitcoin className="h-4 w-4" />
          Connect Wallet
        </Button>
      </div>
    </header>
  )
}
