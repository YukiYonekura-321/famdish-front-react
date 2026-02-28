"use client";

import { useState, useEffect, useCallback } from "react";
import { linkWithPopup, unlink } from "firebase/auth";
import { getLinkedProviderIds } from "@/app/lib/provider-utils";

/**
 * ソーシャルプロバイダの連携/解除ロジックを管理するカスタムフック
 * @param {import("firebase/auth").User | null} user
 */
export function useProviderLink(user) {
  const [linkedProviders, setLinkedProviders] = useState([]);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);

  const canUnlink = linkedProviders.length > 1;

  // ユーザー変更時に連携状態を同期
  useEffect(() => {
    if (!user) return;
    setLinkedProviders(getLinkedProviderIds(user));
  }, [user]);

  const refreshProviders = useCallback(async () => {
    await user.reload();
    setLinkedProviders(getLinkedProviderIds(user));
  }, [user]);

  const linkProvider = useCallback(
    async (provider) => {
      if (!user) return;
      setError("");
      setProcessing(true);
      try {
        await linkWithPopup(user, provider);
        await refreshProviders();
      } catch (e) {
        setError(e.message);
      } finally {
        setProcessing(false);
      }
    },
    [user, refreshProviders],
  );

  const unlinkProvider = useCallback(
    async (providerId) => {
      if (!user) return;
      setError("");
      setProcessing(true);
      try {
        await unlink(user, providerId);
        await refreshProviders();
      } catch (e) {
        setError(e.message);
      } finally {
        setProcessing(false);
      }
    },
    [user, refreshProviders],
  );

  return {
    linkedProviders,
    canUnlink,
    error,
    processing,
    linkProvider,
    unlinkProvider,
  };
}
