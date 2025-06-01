import Image from "next/image";

// import { LoginForm } from "./ui/login_form";
import { InvoiceListing } from "@/app/ui/invoice-listing";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="h-5"></div>

      {/* <LoginForm></LoginForm> */}
      <InvoiceListing></InvoiceListing>
    </div>
  );
}
