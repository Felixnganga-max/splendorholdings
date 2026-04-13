import { useState } from "react";

const API_BASE = "http://localhost:5000/api/v1";

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
    price: "",
    priceLabel: "",
    beds: "",
    baths: "",
    area: "",
    type: "",
    badge: "",
    description: "",
    features: [],
  });

  // Array of { file: File, preview: string }
  const [imageFiles, setImageFiles] = useState([]);
  const [featureInput, setFeatureInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // ── Field setter ────────────────────────────────────────────────────────────
  const set = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
    setError("");
  };

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError("");
  };

  // ── Images ──────────────────────────────────────────────────────────────────
  const addImages = (files) => {
    const incoming = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .map((file) => ({ file, preview: URL.createObjectURL(file) }));

    setImageFiles((prev) => {
      const combined = [...prev, ...incoming];
      // cap at 10
      return combined.slice(0, 10);
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

      // Scalar fields
      body.append("name", form.name.trim());
      body.append("location", form.location.trim());
      body.append("price", form.price);
      if (form.priceLabel) body.append("priceLabel", form.priceLabel.trim());
      if (form.beds) body.append("beds", form.beds);
      if (form.baths) body.append("baths", form.baths);
      if (form.area) body.append("area", form.area);
      if (form.type) body.append("type", form.type);
      if (form.badge) body.append("badge", form.badge);
      if (form.description) body.append("description", form.description.trim());

      // Features — send each item individually so express-validator
      // receives features[] as an array
      form.features.forEach((f) => body.append("features[]", f));

      // Images — first image will become isPrimary in the controller
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

      // Reset everything on success
      setSuccess(true);
      setForm({
        name: "",
        location: "",
        price: "",
        priceLabel: "",
        beds: "",
        baths: "",
        area: "",
        type: "",
        badge: "",
        description: "",
        features: [],
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
