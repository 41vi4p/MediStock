'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout/Layout';
import { Medicine } from '@/types';
import { formatDate, isExpired, isExpiringSoon, getDaysUntilExpiry } from '@/lib/utils';
import { 
  AlertTriangle, 
  Calendar, 
  Package, 
  ArrowLeft,
  Filter
} from 'lucide-react';
import Link from 'next/link';

export default function ExpiredMedicines() {
  const { user } = useAuth();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'expired' | 'expiring_soon'>('all');

  useEffect(() => {
    if (!user?.familyId) {
      setLoading(false);
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
  }, [user?.familyId]);

  const filteredMedicines = medicines.filter(medicine => {
    switch (filter) {
      case 'expired':
        return isExpired(medicine.expiryDate);
      case 'expiring_soon':
        return isExpiringSoon(medicine.expiryDate) && !isExpired(medicine.expiryDate);
      default:
        return isExpired(medicine.expiryDate) || isExpiringSoon(medicine.expiryDate);
    }
  });

  const expiredCount = medicines.filter(med => isExpired(med.expiryDate)).length;
  const expiringSoonCount = medicines.filter(med => isExpiringSoon(med.expiryDate) && !isExpired(med.expiryDate)).length;

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
        </div>
      </Layout>
    );
  }

  if (!user?.familyId) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Family Setup
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              You need to create or join a family to manage medicines.
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Expired & Expiring Medicines
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Monitor medicines that need attention
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="bg-red-500 p-3 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Expired
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {expiredCount}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="bg-yellow-500 p-3 rounded-lg">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Expiring Soon
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {expiringSoonCount}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="bg-orange-500 p-3 rounded-lg">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Flagged
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {expiredCount + expiringSoonCount}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <Filter className="h-5 w-5 text-gray-400" />
            <div className="flex space-x-2">
              {[
                { key: 'all', label: 'All', count: expiredCount + expiringSoonCount },
                { key: 'expired', label: 'Expired', count: expiredCount },
                { key: 'expiring_soon', label: 'Expiring Soon', count: expiringSoonCount },
              ].map(({ key, label, count }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key as typeof filter)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    filter === key
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                      : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {label} ({count})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Medicine List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          {filteredMedicines.length === 0 ? (
            <div className="p-8 text-center">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {filter === 'all' ? 'No expired or expiring medicines' : 
                 filter === 'expired' ? 'No expired medicines' : 
                 'No medicines expiring soon'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {filter === 'all' ? 'All your medicines are still valid!' : 
                 filter === 'expired' ? 'Great! No medicines have expired.' : 
                 'No medicines are expiring in the next 30 days.'}
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredMedicines.map((medicine) => {
                const expired = isExpired(medicine.expiryDate);
                const expiringSoon = isExpiringSoon(medicine.expiryDate);
                const daysUntilExpiry = getDaysUntilExpiry(medicine.expiryDate);

                return (
                  <div key={medicine.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            {medicine.name}
                          </h3>
                          {expired && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Expired
                            </span>
                          )}
                          {!expired && expiringSoon && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                              <Calendar className="h-3 w-3 mr-1" />
                              Expiring Soon
                            </span>
                          )}
                        </div>
                        
                        {medicine.description && (
                          <p className="text-gray-600 dark:text-gray-400 mb-2">
                            {medicine.description}
                          </p>
                        )}
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-500 dark:text-gray-400">Quantity:</span>
                            <span className="ml-1 text-gray-900 dark:text-white">
                              {medicine.quantity} {medicine.unit}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-500 dark:text-gray-400">Category:</span>
                            <span className="ml-1 text-gray-900 dark:text-white">
                              {medicine.category}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-500 dark:text-gray-400">Location:</span>
                            <span className="ml-1 text-gray-900 dark:text-white">
                              {medicine.location}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-500 dark:text-gray-400">Purchase Date:</span>
                            <span className="ml-1 text-gray-900 dark:text-white">
                              {formatDate(medicine.purchaseDate)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="ml-6 text-right">
                        <div className="flex items-center space-x-2 text-sm mb-1">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400">
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
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}