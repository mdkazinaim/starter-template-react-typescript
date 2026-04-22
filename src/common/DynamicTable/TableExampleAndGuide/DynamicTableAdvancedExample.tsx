import { useState, useEffect, useCallback } from "react";
import DynamicTable, { Column } from "@/common/DynamicTable/DynamicTable";
import { useDebounce } from "@/hooks/useDebounce";
import { Pencil, Trash2, Eye, Download, Filter, X, Search } from "lucide-react";

// ============================================
// 📦 Types
// ============================================

interface User extends Record<string, unknown> {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user" | "moderator";
  status: "active" | "inactive";
  createdAt: string;
  age: number;
  department: string;
}

interface FilterOptions {
  role?: string;
  status?: string;
  department?: string;
  ageMin?: number;
  ageMax?: number;
}

interface QueryParams {
  search: string;
  filters: FilterOptions;
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// ============================================
// 🎯 Advanced Table with Filters & Bulk Actions
// ============================================

// Mock data (in real app, this would come from API)
const mockUsers: User[] = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    role: "admin",
    status: "active",
    createdAt: "2024-01-15",
    age: 28,
    department: "Engineering",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    role: "user",
    status: "active",
    createdAt: "2024-02-20",
    age: 32,
    department: "Marketing",
  },
  {
    id: 3,
    name: "Bob Johnson",
    email: "bob@example.com",
    role: "moderator",
    status: "inactive",
    createdAt: "2024-03-10",
    age: 45,
    department: "Sales",
  },
  {
    id: 4,
    name: "Alice Williams",
    email: "alice@example.com",
    role: "user",
    status: "active",
    createdAt: "2024-04-05",
    age: 29,
    department: "Engineering",
  },
  {
    id: 5,
    name: "Charlie Brown",
    email: "charlie@example.com",
    role: "admin",
    status: "active",
    createdAt: "2024-05-12",
    age: 38,
    department: "HR",
  },
];

