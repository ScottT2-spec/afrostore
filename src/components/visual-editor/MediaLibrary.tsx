"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api-client";
import { X, Upload, Search, Folder, Image as ImageIcon, Check, Grid, List } from "lucide-react";

interface MediaItem {
  id: string;
  name: string;
  url: string;
  type: string;
  mimeType?: string;
  size?: number;
  width?: number;
  height?: number;
  alt?: string;
  folder?: string;
  createdAt: string;
}

interface MediaLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (media: MediaItem) => void;
  siteId?: string;
  allowMultiple?: boolean;
}

interface MediaLibraryResponse {
  success?: boolean;
  items?: MediaItem[];
  folders?: string[];
  pagination?: {
    total?: number;
  };
}

export default function MediaLibrary({
  isOpen,
  onClose,
  onSelect,
  siteId,
  allowMultiple = false,
}: MediaLibraryProps) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [folders, setFolders] = useState<string[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>("/");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (isOpen && siteId) {
      loadMedia();
    }
  }, [isOpen, siteId, selectedFolder, searchQuery, page]);

  const loadMedia = async () => {
    if (!siteId) return;
    
    setLoading(true);
    try {
      const params = new URLSearchParams({
        folder: selectedFolder,
        ...(searchQuery && { search: searchQuery }),
        page: page.toString(),
        limit: "30",
      });

      const res = (await api.get(`/api/sites/${siteId}/media?${params}`)) as MediaLibraryResponse;
      if (res.success) {
        setItems(res.items || []);
        setFolders(res.folders || ["/"]);
        setTotal(res.pagination?.total || 0);
      }
    } catch (err) {
      console.error("Error loading media:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !siteId) return;

    const files = Array.from(e.target.files);
    setIsUploading(true);

    for (const file of files) {
      try {
        // Create FormData for file upload
        const formData = new FormData();
        formData.append("file", file);
        formData.append("name", file.name);
        formData.append("folder", selectedFolder);
        formData.append("type", file.type.startsWith("image/") ? "IMAGE" : "DOCUMENT");

        // Upload to Supabase Storage — this also creates the MediaItem DB
        // record server-side, so no follow-up POST is needed here.
        const uploadRes = await fetch(`/api/sites/${siteId}/media/upload`, {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          const errJson = await uploadRes.json().catch(() => ({}));
          console.error("Media upload failed:", errJson.error || uploadRes.statusText);
        }
      } catch (err) {
        console.error("Error uploading file:", err);
      }
    }

    setIsUploading(false);
    loadMedia();
  };

  const toggleSelection = (item: MediaItem) => {
    if (allowMultiple) {
      const newSelection = new Set(selectedItems);
      if (newSelection.has(item.id)) {
        newSelection.delete(item.id);
      } else {
        newSelection.add(item.id);
      }
      setSelectedItems(newSelection);
    } else {
      onSelect(item);
      onClose();
    }
  };

  const handleInsertSelected = () => {
    const selected = items.filter((item) => selectedItems.has(item.id));
    if (selected.length > 0) {
      if (allowMultiple) {
        selected.forEach((item) => onSelect(item));
      } else {
        onSelect(selected[0]);
      }
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-6xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Media Library</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-4 p-4 border-b border-gray-200 dark:border-gray-700">
          {/* Upload Button */}
          <label className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg cursor-pointer transition-colors">
            <Upload className="h-4 w-4" />
            Upload
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleUpload}
              className="hidden"
              disabled={isUploading}
            />
          </label>

          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search media..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-1 border border-gray-300 dark:border-gray-600 rounded-lg">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === "grid"
                  ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
              }`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === "list"
                  ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Folder Navigation */}
        <div className="flex items-center gap-2 p-2 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          <button
            onClick={() => setSelectedFolder("/")}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors ${
              selectedFolder === "/"
                ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
                : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
            }`}
          >
            <Folder className="h-4 w-4" />
            All Media
          </button>
          {folders
            .filter((f) => f !== "/")
            .map((folder) => (
              <button
                key={folder}
                onClick={() => setSelectedFolder(folder)}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors whitespace-nowrap ${
                  selectedFolder === folder
                    ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
                }`}
              >
                <Folder className="h-4 w-4" />
                {folder}
              </button>
            ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-r-transparent" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
              <ImageIcon className="h-16 w-16 mb-4" />
              <p className="text-lg font-medium">No media found</p>
              <p className="text-sm">Upload images to get started</p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleSelection(item)}
                  className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                    selectedItems.has(item.id)
                      ? "border-blue-500 ring-2 ring-blue-500 ring-offset-2"
                      : "border-transparent hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
                >
                  <img
                    src={item.url}
                    alt={item.alt || item.name}
                    className="w-full h-full object-cover"
                  />
                  {selectedItems.has(item.id) && (
                    <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                    <p className="text-white text-xs truncate">{item.name}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleSelection(item)}
                  className={`flex items-center gap-4 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedItems.has(item.id)
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
                >
                  <img
                    src={item.url}
                    alt={item.alt || item.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {item.width && item.height ? `${item.width}x${item.height}` : ""} •{" "}
                      {item.size ? `${(item.size / 1024).toFixed(1)} KB` : ""}
                    </p>
                  </div>
                  {selectedItems.has(item.id) && (
                    <Check className="h-5 w-5 text-blue-500" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {total} item{total !== 1 ? "s" : ""}
          </p>
          {allowMultiple && selectedItems.size > 0 && (
            <button
              onClick={handleInsertSelected}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Insert Selected ({selectedItems.size})
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
