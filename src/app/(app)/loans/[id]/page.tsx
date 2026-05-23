import { notFound } from "next/navigation";
import { LoanDetailContent } from "@/components/loans/loan-detail-content";
import { getTodayDateKey } from "@/lib/loans/urgency";
import { isPreviewMode } from "@/lib/preview";
import { getLoanDetail } from "@/lib/payments/queries";

type LoanDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function LoanDetailPage({ params }: LoanDetailPageProps) {
  const { id } = await params;
  const { loan, payments, error } = await getLoanDetail(id);

  if (!loan && !error) {
    notFound();
  }

  if (!loan && isPreviewMode()) {
    return (
      <LoanDetailContent
        error={error}
        loanId={id}
        payments={payments}
        todayDate={getTodayDateKey()}
      />
    );
  }

  if (!loan) {
    return (
      <main className="page-stack">
        <section className="panel empty-state empty-state--error">
          <h2>Could not load loan</h2>
          <p>{error}</p>
        </section>
      </main>
    );
  }

  return (
    <LoanDetailContent
      error={error}
      initialLoan={loan}
      payments={payments}
      todayDate={getTodayDateKey()}
    />
  );
}
