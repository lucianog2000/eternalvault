import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Package, Shield, Clock, MessageCircle } from 'lucide-react';
import { useCapsules } from '../contexts/CapsuleContext';
import { Capsule } from '../services/supabaseService';
import CapsuleCard from '../components/Capsules/CapsuleCard';
import CapsuleForm from '../components/Capsules/CapsuleForm';

const Capsules: React.FC = () => {
  const { capsules, createCapsule, updateCapsule, deleteCapsule, isLoading } = useCapsules();
  const [showForm, setShowForm] = useState(false);
  const [editingCapsule, setEditingCapsule] = useState<Capsule | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Calculate stats directly from capsules state - no async needed
  const stats = React.useMemo(() => {
    const activeCapsules = capsules.filter(c => c.is_active);
    const categoryStats = capsules.reduce((acc, capsule) => {
      acc[capsule.category] = (acc[capsule.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalCapsules: capsules.length,
      activeCapsules: activeCapsules.length,
      capsulesByCategory: {
        passwords: categoryStats.passwords || 0,
        messages: categoryStats.messages || 0,
        instructions: categoryStats.instructions || 0,
        assets: categoryStats.assets || 0
      }
    };
  }, [capsules]);

  const filteredCapsules = capsules.filter(capsule => {
    const matchesSearch = capsule.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         capsule.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || capsule.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreateCapsule = () => {
    setEditingCapsule(undefined);
    setShowForm(true);
  };

  const handleEditCapsule = (capsule: Capsule) => {
    setEditingCapsule(capsule);
    setShowForm(true);
  };

  const handleSaveCapsule = async (capsuleData: any) => {
    try {
      if (editingCapsule) {
        await updateCapsule(editingCapsule.id, capsuleData);
      } else {
        await createCapsule(capsuleData);
      }
      setShowForm(false);
      setEditingCapsule(undefined);
    } catch (error) {
      console.error('Error saving capsule:', error);
      // Error is handled by the context
    }
  };

  const handleDeleteCapsule = async (id: string) => {
    if (confirm('Are you sure you want to delete this capsule? This action cannot be undone.')) {
      try {
        await deleteCapsule(id);
      } catch (error) {
        console.error('Error deleting capsule:', error);
        // Error is handled by the context
      }
    }
  };

  if (isLoading && capsules.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-2 text-white/70">Loading capsules...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <Package className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Legacy Capsules</h1>
        <p className="text-white/70 max-w-2xl mx-auto">
          Create and manage secure capsules with the most important information for your loved ones.
          Each capsule protects specific content with military-grade encryption.
        </p>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/10 text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Secure Passwords</h3>
          <p className="text-white/70 text-sm">
            Protect banking credentials and important digital access
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/10 text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Personal Messages</h3>
          <p className="text-white/70 text-sm">
            Last words and life advice for each special person
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/10 text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Package className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Detailed Instructions</h3>
          <p className="text-white/70 text-sm">
            Important processes and critical document locations
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/10 text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Automatic Unlock</h3>
          <p className="text-white/70 text-sm">
            Smart rules that activate access when needed most
          </p>
        </div>
      </div>

      {/* Header with Action */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Capsule Management</h2>
          <p className="text-white/70">
            Organize and protect the information you want to preserve for your loved ones
          </p>
        </div>
        <button
          onClick={handleCreateCapsule}
          disabled={isLoading}
          className="mt-4 md:mt-0 flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all disabled:opacity-50"
        >
          <Plus className="w-5 h-5" />
          <span>New Capsule</span>
        </button>
      </div>

      {/* Stats - Now calculated synchronously */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/10">
          <div className="flex items-center space-x-2 mb-2">
            <Package className="w-5 h-5 text-blue-300" />
            <span className="text-white/70 text-sm">Total Capsules</span>
          </div>
          <p className="text-2xl font-bold text-white">{stats.totalCapsules}</p>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/10">
          <div className="flex items-center space-x-2 mb-2">
            <Shield className="w-5 h-5 text-green-300" />
            <span className="text-white/70 text-sm">Active</span>
          </div>
          <p className="text-2xl font-bold text-green-300">{stats.activeCapsules}</p>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/10">
          <div className="flex items-center space-x-2 mb-2">
            <Shield className="w-5 h-5 text-red-300" />
            <span className="text-white/70 text-sm">Passwords</span>
          </div>
          <p className="text-2xl font-bold text-red-300">{stats.capsulesByCategory.passwords}</p>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/10">
          <div className="flex items-center space-x-2 mb-2">
            <MessageCircle className="w-5 h-5 text-purple-300" />
            <span className="text-white/70 text-sm">Messages</span>
          </div>
          <p className="text-2xl font-bold text-purple-300">{stats.capsulesByCategory.messages}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white">Legacy Capsules</h3>
            <p className="text-white/60 text-sm">Manage the content you want to preserve</p>
          </div>
          <div className="text-white/60 text-sm">
            {filteredCapsules.length} of {capsules.length} capsule{capsules.length !== 1 ? 's' : ''}
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search capsules..."
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="pl-10 pr-8 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
            >
              <option value="all">All categories</option>
              <option value="passwords">🔐 Passwords</option>
              <option value="instructions">📋 Instructions</option>
              <option value="messages">💌 Messages</option>
              <option value="assets">💎 Digital Assets</option>
            </select>
          </div>
        </div>

        {/* Capsules Grid */}
        {filteredCapsules.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCapsules.map((capsule) => (
              <CapsuleCard
                key={capsule.id}
                capsule={capsule}
                onEdit={handleEditCapsule}
                onDelete={handleDeleteCapsule}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-white/30 mx-auto mb-3" />
            <p className="text-white/60">
              {searchTerm || filterCategory !== 'all' 
                ? 'No capsules found with those filters' 
                : 'No capsules created'
              }
            </p>
            {(!searchTerm && filterCategory === 'all') && (
              <button
                onClick={handleCreateCapsule}
                className="text-purple-300 hover:text-purple-200 text-sm mt-2 inline-block"
              >
                Create first capsule
              </button>
            )}
          </div>
        )}
      </div>

      {/* Security Information */}
      <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-md rounded-xl p-6 border border-purple-300/20">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-400 rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">🔐 Capsule Security</h3>
            <div className="grid md:grid-cols-2 gap-4 text-white/80">
              <div>
                <p className="mb-2"><strong>Advanced Protection:</strong></p>
                <ul className="text-sm space-y-1 text-white/70">
                  <li>• Supabase PostgreSQL with Row Level Security</li>
                  <li>• Encrypted storage and secure transmission</li>
                  <li>• Access controlled by smart rules</li>
                  <li>• Complete audit trail of all access</li>
                </ul>
              </div>
              <div>
                <p className="mb-2"><strong>Smart Features:</strong></p>
                <ul className="text-sm space-y-1 text-white/70">
                  <li>• Self-destructing capsules for maximum security</li>
                  <li>• Automatic unlock based on inactivity</li>
                  <li>• Granular access control via access keys</li>
                  <li>• Real-time synchronization across devices</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <CapsuleForm
          capsule={editingCapsule}
          onSave={handleSaveCapsule}
          onCancel={() => {
            setShowForm(false);
            setEditingCapsule(undefined);
          }}
        />
      )}
    </div>
  );
};

export default Capsules;