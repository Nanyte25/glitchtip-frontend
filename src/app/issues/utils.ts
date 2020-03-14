export function urlParamsToObject(url: string | null) {
  return url ? paramsToObject(new URLSearchParams(url.split("?")[1])) : null;
}

export function paramsToObject(entries) {
  const result = {};
  for (const entry of entries) {
    // each 'entry' is a [key, value] tuple
    const [key, value] = entry;
    result[key] = value;
  }
  return result;
}