'use client';

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
  Clock
} from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);

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

  const stats = [
    {
      title: 'Total Medicines',
      value: medicines.length,
      icon: Package,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Quantity',
      value: totalQuantity,
      icon: TrendingUp,
      color: 'bg-green-500',
    },
    {
      title: 'Expiring Soon',
      value: expiringSoonMedicines.length,
      icon: Clock,
      color: 'bg-yellow-500',
    },
    {
      title: 'Expired',
      value: expiredMedicines.length,
      icon: AlertTriangle,
      color: 'bg-red-500',
    },
  ];

  const recentMedicines = medicines.slice(0, 5);

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

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.title}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center">
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            href="/medicines/add"
            className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-lg shadow-md transition-colors flex items-center space-x-4"
          >
            <Plus className="h-8 w-8" />
            <div>
              <h3 className="text-lg font-semibold">Add Medicine</h3>
              <p className="text-blue-100">Add new medicine to inventory</p>
            </div>
          </Link>
          
          <Link
            href="/medicines/expired"
            className="bg-red-600 hover:bg-red-700 text-white p-6 rounded-lg shadow-md transition-colors flex items-center space-x-4"
          >
            <AlertTriangle className="h-8 w-8" />
            <div>
              <h3 className="text-lg font-semibold">View Expired</h3>
              <p className="text-red-100">Check expired medicines</p>
            </div>
          </Link>
          
          <Link
            href="/medicines/search"
            className="bg-green-600 hover:bg-green-700 text-white p-6 rounded-lg shadow-md transition-colors flex items-center space-x-4"
          >
            <Pill className="h-8 w-8" />
            <div>
              <h3 className="text-lg font-semibold">Search Medicines</h3>
              <p className="text-green-100">Find specific medicines</p>
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
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
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
      </div>
    </Layout>
  );
}