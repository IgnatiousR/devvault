// Dashboard UI - ShadCN components initialization
import { create } from "@shadcn-ui/react";
import { usePathname } from "next/navigation";

export const dashboard = create({
  placeholder: {
    main: {
      children: [
        {
          children: (
            <h2>Dashboard</h2>
          ),
        },
        {
          children: (
            <h2>Sidebar</h2>
          ),
        },
      ],
    },
  },
});
