import { generatePageMetadata } from "@/lib/metadata";
import OrderConfirmationClient from "@/components/OrderConfirmationClient";

export const metadata = generatePageMetadata({
  title:       'Order Confirmed — Dynamic Tower',
  description: 'Your Dynamic Tower food order has been confirmed. Track your delivery in real time.',
  path:        '/order-confirmation',
});

export default function OrderConfirmation() {
  return <OrderConfirmationClient />
}