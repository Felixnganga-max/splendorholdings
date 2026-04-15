import { useState } from "react";

const API_BASE = "https://splendorholdings-2v47.vercel.app/api/v1";

/**
 * useAddProperty
 * Handles form state, image management, validation, and submission
 * for creating a new property listing.
 *
 * Images are sent as multipart/form-data under the key "images" (multiple files).
 * Auth token is read from localStorage ("accessToken").
 */
export function useAddProperty() {
  const [form, setForm] = useState({
    name: "",
    location: "",
    // ── Pricing ──────────────────────────────────────────
    price: "",
    priceLabel: "",
    offerPrice: "", // fixed offer price (mutually exclusive with discountPercent)
    discountPercent: "", // % discount       (mutually exclusive with offerPrice)
    offerExpiresAt: "", // ISO date string
    // ── Details ──────────────────────────────────────────
    beds: "",
    baths: "",
    area: "",
    type: "",
    badge: "",
    description: "",
    features: [],
    // ── Listing flags ─────────────────────────────────────
    isFeatured: false,
    featuredUntil: "", // ISO date string
  });

  // Array of { file: File, preview: string }
  const [imageFiles, setImageFiles] = useState([]);
  const [featureInput, setFeatureInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // ── Field setters ───────────────────────────────────────────────────────────
  /** For text/number inputs bound via onChange */
  const set = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
    setError("");
  };

  /** For programmatic / toggle updates */
  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError("");
  };

  // ── Offer mode helper ───────────────────────────────────────────────────────
  /**
   * Ensures offerPrice and discountPercent stay mutually exclusive.
   * Clearing one when the other is set keeps the form consistent.
   */
  const setOfferField = (key, value) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "offerPrice" && value) next.discountPercent = "";
      if (key === "discountPercent" && value) next.offerPrice = "";
      return next;
    });
    setError("");
  };

  // ── Images ──────────────────────────────────────────────────────────────────
  const addImages = (files) => {
    const incoming = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .map((file) => ({ file, preview: URL.createObjectURL(file) }));

    setImageFiles((prev) => {
      const combined = [...prev, ...incoming];
      return combined.slice(0, 10); // cap at 10
    });
  };

  const removeImage = (index) => {
    setImageFiles((prev) => {
      const copy = [...prev];
      URL.revokeObjectURL(copy[index].preview); // free memory
      copy.splice(index, 1);
      return copy;
    });
  };

  const reorderImages = (fromIndex, toIndex) => {
    setImageFiles((prev) => {
      const copy = [...prev];
      const [moved] = copy.splice(fromIndex, 1);
      copy.splice(toIndex, 0, moved);
      return copy;
    });
  };

  // ── Features ────────────────────────────────────────────────────────────────
  const addFeature = () => {
    const trimmed = featureInput.trim();
    if (!trimmed || form.features.includes(trimmed)) return;
    setForm((prev) => ({ ...prev, features: [...prev.features, trimmed] }));
    setFeatureInput("");
  };

  const removeFeature = (index) => {
    setForm((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  // ── Validation ───────────────────────────────────────────────────────────────
  const validate = () => {
    if (!form.name.trim()) return "Property name is required.";
    if (!form.location.trim()) return "Location is required.";
    if (!form.price) return "Price is required.";
    if (isNaN(Number(form.price)) || Number(form.price) < 0)
      return "Price must be a positive number.";
    if (!form.type) return "Please select a property type.";

    // Offer price and discount percent are mutually exclusive
    if (form.offerPrice && form.discountPercent)
      return "Provide either an offer price or a discount — not both.";

    if (form.offerPrice && isNaN(Number(form.offerPrice)))
      return "Offer price must be a number.";
    if (form.discountPercent) {
      const d = Number(form.discountPercent);
      if (isNaN(d) || d < 0 || d >= 100)
        return "Discount must be between 0 and 99.";
    }
    if (form.offerExpiresAt && isNaN(Date.parse(form.offerExpiresAt)))
      return "Offer expiry must be a valid date.";
    if (form.featuredUntil && isNaN(Date.parse(form.featuredUntil)))
      return "Featured until must be a valid date.";

    return null;
  };

  // ── Submit ───────────────────────────────────────────────────────────────────
  const submit = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return false;
    }

    const token = localStorage.getItem("accessToken");
    if (!token) {
      setError("You must be logged in to list a property.");
      return false;
    }

    setLoading(true);
    setError("");

    try {
      const body = new FormData();

      // ── Required fields ──────────────────────────────────────────────────
      body.append("name", form.name.trim());
      body.append("location", form.location.trim());
      body.append("price", form.price);

      // ── Optional scalar fields ───────────────────────────────────────────
      if (form.priceLabel) body.append("priceLabel", form.priceLabel.trim());
      if (form.beds) body.append("beds", form.beds);
      if (form.baths) body.append("baths", form.baths);
      if (form.area) body.append("area", form.area);
      if (form.type) body.append("type", form.type);
      if (form.badge) body.append("badge", form.badge);
      if (form.description) body.append("description", form.description.trim());

      // ── Pricing — offer fields (mutually exclusive pair) ─────────────────
      if (form.offerPrice) body.append("offerPrice", form.offerPrice);
      if (form.discountPercent)
        body.append("discountPercent", form.discountPercent);
      if (form.offerExpiresAt)
        body.append("offerExpiresAt", form.offerExpiresAt);

      // ── Listing flags ─────────────────────────────────────────────────────
      body.append("isFeatured", String(form.isFeatured));
      if (form.featuredUntil) body.append("featuredUntil", form.featuredUntil);

      // ── Features — send each item individually so express-validator ───────
      // receives features[] as an array
      form.features.forEach((f) => body.append("features[]", f));

      // ── Images — first image becomes isPrimary in the controller ──────────
      imageFiles.forEach(({ file }) => body.append("images", file));

      const res = await fetch(`${API_BASE}/properties`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // ⚠️ Do NOT set Content-Type — browser sets it with the correct boundary
        },
        credentials: "include",
        body,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to create property.");
        return false;
      }

      // ── Reset on success ──────────────────────────────────────────────────
      setSuccess(true);
      setForm({
        name: "",
        location: "",
        price: "",
        priceLabel: "",
        offerPrice: "",
        discountPercent: "",
        offerExpiresAt: "",
        beds: "",
        baths: "",
        area: "",
        type: "",
        badge: "",
        description: "",
        features: [],
        isFeatured: false,
        featuredUntil: "",
      });
      imageFiles.forEach(({ preview }) => URL.revokeObjectURL(preview));
      setImageFiles([]);
      setTimeout(() => setSuccess(false), 4000);
      return data.data.property;
    } catch {
      setError("Network error. Please check your connection and try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    set,
    setField,
    setOfferField,
    imageFiles,
    addImages,
    removeImage,
    reorderImages,
    featureInput,
    setFeatureInput,
    addFeature,
    removeFeature,
    loading,
    error,
    success,
    submit,
  };
}
