'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout/Layout';
import { Medicine } from '@/types';
import { formatDate, isExpired, isExpiringSoon, getDaysUntilExpiry } from '@/lib/utils';
import { logActivity } from '@/lib/activityLogger';
import { 
  Search, 
  Filter, 
  Calendar, 
  Package, 
  ArrowUpDown,
  X,
  AlertTriangle,
  PackageX,
  PackagePlus,
  Trash2
} from 'lucide-react';

export default function SearchMedicines() {
  const { user } = useAuth();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'out_of_stock'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'expiryDate' | 'quantity' | 'category'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [updatingStock, setUpdatingStock] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.familyId) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'medicines'),
      where('familyId', '==', user.familyId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const medicinesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        expiryDate: doc.data().expiryDate?.toDate() || new Date(),
        purchaseDate: doc.data().purchaseDate?.toDate() || new Date(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        isOutOfStock: doc.data().isOutOfStock || false,
        outOfStockDate: doc.data().outOfStockDate?.toDate() || null,
        outOfStockBy: doc.data().outOfStockBy || null,
      })) as Medicine[];
      
      setMedicines(medicinesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.familyId]);

  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(medicines.map(med => med.category))];
    return uniqueCategories.sort();
  }, [medicines]);

  const locations = useMemo(() => {
    const uniqueLocations = [...new Set(medicines.map(med => med.location))];
    return uniqueLocations.sort();
  }, [medicines]);

  const handleStockToggle = async (medicineId: string, medicineName: string, currentlyOutOfStock: boolean) => {
    if (!user || updatingStock) return;

    setUpdatingStock(medicineId);
    try {
      const updateData = {
        isOutOfStock: !currentlyOutOfStock,
        updatedAt: new Date(),
        ...(currentlyOutOfStock 
          ? {
              // Back in stock
              outOfStockDate: null,
              outOfStockBy: null
            } 
          : {
              // Out of stock
              outOfStockDate: new Date(),
              outOfStockBy: user.id
            }
        )
      };

      await updateDoc(doc(db, 'medicines', medicineId), updateData);
      
      await logActivity({
        type: currentlyOutOfStock ? 'medicine_back_in_stock' : 'medicine_out_of_stock',
        userId: user.id,
        userName: user.displayName || user.email,
        description: currentlyOutOfStock 
          ? `Marked "${medicineName}" as back in stock`
          : `Marked "${medicineName}" as out of stock`,
        familyId: user.familyId!,
        metadata: { medicineId, medicineName }
      });
    } catch (error) {
      console.error('Error updating stock status:', error);
    } finally {
      setUpdatingStock(null);
    }
  };

  const handleDeleteMedicine = async (medicineId: string, medicineName: string) => {
    if (!user || deleting) return;

    setDeleting(medicineId);
    try {
      await deleteDoc(doc(db, 'medicines', medicineId));
      await logActivity({
        type: 'medicine_deleted',
        userId: user.id,
        userName: user.displayName || user.email,
        description: `Deleted medicine: ${medicineName}`,
        familyId: user.familyId!,
        metadata: { medicineId, medicineName }
      });
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting medicine:', error);
    } finally {
      setDeleting(null);
    }
  };

  const filteredAndSortedMedicines = useMemo(() => {
    const filtered = medicines.filter(medicine => {
      const matchesSearch = searchTerm === '' || 
        medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        medicine.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        medicine.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === '' || medicine.category === selectedCategory;
      const matchesLocation = selectedLocation === '' || medicine.location === selectedLocation;
      const matchesStock = stockFilter === 'all' || 
        (stockFilter === 'in_stock' && !medicine.isOutOfStock) ||
        (stockFilter === 'out_of_stock' && medicine.isOutOfStock);
      
      return matchesSearch && matchesCategory && matchesLocation && matchesStock;
    });

    // Sort the filtered results
    filtered.sort((a, b) => {
      let aValue: string | number | Date;
      let bValue: string | number | Date;

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'expiryDate':
          aValue = a.expiryDate;
          bValue = b.expiryDate;
          break;
        case 'quantity':
          aValue = a.quantity;
          bValue = b.quantity;
          break;
        case 'category':
          aValue = a.category.toLowerCase();
          bValue = b.category.toLowerCase();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [medicines, searchTerm, selectedCategory, selectedLocation, stockFilter, sortBy, sortOrder]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedLocation('');
    setStockFilter('all');
    setSortBy('name');
    setSortOrder('asc');
  };

  const hasActiveFilters = searchTerm || selectedCategory || selectedLocation || stockFilter !== 'all';

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (!user?.familyId) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          <div className="text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Family Setup
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm sm:text-base px-4">
              You need to create or join a family to search medicines.
            </p>
            <Link
              href="/family"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Set Up Family
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Search Medicines
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm sm:text-base">
            Find and manage your medicine inventory
          </p>
        </div>

        {/* Search and Filter Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 mb-6 border border-gray-200 dark:border-gray-700">
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search medicines by name, description, or category..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Filter Toggle - Mobile responsive */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters {hasActiveFilters && '(Active)'}
            </button>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center justify-center px-3 py-2 text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 border border-red-200 dark:border-red-800 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <X className="h-4 w-4 mr-1" />
                Clear All
              </button>
            )}
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Location
                  </label>
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">All Locations</option>
                    {locations.map(location => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Stock Status
                  </label>
                  <select
                    value={stockFilter}
                    onChange={(e) => setStockFilter(e.target.value as typeof stockFilter)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="all">All Stock Status</option>
                    <option value="in_stock">In Stock</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sort By
                  </label>
                  <div className="flex space-x-2">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="name">Name</option>
                      <option value="expiryDate">Expiry Date</option>
                      <option value="quantity">Quantity</option>
                      <option value="category">Category</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                      <ArrowUpDown className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
              Search Results ({filteredAndSortedMedicines.length})
            </h2>
          </div>

          {filteredAndSortedMedicines.length === 0 ? (
            <div className="p-6 sm:p-8 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No medicines found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base px-4">
                Try adjusting your search terms or filters to find what you&apos;re looking for.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredAndSortedMedicines.map((medicine) => {
                const expired = isExpired(medicine.expiryDate);
                const expiringSoon = isExpiringSoon(medicine.expiryDate);
                const daysUntilExpiry = getDaysUntilExpiry(medicine.expiryDate);

                return (
                  <div key={medicine.id} className="p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    {/* Mobile-first layout: stack vertically on small screens, horizontal on larger screens */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-4 sm:space-y-0">
                      <div className="flex-1 min-w-0">
                        {/* Title and badges - wrap on mobile */}
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white break-words">
                            {medicine.name}
                          </h3>
                          {medicine.isOutOfStock && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 whitespace-nowrap">
                              <PackageX className="h-3 w-3 mr-1" />
                              Out of Stock
                            </span>
                          )}
                          {expired && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 whitespace-nowrap">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Expired
                            </span>
                          )}
                          {!expired && expiringSoon && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 whitespace-nowrap">
                              Expiring Soon
                            </span>
                          )}
                        </div>
                        
                        {medicine.description && (
                          <p className="text-gray-600 dark:text-gray-400 mb-2">
                            {medicine.description}
                          </p>
                        )}
                        
                        {/* Medicine details - better mobile layout */}
                        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-sm">
                          <div className="min-w-0">
                            <span className="font-medium text-gray-500 dark:text-gray-400">Quantity:</span>
                            <span className="ml-1 text-gray-900 dark:text-white break-words">
                              {medicine.quantity} {medicine.unit}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <span className="font-medium text-gray-500 dark:text-gray-400">Category:</span>
                            <span className="ml-1 text-gray-900 dark:text-white break-words">
                              {medicine.category}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <span className="font-medium text-gray-500 dark:text-gray-400">Location:</span>
                            <span className="ml-1 text-gray-900 dark:text-white break-words">
                              {medicine.location}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <span className="font-medium text-gray-500 dark:text-gray-400">Purchase:</span>
                            <span className="ml-1 text-gray-900 dark:text-white break-words">
                              {formatDate(medicine.purchaseDate)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Actions and expiry info - mobile responsive */}
                      <div className="sm:ml-6 flex flex-col sm:items-end space-y-3 min-w-0 flex-shrink-0">
                        {/* Expiry information */}
                        <div className="w-full sm:text-right">
                          <div className="flex items-center space-x-2 text-sm mb-1 justify-start sm:justify-end">
                            <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            <span className="text-gray-600 dark:text-gray-400 truncate">
                              Expires: {formatDate(medicine.expiryDate)}
                            </span>
                          </div>
                          {expired ? (
                            <p className="text-sm font-medium text-red-600 dark:text-red-400">
                              Expired {Math.abs(daysUntilExpiry)} days ago
                            </p>
                          ) : (
                            <p className={`text-sm font-medium ${
                              daysUntilExpiry <= 7 ? 'text-red-600 dark:text-red-400' :
                              daysUntilExpiry <= 30 ? 'text-yellow-600 dark:text-yellow-400' :
                              'text-gray-600 dark:text-gray-400'
                            }`}>
                              {daysUntilExpiry > 0 ? `${daysUntilExpiry} days left` : 'Expires today'}
                            </p>
                          )}
                        </div>
                        
                        {/* Action buttons - mobile responsive */}
                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                          <button
                            type="button"
                            onClick={() => handleStockToggle(medicine.id, medicine.name, medicine.isOutOfStock)}
                            disabled={updatingStock === medicine.id || deleting === medicine.id}
                            className={`flex-1 sm:flex-initial inline-flex items-center justify-center px-3 py-2 border rounded-md text-sm font-medium transition-colors disabled:opacity-50 ${
                              medicine.isOutOfStock
                                ? 'border-green-300 text-green-700 bg-green-50 hover:bg-green-100 dark:border-green-600 dark:text-green-400 dark:bg-green-900/20 dark:hover:bg-green-900/40'
                                : 'border-gray-300 text-gray-700 bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'
                            }`}
                          >
                            {medicine.isOutOfStock ? (
                              <>
                                <PackagePlus className="h-4 w-4 mr-2 flex-shrink-0" />
                                <span className="whitespace-nowrap">
                                  {updatingStock === medicine.id ? 'Updating...' : 'Mark In Stock'}
                                </span>
                              </>
                            ) : (
                              <>
                                <PackageX className="h-4 w-4 mr-2 flex-shrink-0" />
                                <span className="whitespace-nowrap">
                                  {updatingStock === medicine.id ? 'Updating...' : 'Mark Out of Stock'}
                                </span>
                              </>
                            )}
                          </button>
                          
                          {/* Delete button */}
                          <button
                            type="button"
                            onClick={() => setDeleteConfirm(medicine.id)}
                            disabled={deleting === medicine.id || updatingStock === medicine.id}
                            className="flex-1 sm:flex-initial inline-flex items-center justify-center px-3 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 dark:border-red-600 dark:text-red-400 dark:bg-red-900/20 dark:hover:bg-red-900/40 transition-colors disabled:opacity-50"
                            title="Delete medicine"
                          >
                            <Trash2 className="h-4 w-4 mr-2 sm:mr-0 flex-shrink-0" />
                            <span className="sm:hidden whitespace-nowrap">
                              {deleting === medicine.id ? 'Deleting...' : 'Delete'}
                            </span>
                          </button>
                        </div>
                        
                        {/* Out of stock date - mobile responsive */}
                        {medicine.isOutOfStock && medicine.outOfStockDate && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 text-left sm:text-right">
                            Out of stock since {formatDate(medicine.outOfStockDate)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Confirm Deletion
                </h2>
                <button
                  type="button"
                  onClick={() => setDeleteConfirm(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  title="Close dialog"
                  aria-label="Close dialog"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full">
                    <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Delete this medicine?
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Are you sure you want to permanently delete &ldquo;{medicines.find(m => m.id === deleteConfirm)?.name}&rdquo; from your inventory? This action cannot be undone.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          const medicine = medicines.find(m => m.id === deleteConfirm);
                          if (medicine) handleDeleteMedicine(medicine.id, medicine.name);
                        }}
                        disabled={deleting === deleteConfirm}
                        className="flex-1 sm:flex-initial px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
                      >
                        {deleting === deleteConfirm ? 'Deleting...' : 'Delete Medicine'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirm(null)}
                        className="flex-1 sm:flex-initial px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}