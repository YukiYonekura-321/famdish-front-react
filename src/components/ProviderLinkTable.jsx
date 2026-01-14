"use client";

import { useEffect, useState } from "react";
import { PROVIDERS } from "@/app/lib/providers";
import { getLinkedProviderIds } from "@/app/lib/provider-utils";
import { linkWithPopup, unlink } from "firebase/auth";

export function ProviderLinkTable({ user }) {
  const [linkedProviders, setLinkedProviders] = useState([]);
  const canUnlink = linkedProviders.length > 1;

  useEffect(() => {
    console.log(`ユーザー${user}`);
    if (!user) return;
    setLinkedProviders(getLinkedProviderIds(user));
  }, [user]);

  const linkProvider = async (provider) => {
    try {
      await linkWithPopup(user, provider);
      await user.reload();
      setLinkedProviders(getLinkedProviderIds(user));
    } catch (e) {
      alert(e.message);
    }
  };

  const unlinkProvider = async (providerId) => {
    try {
      await unlink(user, providerId);
      await user.reload();
      setLinkedProviders(getLinkedProviderIds(user));
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <table>
      <tbody>
        {PROVIDERS.map(({ id, name, provider }) => {
          const isLinked = linkedProviders.includes(id);
          const displayName =
            user.providerData?.find((p) => p.providerId === id)?.displayName ??
            "-";
          return (
            <tr key={id}>
              <th>{name}</th>
              <td>{displayName}</td>
              <td>{isLinked ? "連携" : "未連携"}</td>
              <td>
                {isLinked ? (
                  canUnlink && (
                    <button onClick={() => unlinkProvider(id)}>解除</button>
                  )
                ) : (
                  <button onClick={() => linkProvider(provider)}>連携</button>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
