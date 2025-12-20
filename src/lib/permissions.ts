/**
 * Role-Based Access Control (RBAC) System
 *
 * This module defines permissions for different user roles.
 * Easily extensible for future roles like 'manager', 'support', etc.
 */

export type Role = 'user' | 'admin';

export type Permission =
  // Product permissions
  | 'products:read'
  | 'products:create'
  | 'products:update'
  | 'products:delete'
  // Order permissions
  | 'orders:read'
  | 'orders:read:own'
  | 'orders:update'
  | 'orders:delete'
  // User permissions
  | 'users:read'
  | 'users:update'
  | 'users:delete'
  | 'users:update:own'
  // Category permissions
  | 'categories:read'
  | 'categories:create'
  | 'categories:update'
  | 'categories:delete'
  // Coupon permissions
  | 'coupons:read'
  | 'coupons:create'
  | 'coupons:update'
  | 'coupons:delete'
  // Analytics permissions
  | 'analytics:read'
  // Settings permissions
  | 'settings:read'
  | 'settings:update'
  // Notification permissions
  | 'notifications:read'
  | 'notifications:read:admin'
  | 'notifications:update'
  | 'notifications:delete'
  // Review permissions
  | 'reviews:create'
  | 'reviews:update:own'
  | 'reviews:delete'
  | 'reviews:delete:own';

/**
 * Define permissions for each role
 */
const rolePermissions: Record<Role, Permission[]> = {
  user: [
    // Users can read products
    'products:read',
    // Users can read and manage their own orders
    'orders:read:own',
    // Users can update their own profile
    'users:update:own',
    // Users can read categories
    'categories:read',
    // Users can read their own notifications
    'notifications:read',
    'notifications:update',
    'notifications:delete',
    // Users can create and manage their own reviews
    'reviews:create',
    'reviews:update:own',
    'reviews:delete:own',
  ],
  admin: [
    // Admins have all product permissions
    'products:read',
    'products:create',
    'products:update',
    'products:delete',
    // Admins have all order permissions
    'orders:read',
    'orders:read:own',
    'orders:update',
    'orders:delete',
    // Admins have all user permissions
    'users:read',
    'users:update',
    'users:delete',
    'users:update:own',
    // Admins have all category permissions
    'categories:read',
    'categories:create',
    'categories:update',
    'categories:delete',
    // Admins have all coupon permissions
    'coupons:read',
    'coupons:create',
    'coupons:update',
    'coupons:delete',
    // Admins can view analytics
    'analytics:read',
    // Admins can manage settings
    'settings:read',
    'settings:update',
    // Admins have all notification permissions
    'notifications:read',
    'notifications:read:admin',
    'notifications:update',
    'notifications:delete',
    // Admins have all review permissions
    'reviews:create',
    'reviews:update:own',
    'reviews:delete',
    'reviews:delete:own',
  ],
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: Role, permission: Permission): boolean {
  const permissions = rolePermissions[role];
  return permissions?.includes(permission) ?? false;
}

/**
 * Check if a role has all of the specified permissions
 */
export function hasAllPermissions(role: Role, permissions: Permission[]): boolean {
  return permissions.every((permission) => hasPermission(role, permission));
}

/**
 * Check if a role has any of the specified permissions
 */
export function hasAnyPermission(role: Role, permissions: Permission[]): boolean {
  return permissions.some((permission) => hasPermission(role, permission));
}

/**
 * Get all permissions for a role
 */
export function getPermissions(role: Role): Permission[] {
  return rolePermissions[role] || [];
}

/**
 * Check if user can access admin dashboard
 */
export function canAccessAdmin(role: Role): boolean {
  return role === 'admin';
}

/**
 * Check if user can manage resource (create, update, delete)
 */
export function canManageResource(
  role: Role,
  resource: 'products' | 'orders' | 'users' | 'categories' | 'coupons'
): boolean {
  const createPermission = `${resource}:create` as Permission;
  const updatePermission = `${resource}:update` as Permission;
  const deletePermission = `${resource}:delete` as Permission;

  return (
    hasPermission(role, createPermission) ||
    hasPermission(role, updatePermission) ||
    hasPermission(role, deletePermission)
  );
}

/**
 * Navigation items based on role
 */
export interface NavItem {
  href: string;
  label: string;
  icon?: string;
  requiredPermission?: Permission;
}

export const adminNavItems: NavItem[] = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/products', label: 'Products', requiredPermission: 'products:read' },
  { href: '/admin/orders', label: 'Orders', requiredPermission: 'orders:read' },
  { href: '/admin/users', label: 'Users', requiredPermission: 'users:read' },
  { href: '/admin/categories', label: 'Categories', requiredPermission: 'categories:read' },
  { href: '/admin/coupons', label: 'Coupons', requiredPermission: 'coupons:read' },
  { href: '/admin/notifications', label: 'Notifications', requiredPermission: 'notifications:read:admin' },
  { href: '/admin/analytics', label: 'Analytics', requiredPermission: 'analytics:read' },
  { href: '/admin/settings', label: 'Settings', requiredPermission: 'settings:read' },
];

export const userNavItems: NavItem[] = [
  { href: '/profile', label: 'Profile' },
  { href: '/profile/orders', label: 'My Orders' },
  { href: '/profile/addresses', label: 'Addresses' },
  { href: '/profile/notifications', label: 'Notifications' },
  { href: '/profile/settings', label: 'Settings' },
  { href: '/wishlist', label: 'Wishlist' },
];

/**
 * Filter navigation items based on user role
 */
export function getNavItemsForRole(role: Role, items: NavItem[]): NavItem[] {
  return items.filter((item) => {
    if (!item.requiredPermission) return true;
    return hasPermission(role, item.requiredPermission);
  });
}
