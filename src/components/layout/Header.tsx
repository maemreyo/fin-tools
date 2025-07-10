
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Mountain } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link className="mr-6 flex items-center space-x-2" href="/">
            <Mountain className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">
              PropertyWise
            </span>
          </Link>
          <nav className="flex items-center gap-4 text-sm lg:gap-6">
            <Link
              className="text-foreground/60 transition-colors hover:text-foreground/80"
              href="/calculator"
            >
              Công cụ
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* You can add a search bar here if needed */}
          </div>
          <nav className="hidden md:flex md:items-center md:gap-2">
            <Button asChild>
              <Link href="/calculator">Bắt đầu ngay</Link>
            </Button>
          </nav>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button className="md:hidden" size="icon" variant="outline">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Mở/Đóng Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <div className="flex flex-col gap-4 p-4">
              <Link className="mr-6 flex items-center space-x-2" href="/">
                <Mountain className="h-6 w-6" />
                <span className="font-bold">PropertyWise</span>
              </Link>
              <Link href="/calculator" className="text-lg font-medium">
                Công cụ
              </Link>
              <Button asChild>
                <Link href="/calculator">Bắt đầu ngay</Link>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
