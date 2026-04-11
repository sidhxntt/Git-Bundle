 const fetchAllPages = async <T>(url: string, headers: HeadersInit): Promise<T[]> => {
    let results: T[] = [];
    let page = 1;

    while (true) {
      const res = await fetch(
        `${url}${url.includes("?") ? "&" : "?"}page=${page}&per_page=100`,
        { headers }
      );
      if (!res.ok) break;
      const data: T[] = await res.json();
      if (!Array.isArray(data) || data.length === 0) break;
      results = results.concat(data);
      page++;
    }

    return results;
  };
    export default fetchAllPages;