import React from 'react'
import { UserList, UserDetail, UserForm } from './layout/UserManagement'
import { Navigate } from 'react-router-dom'

// Lazy loaded components
const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const AdminList = React.lazy(() => import('./layout/AdminManagement/AdminList'))
const AdminForm = React.lazy(() => import('./layout/AdminManagement/AdminForm'))
const TutorList = React.lazy(() => import('./layout/TutorManagement/TutorList'))
const TutorForm = React.lazy(() => import('./layout/TutorManagement/TutorForm'))
const TutorAssignment = React.lazy(
  () => import('./layout/TutorManagement/TutorAssignment'),
)
const TutorDashboard = React.lazy(
  () => import('./layout/TutorDashboard/TutorDashboard'),
)
const ClassStudents = React.lazy(
  () => import('./layout/TutorDashboard/ClassStudents'),
)

// Schedule management
const ScheduleList = React.lazy(
  () => import('./layout/ScheduleManagement/ScheduleList'),
)
const ScheduleForm = React.lazy(
  () => import('./layout/ScheduleManagement/ScheduleForm'),
)
const ScheduleRequests = React.lazy(
  () => import('./layout/ScheduleManagement/ScheduleRequests'),
)
const ScheduleRequestDetail = React.lazy(
  () => import('./layout/ScheduleManagement/ScheduleRequestDetail'),
)
const ScheduleCapacityDashboard = React.lazy(
  () => import('./layout/ScheduleManagement/ScheduleCapacityDashboard'),
)
const ScheduleRegistrationsList = React.lazy(
  () => import('./layout/ScheduleManagement/ScheduleRegistrationsList'),
)

// Event management
const EventList = React.lazy(() => import('./layout/EventManagement/EventList'))
const EventForm = React.lazy(() => import('./layout/EventManagement/EventForm'))

// Host management
const HostList = React.lazy(() => import('./layout/HostManagement/HostList'))
const HostForm = React.lazy(() => import('./layout/HostManagement/HostForm'))

// Home management
const HomeList = React.lazy(() => import('./layout/HomeManagement/HomeList'))
const HomeForm = React.lazy(() => import('./layout/HomeManagement/HomeForm'))

// About Us management
const AboutUsForm = React.lazy(
  () => import('./layout/AboutUsManagement/AboutUsForm'),
)

// BookWithUs management
const BookWithUsList = React.lazy(
  () => import('./layout/BookWithUsManagement/BookWithUsList'),
)
const BookWithUsForm = React.lazy(
  () => import('./layout/BookWithUsManagement/BookWithUsForm'),
)

// Production management
const ProductionList = React.lazy(
  () => import('./layout/ProductionManagement/ProductionList'),
)
const ProductionForm = React.lazy(
  () => import('./layout/ProductionManagement/ProductionForm'),
)

// Product Category management
const ProductCategoryList = React.lazy(
  () => import('./layout/ProductCategoryManagement/ProductCategoryList'),
)
const ProductCategoryForm = React.lazy(
  () => import('./layout/ProductCategoryManagement/ProductCategoryForm'),
)

// Product management
const ProductList = React.lazy(
  () => import('./layout/ProductManagement/ProductList'),
)
const ProductForm = React.lazy(
  () => import('./layout/ProductManagement/ProductForm'),
)

