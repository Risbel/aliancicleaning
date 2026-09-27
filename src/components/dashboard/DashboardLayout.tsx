import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { PageSpinner } from '@/components/PageSpinner';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';

export function DashboardLayout() {
	return (
		<TooltipProvider>
			<SidebarProvider>
				<DashboardSidebar />
				<SidebarInset>
					<header className="sticky top-0 z-50 flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4">
						<SidebarTrigger />
					</header>
					<Suspense fallback={<PageSpinner className="min-h-[60vh]" />}>
						<Outlet />
					</Suspense>
				</SidebarInset>
			</SidebarProvider>
		</TooltipProvider>
	);
}
