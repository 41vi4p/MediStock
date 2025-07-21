'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout/Layout';
import { Medicine } from '@/types';
import { formatDate, isExpired, isExpiringSoon, getDaysUntilExpiry } from '@/lib/utils';
import { 
  Pill, 
  Plus, 
  AlertTriangle, 
  Calendar, 
  TrendingUp,
  Package,
  Clock,
  X,
  MapPin,
  Tag,
  ShoppingCart
} from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!user?.familyId) {
      router.push('/family');
      return;
    }

    const q = query(
      collection(db, 'medicines'),
      where('familyId', '==', user.familyId),
      orderBy('expiryDate', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const medicinesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        expiryDate: doc.data().expiryDate?.toDate() || new Date(),
        purchaseDate: doc.data().purchaseDate?.toDate() || new Date(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Medicine[];
      
      setMedicines(medicinesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.familyId, router]);

  const expiredMedicines = medicines.filter(med => isExpired(med.expiryDate));
  const expiringSoonMedicines = medicines.filter(med => isExpiringSoon(med.expiryDate));
  const totalQuantity = medicines.reduce((sum, med) => sum + med.quantity, 0);


  const recentMedicines = medicines.slice(0, 5);

  const openMedicineModal = (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setShowModal(true);
  };

  const closeMedicineModal = () => {
    setShowModal(false);
    setSelectedMedicine(null);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.displayName}!
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Here&apos;s an overview of your medicine inventory
          </p>
        </div>

        {/* Stats Grid - Two Rows */}
        <div className="space-y-6 mb-8">
          {/* First Row - Total Medicines and Total Quantity */}
          <div className="grid grid-cols-2 gap-3 sm:gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 sm:p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="bg-blue-500 p-2 sm:p-3 rounded-lg">
                  <Package className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="ml-2 sm:ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Medicines
                  </p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                    {medicines.length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 sm:p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="bg-green-500 p-2 sm:p-3 rounded-lg">
                  <TrendingUp className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="ml-2 sm:ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Quantity
                  </p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                    {totalQuantity}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Second Row - Expiring Soon and Expired */}
          <div className="grid grid-cols-2 gap-3 sm:gap-6">
            <Link
              href="/medicines/expired"
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 sm:p-6 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            >
              <div className="flex items-center">
                <div className="bg-yellow-500 p-2 sm:p-3 rounded-lg">
                  <Clock className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="ml-2 sm:ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Expiring Soon
                  </p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                    {expiringSoonMedicines.length}
                  </p>
                  <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1 hidden sm:block">
                    Click to view details
                  </p>
                </div>
              </div>
            </Link>
            
            <Link
              href="/medicines/expired"
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 sm:p-6 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            >
              <div className="flex items-center">
                <div className="bg-red-500 p-2 sm:p-3 rounded-lg">
                  <AlertTriangle className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="ml-2 sm:ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Expired
                  </p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                    {expiredMedicines.length}
                  </p>
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1 hidden sm:block">
                    Click to view details
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8 space-y-4">
          <Link
            href="/medicines/add"
            className="bg-blue-600 hover:bg-blue-700 text-white p-4 sm:p-6 rounded-lg shadow-md transition-colors flex items-center space-x-3 sm:space-x-4 w-full sm:max-w-md"
          >
            <Plus className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-base sm:text-lg font-semibold">Add Medicine</h3>
              <p className="text-blue-100 text-sm sm:text-base">Add new medicine to inventory</p>
            </div>
          </Link>
          
          <Link
            href="/medicines/search"
            className="bg-green-600 hover:bg-green-700 text-white p-4 sm:p-6 rounded-lg shadow-md transition-colors flex items-center space-x-3 sm:space-x-4 w-full sm:max-w-md"
          >
            <Pill className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-base sm:text-lg font-semibold">View All Medicines</h3>
              <p className="text-green-100 text-sm sm:text-base">Browse and search your medicine inventory</p>
            </div>
          </Link>
        </div>

        {/* Recent Medicines */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Recent Medicines
            </h2>
          </div>
          
          {recentMedicines.length === 0 ? (
            <div className="p-8 text-center">
              <Pill className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No medicines yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Start by adding your first medicine to the inventory
              </p>
              <Link
                href="/medicines/add"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Medicine
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {recentMedicines.map((medicine) => {
                const expired = isExpired(medicine.expiryDate);
                const expiringSoon = isExpiringSoon(medicine.expiryDate);
                const daysUntilExpiry = getDaysUntilExpiry(medicine.expiryDate);

                return (
                  <div key={medicine.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 
                            className="text-lg font-medium text-gray-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            onClick={() => openMedicineModal(medicine)}
                          >
                            {medicine.name}
                          </h3>
                          {expired && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                              Expired
                            </span>
                          )}
                          {!expired && expiringSoon && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                              Expiring Soon
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                          <span>Quantity: {medicine.quantity} {medicine.unit}</span>
                          <span>Category: {medicine.category}</span>
                          <span>Location: {medicine.location}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                          <Calendar className="h-4 w-4" />
                          <span>Expires: {formatDate(medicine.expiryDate)}</span>
                        </div>
                        {!expired && (
                          <p className={`text-sm ${daysUntilExpiry <= 30 ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-600 dark:text-gray-400'}`}>
                            {daysUntilExpiry > 0 ? `${daysUntilExpiry} days left` : 'Expires today'}
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

        {/* Medicine Details Modal */}
        {showModal && selectedMedicine && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={closeMedicineModal}
          >
            <div 
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Medicine Details
                </h2>
                <button
                  onClick={closeMedicineModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Medicine Name and Status */}
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {selectedMedicine.name}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {isExpired(selectedMedicine.expiryDate) && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        Expired
                      </span>
                    )}
                    {!isExpired(selectedMedicine.expiryDate) && isExpiringSoon(selectedMedicine.expiryDate) && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                        <Clock className="h-4 w-4 mr-1" />
                        Expiring Soon
                      </span>
                    )}
                  </div>
                </div>

                {/* Description */}
                {selectedMedicine.description && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</h4>
                    <p className="text-gray-600 dark:text-gray-400">{selectedMedicine.description}</p>
                  </div>
                )}

                {/* Details Grid */}
                <div className="grid grid-cols-1 gap-4">
                  {/* Quantity */}
                  <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <Package className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Quantity</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {selectedMedicine.quantity} {selectedMedicine.unit}
                      </p>
                    </div>
                  </div>

                  {/* Category */}
                  <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <Tag className="h-5 w-5 text-green-600 dark:text-green-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Category</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">{selectedMedicine.category}</p>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <MapPin className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Storage Location</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">{selectedMedicine.location}</p>
                    </div>
                  </div>

                  {/* Expiry Date */}
                  <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <Calendar className="h-5 w-5 text-red-600 dark:text-red-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Expiry Date</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {formatDate(selectedMedicine.expiryDate)}
                      </p>
                      {!isExpired(selectedMedicine.expiryDate) && (
                        <p className={`text-sm ${getDaysUntilExpiry(selectedMedicine.expiryDate) <= 30 ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-500 dark:text-gray-400'}`}>
                          {getDaysUntilExpiry(selectedMedicine.expiryDate) > 0 
                            ? `${getDaysUntilExpiry(selectedMedicine.expiryDate)} days remaining` 
                            : 'Expires today'}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Purchase Date */}
                  <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <ShoppingCart className="h-5 w-5 text-orange-600 dark:text-orange-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Purchase Date</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {formatDate(selectedMedicine.purchaseDate)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={closeMedicineModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}