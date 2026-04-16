import { useState, useEffect, useCallback } from "react";

const API_BASE = "https://splendorholdings-2v47.vercel.app/api/v1";
const getToken = () => localStorage.getItem("accessToken");
const authHeaders = () => ({ Authorization: `Bearer ${getToken()}` });

// ─── Helpers ──────────────────────────────────────────────────────────────────
export const formatKES = (amount) => {
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
    sort: "-isFeatured -createdAt",
    isFeatured: "",
    isSoldOut: "",
    listingIntent: "",
    listingMode: "",
    minPrice: "",
    maxPrice: "",
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
        // fall through
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
        includeHidden: "true",
      });
      if (filters.search) params.set("search", filters.search);
      if (filters.type) params.set("type", filters.type);
      if (filters.badge) params.set("badge", filters.badge);
      if (filters.status) params.set("status", filters.status);
      if (filters.isFeatured) params.set("isFeatured", filters.isFeatured);
      if (filters.isSoldOut) params.set("isSoldOut", filters.isSoldOut);
      if (filters.listingIntent)
        params.set("listingIntent", filters.listingIntent);
      if (filters.listingMode) params.set("listingMode", filters.listingMode);
      if (filters.minPrice) params.set("minPrice", filters.minPrice);
      if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);

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

  // ── Quick toggles ───────────────────────────────────────────────────────────
  const toggleVisibility = async (property) => {
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

  // Live sale pricing preview
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
    const rp = property.rentalPricing || {};
    const la = property.landArea || {};

    let offerMode = "none";
    if (p.discountPercent != null) offerMode = "percent";
    else if (p.offerPrice != null) offerMode = "fixed";

    setEditing(property);
    setEditFormState({
      // Identity
      name: property.name || "",
      buildingName: property.buildingName || "",
      location: property.location || "",

      // Listing
      listingMode: property.listingMode || "whole",
      listingIntent: property.listingIntent || "sale",

      // Sale pricing
      price: p.original ?? "",
      priceLabel: p.label || "",
      offerMode,
      discountPercent: p.discountPercent ?? "",
      offerPrice: p.offerPrice ?? "",
      offerExpiresAt: p.offerExpiresAt
        ? new Date(p.offerExpiresAt).toISOString().split("T")[0]
        : "",

      // Rental pricing
      rentPerDay: rp.rentPerDay ?? "",
      rentPerMonth: rp.rentPerMonth ?? "",
      rentalLabel: rp.label || "",

      // Land area
      landAreaValue: la.value ?? "",
      landAreaUnit: la.unit || "sqm",

      // Specs
      beds: property.beds ?? "",
      baths: property.baths ?? "",
      area: property.area ?? "",

      // Classification
      type: property.type || "",
      badge: property.badge || "",
      status: property.status || "active",
      description: property.description || "",
      features: property.features || [],

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
      const f = editForm;

      // ── Identity
      body.append("name", f.name);
      body.append("location", f.location);
      if (f.buildingName) body.append("buildingName", f.buildingName);
      else body.append("buildingName", ""); // allow clearing

      // ── Listing
      body.append("listingMode", f.listingMode);
      body.append("listingIntent", f.listingIntent);

      // ── Sale pricing
      const showSale = f.listingIntent === "sale" || f.listingIntent === "both";
      if (showSale && f.price !== "") {
        body.append("price", f.price);
        if (f.priceLabel) body.append("priceLabel", f.priceLabel);
        if (f.offerMode === "percent" && f.discountPercent !== "") {
          body.append("discountPercent", f.discountPercent);
          if (f.offerExpiresAt) body.append("offerExpiresAt", f.offerExpiresAt);
        } else if (f.offerMode === "fixed" && f.offerPrice !== "") {
          body.append("offerPrice", f.offerPrice);
          if (f.offerExpiresAt) body.append("offerExpiresAt", f.offerExpiresAt);
        } else if (f.offerMode === "none") {
          body.append("clearOffer", "true");
        }
      }

      // ── Rental pricing
      const showRent = f.listingIntent === "rent" || f.listingIntent === "both";
      if (showRent) {
        if (f.rentPerDay !== "") body.append("rentPerDay", f.rentPerDay);
        if (f.rentPerMonth !== "") body.append("rentPerMonth", f.rentPerMonth);
        if (f.rentalLabel) body.append("rentalLabel", f.rentalLabel);
      }

      // ── Land area
      if (f.landAreaValue !== "") {
        body.append("landAreaValue", f.landAreaValue);
        body.append("landAreaUnit", f.landAreaUnit);
      }

      // ── Specs
      if (f.beds !== "") body.append("beds", f.beds);
      if (f.baths !== "") body.append("baths", f.baths);
      if (f.area !== "") body.append("area", f.area);

      // ── Classification
      body.append("type", f.type);
      if (f.badge) body.append("badge", f.badge);
      body.append("status", f.status);
      if (f.description) body.append("description", f.description);
      f.features.forEach((ft) => body.append("features", ft));

      // ── Toggles
      body.append("isVisible", f.isVisible);
      body.append("isSoldOut", f.isSoldOut);
      body.append("isFeatured", f.isFeatured);
      if (f.featuredUntil) body.append("featuredUntil", f.featuredUntil);

      // ── New images
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
