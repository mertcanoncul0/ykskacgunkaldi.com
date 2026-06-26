// Son aramaları localStorage'da tutan küçük yardımcı (tarayıcı tarafı).

const KEY = "recent-searches";
const MAX = 6;

export function getRecentSearches(): string[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    const arr = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(arr) ? arr.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function addRecentSearch(q: string) {
  const query = q.trim();
  if (!query || typeof localStorage === "undefined") return;
  try {
    const list = getRecentSearches().filter((x) => x.toLocaleLowerCase("tr") !== query.toLocaleLowerCase("tr"));
    list.unshift(query);
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
  } catch {
    /* yoksay */
  }
}

export function clearRecentSearches() {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* yoksay */
  }
}
