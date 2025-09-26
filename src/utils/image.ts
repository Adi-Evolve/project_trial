// Utility helpers for selecting project images
export function getImageList(project: any): string[] {
  const urls: string[] = [];
  if (!project) return urls;

  // Support both snake_case (db rows) and camelCase (mapped objects)
  const arrCandidates = project.image_urls || project.imageUrls || [];
  if (Array.isArray(arrCandidates) && arrCandidates.length > 0) {
    urls.push(...arrCandidates.filter(Boolean));
  }

  const singleCandidates = project.image_url || project.imageUrl || '';
  if (singleCandidates) urls.push(singleCandidates);

  const hashCandidates = project.image_hashes || project.imageHashes || [];
  if (Array.isArray(hashCandidates) && hashCandidates.length > 0) {
    urls.push(...hashCandidates.filter(Boolean).map((h: string) => {
      // If the hash already looks like an IPFS path/url, prefer it
      if (h.startsWith('http') || h.startsWith('ipfs://')) return h.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/');
      return `https://gateway.pinata.cloud/ipfs/${h}`;
    }));
  }

  // Dedupe and cap at 5
  return Array.from(new Set(urls)).slice(0, 5);
}

export function getPrimaryImage(project: any): string | undefined {
  const list = getImageList(project);
  return list.length > 0 ? list[0] : undefined;
}

const imageUtils = { getImageList, getPrimaryImage };
export default imageUtils;
