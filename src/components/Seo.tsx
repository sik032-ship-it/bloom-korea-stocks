import { Helmet } from "react-helmet-async";

interface SeoProps {
  title: string;
  description: string;
  path?: string;
  noindex?: boolean;
}

const SITE = "PPURI (뿌리)";
const BASE = "https://bloom-korea-stocks.lovable.app";

export function Seo({ title, description, path, noindex }: SeoProps) {
  const fullTitle = title === SITE ? title : `${title} | ${SITE}`;
  const url = path ? `${BASE}${path}` : undefined;
  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      {url && <meta property="og:url" content={url} />}
      {url && <link rel="canonical" href={url} />}
      {noindex && <meta name="robots" content="noindex" />}
    </Helmet>
  );
}
