'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { motion } from 'motion/react'
import { Upload, X, Eye, Trash2, Image as ImageIcon } from 'lucide-react'
import { DashboardLayout } from '@/components/admin/layout/DashboardLayout'
import { createClient } from '@/lib/supabase/client'
import { DESIGN_SYSTEM } from '@/lib/admin/designSystem'
import { toast } from 'sonner'
import imageCompression from 'browser-image-compression'

interface GalleryImage {
  id: string
  title?: string
  description?: string
  image_url: string
  storage_path: string
  category: 'hostel' | 'food' | 'rooms' | 'events' | 'general'
  sort_order: number
  is_active: boolean
  created_at: string
}

const CATEGORIES = ['hostel', 'food', 'rooms', 'events', 'general']

const MOCK_GALLERY: GalleryImage[] = [
  {
    id: '1',
    title: 'Hostel Entrance',
    image_url: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=500&h=500&fit=crop',
    storage_path: 'hostel/entrance.jpg',
    category: 'hostel',
    sort_order: 0,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Common Area',
    image_url: 'https://images.unsplash.com/photo-1562595481-e92d025b6b7f?w=500&h=500&fit=crop',
    storage_path: 'hostel/common.jpg',
    category: 'hostel',
    sort_order: 1,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Room View',
    image_url: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=500&h=500&fit=crop',
    storage_path: 'rooms/room1.jpg',
    category: 'rooms',
    sort_order: 2,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '4',
    title: 'Dining Area',
    image_url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=500&h=500&fit=crop',
    storage_path: 'food/dining.jpg',
    category: 'food',
    sort_order: 3,
    is_active: true,
    created_at: new Date().toISOString(),
  },
]

