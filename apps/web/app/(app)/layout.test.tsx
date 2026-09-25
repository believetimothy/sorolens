/**
 * Tests for apps/web/app/(app)/layout.tsx
 *
 * The layout wraps every dashboard page, so asserting on it covers them all.
 */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

vi.mock("@/components/NetworkSelector", () => ({
  NetworkSelector: () => <div data-testid="network-selector" />,
}));

// ThemeToggle calls useTheme(), which requires the ThemeProvider that the root
// layout supplies in the real app. It is irrelevant to the layout structure
// this test asserts on, so stub it as the other provider-bound child is.
vi.mock("@/components/ThemeToggle", () => ({
  ThemeToggle: () => <div data-testid="theme-toggle" />,
}));

// The remaining header/offline children reach for browser-only APIs (cmdk's
// router, Web Push, IndexedDB). They are not what this test asserts on, so they
// are stubbed out as well.
vi.mock("@/components/CmdkSearch", () => ({
  CmdkSearch: () => <div data-testid="cmdk-search" />,
}));

vi.mock("@/components/PushSubscribeButton", () => ({
  PushSubscribeButton: () => <div data-testid="push-subscribe-button" />,
}));

vi.mock("@/components/OfflineAlertBanner", () => ({
  OfflineAlertBanner: () => <div data-testid="offline-alert-banner" />,
}));

vi.mock("@/hooks/useOfflineAlertQueue", () => ({
  useOfflineAlertQueue: () => ({
    pending: [],
    isOffline: false,
    queueAlert: vi.fn(),
    dismiss: vi.fn(),
    dismissAll: vi.fn(),
  }),
}));

describe("AppLayout", () => {
  afterEach(() => {
    cleanup();
  });

  async function renderLayout() {
    const { default: AppLayout } = await import("@/app/(app)/layout");
    return render(
      <AppLayout>
        <p>page content</p>
      </AppLayout>,
    );
  }

  it("renders the Stellar community line in the footer", async () => {
    await renderLayout();
    const footer = screen.getByRole("contentinfo");
    expect(footer.textContent).toContain(
      "Built for the Stellar developer community.",
    );
  });

  it("renders the footer after the page content", async () => {
    await renderLayout();
    const content = screen.getByText("page content");
    const footer = screen.getByRole("contentinfo");
    expect(
      content.compareDocumentPosition(footer) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
});
