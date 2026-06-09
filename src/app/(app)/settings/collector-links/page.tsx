import { CollectorLinksContent } from "@/components/collector-board/collector-links-content";
import { getCollectionShares } from "@/lib/collector-board/queries";
import { getLenderProfiles } from "@/lib/lender-profiles/queries";
import { isPreviewMode } from "@/lib/preview";

type CollectorLinksPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function CollectorLinksPage({
  searchParams,
}: CollectorLinksPageProps) {
  const [{ error: linksError, shares }, { error: profilesError, profiles }, params] =
    await Promise.all([
      getCollectionShares(),
      getLenderProfiles(),
      searchParams,
    ]);

  return (
    <CollectorLinksContent
      error={params.error ?? linksError ?? profilesError}
      isPreviewMode={isPreviewMode()}
      profiles={profiles}
      shares={shares}
    />
  );
}
