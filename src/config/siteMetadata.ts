import siteMetadata from "../../siteMetadata.json";

export const SITE_METADATA = siteMetadata;

export function getPageTitle(page?: string) {
  return page ? `${page} | ${SITE_METADATA.appName}` : SITE_METADATA.title;
}
