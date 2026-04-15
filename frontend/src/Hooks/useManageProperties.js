import { useState, useEffect, useCallback } from "react";

const API_BASE = "http://localhost:5000/api/v1";
const getToken = () => localStorage.getItem("accessToken");

const authHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatKES = (amount) => {
  if (!amount && amount !== 0) return "";
  if (amount >= 1_000_000) {
    const m = amount / 1_000_000;
    return `KES ${Number.isInteger(m) ? m : m.toFixed(1)}M`;
  }
  if (amount >= 1_000) return `KES ${(amount / 1_000).toFixed(0)}K`;
  return `KES ${amount.toLocaleString()}`;
};

const calcEffective = (original, discountPercent, offerPrice, expiresAt) => {
  const now = new Date();
  const active = !expiresAt || now <= new Date(expiresAt);
  if (active && offerPrice != null && offerPrice !== "")
    return Number(offerPrice);
  if (active && discountPercent != null && discountPercent !== "")
    return Number(original) * (1 - Number(discountPercent) / 100);
  return Number(original);
};

export function useManageProperties() {
  // ── List state ──────────────────────────────────────────────────────────────
  const [properties, setProperties] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const limit = 12;

  const [filters, setFilters] = useState({
    search: "",
    type: "",
    badge: "",
    status: "",
    sort: "-createdAt",
    isFeatured: "",
    isSoldOut: "",
  });

  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState("");

  // ── Dynamic categories ──────────────────────────────────────────────────────
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [badges, setBadges] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      setCategoriesLoading(true);
      try {
        const res = await fetch(`${API_BASE}/categories`, {
          headers: authHeaders(),
          credentials: "include",
        });
        const data = await res.json();
        if (res.ok) {
          const cats = data.data.categories;
          setPropertyTypes(
            cats.filter((c) => c.kind === "type").map((c) => c.label),
          );
          setBadges(cats.filter((c) => c.kind === "badge").map((c) => c.label));
        }
      } catch {
        // fall through — UI will show empty pills, not crash
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // ── Fetch list ──────────────────────────────────────────────────────────────
  const fetchProperties = useCallback(async () => {
    setListLoading(true);
    setListError("");
    try {
      const params = new URLSearchParams({
        page,
        limit,
        sort: filters.sort,
        includeHidden: "true", // admin sees everything
      });
      if (filters.search) params.set("search", filters.search);
      if (filters.type) params.set("type", filters.type);
      if (filters.badge) params.set("badge", filters.badge);
      if (filters.status) params.set("status", filters.status);
      if (filters.isFeatured) params.set("isFeatured", filters.isFeatured);
      if (filters.isSoldOut) params.set("isSoldOut", filters.isSoldOut);

      const res = await fetch(`${API_BASE}/properties?${params}`, {
        headers: authHeaders(),
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

  // ── Quick toggles (optimistic update) ──────────────────────────────────────
  const toggleVisibility = async (property) => {
    // Optimistic
    setProperties((prev) =>
      prev.map((p) =>
        p._id === property._id ? { ...p, isVisible: !p.isVisible } : p,
      ),
    );
    try {
      const res = await fetch(
        `${API_BASE}/properties/${property._id}/visibility`,
        {
          method: "PATCH",
          headers: authHeaders(),
          credentials: "include",
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setProperties((prev) =>
        prev.map((p) =>
          p._id === property._id ? { ...p, isVisible: data.data.isVisible } : p,
        ),
      );
    } catch {
      // revert on failure
      setProperties((prev) =>
        prev.map((p) =>
          p._id === property._id ? { ...p, isVisible: property.isVisible } : p,
        ),
      );
    }
  };

  const toggleSoldOut = async (property) => {
    setProperties((prev) =>
      prev.map((p) =>
        p._id === property._id ? { ...p, isSoldOut: !p.isSoldOut } : p,
      ),
    );
    try {
      const res = await fetch(
        `${API_BASE}/properties/${property._id}/sold-out`,
        {
          method: "PATCH",
          headers: authHeaders(),
          credentials: "include",
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setProperties((prev) =>
        prev.map((p) =>
          p._id === property._id
            ? { ...p, isSoldOut: data.data.isSoldOut, status: data.data.status }
            : p,
        ),
      );
    } catch {
      setProperties((prev) =>
        prev.map((p) =>
          p._id === property._id ? { ...p, isSoldOut: property.isSoldOut } : p,
        ),
      );
    }
  };

  // ── Edit state ──────────────────────────────────────────────────────────────
  const [editing, setEditing] = useState(null);
  const [editForm, setEditFormState] = useState({});
  const [editImages, setEditImages] = useState([]);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState(false);
  const [featureInput, setFeatureInput] = useState("");

  // Derived: live pricing preview
  const editPricingPreview = (() => {
    const { price, discountPercent, offerPrice, offerExpiresAt, offerMode } =
      editForm;
    if (!price) return null;
    const disc = offerMode === "percent" ? discountPercent : null;
    const fixed = offerMode === "fixed" ? offerPrice : null;
    const effective = calcEffective(price, disc, fixed, offerExpiresAt);
    const savings = Number(price) - effective;
    const savingsPct =
      savings > 0 ? Math.round((savings / Number(price)) * 100) : 0;
    return { effective, savings, savingsPct };
  })();

  const openEdit = (property) => {
    const p = property.pricing || {};
    // Determine which offer mode is active
    let offerMode = "none";
    if (p.discountPercent != null) offerMode = "percent";
    else if (p.offerPrice != null) offerMode = "fixed";

    setEditing(property);
    setEditFormState({
      name: property.name || "",
      location: property.location || "",
      price: p.original ?? property.price ?? "",
      priceLabel: p.label || property.priceLabel || "",
      beds: property.beds ?? "",
      baths: property.baths ?? "",
      area: property.area ?? "",
      type: property.type || "",
      badge: property.badge || "",
      description: property.description || "",
      features: property.features || [],
      status: property.status || "active",
      // Pricing offer
      offerMode, // "none" | "percent" | "fixed"
      discountPercent: p.discountPercent ?? "",
      offerPrice: p.offerPrice ?? "",
      offerExpiresAt: p.offerExpiresAt
        ? new Date(p.offerExpiresAt).toISOString().split("T")[0]
        : "",
      // Toggles
      isVisible: property.isVisible ?? true,
      isSoldOut: property.isSoldOut ?? false,
      isFeatured: property.isFeatured ?? false,
      featuredUntil: property.featuredUntil
        ? new Date(property.featuredUntil).toISOString().split("T")[0]
        : "",
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

  const setEditField = (key) => (e) => {
    setEditFormState((prev) => ({ ...prev, [key]: e.target.value }));
    setEditError("");
  };

  const setEditDirect = (key, value) => {
    setEditFormState((prev) => ({ ...prev, [key]: value }));
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
        { method: "DELETE", headers: authHeaders(), credentials: "include" },
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

      // Core scalar fields
      const scalars = [
        "name",
        "location",
        "beds",
        "baths",
        "area",
        "type",
        "badge",
        "description",
        "status",
      ];
      scalars.forEach((f) => {
        if (editForm[f] !== undefined && editForm[f] !== "")
          body.append(f, editForm[f]);
      });

      // Pricing
      body.append("price", editForm.price);
      if (editForm.priceLabel) body.append("priceLabel", editForm.priceLabel);

      if (editForm.offerMode === "percent" && editForm.discountPercent !== "") {
        body.append("discountPercent", editForm.discountPercent);
        if (editForm.offerExpiresAt)
          body.append("offerExpiresAt", editForm.offerExpiresAt);
      } else if (editForm.offerMode === "fixed" && editForm.offerPrice !== "") {
        body.append("offerPrice", editForm.offerPrice);
        if (editForm.offerExpiresAt)
          body.append("offerExpiresAt", editForm.offerExpiresAt);
      } else if (editForm.offerMode === "none") {
        body.append("clearOffer", "true");
      }

      // Toggles
      body.append("isVisible", editForm.isVisible);
      body.append("isSoldOut", editForm.isSoldOut);
      body.append("isFeatured", editForm.isFeatured);
      if (editForm.featuredUntil)
        body.append("featuredUntil", editForm.featuredUntil);

      // Features — send as features not features[]
      editForm.features.forEach((ft) => body.append("features", ft));

      // New images
      editImages.forEach(({ file }) => body.append("images", file));

      const res = await fetch(`${API_BASE}/properties/${editing._id}`, {
        method: "PATCH",
        headers: authHeaders(),
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
  const [deleting, setDeleting] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

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
        headers: authHeaders(),
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
    // categories
    propertyTypes,
    badges,
    categoriesLoading,
    // quick toggles
    toggleVisibility,
    toggleSoldOut,
    // edit
    editing,
    editForm,
    editImages,
    editLoading,
    editError,
    editSuccess,
    editPricingPreview,
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
    // utils
    formatKES,
  };
}
