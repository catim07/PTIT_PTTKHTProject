import { Separator } from "./ui/separator";

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="mt-16 border-t border-border">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground">
              © {currentYear} BlogHub. Tất cả quyền được bảo lưu.
            </p>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">
              Điều khoản
            </a>
            <Separator orientation="vertical" className="h-4" />
            <a href="#" className="hover:text-foreground transition-colors">
              Quyền riêng tư
            </a>
            <Separator orientation="vertical" className="h-4" />
            <a href="#" className="hover:text-foreground transition-colors">
              Liên hệ
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
