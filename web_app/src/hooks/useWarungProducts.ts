import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export function useWarungProducts(warungId: string | undefined) {
    return useQuery({
        queryKey: ["warung-products", warungId],
        queryFn: async () => {
            const response: any = await api.get(`/warungs/${warungId}/products`);
            return response.data;
        },
        enabled: !!warungId,
    });
}
