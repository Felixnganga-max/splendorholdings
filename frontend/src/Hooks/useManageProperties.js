import { useState, useEffect, useCallback } from "react";

const API_BASE = "http://localhost:5000/api/v1";

const getToken = () => localStorage.getItem("accessToken");

export function useManageProperties() {
  const [properties, setProperties] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const limit = 12;

  const [filters, setFilters] = useState({
    search: "",
    type: "",
    badge: "",
    status: "active",
    sort: "-createdAt",
  });

  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState("");

  // ── Edit modal ──────────────────────────────────────────────────────────────
  const [editing, setEditing] = useState(null); // property object
  const [editForm, setEditForm] = useState({});
  const [editImages, setEditImages] = useState([]); // { file, preview } for NEW images
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState(false);
  const [featureInput, setFeatureInput] = useState("");

  // ── Delete confirm ──────────────────────────────────────────────────────────
  const [deleting, setDeleting] = useState(null); // property object
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // ── Fetch list ──────────────────────────────────────────────────────────────
  const fetchProperties = useCallback(async () => {
    setListLoading(true);
    setListError("");
    try {
      const params = new URLSearchParams({ page, limit, sort: filters.sort });
      if (filters.search) params.set("search", filters.search);
      if (filters.type) params.set("type", filters.type);
      if (filters.badge) params.set("badge", filters.badge);
      if (filters.status) params.set("status", filters.status);

      const res = await fetch(`${API_BASE}/properties?${params}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Failed to load properties.");

      setProperties(data.data.properties);
      setTotal(data.pagination.total);
      setPages(data.pagination.pages);
    } catch (e) {
      setListError(e.message);
    } finally {
      setListLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const setFilter = (key, value) => {
    setPage(1);
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // ── Open edit modal ─────────────────────────────────────────────────────────
  const openEdit = (property) => {
    setEditing(property);
    setEditForm({
      name: property.name,
      location: property.location,
      price: property.price,
      priceLabel: property.priceLabel || "",
      beds: property.beds,
      baths: property.baths,
      area: property.area || "",
      type: property.type,
      badge: property.badge || "",
      description: property.description || "",
      features: property.features || [],
      status: property.status,
    });
    setEditImages([]);
    setEditError("");
    setEditSuccess(false);
    setFeatureInput("");
  };

  const closeEdit = () => {
    editImages.forEach(({ preview }) => URL.revokeObjectURL(preview));
    setEditing(null);
  };

  // ── Edit form helpers ───────────────────────────────────────────────────────
  const setEditField = (key) => (e) => {
    setEditForm((prev) => ({ ...prev, [key]: e.target.value }));
    setEditError("");
  };

  const setEditDirect = (key, value) => {
    setEditForm((prev) => ({ ...prev, [key]: value }));
    setEditError("");
  };

  const addEditImages = (files) => {
    const incoming = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .map((file) => ({ file, preview: URL.createObjectURL(file) }));
    setEditImages((prev) => [...prev, ...incoming].slice(0, 10));
  };

  const removeNewImage = (idx) => {
    setEditImages((prev) => {
      const copy = [...prev];
      URL.revokeObjectURL(copy[idx].preview);
      copy.splice(idx, 1);
      return copy;
    });
  };

  const removeExistingImage = async (imageId) => {
    if (!editing) return;
    try {
      const res = await fetch(
        `${API_BASE}/properties/${editing._id}/images/${imageId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${getToken()}` },
          credentials: "include",
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Could not remove image.");
      setEditing((prev) => ({ ...prev, images: data.data.property.images }));
    } catch (e) {
      setEditError(e.message);
    }
  };

  const addFeature = () => {
    const t = featureInput.trim();
    if (!t || editForm.features.includes(t)) return;
    setEditDirect("features", [...editForm.features, t]);
    setFeatureInput("");
  };

  const removeFeature = (i) => {
    setEditDirect(
      "features",
      editForm.features.filter((_, idx) => idx !== i),
    );
  };

  // ── Submit edit ─────────────────────────────────────────────────────────────
  const submitEdit = async () => {
    if (!editing) return;
    setEditLoading(true);
    setEditError("");
    try {
      const body = new FormData();
      const fields = [
        "name",
        "location",
        "price",
        "priceLabel",
        "beds",
        "baths",
        "area",
        "type",
        "badge",
        "description",
        "status",
      ];
      fields.forEach((f) => {
        if (editForm[f] !== undefined && editForm[f] !== "")
          body.append(f, editForm[f]);
      });
      editForm.features.forEach((ft) => body.append("features[]", ft));
      editImages.forEach(({ file }) => body.append("images", file));

      const res = await fetch(`${API_BASE}/properties/${editing._id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${getToken()}` },
        credentials: "include",
        body,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed.");

      setProperties((prev) =>
        prev.map((p) => (p._id === editing._id ? data.data.property : p)),
      );
      setEditSuccess(true);
      setTimeout(() => {
        setEditSuccess(false);
        closeEdit();
      }, 1800);
    } catch (e) {
      setEditError(e.message);
    } finally {
      setEditLoading(false);
    }
  };

  // ── Delete ──────────────────────────────────────────────────────────────────
  const openDelete = (property) => {
    setDeleting(property);
    setDeleteError("");
  };
  const closeDelete = () => setDeleting(null);

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteLoading(true);
    setDeleteError("");
    try {
      const res = await fetch(`${API_BASE}/properties/${deleting._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Delete failed.");
      setProperties((prev) => prev.filter((p) => p._id !== deleting._id));
      setTotal((t) => t - 1);
      closeDelete();
    } catch (e) {
      setDeleteError(e.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  return {
    // list
    properties,
    total,
    pages,
    page,
    setPage,
    filters,
    setFilter,
    listLoading,
    listError,
    fetchProperties,
    // edit
    editing,
    editForm,
    editImages,
    editLoading,
    editError,
    editSuccess,
    featureInput,
    setFeatureInput,
    openEdit,
    closeEdit,
    setEditField,
    setEditDirect,
    addEditImages,
    removeNewImage,
    removeExistingImage,
    addFeature,
    removeFeature,
    submitEdit,
    // delete
    deleting,
    deleteLoading,
    deleteError,
    openDelete,
    closeDelete,
    confirmDelete,
  };
}
