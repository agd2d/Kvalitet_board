export const dynamic = "force-dynamic";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";
import NavDropdown from "@/components/NavDropdown";
import MobileNav from "@/components/MobileNav";
import DashboardNav from "@/components/DashboardNav";
import RolePreviewSwitcher from "@/components/RolePreviewSwitcher";
import RolePreviewBanner from "@/components/RolePreviewBanner";
import ViewportPreviewModal from "@/components/ViewportPreviewModal";
import { getCurrentUserProfile, getRealUserRole } from "@/lib/auth";
import { getCurrentUserAccess } from "@/lib/auth/user-access";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile, access } = await getCurrentUserAccess();

  if (!user) redirect("/login");

  const realRole = await getRealUserRole();
  const isRealAdmin = realRole === "admin";

  const jar = await cookies();
  const previewRole = isRealAdmin ? jar.get("preview_role")?.value ?? "" : "";
  const me = await getCurrentUserProfile();

  const qualityItems = [
    { label: "Kvalitetsoverblik", href: "/quality-reports" },
    { label: "Planlaegning", href: "/quality-reports/schedule" },
    { label: "Kvalitetsmaal", href: "/settings/quality-targets" },
  ];

  const ordersItems = access.canSeeOrdersModule
    ? [
        { label: "Arbejdsbord", href: "/orders" },
        { label: "Varebestilling", href: "/orders/requests" },
        { label: "Leverandorordre", href: "/orders/purchase-orders" },
        { label: "Varekatalog", href: "/orders/products" },
        { label: "Leverandorer", href: "/orders/suppliers" },
        ...(access.canSeeCustomerInvoicing
          ? [{ label: "Fakturering til kunde", href: "/orders/customer-invoicing" }]
          : []),
      ]
    : [];

  const settingsItems = [
    { label: "Kundemapping", href: "/settings/customer-mapping" },
    { label: "Synkronisering", href: "/settings/sync" },
    ...(isRealAdmin ? [{ label: "Brugere", href: "/settings/users" }] : []),
  ];

  const kundeportalItems = [
    { label: "Overblik", href: "/kundeportal" },
    { label: "Ordrer & bookinger", href: "/kundeportal/bookinger" },
    { label: "Opgaver", href: "/kundeportal/opgaver" },
    { label: "Beskeder", href: "/kundeportal/beskeder" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {previewRole ? <RolePreviewBanner role={previewRole} /> : null}

      <header className="bg-white border-b border-gray-200 px-3 sm:px-6 py-3 sm:py-4 relative">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-4 sm:gap-8 min-w-0">
            <a href="/" className="text-base sm:text-lg font-bold text-gray-900 shrink-0">
              Hvidbjerg Service Kundesystem
            </a>

            <nav className="hidden md:flex gap-4 lg:gap-6 items-center">
              <a
                href="/"
                className="text-sm text-gray-600 hover:text-gray-900 font-medium whitespace-nowrap"
              >
                Overblik
              </a>
              <a
                href="/customers"
                className="text-sm text-gray-600 hover:text-gray-900 font-medium whitespace-nowrap"
              >
                Kunder
              </a>
              <DashboardNav access={access} />
              <NavDropdown label="Kundekvalitet" items={qualityItems} />
              <NavDropdown label="Kundeportal" items={kundeportalItems} />
              <NavDropdown label="Indstillinger" items={settingsItems} />
              {isRealAdmin ? <RolePreviewSwitcher currentPreview={previewRole || undefined} /> : null}
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <span className="hidden lg:block text-sm text-gray-500 truncate max-w-[240px]">
              {profile?.name ?? me?.name ?? user.email}
            </span>
            <span className="hidden md:block text-xs uppercase tracking-wide text-gray-400">
              {access.role}
            </span>

            {isRealAdmin ? <ViewportPreviewModal /> : null}

            <LogoutButton />

            <MobileNav
              isRealAdmin={isRealAdmin}
              previewRole={previewRole || undefined}
              ordersItems={ordersItems}
              qualityItems={qualityItems}
              settingsItems={settingsItems}
              kundeportalItems={kundeportalItems}
              userEmail={user.email ?? ""}
            />
          </div>
        </div>
      </header>

      <main className="p-3 sm:p-6">{children}</main>
    </div>
  );
}
