import React, { useState } from "react";
import {
  addCustomer,
  updateCustomer,
  deleteCustomer,
} from "../firebase/firestore";
import { LoadingButton } from "./LoadingSpinner";
import ResponsiveTable, { createMobileCard } from "./ResponsiveTable";
import AddCustomerModal from "./AddCustomerModal";
import EditCustomerModal from "./EditCustomerModal";
import RoleGuard, { RoleMessage } from "./RoleGuard";

const CustomerManagement = ({
  customers,
  setCustomers,
  userRole = "admin",
}) => {
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [viewMode, setViewMode] = useState("cards"); // 'cards' or 'table'
  const [loadingStates, setLoadingStates] = useState({
    adding: false,
    editing: false,
    deleting: null,
  });

  const handleAddCustomer = async (customer) => {
    try {
      setLoadingStates((prev) => ({ ...prev, adding: true }));
      const newCustomer = await addCustomer(customer);
      setCustomers([...customers, newCustomer]);
      setIsAddModalOpen(false);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoadingStates((prev) => ({ ...prev, adding: false }));
    }
  };

  const handleEditCustomer = (customer) => {
    setEditingCustomer(customer);
    setIsEditModalOpen(true);
  };

  const handleUpdateCustomer = async (id, customer) => {
    try {
      setLoadingStates((prev) => ({ ...prev, editing: true }));
      await updateCustomer(id, customer);
      setCustomers(
        customers.map((c) => (c.id === id ? { id, ...customer } : c))
      );
      setIsEditModalOpen(false);
      setEditingCustomer(null);
    } catch (error) {
      if (error.message && error.message.includes("No customer found with ID")) {
        setCustomers(customers.filter((c) => c.id !== id));
        setError("This customer has been deleted. Please add the customer again.");
        setIsEditModalOpen(false);
        setEditingCustomer(null);
      } else {
        setError(error.message);
      }
    } finally {
      setLoadingStates((prev) => ({ ...prev, editing: false }));
    }
  };

  const handleDeleteCustomer = async (id) => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      try {
        setLoadingStates((prev) => ({ ...prev, deleting: id }));
        await deleteCustomer(id);
        setCustomers(customers.filter((customer) => customer.id !== id));
      } catch (error) {
        if (error.message && error.message.includes("No customer found with ID")) {
          setCustomers(customers.filter((customer) => customer.id !== id));
          setError("This customer has been deleted.");
        } else {
          setError(error.message);
        }
      } finally {
        setLoadingStates((prev) => ({ ...prev, deleting: null }));
      }
    }
  };

  // Glassy Customer Card Component
  const CustomerCard = ({ customer }) => {
    const isDeleting = loadingStates.deleting === customer.id;
    const isEditing =
      loadingStates.editing && editingCustomer?.id === customer.id;

    return (
      <div className="group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-gray-700 rounded-2xl p-6 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 ease-out hover:border-gray-600">
        {/* Floating glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-blue-500/10 group-hover:via-purple-500/10 group-hover:to-pink-500/10 rounded-2xl transition-all duration-500 ease-out"></div>

        {/* Card content */}
        <div className="relative z-10">
          {/* Customer Avatar/Icon */}
          <div className="relative mb-4 flex items-center justify-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center border border-blue-500/30 group-hover:scale-110 transition-transform duration-300">
              <span className="text-3xl">👤</span>
            </div>
          </div>

          {/* Customer Info */}
          <div className="space-y-3 text-center">
            <div>
              <h3 className="text-xl font-bold text-white mb-1 group-hover:text-blue-300 transition-colors duration-300">
                {customer.name}
              </h3>
            </div>

            {/* Contact Details */}
            <div className="space-y-2">
              <div className="flex items-center justify-center space-x-2 text-sm">
                <span className="text-blue-400">📧</span>
                <span className="text-gray-300">
                  {customer.email || "No email"}
                </span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-sm">
                <span className="text-green-400">📞</span>
                <span className="text-gray-300">
                  {customer.phone || "No phone"}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <RoleGuard userRole={userRole} allowedRoles={["admin"]}>
              <div className="flex space-x-3 pt-4">
                <LoadingButton
                  loading={isEditing}
                  onClick={() => handleEditCustomer(customer)}
                  className="flex-1 bg-gradient-to-r from-yellow-500/80 to-orange-500/80 hover:from-yellow-400 hover:to-orange-400 text-white font-medium py-2.5 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg backdrop-blur-sm border border-yellow-500/30"
                  loadingText="Editing..."
                >
                  ✏️ Edit
                </LoadingButton>
                <LoadingButton
                  loading={isDeleting}
                  onClick={() => handleDeleteCustomer(customer.id)}
                  className="flex-1 bg-gradient-to-r from-red-500/80 to-pink-500/80 hover:from-red-400 hover:to-pink-400 text-white font-medium py-2.5 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg backdrop-blur-sm border border-red-500/30"
                  loadingText="Deleting..."
                >
                  🗑️ Delete
                </LoadingButton>
              </div>
            </RoleGuard>
          </div>
        </div>

        {/* Loading overlay */}
        {(isDeleting || isEditing) && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-2xl flex items-center justify-center z-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        )}
      </div>
    );
  };

  // Mobile card component for customers
  const CustomerMobileCard = createMobileCard(({ item: customer }) => {
    const isDeleting = loadingStates.deleting === customer.id;
    const isEditing =
      loadingStates.editing && editingCustomer?.id === customer.id;

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg text-white">{customer.name}</h3>
          <div className="flex space-x-2">
            <RoleGuard userRole={userRole} allowedRoles={["admin"]}>
              <LoadingButton
                loading={isEditing}
                onClick={() => handleEditCustomer(customer)}
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-1 px-3 rounded text-sm transition-colors"
                loadingText="Editing..."
              >
                Edit
              </LoadingButton>
              <LoadingButton
                loading={isDeleting}
                onClick={() => handleDeleteCustomer(customer.id)}
                className="bg-red-500 hover:bg-red-600 text-white font-medium py-1 px-3 rounded text-sm transition-colors"
                loadingText="Deleting..."
              >
                Delete
              </LoadingButton>
            </RoleGuard>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-blue-400">📧</span>
            <span className="text-gray-400 text-sm">Email:</span>
            <span className="text-white text-sm">
              {customer.email || "N/A"}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-green-400">📞</span>
            <span className="text-gray-400 text-sm">Phone:</span>
            <span className="text-white text-sm">
              {customer.phone || "N/A"}
            </span>
          </div>
        </div>
      </div>
    );
  });

  // Table columns configuration
  const columns = [
    {
      header: "Name",
      accessor: "name",
      sortable: true,
    },
    {
      header: "Email",
      accessor: "email",
      sortable: true,
    },
    {
      header: "Phone",
      accessor: "phone",
      sortable: true,
    },
    {
      header: "Actions",
      accessor: "actions",
      sortable: false,
      render: (customer) => (
        <RoleGuard
          userRole={userRole}
          allowedRoles={["admin"]}
          fallback={<span className="text-gray-500 text-xs">View Only</span>}
        >
          <div className="flex space-x-2">
            <LoadingButton
              loading={
                loadingStates.editing && editingCustomer?.id === customer.id
              }
              onClick={() => handleEditCustomer(customer)}
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-1 px-3 rounded text-sm transition-colors"
              loadingText="Editing..."
            >
              Edit
            </LoadingButton>
            <LoadingButton
              loading={loadingStates.deleting === customer.id}
              onClick={() => handleDeleteCustomer(customer.id)}
              className="bg-red-500 hover:bg-red-600 text-white font-medium py-1 px-3 rounded text-sm transition-colors"
              loadingText="Deleting..."
            >
              Delete
            </LoadingButton>
          </div>
        </RoleGuard>
      ),
    },
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(120,119,198,0.4),rgba(255,255,255,0))]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.4),rgba(255,255,255,0))]"></div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Role Message */}
        <RoleMessage userRole={userRole} />

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Customer Management
              </h1>
              <p className="text-gray-300">
                Manage your customers with our glassy interface
              </p>
            </div>

            {/* View Toggle */}
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <div className="flex bg-gray-800/50 backdrop-blur-md rounded-xl p-1 border border-gray-700">
                <button
                  onClick={() => setViewMode("cards")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    viewMode === "cards"
                      ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                      : "text-gray-300 hover:text-white hover:bg-gray-700/40"
                  }`}
                >
                  🃏 Cards
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    viewMode === "table"
                      ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                      : "text-gray-300 hover:text-white hover:bg-gray-700/40"
                  }`}
                >
                  📊 Table
                </button>
              </div>

              <RoleGuard userRole={userRole} allowedRoles={["admin"]}>
                <LoadingButton
                  loading={loadingStates.adding}
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg backdrop-blur-sm border border-green-500/30"
                  loadingText="Adding..."
                >
                  ➕ Add Customer
                </LoadingButton>
              </RoleGuard>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/20 backdrop-blur-md border border-red-500/30 rounded-xl p-4 mb-6">
            <div className="flex items-center space-x-2">
              <span className="text-red-400">⚠️</span>
              <span className="text-red-300">{error}</span>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-300 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        {customers.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8">
              <span className="text-6xl mb-4 block">👥</span>
              <h3 className="text-xl font-semibold text-white mb-2">
                No customers yet
              </h3>
              <p className="text-gray-400 mb-6">
                Start by adding your first customer to the system
              </p>
              <RoleGuard userRole={userRole} allowedRoles={["admin"]}>
                <LoadingButton
                  loading={loadingStates.adding}
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                  loadingText="Adding..."
                >
                  ➕ Add First Customer
                </LoadingButton>
              </RoleGuard>
            </div>
          </div>
        ) : viewMode === "cards" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {customers.map((customer, index) => (
              <CustomerCard key={`${customer.id}-${index}`} customer={customer} />
            ))}
          </div>
        ) : (
          <div className="bg-gray-800/60 backdrop-blur-md border border-gray-700 rounded-2xl overflow-hidden">
            <ResponsiveTable
              columns={columns}
              data={customers}
              mobileCard={CustomerMobileCard}
              className="text-white"
            />
          </div>
        )}

        {/* Modals */}
        <AddCustomerModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddCustomer}
          loading={loadingStates.adding}
        />

        <EditCustomerModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingCustomer(null);
          }}
          customer={editingCustomer}
          onUpdate={handleUpdateCustomer}
          loading={loadingStates.editing}
        />
      </div>
    </div>
  );
};

export default CustomerManagement;
