import { Link, useLocation } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import {
	ArrowLeft01Icon,
	CoinsDollarIcon,
	DashboardSquare01Icon,
	ListChecks,
	UserGroupIcon,
	UserMultipleIcon,
} from '@hugeicons/core-free-icons';
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
} from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/auth/use-auth';
import { useStaffProfile } from '@/hooks/queries/use-profile';

const navItems = [
	{ label: 'Overview', href: '/dashboard', icon: DashboardSquare01Icon, adminOnly: false },
	{ label: 'Quotes', href: '/dashboard/quotes', icon: ListChecks, adminOnly: false },
	{ label: 'Clients', href: '/dashboard/clients', icon: UserMultipleIcon, adminOnly: false },
	{ label: 'Staff', href: '/dashboard/staff', icon: UserGroupIcon, adminOnly: true },
	{ label: 'Plan Pricing', href: '/dashboard/plans', icon: CoinsDollarIcon, adminOnly: true },
];

export function DashboardSidebar() {
	const { pathname } = useLocation();
	const { user } = useAuth();
	const { data: staffProfile } = useStaffProfile(user?.id);
	const isAdmin = staffProfile?.role === 'admin';

	const visibleItems = navItems.filter((item) => !item.adminOnly || isAdmin);

	return (
		<Sidebar collapsible="icon">
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton size="lg" asChild>
							<Link to="/">
								<img
									src="/favicon/nav-icon.png"
									alt="Alianci Cleaning"
									className="size-8 shrink-0 rounded-full object-cover"
								/>
								<span className="font-semibold tracking-tight">AlianciCleaning</span>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Dashboard</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{visibleItems.map((item) => (
								<SidebarMenuItem key={item.href}>
									<SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.label}>
										<Link to={item.href}>
											<HugeiconsIcon icon={item.icon} />
											<span>{item.label}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton asChild tooltip="Back to site">
							<Link to="/">
								<HugeiconsIcon icon={ArrowLeft01Icon} />
								<span>Back to site</span>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
