import BillForm from "@/app/components/BillForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Generate Invoice | HR SALES",
  description: "Admin invoice generator for HR SALES.",
};

export default function BillsPage() {
  return <BillForm />;
}