const AdvancedTableExample = () => {
  // ============================================
  // State Management
  // ============================================
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Debounce search to prevent excessive API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Filter states
  const [filters, setFilters] = useState<FilterOptions>({
    role: "",
    status: "",
    department: "",
    ageMin: undefined,
    ageMax: undefined,
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  // ============================================
  // Fetch Data with Query Parameters
  // ============================================
  const fetchUsers = useCallback(async () => {
    setLoading(true);

    // Build query parameters
    const queryParams: QueryParams = {
      search: debouncedSearchQuery,
      filters: filters,
      page: currentPage,
      pageSize: pageSize,
    };

    // Simulate API call
    console.log("Fetching with params:", queryParams);

    // In real implementation, you would do:
    // const response = await fetch(`/api/users?${new URLSearchParams(queryParams)}`);
    // const data = await response.json();

    // Mock filtering logic
    setTimeout(() => {
      let filteredUsers = [...mockUsers];

      // Apply search
      if (searchQuery) {
        filteredUsers = filteredUsers.filter(
          (user) =>
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      // Apply filters
      if (filters.role) {
        filteredUsers = filteredUsers.filter(
          (user) => user.role === filters.role
        );
      }
      if (filters.status) {
        filteredUsers = filteredUsers.filter(
          (user) => user.status === filters.status
        );
      }
      if (filters.department) {
        filteredUsers = filteredUsers.filter(
          (user) => user.department === filters.department
        );
      }
      if (filters.ageMin) {
        filteredUsers = filteredUsers.filter(
          (user) => user.age >= (filters.ageMin || 0)
        );
      }
      if (filters.ageMax) {
        filteredUsers = filteredUsers.filter(
          (user) => user.age <= (filters.ageMax || 999)
        );
      }

      setUsers(filteredUsers);
      setTotalRecords(filteredUsers.length);
      setLoading(false);
    }, 500);
  }, [debouncedSearchQuery, filters, currentPage, pageSize]);

  // Fetch on mount and when dependencies change
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // ============================================
  // Table Columns
  // ============================================
  const columns: Column<User>[] = [
    {
      key: "id",
      label: "ID",
      accessor: "id",
      sortable: true,
      width: "80px",
      align: "center",
    },
    {
      key: "name",
      label: "Name",
      accessor: "name",
      sortable: true,
    },
    {
      key: "email",
      label: "Email",
      accessor: "email",
      sortable: true,
      hideOnMobile: true,
    },
    {
      key: "role",
      label: "Role",
      accessor: "role",
      sortable: true,
      render: (user) => (
        <span
          className={`px-2 py-1 text-xs font-semibold rounded-full ${
            user.role === "admin"
              ? "bg-purple-100 text-purple-800"
              : user.role === "moderator"
              ? "bg-blue-100 text-blue-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {user.role.toUpperCase()}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      accessor: "status",
      sortable: true,
      render: (user) => (
        <span
          className={`px-2 py-1 text-xs font-semibold rounded-full ${
            user.status === "active"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {user.status}
        </span>
      ),
    },
    {
      key: "department",
      label: "Department",
      accessor: "department",
      sortable: true,
      hideOnMobile: true,
    },
    {
      key: "age",
      label: "Age",
      accessor: "age",
      sortable: true,
      align: "center",
      width: "100px",
    },
  ];

  // ============================================
  // Filter Handlers
  // ============================================
  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
    }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setFilters({
      role: "",
      status: "",
      department: "",
      ageMin: undefined,
      ageMax: undefined,
    });
    setSearchQuery("");
    setCurrentPage(1);
  };

  const hasActiveFilters = () => {
    return (
      searchQuery ||
      filters.role ||
      filters.status ||
      filters.department ||
      filters.ageMin ||
      filters.ageMax
    );
  };

  // ============================================
  // Bulk Actions
  // ============================================
  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) {
      alert("Please select users to delete");
      return;
    }

    const confirmed = confirm(
      `Are you sure you want to delete ${selectedUsers.length} user(s)?`
    );

    if (confirmed) {
      setLoading(true);

      // In real implementation:
      // await fetch('/api/users/bulk-delete', {
      //   method: 'DELETE',
      //   body: JSON.stringify({ ids: selectedUsers.map(u => u.id) })
      // });

      console.log(
        "Deleting users:",
        selectedUsers.map((u) => u.id)
      );

      setTimeout(() => {
        // Remove deleted users from state
        setUsers((prev) =>
          prev.filter((user) => !selectedUsers.some((su) => su.id === user.id))
        );
        setSelectedUsers([]);
        setLoading(false);
        alert(`Successfully deleted ${selectedUsers.length} user(s)`);
      }, 1000);
    }
  };

  const handleBulkExport = () => {
    if (selectedUsers.length === 0) {
      alert("Please select users to export");
      return;
    }

    // Convert to CSV
    const headers = [
      "ID",
      "Name",
      "Email",
      "Role",
      "Status",
      "Department",
      "Age",
    ];
    const csvContent = [
      headers.join(","),
      ...selectedUsers.map((user) =>
        [
          user.id,
          user.name,
          user.email,
          user.role,
          user.status,
          user.department,
          user.age,
        ].join(",")
      ),
    ].join("\n");

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `users_export_${new Date().toISOString()}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);

    console.log("Exported users:", selectedUsers);
  };

  const handleExportAll = () => {
    // Export all users (not just selected)
    const headers = [
      "ID",
      "Name",
      "Email",
      "Role",
      "Status",
      "Department",
      "Age",
    ];
    const csvContent = [
      headers.join(","),
      ...users.map((user) =>
        [
          user.id,
          user.name,
          user.email,
          user.role,
          user.status,
          user.department,
          user.age,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `all_users_export_${new Date().toISOString()}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  // ============================================
  // Row Actions
  // ============================================
  const handleEdit = (user: User) => {
    console.log("Edit user:", user);
    alert(`Editing user: ${user.name}`);
  };

  const handleDelete = async (user: User) => {
    const confirmed = confirm(`Are you sure you want to delete ${user.name}?`);

    if (confirmed) {
      setLoading(true);
      // API call: await fetch(`/api/users/${user.id}`, { method: 'DELETE' });
      console.log("Delete user:", user);

      setTimeout(() => {
        setUsers((prev) => prev.filter((u) => u.id !== user.id));
        setLoading(false);
        alert(`Deleted user: ${user.name}`);
      }, 500);
    }
  };

  const handleView = (user: User) => {
    console.log("View user:", user);
    alert(`Viewing user: ${user.name}`);
  };

  // ============================================
  // Render
  // ============================================
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="text-3xl font-bold mb-2">Advanced User Management</h2>
        <p className="text-gray-600">
          Search, filter, and manage users with bulk actions
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
              showFilters
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
            {hasActiveFilters() && (
              <span className="bg-white text-blue-600 text-xs px-2 py-0.5 rounded-full">
                Active
              </span>
            )}
          </button>

          {/* Clear Filters */}
          {hasActiveFilters() && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
          )}
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {/* Role Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                value={filters.role || ""}
                onChange={(e) => handleFilterChange("role", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
                <option value="moderator">Moderator</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status || ""}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Department Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <select
                value={filters.department || ""}
                onChange={(e) =>
                  handleFilterChange("department", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Departments</option>
                <option value="Engineering">Engineering</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="HR">HR</option>
              </select>
            </div>

            {/* Age Min Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Age
              </label>
              <input
                type="number"
                value={filters.ageMin || ""}
                onChange={(e) => handleFilterChange("ageMin", e.target.value)}
                placeholder="Min"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Age Max Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Age
              </label>
              <input
                type="number"
                value={filters.ageMax || ""}
                onChange={(e) => handleFilterChange("ageMax", e.target.value)}
                placeholder="Max"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions Bar */}
      {selectedUsers.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-medium text-blue-900">
              {selectedUsers.length} user(s) selected
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleBulkExport}
              className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Selected
            </button>
            <button
              onClick={handleBulkDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Additional Actions */}
      <div className="mb-4 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Showing {users.length} of {totalRecords} users
        </div>
        <button
          onClick={handleExportAll}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export All
        </button>
      </div>

      {/* Table */}
      <DynamicTable
        data={users}
        columns={columns}
        selectable
        onSelectionChange={setSelectedUsers}
        pagination
        pageSize={pageSize}
        hoverable
        striped
        loading={loading}
        emptyMessage="No users found. Try adjusting your search or filters."
        actions={[
          {
            label: "View",
            onClick: handleView,
            icon: <Eye className="w-4 h-4" />,
            variant: "secondary",
          },
          {
            label: "Edit",
            onClick: handleEdit,
            icon: <Pencil className="w-4 h-4" />,
            variant: "primary",
          },
          {
            label: "Delete",
            onClick: handleDelete,
            icon: <Trash2 className="w-4 h-4" />,
            variant: "danger",
          },
        ]}
        getRowKey={(user) => user.id.toString()}
      />
    </div>
  );
};

export default AdvancedTableExample;
