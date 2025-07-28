// import { LoginForm } from "./ui/login_form";
import { InvoiceListing } from "@/app/ui/invoice-listing";

export default function Home() {
  return (
    <div className="mt-15 flex flex-col items-center justify-center md:mt-8">
      <div className="h-5"></div>

      {/* <LoginForm></LoginForm> */}
      <InvoiceListing></InvoiceListing>
    </div>
  );
}
