import { CollectorBoardContent } from "@/components/collector-board/collector-board-content";
import { getCollectorBoardData } from "@/lib/collector-board/queries";

export const dynamic = "force-dynamic";

type CollectorPageProps = {
  params: Promise<{
    token: string;
  }>;
  searchParams: Promise<{
    filter?: string;
  }>;
};

export default async function CollectorPage({
  params,
  searchParams,
}: CollectorPageProps) {
  const [{ token }, { filter }] = await Promise.all([params, searchParams]);
  const result = await getCollectorBoardData({ filter, token });

  return <CollectorBoardContent result={result} token={token} />;
}
