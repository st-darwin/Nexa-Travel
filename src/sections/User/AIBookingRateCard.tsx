import React, { useEffect, useState } from 'react';
import { database, appwriteConfig } from '../../appwrite/client';
import { Query } from 'appwrite';
import { TrendingUp, AlertCircle ,  Clock, CheckCircle2, BeakerIcon} from 'lucide-react';

interface BookingStats {
  totalGenerated: number;
  confirmedBookings: number;
  pendingBookings: number;
  conversionRate: number;
}

export const AIBookingRateCard: React.FC = () => {
  const [stats, setStats] = useState<BookingStats>({
    totalGenerated: 0,
    confirmedBookings: 0,
    pendingBookings: 0,
    conversionRate: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const calculateBookingRate = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch trips collection documents
      const response = await database.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.tripCollectionId,
        [Query.limit(100)]
      );

      const docs = response.documents;
      const totalGenerated = response.total;

      if (totalGenerated === 0) {
        setStats({
          totalGenerated: 0,
          confirmedBookings: 0,
          pendingBookings: 0,
          conversionRate: 0,
        });
        return;
      }

      // Safe evaluation across schema attributes
      const confirmedCount = docs.filter((doc) => {
        const bStatus = (doc.bookingStatus || '').toLowerCase();
        const pStatus = (doc.paymentStatus || '').toLowerCase();
        return bStatus === 'confirmed' || pStatus === 'paid';
      }).length;

      const pendingCount = docs.filter((doc) => {
        const bStatus = (doc.bookingStatus || '').toLowerCase();
        return bStatus === 'pending';
      }).length;

      const rate = (confirmedCount / totalGenerated) * 100;

      setStats({
        totalGenerated,
        confirmedBookings: confirmedCount,
        pendingBookings: pendingCount,
        conversionRate: Math.round(rate),
      });
    } catch (err: any) {
      console.error('Failed to calculate AI Booking Rate:', err);
      setError('Could not sync conversion telemetry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateBookingRate();
  }, []);

  if (loading) {
    return (
      <div className="p-6 bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/80 animate-pulse flex flex-col justify-between h-44 shadow-sm">
        <div className="flex justify-between items-center">
          <div className="h-4 w-32 bg-slate-200 rounded-md"></div>
          <div className="h-8 w-8 bg-slate-100 rounded-lg"></div>
        </div>
        <div className="h-9 w-24 bg-slate-200 rounded-md my-2"></div>
        <div className="h-2 w-full bg-slate-100 rounded-full"></div>
        <div className="flex justify-between mt-2">
          <div className="h-3 w-16 bg-slate-100 rounded"></div>
          <div className="h-3 w-16 bg-slate-100 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50/50 backdrop-blur-md rounded-2xl border border-red-200/80 text-red-600 flex items-center gap-3">
        <AlertCircle size={20} className="shrink-0" />
        <span className="text-xs font-semibold tracking-wide">{error}</span>
      </div>
    );
  }

  return (
    <div className="group relative p-6 bg-white rounded-2xl border border-slate-200/90 text-slate-900 flex flex-col justify-between shadow-sm hover:shadow-lg transition-all duration-300 ease-in-out overflow-hidden">
      {/* Subtle Background Accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-slate-100/50 to-transparent rounded-bl-full pointer-events-none transition-transform group-hover:scale-110" />

      {/* Card Header */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">
            AI Conversion Rate
          </span>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
            <BeakerIcon size={10} className="mr-1 text-slate-500" /> Live
          </span>
        </div>
        <div className="p-2 bg-slate-900 text-white rounded-xl shadow-sm transition-transform group-hover:scale-105">
          <TrendingUp size={16} />
        </div>
      </div>

      {/* Main Metric Display */}
      <div className="my-4 flex items-baseline justify-between z-10">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-4xl font-black tracking-tight text-slate-900">
              {stats.conversionRate}%
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {stats.confirmedBookings} finalized from {stats.totalGenerated} generated trips
          </p>
        </div>

        {/* Mini Radial Indicator */}
        <div className="relative w-12 h-12 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-slate-100"
              strokeWidth="3.5"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="text-slate-900 transition-all duration-700 ease-out"
              strokeDasharray={`${stats.conversionRate}, 100`}
              strokeWidth="3.5"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
        </div>
      </div>

      {/* Linear Progress Bar */}
      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/60 z-10">
        <div
          className="bg-slate-900 h-full transition-all duration-700 ease-out rounded-full"
          style={{ width: `${stats.conversionRate}%` }}
        />
      </div>

      {/* Status Badges Subtext */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs z-10">
        <div className="flex items-center gap-1.5 text-slate-600 font-medium">
          <Clock size={13} className="text-amber-500" />
          <span>Pending:</span>
          <span className="font-bold text-slate-900">{stats.pendingBookings}</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-600 font-medium">
          <CheckCircle2 size={13} className="text-emerald-600" />
          <span>Confirmed:</span>
          <span className="font-bold text-slate-900">{stats.confirmedBookings}</span>
        </div>
      </div>
    </div>
  );
};