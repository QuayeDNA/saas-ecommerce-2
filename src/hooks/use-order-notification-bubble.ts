import { useEffect, useRef, useState } from "react";
import { websocketService } from "../services/websocket.service";

export function useOrderNotificationBubble(isOrdersPage: boolean) {
  const [newOrderCount, setNewOrderCount] = useState(0);
  const isOrdersPageRef = useRef(isOrdersPage);

  useEffect(() => {
    isOrdersPageRef.current = isOrdersPage;
    if (isOrdersPage) {
      setNewOrderCount(0);
    }
  }, [isOrdersPage]);

  useEffect(() => {
    const handleOrderCreated = (data: unknown) => {
      if (isOrdersPageRef.current) {
        return;
      }

      const increment =
        data && typeof data === "object" && "count" in data && typeof (data as any).count === "number"
          ? (data as any).count
          : 1;

      setNewOrderCount((current) => current + increment);
    };

    websocketService.on("order_created", handleOrderCreated);
    return () => websocketService.off("order_created", handleOrderCreated);
  }, []);

  return newOrderCount;
}
