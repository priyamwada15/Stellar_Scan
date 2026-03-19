
/**
 * Formats the visibility string from "Visible between latitudes +90° and -65°"
 * to "LAT +90°-LAT -65°"
 */
export const formatVisibility = (visibility: string): string => {
  if (!visibility) return 'N/A';
  
  // Match the pattern "Visible between latitudes [val1] and [val2]"
  const regex = /Visible between latitudes ([\+\-\d°]+) and ([\+\-\d°]+)/i;
  const match = visibility.match(regex);
  
  if (match) {
    return `LAT ${match[1]}-LAT ${match[2]}`;
  }
  
  return visibility;
};
