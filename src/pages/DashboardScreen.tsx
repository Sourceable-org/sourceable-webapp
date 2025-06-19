// DashboardScreen.tsx — Fixed `.startsWith` errors and legend tweaks

import { useState, useEffect, useMemo } from 'react';
import {
  Card,
  Title,
  Text,
  Button,
  AreaChart,
  DonutChart,
} from '@tremor/react';
import { format } from 'date-fns';
import { supabase } from '../utils/supabaseClient';
import { motion } from 'framer-motion';

interface MediaMetadata {
  id: string;
  created_at: string;
  file_name: string;
  file_size: number;
  file_type?: string | null;
  gps_lat?: number;
  gps_lng?: number;
  media_url?: string | null;
  public_url?: string | null;
  status: string;
}

export default function DashboardScreen() {
  const [mediaData, setMediaData] = useState<MediaMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
    const sub = supabase
      .channel('media_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'media_metadata' },
        fetchData
      )
      .subscribe();
    return () => supabase.removeChannel(sub);
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from<MediaMetadata>('media_metadata')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setMediaData(data || []);
    } catch (err: any) {
      setError(err.message || 'Error fetching');
    } finally {
      setLoading(false);
    }
  }

  const trendData = useMemo(() => {
    const counts: Record<string, number> = {};
    mediaData.forEach(({ created_at }) => {
      const day = format(new Date(created_at), 'yyyy-MM-dd');
      counts[day] = (counts[day] || 0) + 1;
    });
    return Object.entries(counts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, uploads]) => ({ date, uploads }));
  }, [mediaData]);

  const breakdownData = useMemo(() => {
    const counts: Record<string, number> = {};
    mediaData.forEach(({ file_type, media_url }) => {
      const url = (media_url || '').toLowerCase();
      const type = (file_type || '').toLowerCase();
      const isImg =
        /\.(jpe?g|png|gif|webp)$/i.test(url) || type.startsWith('image');
      const key = isImg ? 'Images' : 'Videos';
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [mediaData]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <Text className="text-gray-600 text-lg">Loading dashboard…</Text>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-pink-100">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <Text className="text-red-600 text-lg font-medium">
            Error: {error}
          </Text>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <Title className="text-4xl font-bold text-gray-800 mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Content Dashboard
          </Title>
          <Text className="text-gray-600 text-lg">
            Your uploaded content and statistics
          </Text>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-8"
        >
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-300">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {mediaData.length}
                </div>
                <Text className="text-gray-600 font-medium">Total Uploads</Text>
              </div>
            </Card>
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-300">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {breakdownData.find((d) => d.name === 'Images')?.value ?? 0}
                </div>
                <Text className="text-gray-600 font-medium">Images</Text>
              </div>
            </Card>
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-300">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {breakdownData.find((d) => d.name === 'Videos')?.value ?? 0}
                </div>
                <Text className="text-gray-600 font-medium">Videos</Text>
              </div>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left chart: hide legend dot */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-300">
              <Title className="text-xl font-semibold text-gray-800 mb-4">
                Uploads Over Time
              </Title>
              <AreaChart
                data={trendData}
                index="date"
                categories={['uploads']}
                colors={['blue']}
                curve="smooth"
                showLegend={false}
                yAxisWidth={40}
                marginTop="mt-4"
                valueFormatter={(n: number) => `${n}`}
                tooltip={({ index, value }) => (
                  <div>
                    <Text>{format(new Date(index), 'MMM d, yyyy')}</Text>
                    <Text>{`${value} upload${value !== 1 ? 's' : ''}`}</Text>
                  </div>
                )}
                className="h-64"
              />
            </Card>

            {/* Right chart: colored, labeled segments */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-300">
              <Title className="text-xl font-semibold text-gray-800 mb-4">
                Content Type Distribution
              </Title>
              <DonutChart
                data={breakdownData}
                category="value"
                index="name"
                colors={['blue', 'teal']}
                showLabel
                showLegend
                innerRadius="inner"
                marginTop="mt-4"
                tooltip={({ index, value }) => (
                  <div>
                    <Text>{index}</Text>
                    <Text>{`${value} item${value !== 1 ? 's' : ''}`}</Text>
                  </div>
                )}
                className="h-64"
              />
            </Card>
          </div>

          {/* Your Content Grid */}
          <div className="space-y-6">
            <div className="text-center">
              <Title className="text-2xl font-semibold text-gray-800 mb-2">
                Your Content
              </Title>
              <Text className="text-gray-600">
                All your uploaded media files
              </Text>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {mediaData.map((item, i) => {
                const url = (item.media_url || '').toLowerCase();
                const type = (item.file_type || '').toLowerCase();
                const isImg =
                  /\.(jpe?g|png|gif|webp)$/i.test(url) ||
                  type.startsWith('image');
                const isVid =
                  /\.(mp4|mov|webm|avi)$/i.test(url) ||
                  type.startsWith('video');
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
                  >
                    <div className="relative group">
                      {isImg ? (
                        <img
                          src={item.media_url!}
                          alt={item.file_name}
                          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : isVid ? (
                        <video
                          src={item.media_url!}
                          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                          muted
                          controls
                        />
                      ) : (
                        <div className="w-full h-48 flex items-center justify-center bg-gray-100 text-gray-500">
                          <Text>Unsupported Format</Text>
                        </div>
                      )}
                      <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                        {isImg ? '📷' : isVid ? '🎥' : '📄'}
                      </div>
                    </div>
                    <div className="p-4 space-y-2">
                      <Text className="text-xs text-gray-500">
                        📍 GPS:{' '}
                        {item.gps_lat?.toFixed(4) ?? 'N/A'},{' '}
                        {item.gps_lng?.toFixed(4) ?? 'N/A'}
                      </Text>
                      <Text className="text-xs text-gray-400">
                        📅{' '}
                        {format(new Date(item.created_at), 'MMM d, yyyy hh:mm a')}
                      </Text>
                      {item.public_url && (
                        <Button
                          size="sm"
                          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                          onClick={() =>
                            window.open(
                              `https://sourceable.vercel.app/verify/${item.public_url}`,
                              '_blank'
                            )
                          }
                        >
                          🌐 View on Website
                        </Button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {mediaData.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <div className="text-6xl mb-4">📁</div>
                <Text className="text-gray-600 text-lg">
                  No content uploaded yet
                </Text>
                <Text className="text-gray-400 text-sm mt-2">
                  Upload some content to see it here
                </Text>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
