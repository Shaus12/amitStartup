import { redirect } from "next/navigation";
import { PaymentSimulationClient } from "./PaymentSimulationClient";

export default function PaymentSimulationPage() {
  if (process.env.SKIP_PAYMENT !== "true") {
    redirect("/checkout");
  }

  return <PaymentSimulationClient />;
}
