import React, { useState } from "react";
import { addVendor, updateVendor, deleteVendor } from "../firebase/firestore";
import { LoadingButton } from "./LoadingSpinner";
import ResponsiveTable, { createMobileCard } from "./ResponsiveTable";
import AddVendorModal from "./AddVendorModal";
import EditVendorModal from "./EditVendorModal";
import RoleGuard, { ReadOnlyWrapper, RoleMessage } from "./RoleGuard";

const VendorManagement = ({ vendors, setVendors, userRole = "admin" }) => {
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [viewMode, setViewMode] = useState("cards"); // 'cards' or 'table'
  const [loadingStates, setLoadingStates] = useState({
    adding: false,
    editing: false,
    deleting: null,
  });

  const handleAddVendor = async (vendor) => {
    try {
      setLoadingStates((prev) => ({ ...prev, adding: true }));
      const newVendor = await addVendor(vendor);
      setVendors([...vendors, newVendor]);
      setIsAddModalOpen(false);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoadingStates((prev) => ({ ...prev, adding: false }));
    }
  };

  const handleEditVendor = (vendor) => {
    setEditingVendor(vendor);
    setIsEditModalOpen(true);
  };

  const handleUpdateVendor = async (id, vendor) => {
    try {
      setLoadingStates((prev) => ({ ...prev, editing: true }));
      await updateVendor(id, vendor);
      setVendors(vendors.map((v) => (v.id === id ? { id, ...vendor } : v)));
      setIsEditModalOpen(false);
      setEditingVendor(null);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoadingStates((prev) => ({ ...prev, editing: false }));
    }
  };

  const handleDeleteVendor = async (id) => {
    if (window.confirm("Are you sure you want to delete this vendor?")) {
      try {
        setLoadingStates((prev) => ({ ...prev, deleting: id }));
        await deleteVendor(id);
        setVendors(vendors.filter((vendor) => vendor.id !== id));
      } catch (error) {
        setError(error.message);
      } finally {
        setLoadingStates((prev) => ({ ...prev, deleting: null }));
      }
    }
  };

  // Glassy Vendor Card Component
  const VendorCard = ({ vendor }) => {
    const isDeleting = loadingStates.deleting === vendor.id;
    const isEditing = loadingStates.editing && editingVendor?.id === vendor.id;

    return (
      <div className="group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 ease-out hover:border-white/30">
        {/* Floating glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-pink-500/0 to-red-500/0 group-hover:from-purple-500/10 group-hover:via-pink-500/10 group-hover:to-red-500/10 rounded-2xl transition-all duration-500 ease-out"></div>

        {/* Card content */}
        <div className="relative z-10">
          {/* Vendor Avatar/Icon */}
          <div className="relative mb-4 flex items-center justify-center">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center border border-purple-500/30 group-hover:scale-110 transition-transform duration-300">
              <span className="text-3xl">🏢</span>
            </div>
          </div>

          {/* Vendor Info */}
          <div className="space-y-3 text-center">
            <div>
              <h3 className="text-xl font-bold text-white mb-1 group-hover:text-purple-300 transition-colors duration-300">
                {vendor.name}
              </h3>
            </div>

            {/* Contact Details */}
            <div className="space-y-2">
              <div className="flex items-center justify-center space-x-2 text-sm">
                <span className="text-purple-400">👤</span>
                <span className="text-gray-300">
                  {vendor.contactPerson || "No contact"}
                </span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-sm">
                <span className="text-blue-400">📧</span>
                <span className="text-gray-300">
                  {vendor.email || "No email"}
                </span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-sm">
                <span className="text-green-400">📞</span>
                <span className="text-gray-300">
                  {vendor.phone || "No phone"}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <RoleGuard userRole={userRole} allowedRoles={["admin"]}>
              <div className="flex space-x-3 pt-4">
                <LoadingButton
                  loading={isEditing}
                  onClick={() => handleEditVendor(vendor)}
                  className="flex-1 bg-gradient-to-r from-yellow-500/80 to-orange-500/80 hover:from-yellow-400 hover:to-orange-400 text-white font-medium py-2.5 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg backdrop-blur-sm border border-yellow-500/30"
                  loadingText="Editing..."
                >
                  ✏️ Edit
                </LoadingButton>
                <LoadingButton
                  loading={isDeleting}
                  onClick={() => handleDeleteVendor(vendor.id)}
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

  // Mobile card component for vendors
  const VendorMobileCard = createMobileCard(({ item: vendor }) => {
    const isDeleting = loadingStates.deleting === vendor.id;
    const isEditing = loadingStates.editing && editingVendor?.id === vendor.id;

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg text-white">{vendor.name}</h3>
          <RoleGuard userRole={userRole} allowedRoles={["admin"]}>
            <div className="flex space-x-2">
              <LoadingButton
                loading={isEditing}
                onClick={() => handleEditVendor(vendor)}
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-1 px-3 rounded text-sm transition-colors"
                loadingText="Editing..."
              >
                Edit
              </LoadingButton>
              <LoadingButton
                loading={isDeleting}
                onClick={() => handleDeleteVendor(vendor.id)}
                className="bg-red-500 hover:bg-red-600 text-white font-medium py-1 px-3 rounded text-sm transition-colors"
                loadingText="Deleting..."
              >
                Delete
              </LoadingButton>
            </div>
          </RoleGuard>
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-purple-400">👤</span>
            <span className="text-gray-400 text-sm">Contact:</span>
            <span className="text-white text-sm">
              {vendor.contactPerson || "N/A"}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-blue-400">📧</span>
            <span className="text-gray-400 text-sm">Email:</span>
            <span className="text-white text-sm">{vendor.email || "N/A"}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-green-400">📞</span>
            <span className="text-gray-400 text-sm">Phone:</span>
            <span className="text-white text-sm">{vendor.phone || "N/A"}</span>
          </div>
        </div>
      </div>
    );
  });

  // Table columns configuration
  const columns = [
    {
      header: "Name",
      key: "name",
      cellClassName: "font-medium",
    },
    {
      header: "Contact Person",
      key: "contactPerson",
    },
    {
      header: "Email",
      key: "email",
    },
    {
      header: "Phone",
      key: "phone",
    },
    {
      header: "Actions",
      key: "actions",
      render: (vendor) => (
        <RoleGuard
          userRole={userRole}
          allowedRoles={["admin"]}
          fallback={<span className="text-gray-500 text-xs">View Only</span>}
        >
          <div className="flex space-x-2">
            <LoadingButton
              loading={loadingStates.editing && editingVendor?.id === vendor.id}
              onClick={() => handleEditVendor(vendor)}
              className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded text-sm"
              loadingText="Editing..."
            >
              Edit
            </LoadingButton>
            <LoadingButton
              loading={loadingStates.deleting === vendor.id}
              onClick={() => handleDeleteVendor(vendor.id)}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm"
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
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-3 sm:p-6 rounded-2xl shadow-2xl mt-4 sm:mt-8 max-w-full overflow-hidden border border-white/10">
      {/* Role Message */}
      <RoleMessage userRole={userRole} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent mb-4 sm:mb-0">
          🏢 Vendor Management
        </h2>

        {/* View Toggle & Add Button */}
        <div className="flex items-center space-x-4">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-xl p-1 border border-white/20">
            <button
              onClick={() => setViewMode("cards")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                viewMode === "cards"
                  ? "bg-purple-500 text-white shadow-lg"
                  : "text-gray-300 hover:text-white hover:bg-white/10"
              }`}
            >
              🎴 Cards
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                viewMode === "table"
                  ? "bg-purple-500 text-white shadow-lg"
                  : "text-gray-300 hover:text-white hover:bg-white/10"
              }`}
            >
              📊 Table
            </button>
          </div>

          {/* Add Vendor Button */}
          <RoleGuard userRole={userRole} allowedRoles={["admin"]}>
            <LoadingButton
              loading={loadingStates.adding}
              onClick={() => setIsAddModalOpen(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white font-bold py-2.5 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg backdrop-blur-sm border border-purple-500/30"
              loadingText="Adding..."
            >
              ➕ Add Vendor
            </LoadingButton>
          </RoleGuard>
        </div>
      </div>

      {/* Modals */}
      {isAddModalOpen && (
        <AddVendorModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddVendor}
        />
      )}

      {isEditModalOpen && (
        <EditVendorModal
          isOpen={isEditModalOpen}
          vendor={editingVendor}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingVendor(null);
          }}
          onUpdate={handleUpdateVendor}
        />
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl mb-6 backdrop-blur-sm">
          {error}
        </div>
      )}

      {/* Content */}
      {viewMode === "cards" ? (
        /* Cards View */
        <div>
          {vendors.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🏢</div>
              <h3 className="text-xl font-semibold text-gray-300 mb-2">
                No vendors found
              </h3>
              <p className="text-gray-400 mb-6">
                Add your first vendor to get started!
              </p>
              <RoleGuard userRole={userRole} allowedRoles={["admin"]}>
                <LoadingButton
                  loading={loadingStates.adding}
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105"
                  loadingText="Adding..."
                >
                  ➕ Add Your First Vendor
                </LoadingButton>
              </RoleGuard>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {vendors.map((vendor) => (
                <VendorCard key={vendor.id} vendor={vendor} />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Table View */
        <ResponsiveTable
          data={vendors}
          columns={columns}
          mobileCardComponent={VendorMobileCard}
          emptyMessage="No vendors found. Add your first vendor to get started!"
          className="mt-4"
        />
      )}
    </div>
  );
};

export default VendorManagement;
