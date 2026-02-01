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
    <table className="w-full table-auto">
      <tbody>
        {PROVIDERS.map(({ id, name, provider }) => {
          const isLinked = linkedProviders.includes(id);
          return (
            <tr key={id} className="border-b">
              <th className="text-left px-4 py-2">{name}</th>
              <td className="px-4 py-2 text-center w-28">
                {isLinked ? "連携" : "未連携"}
              </td>
              <td className="px-4 py-2">
                <div className="flex items-center gap-3">
                  {isLinked ? (
                    canUnlink && (
                      <button
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                        onClick={() => unlinkProvider(id)}
                      >
                        解除
                      </button>
                    )
                  ) : (
                    <button
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      onClick={() => linkProvider(provider)}
                    >
                      連携
                    </button>
                  )}
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
