import { useState, useEffect, useCallback } from "react";

interface Content {
  id: number;
  title: string;
  textHtml: string;
  banner: string;
  createdBy: string;
  createdDate: string;
  updatedBy: string;
  updatedDate: string;
  status: string;
}

interface ContentResponse {
  data: Content[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface UseContentOptions {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const useContent = (options: UseContentOptions = {}) => {
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // keep an internal status state so we can refetch with overrides
  const [statusState, setStatusState] = useState<string | undefined>(
    options.status
  );
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  // keep internal status in sync when hook options change
  useEffect(() => {
    setStatusState(options.status);
  }, [options.status]);

  const fetchWith = useCallback(async (overrideStatus?: string) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      const effStatus = overrideStatus ?? statusState;
      if (effStatus) params.append("status", effStatus);
      if (options.search) params.append("search", options.search);
      if (options.page) params.append("page", options.page.toString());
      if (options.limit) params.append("limit", options.limit.toString());

      const qs = params.toString();
      const url = `/api/contents${qs ? `?${qs}` : ""}`;
      try { console.debug('[useContent] fetch', url); } catch {}
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch contents");
      }

      const result: ContentResponse = await response.json();
      setContents(result.data);
      setPagination({
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [statusState, options.search, options.page, options.limit]);

  useEffect(() => {
    fetchWith();
  }, [fetchWith]);

  const refetch = (overrideStatus?: string) => {
    if (typeof overrideStatus !== "undefined") {
      // optimistic sync
      setStatusState(overrideStatus);
      fetchWith(overrideStatus);
    } else {
      fetchWith();
    }
  };

  return {
    contents,
    loading,
    error,
    pagination,
    refetch,
  };
};
