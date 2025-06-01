import { Outlet, createRootRoute } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: () => (
    <div className="max-w-7xl mx-auto p-6">
      <Outlet />
    </div>
  ),
});