export default function GalleryPage() {
  const supabase = createClient()
  const [images, setImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [filter, setFilter] = useState<string>('all')
  const [dragActive, setDragActive] = useState(false)
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null)
  const [isMockData, setIsMockData] = useState(false)

  const fetchImages = useCallback(async () => {
    try {
      setLoading(true)
      setIsMockData(false)
      
      let query = supabase
        .from('gallery')
        .select('*')
        .order('sort_order', { ascending: true })

      const { data, error } = await query

      // Check if table doesn't exist
      if (error?.message?.includes('Could not find the table')) {
        console.warn('Gallery table not found, using mock data')
        setImages(MOCK_GALLERY)
        setIsMockData(true)
        return
      }

      if (error) throw error
      setImages(data || [])
    } catch (error) {
      console.error('Failed to fetch images:', error)
      // Fallback to mock data on any error
      setImages(MOCK_GALLERY)
      setIsMockData(true)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchImages()
  }, [fetchImages])

  const filteredImages = images.filter(img => {
    if (filter === 'all') return true
    return img.category === filter
  })

  const compressAndUploadImage = async (file: File, category: string) => {
    if (isMockData) {
      toast.info('Using mock data - upload disabled. Set up gallery table in Supabase.')
      return
    }

    try {
      setUploading(true)

      // Compress image
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      }
      const compressedFile = await imageCompression(file, options)

      // Generate unique filename
      const fileExt = compressedFile.name.split('.').pop()
      const fileName = `${crypto.randomUUID()}.${fileExt}`
      const storagePath = `${category}/${fileName}`

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('gallery')
        .upload(storagePath, compressedFile)

      if (error) throw error

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('gallery').getPublicUrl(storagePath)

      // Save to database
      const { data: imgData, error: dbError } = await supabase
        .from('gallery')
        .insert({
          title: file.name.replace(/\.[^/.]+$/, ''),
          image_url: publicUrl,
          storage_path: storagePath,
          category,
          sort_order: images.length,
          is_active: true,
        })
        .select()

      if (dbError) throw dbError

      setImages(prev => [...prev, imgData[0]])
      toast.success('Image uploaded successfully')
    } catch (error) {
      console.error('Upload failed:', error)
      toast.error('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragActive(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        await compressAndUploadImage(files[i], 'general')
      }
    }
  }

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files
    if (files && files.length > 0) {
      const category = (document.getElementById('category-select') as HTMLSelectElement)
        ?.value || 'general'
      for (let i = 0; i < files.length; i++) {
        await compressAndUploadImage(files[i], category)
      }
    }
  }

  const handleDelete = async (image: GalleryImage) => {
    if (!window.confirm('Delete this image?')) return

    if (isMockData) {
      // Allow delete in mock mode for local state only
      setImages(prev => prev.filter(img => img.id !== image.id))
      toast.success('Image deleted (mock mode)')
      return
    }

    try {
      // Delete from storage
      await supabase.storage.from('gallery').remove([image.storage_path])

      // Delete from database
      await supabase.from('gallery').delete().eq('id', image.id)

      setImages(prev => prev.filter(img => img.id !== image.id))
      toast.success('Image deleted')
    } catch (error) {
      console.error('Delete failed:', error)
      toast.error('Failed to delete image')
    }
  }

  const handleToggleActive = async (image: GalleryImage) => {
    if (isMockData) {
      // Allow toggle in mock mode for local state only
      setImages(prev =>
        prev.map(img =>
          img.id === image.id ? { ...img, is_active: !img.is_active } : img
        )
      )
      toast.success(image.is_active ? 'Image hidden (mock mode)' : 'Image shown (mock mode)')
      return
    }

    try {
      await supabase
        .from('gallery')
        .update({ is_active: !image.is_active })
        .eq('id', image.id)

      setImages(prev =>
        prev.map(img =>
          img.id === image.id ? { ...img, is_active: !img.is_active } : img
        )
      )
      toast.success(image.is_active ? 'Image hidden' : 'Image shown')
    } catch (error) {
      console.error('Update failed:', error)
      toast.error('Failed to update image')
    }
  }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Mock Data Banner */}
        {isMockData && (
          <div className="p-4 rounded-lg bg-blue-500/20 border border-blue-500/40 text-blue-300 text-sm flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">ℹ️</div>
            <div>
              <p className="font-medium">Using Sample Data</p>
              <p className="text-xs mt-1 opacity-90">Gallery table not found in Supabase. Showing sample images. Set up the gallery table to enable uploads and database operations.</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Gallery</h1>
          <p className="text-gray-400">Manage hostel gallery and showcase images</p>
        </div>

        {/* Upload Zone */}
        <motion.div
          onDragOver={e => {
            e.preventDefault()
            setDragActive(true)
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all ${
            dragActive
              ? 'border-amber-500/50 bg-amber-500/10'
              : 'border-amber-500/20 hover:border-amber-500/40'
          }`}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center">
              <Upload className="text-amber-400" size={32} />
            </div>
            <div>
              <p className="text-white font-semibold mb-1">Drag images here or click to browse</p>
              <p className="text-sm text-gray-400">Supports JPG, PNG, WebP, GIF (Max 5MB each)</p>
            </div>

            <div className="flex gap-2 flex-wrap justify-center">
              <select
                id="category-select"
                defaultValue="general"
                className="px-4 py-2 rounded-lg bg-white/5 border border-amber-500/20 text-white text-sm focus:outline-none"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
              <label className="px-4 py-2 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-all cursor-pointer text-sm font-medium">
                Choose Files
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileInput}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>

            {uploading && (
              <p className="text-sm text-amber-400">Uploading images...</p>
            )}
          </div>
        </motion.div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
              filter === 'all'
                ? 'bg-amber-500/30 text-amber-400 border border-amber-500/50'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            All ({images.length})
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                filter === cat
                  ? 'bg-amber-500/30 text-amber-400 border border-amber-500/50'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)} (
              {images.filter(img => img.category === cat).length})
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-96 text-gray-400">
            Loading gallery...
          </div>
        ) : filteredImages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 text-gray-400">
            <ImageIcon size={48} className="mb-4 opacity-50" />
            <p>No images in this category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredImages.map((image, idx) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="group relative rounded-lg overflow-hidden bg-white/5 border border-white/10 hover:border-amber-500/30 transition-all"
              >
                {/* Image */}
                <div className="aspect-square overflow-hidden">
                  <img
                    src={image.image_url}
                    alt={image.title || 'Gallery image'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <button
                    onClick={() => setSelectedImage(image)}
                    className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-all"
                    title="View"
                  >
                    <Eye size={20} />
                  </button>
                  <button
                    onClick={() => handleToggleActive(image)}
                    className={`px-3 py-2 rounded-lg transition-all text-sm font-medium ${
                      image.is_active
                        ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                        : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
                    }`}
                    title={image.is_active ? 'Hide' : 'Show'}
                  >
                    {image.is_active ? 'Active' : 'Hidden'}
                  </button>
                  <button
                    onClick={() => handleDelete(image)}
                    className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-all"
                    title="Delete"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>

                {/* Info */}
                {image.title && (
                  <div className="p-3 border-t border-white/10">
                    <p className="text-sm text-white truncate font-medium">{image.title}</p>
                    <p className="text-xs text-gray-500">
                      {image.category.charAt(0).toUpperCase() + image.category.slice(1)}
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Image Preview Modal */}
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="max-w-4xl w-full max-h-96 relative"
              onClick={e => e.stopPropagation()}
            >
              <img
                src={selectedImage.image_url}
                alt={selectedImage.title || 'Gallery image'}
                className="w-full h-full object-contain rounded-lg"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 p-2 rounded-lg bg-black/50 hover:bg-black/70 text-white transition-all"
              >
                <X size={24} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </DashboardLayout>
  )
}
