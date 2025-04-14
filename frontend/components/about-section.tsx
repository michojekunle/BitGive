import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bitcoin, ExternalLink } from "lucide-react"
import Link from "next/link"

export default function AboutSection() {
  return (
    <Card className="mx-auto max-w-3xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">About BitGive</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <p className="text-muted-foreground">
            BitGive uses Rootstock's blockchain to make charity donations transparent and rewarding. Powered by Bitcoin,
            we're building a future where giving is secure and fun.
          </p>
        </div>

        <div className="rounded-lg bg-[#F9F9F9] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F7931A] text-white">
              <Bitcoin className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-medium">Built on Rootstock</h3>
              <p className="text-sm text-muted-foreground">The Bitcoin sidechain that brings smart contracts to BTC.</p>
            </div>
          </div>
          <div className="mt-3 text-right">
            <Link
              href="https://rootstock.io"
              target="_blank"
              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
            >
              Learn more about Rootstock
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>

        <div className="text-center">
          <h3 className="mb-2 font-medium">Got ideas? Join our community!</h3>
          <div className="flex justify-center gap-3">
            <Button variant="outline" size="sm">
              Join Discord
            </Button>
            <Button variant="outline" size="sm">
              Follow on Twitter
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