// Function to create a protected route element for super admin only
const createSuperAdminRoute = (Component) => {
  return (props) => {
    // Get admin info from localStorage
    const adminInfo = localStorage.getItem('admin_info')
    if (!adminInfo) return <Navigate to="/login" />

    try {
      const admin = JSON.parse(adminInfo)
      // Only allow access if user is super_admin
      if (admin.role !== 'super_admin') {
        return <Navigate to="/dashboard" />
      }

      // Otherwise render the component
      return <Component {...props} />
    } catch (e) {
      // If parsing fails, redirect to login
      return <Navigate to="/login" />
    }
  }
}

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  {
    path: '/admin-management',
    name: 'Admin Management',
    element: createSuperAdminRoute(AdminList),
  },
  {
    path: '/admin-management/new',
    name: 'Add New Admin',
    element: createSuperAdminRoute(AdminForm),
  },
  {
    path: '/admin-management/:id/edit',
    name: 'Edit Admin',
    element: createSuperAdminRoute(AdminForm),
  },
  {
    path: '/tutor-management',
    name: 'Tutor Management',
    element: TutorList,
  },
  {
    path: '/tutor-management/new',
    name: 'Add New Tutor',
    element: TutorForm,
  },
  {
    path: '/tutor-management/:id/edit',
    name: 'Edit Tutor',
    element: TutorForm,
  },
  {
    path: '/schedule/:scheduleId/assign-tutors',
    name: 'Assign Tutors to Schedule',
    element: TutorAssignment,
  },
  // Tutor dashboard routes
  {
    path: '/tutor-dashboard',
    name: 'Tutor Dashboard',
    element: TutorDashboard,
  },
  {
    path: '/class/:classId/students',
    name: 'Class Students',
    element: ClassStudents,
  },
  {
    path: '/users',
    name: 'User Management',
    element: UserList,
  },
  {
    path: '/users/new',
    name: 'Create User',
    element: UserForm,
  },
  {
    path: '/users/:id/edit',
    name: 'Edit User',
    element: UserForm,
  },
  {
    path: '/users/:id/view',
    name: 'User Details',
    element: UserDetail,
  },
  {
    path: '/schedule-management',
    name: 'Schedule Management',
    element: ScheduleList,
  },
  {
    path: '/schedule-management/new',
    name: 'Create Schedule',
    element: ScheduleForm,
  },
  {
    path: '/schedule-management/:slug/edit',
    name: 'Edit Schedule',
    element: ScheduleForm,
  },
  // Schedule Capacity Dashboard
  {
    path: '/schedule-capacity',
    name: 'Schedule Capacity',
    element: ScheduleCapacityDashboard,
  },
  {
    path: '/schedule-registrations/:scheduleId',
    name: 'Schedule Registrations',
    element: ScheduleRegistrationsList,
  },
  // Schedule Requests routes
  {
    path: '/schedule-requests',
    name: 'Schedule Requests',
    element: ScheduleRequests,
  },
  {
    path: '/schedule-requests/:requestId',
    name: 'Request Details',
    element: ScheduleRequestDetail,
  },
  {
    path: '/event-management',
    name: 'Event Management',
    element: EventList,
  },
  {
    path: '/event-management/new',
    name: 'Create Event',
    element: EventForm,
  },
  {
    path: '/event-management/:slug/edit',
    name: 'Edit Event',
    element: EventForm,
  },
  {
    path: '/host-management',
    name: 'Host Management',
    element: HostList,
  },
  {
    path: '/host-management/new',
    name: 'Create Host',
    element: HostForm,
  },
  {
    path: '/host-management/:slug/edit',
    name: 'Edit Host',
    element: HostForm,
  },
  // Home routes
  {
    path: '/home-management',
    name: 'Home Management',
    element: HomeList,
  },
  {
    path: '/home-management/new',
    name: 'Create Home',
    element: HomeForm,
  },
  {
    path: '/home-management/:slug/edit',
    name: 'Edit Home',
    element: HomeForm,
  },
  // About Us routes
  {
    path: '/about-us-management',
    name: 'About Us Management',
    element: AboutUsForm,
  },
  // BookWithUs routes
  {
    path: '/book-with-us-management',
    name: 'Book With Us Management',
    element: BookWithUsList,
  },
  {
    path: '/book-with-us-management/new',
    name: 'Create Book With Us',
    element: BookWithUsForm,
  },
  {
    path: '/book-with-us-management/:slug/edit',
    name: 'Edit Book With Us',
    element: BookWithUsForm,
  },

  // Production routes
  {
    path: '/production-management',
    name: 'Production Management',
    element: ProductionList,
  },
  {
    path: '/production-management/new',
    name: 'Create Production',
    element: ProductionForm,
  },
  {
    path: '/production-management/:slug/edit',
    name: 'Edit Production',
    element: ProductionForm,
  },

  // Product Category routes
  {
    path: '/product-categories',
    name: 'Product Categories',
    element: ProductCategoryList,
  },
  {
    path: '/product-categories/create',
    name: 'Create Product Category',
    element: ProductCategoryForm,
  },
  {
    path: '/product-categories/edit/:slug',
    name: 'Edit Product Category',
    element: ProductCategoryForm,
  },

  // Product routes
  {
    path: '/products',
    name: 'Products',
    element: ProductList,
  },
  {
    path: '/products/create',
    name: 'Create Product',
    element: ProductForm,
  },
  {
    path: '/products/edit/:slug',
    name: 'Edit Product',
    element: ProductForm,
  },

  // Product Request routes
  {
    path: '/product-requests',
    name: 'Product Requests',
    element: React.lazy(
      () => import('./layout/ProductRequestManagement/ProductRequestList'),
    ),
  },
  {
    path: '/product-requests/:id/view',
    name: 'Product Request Details',
    element: React.lazy(
      () => import('./layout/ProductRequestManagement/ProductRequestDetail'),
    ),
  },
]

export default routes
