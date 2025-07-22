'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  doc, 
  updateDoc, 
  deleteDoc,
  orderBy 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout/Layout';
import { ShoppingItem } from '@/types';
import { logActivity } from '@/lib/activityLogger';
import { 
  ShoppingCart, 
  Plus, 
  Trash2, 
  Check,
  ArrowLeft,
  Package2,
  AlertCircle,
  Star,
  X
} from 'lucide-react';
import Link from 'next/link';

export default function ShoppingList() {
  const { user } = useAuth();
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    category: '',
    priority: 'medium' as 'low' | 'medium' | 'high'
  });
  const [submitting, setSubmitting] = useState(false);
  const [completingItem, setCompletingItem] = useState<string | null>(null);
  const [deletingItem, setDeletingItem] = useState<string | null>(null);
  const [bulkActionMode, setBulkActionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [bulkActioning, setBulkActioning] = useState(false);

  useEffect(() => {
    if (!user?.familyId) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'shopping'),
      where('familyId', '==', user.familyId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const itemsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        completedAt: doc.data().completedAt?.toDate() || null,
      })) as ShoppingItem[];
      
      setItems(itemsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.familyId]);

  const categories = [
    'Pain Relief',
    'Antibiotics',
    'Vitamins',
    'Cold & Flu',
    'Digestive',
    'Heart & Blood Pressure',
    'Diabetes',
    'Allergy',
    'Skin Care',
    'First Aid',
    'Other'
  ];

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newItem.name.trim() || submitting) return;

    setSubmitting(true);
    try {
      const itemData = {
        name: newItem.name.trim(),
        description: newItem.description.trim() || null,
        category: newItem.category || 'Other',
        priority: newItem.priority,
        addedBy: user.id,
        addedByName: user.displayName || user.email,
        familyId: user.familyId!,
        createdAt: new Date(),
        isCompleted: false
      };

      await addDoc(collection(db, 'shopping'), itemData);
      await logActivity({
        type: 'shopping_item_added',
        userId: user.id,
        userName: user.displayName || user.email,
        description: `Added "${newItem.name}" to shopping list`,
        familyId: user.familyId!,
        metadata: { itemName: newItem.name, category: newItem.category, priority: newItem.priority }
      });

      setNewItem({ name: '', description: '', category: '', priority: 'medium' });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding item:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompleteItem = async (itemId: string, itemName: string) => {
    if (!user || completingItem) return;

    setCompletingItem(itemId);
    try {
      await updateDoc(doc(db, 'shopping', itemId), {
        isCompleted: true,
        completedBy: user.id,
        completedAt: new Date()
      });
      
      await logActivity({
        type: 'shopping_item_removed',
        userId: user.id,
        userName: user.displayName || user.email,
        description: `Completed shopping item: ${itemName}`,
        familyId: user.familyId!,
        metadata: { itemId, itemName }
      });
    } catch (error) {
      console.error('Error completing item:', error);
    } finally {
      setCompletingItem(null);
    }
  };

  const handleDeleteItem = async (itemId: string, itemName: string) => {
    if (!user || deletingItem) return;

    setDeletingItem(itemId);
    try {
      await deleteDoc(doc(db, 'shopping', itemId));
      await logActivity({
        type: 'shopping_item_removed',
        userId: user.id,
        userName: user.displayName || user.email,
        description: `Deleted shopping item: ${itemName}`,
        familyId: user.familyId!,
        metadata: { itemId, itemName }
      });
    } catch (error) {
      console.error('Error deleting item:', error);
    } finally {
      setDeletingItem(null);
    }
  };

  const handleSelectItem = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedItems.size === pendingItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(pendingItems.map(item => item.id)));
    }
  };

  const handleBulkComplete = async () => {
    if (!user || selectedItems.size === 0 || bulkActioning) return;

    setBulkActioning(true);
    try {
      const completePromises = Array.from(selectedItems).map(async (itemId) => {
        const item = items.find(i => i.id === itemId);
        if (item && !item.isCompleted) {
          await updateDoc(doc(db, 'shopping', itemId), {
            isCompleted: true,
            completedBy: user.id,
            completedAt: new Date()
          });
          await logActivity({
            type: 'shopping_item_removed',
            userId: user.id,
            userName: user.displayName || user.email,
            description: `Bulk completed shopping item: ${item.name}`,
            familyId: user.familyId!,
            metadata: { itemId, itemName: item.name }
          });
        }
      });
      
      await Promise.all(completePromises);
      setSelectedItems(new Set());
      setBulkActionMode(false);
    } catch (error) {
      console.error('Error bulk completing items:', error);
    } finally {
      setBulkActioning(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!user || selectedItems.size === 0 || bulkActioning) return;

    setBulkActioning(true);
    try {
      const deletePromises = Array.from(selectedItems).map(async (itemId) => {
        const item = items.find(i => i.id === itemId);
        if (item) {
          await deleteDoc(doc(db, 'shopping', itemId));
          await logActivity({
            type: 'shopping_item_removed',
            userId: user.id,
            userName: user.displayName || user.email,
            description: `Bulk deleted shopping item: ${item.name}`,
            familyId: user.familyId!,
            metadata: { itemId, itemName: item.name }
          });
        }
      });
      
      await Promise.all(deletePromises);
      setSelectedItems(new Set());
      setBulkActionMode(false);
    } catch (error) {
      console.error('Error bulk deleting items:', error);
    } finally {
      setBulkActioning(false);
    }
  };

  const handleClearCompleted = async () => {
    if (!user || bulkActioning) return;

    const completedItemsToDelete = completedItems.slice(0, 10); // Clear first 10 completed items
    if (completedItemsToDelete.length === 0) return;

    setBulkActioning(true);
    try {
      const deletePromises = completedItemsToDelete.map(async (item) => {
        await deleteDoc(doc(db, 'shopping', item.id));
        await logActivity({
          type: 'shopping_item_removed',
          userId: user.id,
          userName: user.displayName || user.email,
          description: `Cleared completed shopping item: ${item.name}`,
          familyId: user.familyId!,
          metadata: { itemId: item.id, itemName: item.name }
        });
      });
      
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error clearing completed items:', error);
    } finally {
      setBulkActioning(false);
    }
  };

  const pendingItems = items.filter(item => !item.isCompleted);
  const completedItems = items.filter(item => item.isCompleted);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
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

  if (!user?.familyId) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Family Setup
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              You need to create or join a family to manage shopping lists.
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Medicine Shopping List
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Keep track of medicines you need to buy
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {completedItems.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearCompleted}
                  disabled={bulkActioning}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {bulkActioning ? 'Clearing...' : `Clear Completed (${Math.min(completedItems.length, 10)})`}
                </button>
              )}
              
              {pendingItems.length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    setBulkActionMode(!bulkActionMode);
                    setSelectedItems(new Set());
                  }}
                  className={`inline-flex items-center px-3 py-2 border rounded-md shadow-sm text-sm font-medium ${
                    bulkActionMode
                      ? 'border-gray-300 text-gray-700 bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'
                      : 'border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100 dark:border-blue-600 dark:text-blue-400 dark:bg-blue-900/20 dark:hover:bg-blue-900/40'
                  }`}
                >
                  {bulkActionMode ? 'Cancel Bulk Actions' : 'Bulk Actions'}
                </button>
              )}
              
              <button
                type="button"
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="bg-blue-500 p-3 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Pending Items
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {pendingItems.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="bg-green-500 p-3 rounded-lg">
                <Check className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Completed
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {completedItems.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="bg-red-500 p-3 rounded-lg">
                <AlertCircle className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  High Priority
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {pendingItems.filter(item => item.priority === 'high').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Items */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 mb-6">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Items to Buy ({pendingItems.length})
              </h2>
              
              {/* Bulk Selection Controls */}
              {bulkActionMode && pendingItems.length > 0 && (
                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    {selectedItems.size === pendingItems.length ? 'Deselect All' : 'Select All'}
                  </button>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedItems.size} selected
                  </span>
                  {selectedItems.size > 0 && (
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={handleBulkComplete}
                        disabled={bulkActioning}
                        className="inline-flex items-center px-3 py-2 border border-green-300 rounded-md text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 dark:border-green-600 dark:text-green-400 dark:bg-green-900/20 dark:hover:bg-green-900/40 transition-colors disabled:opacity-50"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        {bulkActioning ? 'Completing...' : `Complete (${selectedItems.size})`}
                      </button>
                      <button
                        type="button"
                        onClick={handleBulkDelete}
                        disabled={bulkActioning}
                        className="inline-flex items-center px-3 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 dark:border-red-600 dark:text-red-400 dark:bg-red-900/20 dark:hover:bg-red-900/40 transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        {bulkActioning ? 'Removing...' : `Remove (${selectedItems.size})`}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {pendingItems.length === 0 ? (
            <div className="p-8 text-center">
              <Package2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No items in your shopping list
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Add medicines you need to buy to keep track of your shopping needs.
              </p>
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Item
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {pendingItems.map((item) => (
                <div key={item.id} className={`p-6 transition-colors ${
                  bulkActionMode 
                    ? selectedItems.has(item.id) 
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500' 
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}>
                  <div className="flex items-start justify-between">
                    {bulkActionMode && (
                      <div className="flex items-start mr-4 mt-1">
                        <input
                          type="checkbox"
                          checked={selectedItems.has(item.id)}
                          onChange={() => handleSelectItem(item.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          aria-label={`Select ${item.name} for bulk action`}
                          title={`Select ${item.name} for bulk action`}
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          {item.name}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                          {item.priority === 'high' && <Star className="h-3 w-3 mr-1" />}
                          {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}
                        </span>
                      </div>
                      
                      {item.description && (
                        <p className="text-gray-600 dark:text-gray-400 mb-2">
                          {item.description}
                        </p>
                      )}
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <span>Category: {item.category}</span>
                        <span>Added by: {item.addedByName}</span>
                        <span>Added: {item.createdAt.toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    {!bulkActionMode && (
                      <div className="flex items-center space-x-2 ml-6">
                        <button
                          type="button"
                          onClick={() => handleCompleteItem(item.id, item.name)}
                          disabled={completingItem === item.id}
                          className="inline-flex items-center px-3 py-1.5 border border-green-300 rounded-md text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 dark:border-green-600 dark:text-green-400 dark:bg-green-900/20 dark:hover:bg-green-900/40 transition-colors disabled:opacity-50"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          {completingItem === item.id ? 'Completing...' : 'Mark as Bought'}
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => handleDeleteItem(item.id, item.name)}
                          disabled={deletingItem === item.id}
                          className="inline-flex items-center px-3 py-1.5 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 dark:border-red-600 dark:text-red-400 dark:bg-red-900/20 dark:hover:bg-red-900/40 transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          {deletingItem === item.id ? 'Removing...' : 'Remove'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Completed Items (if any) */}
        {completedItems.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Recently Completed ({completedItems.length})
              </h2>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {completedItems.slice(0, 5).map((item) => (
                <div key={item.id} className="p-6 opacity-60">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-1">
                        <Check className="h-5 w-5 text-green-500" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white line-through">
                          {item.name}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Completed on {item.completedAt?.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add Item Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Add Shopping Item
                </h2>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handleAddItem} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Medicine Name *
                  </label>
                  <input
                    type="text"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter medicine name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description (optional)
                  </label>
                  <textarea
                    value={newItem.description}
                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Any additional notes"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Priority
                  </label>
                  <select
                    value={newItem.priority}
                    onChange={(e) => setNewItem({ ...newItem, priority: e.target.value as 'low' | 'medium' | 'high' })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    disabled={!newItem.name.trim() || submitting}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Adding...' : 'Add Item'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}