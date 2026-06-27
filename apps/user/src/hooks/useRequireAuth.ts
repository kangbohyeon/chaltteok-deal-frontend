import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@chaltteok/shared-store";

export function useRequireAuth(redirectTo = "/login") {
  const router = useRouter();
  const role = useAuthStore((s) => s.role);

  useEffect(() => {
    if (!role) {
      router.replace(redirectTo);
    }
  }, [role, router, redirectTo]);

  return !!role;
}
