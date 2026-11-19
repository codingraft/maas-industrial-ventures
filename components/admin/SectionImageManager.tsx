"use client";

import { useState } from "react";
import Image from "next/image";
import { SiteSettings, HeroSlide, GalleryItem, SectionImage, MasterPlanItem, GalleryCategory } from "@/lib/types";
import { ToastContainer, ConfirmModal, ToastMessage } from "@/components/admin/AdminDialogs";
import { AdminTabs } from "@/components/admin/ui/AdminTabs";
import { uploadImage } from "@/lib/imageOptimizer";
import { MediaPickerModal } from "@/components/admin/MediaPickerModal";

interface SectionImageManagerProps {
  initialMedia: SiteSettings["media"];
  onUpdate: (updated: SiteSettings["media"]) => Promise<void>;
}

export function SectionImageManager({ initialMedia, onUpdate }: SectionImageManagerProps) {
  const [media, setMedia] = useState(initialMedia);
  const [activeSection, setActiveSection] = useState<
    "hero" | "overview" | "infra" | "masterplan" | "location" | "gallery" | "logo"
  >("hero");

  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [pickerModal, setPickerModal] = useState<{
    isOpen: boolean;
    onSelect: (url: string, alt?: string) => void;
    currentUrl?: string;
    title?: string;
  }>({
    isOpen: false,
    onSelect: () => {},
  });

  // In-app toasts & modal dialogs
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    action: () => {},
  });

  // Gallery new item form state
  const [newGalCategory, setNewGalCategory] = useState<string>("manufacturing");
  const [newGalCaption, setNewGalCaption] = useState("");
  const [newGalAlt, setNewGalAlt] = useState("");

  // Category creation state
  const [newCatLabel, setNewCatLabel] = useState("");

  // Master plan new item form state
  const [newPlanTitle, setNewPlanTitle] = useState("");
  const [newPlanSubtitle, setNewPlanSubtitle] = useState("");
  const [newPlanTag, setNewPlanTag] = useState("");
  const [newPlanDesc, setNewPlanDesc] = useState("");

  function addToast(type: "success" | "error" | "info", title: string, message?: string) {
    const id = "toast-" + Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }

  function dismissToast(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  function notify(msg: string) {
    addToast("success", msg);
  }

  async function uploadFile(file: File): Promise<string> {
    return await uploadImage(file);
  }

  /* --- 1. HERO SLIDER HANDLERS --- */
  async function handleHeroSlideImageUpload(slideIndex: number, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingField(`hero-${slideIndex}`);
    try {
      const url = await uploadFile(file);
      const nextSlides = [...media.heroSlides];
      nextSlides[slideIndex] = { ...nextSlides[slideIndex], src: url };
      const nextMedia = { ...media, heroSlides: nextSlides, hero: nextSlides[0].src };
      setMedia(nextMedia);
      await onUpdate(nextMedia);
      notify(`Hero Slide #${slideIndex + 1} image updated!`);
    } catch (err: unknown) {
      addToast("error", "Upload error", err instanceof Error ? err.message : "Upload error");
    } finally {
      setUploadingField(null);
    }
  }

  async function handleHeroSlideFieldChange(
    slideIndex: number,
    field: keyof HeroSlide,
    value: string
  ) {
    const nextSlides = [...media.heroSlides];
    nextSlides[slideIndex] = { ...nextSlides[slideIndex], [field]: value };
    const nextMedia = { ...media, heroSlides: nextSlides };
    setMedia(nextMedia);
    await onUpdate(nextMedia);
  }

  function handleAddNewHeroSlide() {
    setPickerModal({
      isOpen: true,
      title: "Select or Upload Image for New Hero Slide",
      onSelect: async (url, alt) => {
        const newSlide: HeroSlide = {
          id: `slide-${Date.now()}`,
          src: url,
          alt: alt || "MAAS Industrial infrastructure perspective",
          eyebrow: "NEW DEVELOPMENT PERSPECTIVE",
          title: "Developing Land. Building Opportunities.",
          subtitle: "High-capacity industrial infrastructure engineered for modern manufacturing and enterprise growth.",
        };
        const nextSlides = [...media.heroSlides, newSlide];
        const nextMedia = { ...media, heroSlides: nextSlides };
        setMedia(nextMedia);
        await onUpdate(nextMedia);
        notify("New Hero Slide added with your selected image!");
      },
    });
  }

  async function handleDirectSectionUrlChange(
    field: "overviewImage" | "infraImage" | "locationImage",
    url: string,
    alt?: string
  ) {
    const nextMedia = {
      ...media,
      [field]: {
        ...media[field],
        src: url,
        ...(alt ? { alt } : {}),
      },
    };
    setMedia(nextMedia);
    await onUpdate(nextMedia);
    notify("Visual updated successfully from Media Library!");
  }

  async function handleDeleteHeroSlide(slideIndex: number) {
    if (media.heroSlides.length <= 1) {
      addToast("error", "Cannot remove slide", "At least one slide must remain in the Hero Carousel.");
      return;
    }
    setConfirmDialog({
      isOpen: true,
      title: "Remove Hero Slide",
      message: `Are you sure you want to remove Hero Slide #${slideIndex + 1}?`,
      action: async () => {
        const nextSlides = media.heroSlides.filter((_, idx) => idx !== slideIndex);
        const nextMedia = { ...media, heroSlides: nextSlides, hero: nextSlides[0].src };
        setMedia(nextMedia);
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        await onUpdate(nextMedia);
        notify("Slide removed from carousel.");
      },
    });
  }

  async function handleMoveHeroSlide(fromIndex: number, direction: "up" | "down") {
    const toIndex = direction === "up" ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= media.heroSlides.length) return;
    const nextSlides = [...media.heroSlides];
    const [moved] = nextSlides.splice(fromIndex, 1);
    nextSlides.splice(toIndex, 0, moved);
    const nextMedia = { ...media, heroSlides: nextSlides, hero: nextSlides[0].src };
    setMedia(nextMedia);
    await onUpdate(nextMedia);
    notify(`Slide moved ${direction}!`);
  }

  /* --- 2. SINGLE SECTION IMAGE HANDLERS --- */
  async function handleSectionImageUpload(
    field: "overviewImage" | "infraImage" | "locationImage",
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingField(field);
    try {
      const url = await uploadFile(file);
      const existing = media[field] || { src: "", alt: "", caption: "" };
      const nextSectionImg: SectionImage = {
        ...existing,
        src: url,
      };
      const nextMedia = {
        ...media,
        [field]: nextSectionImg,
        ...(field === "overviewImage" ? { overview: url } : {}),
      };
      setMedia(nextMedia);
      await onUpdate(nextMedia);
      notify("Section visual updated successfully!");
    } catch (err: unknown) {
      addToast("error", "Upload error", err instanceof Error ? err.message : "Upload error");
    } finally {
      setUploadingField(null);
    }
  }

  /* --- 3. MULTI-PLAN MASTERPLAN HANDLERS --- */
  async function handleAddMasterPlan(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingField("new-plan");
    try {
      const url = await uploadFile(file);
      const currentPlans = media.masterplanPlans && media.masterplanPlans.length > 0
        ? media.masterplanPlans
        : [];

      const newPlan: MasterPlanItem = {
        id: `plan-${Date.now()}`,
        title: newPlanTitle.trim() || `Master Plan Perspective ${currentPlans.length + 1}`,
        subtitle: newPlanSubtitle.trim() || "Zoning and infrastructure perspective",
        description: newPlanDesc.trim() || "Official site blueprint detailing plot zoning, utility corridors, and road access.",
        src: url,
        alt: newPlanTitle.trim() || "Master Plan Layout",
        tag: newPlanTag.trim() || "Verified Layout",
      };

      const nextPlans = [...currentPlans, newPlan];
      const nextMedia = {
        ...media,
        masterplanPlans: nextPlans,
        masterplanImage: { src: nextPlans[0].src, alt: nextPlans[0].alt, caption: nextPlans[0].title },
      };
      setMedia(nextMedia);
      setNewPlanTitle("");
      setNewPlanSubtitle("");
      setNewPlanTag("");
      setNewPlanDesc("");
      await onUpdate(nextMedia);
      notify("New Master Plan perspective added!");
    } catch (err: unknown) {
      addToast("error", "Upload error", err instanceof Error ? err.message : "Upload error");
    } finally {
      setUploadingField(null);
    }
  }

  async function handleDeleteMasterPlan(planId: string) {
    if ((media.masterplanPlans?.length || 0) <= 1) {
      addToast("error", "Cannot remove perspective", "At least one master plan perspective must remain.");
      return;
    }
    setConfirmDialog({
      isOpen: true,
      title: "Remove Master Plan Perspective",
      message: "Are you sure you want to remove this master plan perspective?",
      action: async () => {
        const nextPlans = (media.masterplanPlans || []).filter((p) => p.id !== planId);
        const nextMedia = {
          ...media,
          masterplanPlans: nextPlans,
          masterplanImage: {
            src: nextPlans[0]?.src || "",
            alt: nextPlans[0]?.alt || "",
            caption: nextPlans[0]?.title || "",
          },
        };
        setMedia(nextMedia);
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        await onUpdate(nextMedia);
        notify("Master plan perspective removed.");
      },
    });
  }

  async function handleReplacePlanImage(planIndex: number, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingField(`plan-${planIndex}`);
    try {
      const url = await uploadFile(file);
      const nextPlans = [...(media.masterplanPlans || [])];
      nextPlans[planIndex] = { ...nextPlans[planIndex], src: url };
      const nextMedia = {
        ...media,
        masterplanPlans: nextPlans,
        masterplanImage: { src: nextPlans[0].src, alt: nextPlans[0].alt, caption: nextPlans[0].title },
      };
      setMedia(nextMedia);
      await onUpdate(nextMedia);
      notify(`Plan #${planIndex + 1} blueprint image updated!`);
    } catch (err: unknown) {
      addToast("error", "Upload error", err instanceof Error ? err.message : "Upload error");
    } finally {
      setUploadingField(null);
    }
  }

  async function handlePlanFieldChange(planIndex: number, field: keyof MasterPlanItem, value: string) {
    const nextPlans = [...(media.masterplanPlans || [])];
    nextPlans[planIndex] = { ...nextPlans[planIndex], [field]: value };
    const nextMedia = { ...media, masterplanPlans: nextPlans };
    setMedia(nextMedia);
    await onUpdate(nextMedia);
  }

  /* --- 4. GALLERY & CATEGORIES HANDLERS --- */
  const activeCategories: GalleryCategory[] = media.galleryCategories && media.galleryCategories.length > 0
    ? media.galleryCategories
    : [
        { id: "manufacturing", label: "Manufacturing" },
        { id: "warehousing", label: "Warehousing" },
        { id: "infrastructure", label: "Infrastructure" },
        { id: "logistics", label: "Logistics" },
      ];

  async function handleCreateCategory() {
    const label = newCatLabel.trim();
    if (!label) return;
    const id = label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    if (!id) return;

    if (activeCategories.some((c) => c.id === id)) {
      addToast("error", "Category already exists", "A category with this name or ID already exists.");
      return;
    }

    const nextCategories = [...activeCategories, { id, label }];
    const nextMedia = { ...media, galleryCategories: nextCategories };
    setMedia(nextMedia);
    setNewCatLabel("");
    await onUpdate(nextMedia);
    notify(`Category "${label}" created successfully!`);
  }

  async function handleDeleteCategory(catId: string) {
    if (activeCategories.length <= 1) {
      addToast("error", "Cannot remove category", "You must keep at least one category.");
      return;
    }
    setConfirmDialog({
      isOpen: true,
      title: "Delete Category",
      message: `Delete category "${catId}"? Any photos in this category will be reassigned.`,
      action: async () => {
        const nextCategories = activeCategories.filter((c) => c.id !== catId);
        const fallbackCatId = nextCategories[0].id;
        const nextGallery = media.gallery.map((g) =>
          g.category === catId ? { ...g, category: fallbackCatId } : g
        );
        const nextMedia = { ...media, galleryCategories: nextCategories, gallery: nextGallery };
        setMedia(nextMedia);
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        await onUpdate(nextMedia);
        notify(`Category "${catId}" deleted.`);
      },
    });
  }

  async function handleAddGalleryPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingField("new-gal");
    try {
      const url = await uploadFile(file);
      const newItem: GalleryItem = {
        id: `gal-${Date.now()}`,
        src: url,
        alt: newGalAlt || "MAAS industrial asset",
        caption: newGalCaption || "Industrial Township Facility",
        category: newGalCategory || activeCategories[0].id,
      };
      const nextGallery = [...media.gallery, newItem];
      const nextMedia = { ...media, gallery: nextGallery };
      setMedia(nextMedia);
      setNewGalCaption("");
      setNewGalAlt("");
      await onUpdate(nextMedia);
      notify("New photo added to Project Gallery!");
    } catch (err: unknown) {
      addToast("error", "Upload error", err instanceof Error ? err.message : "Upload error");
    } finally {
      setUploadingField(null);
    }
  }

  async function handleDeleteGalleryPhoto(id: string) {
    setConfirmDialog({
      isOpen: true,
      title: "Remove Photo from Gallery",
      message: "Are you sure you want to remove this photo from the gallery?",
      action: async () => {
        const nextGallery = media.gallery.filter((item) => item.id !== id);
        const nextMedia = { ...media, gallery: nextGallery };
        setMedia(nextMedia);
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        await onUpdate(nextMedia);
        notify("Photo removed from gallery.");
      },
    });
  }

  return (
    <div>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      <ConfirmModal
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmLabel="Confirm"
        isDanger={true}
        onConfirm={confirmDialog.action}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Sleek Visuals & Blueprints Studio Action Header */}
      <div
        className="admin-content-toolbar"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "14px",
          paddingBottom: "18px",
          marginBottom: "20px",
          borderBottom: "1px solid var(--admin-border-subtle)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              background: "rgba(212, 175, 55, 0.12)",
              border: "1px solid rgba(212, 175, 55, 0.28)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--admin-gold)",
              flexShrink: 0,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
          </div>
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--admin-text-main)", margin: 0, letterSpacing: "-0.01em" }}>
              Visuals, Media &amp; Blueprints Studio
            </h2>
            <p style={{ fontSize: "12.5px", color: "var(--admin-text-muted)", margin: "3px 0 0 0" }}>
              Configure homepage hero carousel slides, section photos, blueprint schematics, and photo gallery.
            </p>
          </div>
        </div>

        {activeSection === "hero" && (
          <button
            type="button"
            className="btn-gold"
            onClick={handleAddNewHeroSlide}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "9px 20px",
              fontSize: "13.5px",
              fontWeight: 700,
              borderRadius: "6px",
              boxShadow: "0 2px 10px rgba(212, 175, 55, 0.22)",
              cursor: "pointer",
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>+ Add New Slide</span>
          </button>
        )}
      </div>

      {/* Section Sub-Navigation Tabs */}
      <div style={{ marginBottom: "20px" }}>
        <AdminTabs
          tabs={[
            { id: "hero", label: "🌟 Hero Carousel", count: media.heroSlides.length },
            { id: "overview", label: "🏢 Overview Photo" },
            { id: "infra", label: "🏗️ Infrastructure Visual" },
            { id: "masterplan", label: "📐 Master Plan Blueprints", count: (media.masterplanPlans || []).length },
            { id: "location", label: "📍 Location & Connectivity" },
            { id: "gallery", label: "🖼️ Project Gallery", count: media.gallery.length },
            { id: "logo", label: "✨ Brand Logo" },
          ]}
          activeTab={activeSection}
          onChange={(tabId) => setActiveSection(tabId as typeof activeSection)}
        />
      </div>

      {/* 1. HERO CAROUSEL STUDIO */}
      {activeSection === "hero" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Slides List */}
          {media.heroSlides.map((slide, idx) => (
            <div
              key={slide.id || idx}
              className="admin-card-inner"
              style={{
                padding: "20px",
                background: "var(--admin-bg-card-subtle)",
                borderRadius: "10px",
                border: "1px solid var(--admin-border-subtle)",
              }}
            >
              {/* Slide Card Header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "10px",
                  paddingBottom: "14px",
                  marginBottom: "16px",
                  borderBottom: "1px solid var(--admin-border-subtle)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "var(--admin-gold)",
                      padding: "3px 8px",
                      background: "rgba(212, 175, 55, 0.12)",
                      borderRadius: "4px",
                    }}
                  >
                    SLIDE 0{idx + 1} OF 0{media.heroSlides.length}
                  </span>
                  <span style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--admin-text-main)" }}>
                    {slide.title || `Perspective #${idx + 1}`}
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  {/* Reorder Up / Down */}
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ padding: "4px 8px", fontSize: "11px" }}
                    onClick={() => handleMoveHeroSlide(idx, "up")}
                    disabled={idx === 0}
                    title="Move slide earlier in carousel"
                  >
                    ▲ Move Up
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ padding: "4px 8px", fontSize: "11px" }}
                    onClick={() => handleMoveHeroSlide(idx, "down")}
                    disabled={idx === media.heroSlides.length - 1}
                    title="Move slide later in carousel"
                  >
                    ▼ Move Down
                  </button>
                  {media.heroSlides.length > 1 && (
                    <button
                      type="button"
                      className="btn-danger"
                      style={{ padding: "4px 10px", fontSize: "11.5px" }}
                      onClick={() => handleDeleteHeroSlide(idx)}
                    >
                      Delete Slide
                    </button>
                  )}
                </div>
              </div>

              {/* Slide Body: 2 Columns */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
                {/* Left: Image Preview & Actions */}
                <div>
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      height: "180px",
                      borderRadius: "8px",
                      overflow: "hidden",
                      border: "1px solid var(--admin-border-subtle)",
                      background: "#070a12",
                    }}
                  >
                    <Image
                      src={slide.src}
                      alt={slide.alt || `Slide ${idx + 1}`}
                      fill
                      style={{ objectFit: "cover" }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        bottom: "8px",
                        left: "8px",
                        padding: "3px 8px",
                        background: "rgba(0, 0, 0, 0.75)",
                        borderRadius: "4px",
                        fontSize: "10.5px",
                        color: "#cbd5e1",
                      }}
                    >
                      16:9 Hero Perspective
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "12px" }}>
                    <button
                      type="button"
                      className="btn-secondary"
                      style={{ justifyContent: "center", fontSize: "12px", padding: "8px" }}
                      onClick={() =>
                        setPickerModal({
                          isOpen: true,
                          title: `Select Image for Hero Slide #${idx + 1}`,
                          currentUrl: slide.src,
                          onSelect: (url, alt) => {
                            handleHeroSlideFieldChange(idx, "src", url);
                            if (alt && !slide.alt) handleHeroSlideFieldChange(idx, "alt", alt);
                          },
                        })
                      }
                    >
                      🖼️ Library
                    </button>

                    <label
                      className="btn-secondary"
                      style={{ justifyContent: "center", fontSize: "12px", padding: "8px", cursor: "pointer", textAlign: "center" }}
                    >
                      {uploadingField === `hero-${idx}` ? "Uploading…" : "📁 Upload New"}
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={(e) => handleHeroSlideImageUpload(idx, e)}
                        disabled={uploadingField === `hero-${idx}`}
                      />
                    </label>
                  </div>
                </div>

                {/* Right: Slide Copy Inputs */}
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "#e2e8f0", marginBottom: "4px", display: "block" }}>
                      Category Eyebrow Pill
                    </label>
                    <input
                      type="text"
                      className="admin-input"
                      value={slide.eyebrow || ""}
                      onChange={(e) => handleHeroSlideFieldChange(idx, "eyebrow", e.target.value)}
                      placeholder="e.g. HIGH-CAPACITY INFRASTRUCTURE"
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "#e2e8f0", marginBottom: "4px", display: "block" }}>
                      Main Slide Headline
                    </label>
                    <input
                      type="text"
                      className="admin-input"
                      value={slide.title}
                      onChange={(e) => handleHeroSlideFieldChange(idx, "title", e.target.value)}
                      placeholder="e.g. Developing Land. Building Opportunities."
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "#e2e8f0", marginBottom: "4px", display: "block" }}>
                      Subheading Copy
                    </label>
                    <textarea
                      rows={2}
                      className="admin-textarea"
                      value={slide.subtitle}
                      onChange={(e) => handleHeroSlideFieldChange(idx, "subtitle", e.target.value)}
                      placeholder="Brief descriptive highlight..."
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "#e2e8f0", marginBottom: "4px", display: "block" }}>
                      Image Alt Text (SEO &amp; Accessibility)
                    </label>
                    <input
                      type="text"
                      className="admin-input"
                      value={slide.alt || ""}
                      onChange={(e) => handleHeroSlideFieldChange(idx, "alt", e.target.value)}
                      placeholder="e.g. MAAS Industrial infrastructure perspective"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 2. OVERVIEW VISUAL */}
      {activeSection === "overview" && (
        <div
          className="admin-card-inner"
          style={{
            padding: "24px",
            background: "var(--admin-bg-card-subtle)",
            borderRadius: "10px",
            border: "1px solid var(--admin-border-subtle)",
          }}
        >
          <div style={{ marginBottom: "20px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--admin-text-main)", margin: "0 0 4px 0", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>🏢</span>
              <span>Company Overview Section Visual</span>
            </h3>
            <p style={{ fontSize: "12px", color: "var(--admin-text-muted)", margin: 0 }}>
              High-resolution photo displayed alongside the core project proposition and company story.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px", alignItems: "start" }}>
            {/* Visual Preview */}
            <div>
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: "220px",
                  borderRadius: "8px",
                  overflow: "hidden",
                  border: "1px solid var(--admin-border-subtle)",
                  background: "#070a12",
                }}
              >
                <Image
                  src={media.overviewImage.src}
                  alt={media.overviewImage.alt || "Overview"}
                  fill
                  style={{ objectFit: "cover" }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: "8px",
                    left: "8px",
                    padding: "4px 8px",
                    background: "rgba(0, 0, 0, 0.75)",
                    borderRadius: "4px",
                    fontSize: "10.5px",
                    color: "#cbd5e1",
                  }}
                >
                  16:10 Aspect Ratio · 1920×1080 Recommended
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "12px" }}>
                <button
                  type="button"
                  className="btn-gold"
                  style={{ justifyContent: "center", fontSize: "12.5px", padding: "8px" }}
                  onClick={() =>
                    setPickerModal({
                      isOpen: true,
                      title: "Select Overview Section Visual",
                      currentUrl: media.overviewImage.src,
                      onSelect: (url, alt) => handleDirectSectionUrlChange("overviewImage", url, alt),
                    })
                  }
                >
                  🖼️ Library
                </button>

                <label
                  className="btn-secondary"
                  style={{ justifyContent: "center", fontSize: "12.5px", padding: "8px", cursor: "pointer", textAlign: "center" }}
                >
                  {uploadingField === "overviewImage" ? "Uploading…" : "📁 Upload New"}
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => handleSectionImageUpload("overviewImage", e)}
                    disabled={uploadingField === "overviewImage"}
                  />
                </label>
              </div>
            </div>

            {/* Inputs */}
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "#e2e8f0", marginBottom: "4px", display: "block" }}>
                  Direct Image URL
                </label>
                <input
                  type="text"
                  className="admin-input"
                  value={media.overviewImage.src}
                  onChange={(e) => handleDirectSectionUrlChange("overviewImage", e.target.value)}
                  placeholder="https://... or uploaded image URL"
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "#e2e8f0", marginBottom: "4px", display: "block" }}>
                  Image Alt Text (SEO &amp; Accessibility)
                </label>
                <input
                  type="text"
                  className="admin-input"
                  value={media.overviewImage.alt || ""}
                  placeholder="e.g. Master industrial infrastructure aerial perspective"
                  onChange={async (e) => {
                    const nextMedia = {
                      ...media,
                      overviewImage: { ...media.overviewImage, alt: e.target.value },
                    };
                    setMedia(nextMedia);
                    await onUpdate(nextMedia);
                  }}
                />
              </div>

              <div style={{ padding: "12px", background: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--admin-border-subtle)", borderRadius: "6px" }}>
                <span style={{ fontSize: "11.5px", color: "var(--admin-text-muted)", display: "block" }}>
                  💡 <strong>Display Placement:</strong> Renders inside the Company Story &amp; Proposition section alongside the 3 narrative paragraphs.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. INFRASTRUCTURE FRAMEWORK */}
      {activeSection === "infra" && (
        <div
          className="admin-card-inner"
          style={{
            padding: "24px",
            background: "var(--admin-bg-card-subtle)",
            borderRadius: "10px",
            border: "1px solid var(--admin-border-subtle)",
          }}
        >
          <div style={{ marginBottom: "20px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--admin-text-main)", margin: "0 0 4px 0", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>🏗️</span>
              <span>Infrastructure Framework Visual</span>
            </h3>
            <p style={{ fontSize: "12px", color: "var(--admin-text-muted)", margin: 0 }}>
              Displayed in the 3rd pillar card (Utilities &amp; Heavy Operations).
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px", alignItems: "start" }}>
            {/* Visual Preview */}
            <div>
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: "220px",
                  borderRadius: "8px",
                  overflow: "hidden",
                  border: "1px solid var(--admin-border-subtle)",
                  background: "#070a12",
                }}
              >
                <Image
                  src={media.infraImage.src}
                  alt={media.infraImage.alt || "Infrastructure"}
                  fill
                  style={{ objectFit: "cover" }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: "8px",
                    left: "8px",
                    padding: "4px 8px",
                    background: "rgba(0, 0, 0, 0.75)",
                    borderRadius: "4px",
                    fontSize: "10.5px",
                    color: "#cbd5e1",
                  }}
                >
                  Utilities Framework · 1920×1080 Recommended
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "12px" }}>
                <button
                  type="button"
                  className="btn-gold"
                  style={{ justifyContent: "center", fontSize: "12.5px", padding: "8px" }}
                  onClick={() =>
                    setPickerModal({
                      isOpen: true,
                      title: "Select Infrastructure Framework Visual",
                      currentUrl: media.infraImage.src,
                      onSelect: (url, alt) => handleDirectSectionUrlChange("infraImage", url, alt),
                    })
                  }
                >
                  🖼️ Library
                </button>

                <label
                  className="btn-secondary"
                  style={{ justifyContent: "center", fontSize: "12.5px", padding: "8px", cursor: "pointer", textAlign: "center" }}
                >
                  {uploadingField === "infraImage" ? "Uploading…" : "📁 Upload New"}
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => handleSectionImageUpload("infraImage", e)}
                    disabled={uploadingField === "infraImage"}
                  />
                </label>
              </div>
            </div>

            {/* Inputs */}
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "#e2e8f0", marginBottom: "4px", display: "block" }}>
                  Direct Image URL
                </label>
                <input
                  type="text"
                  className="admin-input"
                  value={media.infraImage.src}
                  onChange={(e) => handleDirectSectionUrlChange("infraImage", e.target.value)}
                  placeholder="https://... or uploaded image URL"
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "#e2e8f0", marginBottom: "4px", display: "block" }}>
                  Image Alt Text (SEO &amp; Accessibility)
                </label>
                <input
                  type="text"
                  className="admin-input"
                  value={media.infraImage.alt || ""}
                  placeholder="e.g. High-voltage power sub-station and clean water feeds"
                  onChange={async (e) => {
                    const nextMedia = {
                      ...media,
                      infraImage: { ...media.infraImage, alt: e.target.value },
                    };
                    setMedia(nextMedia);
                    await onUpdate(nextMedia);
                  }}
                />
              </div>

              <div style={{ padding: "12px", background: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--admin-border-subtle)", borderRadius: "6px" }}>
                <span style={{ fontSize: "11.5px", color: "var(--admin-text-muted)", display: "block" }}>
                  💡 <strong>Recommended:</strong> High-voltage substations, modern drainage networks, or clean manufacturing machinery.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. MASTER PLAN MULTI-PERSPECTIVE STUDIO */}
      {activeSection === "masterplan" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* List of Configured Master Plans */}
          {(media.masterplanPlans || []).map((plan, pIdx) => (
            <div
              key={plan.id || pIdx}
              className="admin-card-inner"
              style={{
                padding: "20px",
                background: "var(--admin-bg-card-subtle)",
                borderRadius: "10px",
                border: "1px solid var(--admin-border-subtle)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "10px",
                  paddingBottom: "12px",
                  marginBottom: "16px",
                  borderBottom: "1px solid var(--admin-border-subtle)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "var(--admin-gold)",
                      padding: "3px 8px",
                      background: "rgba(212, 175, 55, 0.12)",
                      borderRadius: "4px",
                    }}
                  >
                    PERSPECTIVE 0{pIdx + 1}
                  </span>
                  <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--admin-text-main)" }}>
                    {plan.title}
                  </span>
                  {plan.tag && (
                    <span
                      style={{
                        fontSize: "10.5px",
                        padding: "2px 8px",
                        borderRadius: "999px",
                        background: "rgba(255, 255, 255, 0.08)",
                        color: "#94a3b8",
                      }}
                    >
                      {plan.tag}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  className="btn-danger"
                  style={{ padding: "4px 10px", fontSize: "11.5px" }}
                  onClick={() => handleDeleteMasterPlan(plan.id)}
                >
                  Delete Perspective
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
                {/* Left: Blueprint Visual Preview */}
                <div>
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      height: "190px",
                      background: "#070a12",
                      borderRadius: "8px",
                      overflow: "hidden",
                      border: "1px solid var(--admin-border-subtle)",
                    }}
                  >
                    <Image
                      src={plan.src}
                      alt={plan.title}
                      fill
                      style={{ objectFit: "contain", padding: "10px" }}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "12px" }}>
                    <button
                      type="button"
                      className="btn-gold"
                      style={{ justifyContent: "center", fontSize: "12px", padding: "8px" }}
                      onClick={() =>
                        setPickerModal({
                          isOpen: true,
                          title: `Select Blueprint for ${plan.title || `Perspective #${pIdx + 1}`}`,
                          currentUrl: plan.src,
                          onSelect: async (url) => {
                            const updatedPlans = [...(media.masterplanPlans || [])];
                            updatedPlans[pIdx] = { ...updatedPlans[pIdx], src: url };
                            const nextMedia = { ...media, masterplanPlans: updatedPlans };
                            setMedia(nextMedia);
                            await onUpdate(nextMedia);
                            notify("Master plan image updated from library!");
                          },
                        })
                      }
                    >
                      🖼️ Library
                    </button>

                    <label
                      className="btn-secondary"
                      style={{ justifyContent: "center", fontSize: "12px", padding: "8px", cursor: "pointer", textAlign: "center" }}
                    >
                      {uploadingField === `plan-${pIdx}` ? "Uploading…" : "📁 Upload File"}
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={(e) => handleReplacePlanImage(pIdx, e)}
                        disabled={uploadingField === `plan-${pIdx}`}
                      />
                    </label>
                  </div>
                </div>

                {/* Right: Technical Fields */}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "10px" }}>
                    <div>
                      <label style={{ fontSize: "12px", fontWeight: 600, color: "#e2e8f0", marginBottom: "4px", display: "block" }}>
                        Perspective Title
                      </label>
                      <input
                        type="text"
                        className="admin-input"
                        value={plan.title}
                        onChange={(e) => handlePlanFieldChange(pIdx, "title", e.target.value)}
                        placeholder="e.g. Overall Zoning & Master Layout"
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "12px", fontWeight: 600, color: "#e2e8f0", marginBottom: "4px", display: "block" }}>
                        Tag Badge
                      </label>
                      <input
                        type="text"
                        className="admin-input"
                        value={plan.tag || ""}
                        onChange={(e) => handlePlanFieldChange(pIdx, "tag", e.target.value)}
                        placeholder="e.g. Phase 1 & 2 Blueprint"
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "#e2e8f0", marginBottom: "4px", display: "block" }}>
                      Subtitle Summary
                    </label>
                    <input
                      type="text"
                      className="admin-input"
                      value={plan.subtitle || ""}
                      onChange={(e) => handlePlanFieldChange(pIdx, "subtitle", e.target.value)}
                      placeholder="e.g. Macro sectoral demarcation & green buffer perimeter"
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "#e2e8f0", marginBottom: "4px", display: "block" }}>
                      Technical Description
                    </label>
                    <textarea
                      rows={2}
                      className="admin-textarea"
                      value={plan.description || ""}
                      onChange={(e) => handlePlanFieldChange(pIdx, "description", e.target.value)}
                      placeholder="Details about zoning division, road widths, setbacks..."
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Add New Master Plan Perspective Elevated Card */}
          <div
            className="admin-card-inner"
            style={{
              padding: "24px",
              background: "var(--admin-bg-card-subtle)",
              borderRadius: "10px",
              border: "1px dashed rgba(212, 175, 55, 0.35)",
            }}
          >
            <h3 style={{ margin: "0 0 6px", fontSize: "15px", fontWeight: 700, color: "var(--admin-gold)", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>+</span>
              <span>Add New Master Plan Perspective</span>
            </h3>
            <p style={{ fontSize: "12px", color: "var(--admin-text-muted)", margin: "0 0 16px" }}>
              Add a specialized zoning diagram, utilities overlay, or phase delivery schematic.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "14px", marginBottom: "14px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "#e2e8f0", marginBottom: "4px", display: "block" }}>
                  Perspective Title *
                </label>
                <input
                  type="text"
                  className="admin-input"
                  value={newPlanTitle}
                  onChange={(e) => setNewPlanTitle(e.target.value)}
                  placeholder="e.g. Phase 2 Heavy Engineering Layout"
                />
              </div>
              <div>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "#e2e8f0", marginBottom: "4px", display: "block" }}>
                  Tag Badge
                </label>
                <input
                  type="text"
                  className="admin-input"
                  value={newPlanTag}
                  onChange={(e) => setNewPlanTag(e.target.value)}
                  placeholder="e.g. Phase 2 Demarcation"
                />
              </div>
            </div>

            <div style={{ marginBottom: "14px" }}>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "#e2e8f0", marginBottom: "4px", display: "block" }}>
                Subtitle
              </label>
              <input
                type="text"
                className="admin-input"
                value={newPlanSubtitle}
                onChange={(e) => setNewPlanSubtitle(e.target.value)}
                placeholder="e.g. 50-acre dedicated heavy engineering cluster"
              />
            </div>

            <div style={{ marginBottom: "18px" }}>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "#e2e8f0", marginBottom: "4px", display: "block" }}>
                Technical Description
              </label>
              <textarea
                rows={2}
                className="admin-textarea"
                value={newPlanDesc}
                onChange={(e) => setNewPlanDesc(e.target.value)}
                placeholder="Specify setbacks, road circulation, power connection details..."
              />
            </div>

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
              <button
                type="button"
                className="btn-gold"
                style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                onClick={() => {
                  if (!newPlanTitle.trim()) {
                    addToast("error", "Perspective title required", "Please enter a perspective title first.");
                    return;
                  }
                  setPickerModal({
                    isOpen: true,
                    title: "Select Blueprint for New Perspective",
                    onSelect: async (url) => {
                      const newPlan: MasterPlanItem = {
                        id: `plan-${Date.now()}`,
                        title: newPlanTitle.trim(),
                        subtitle: newPlanSubtitle.trim(),
                        description: newPlanDesc.trim(),
                        tag: newPlanTag.trim() || "Blueprint",
                        src: url,
                        alt: newPlanTitle.trim() || "Master Plan Perspective",
                      };
                      const nextMedia = {
                        ...media,
                        masterplanPlans: [...(media.masterplanPlans || []), newPlan],
                      };
                      setMedia(nextMedia);
                      await onUpdate(nextMedia);
                      setNewPlanTitle("");
                      setNewPlanSubtitle("");
                      setNewPlanDesc("");
                      setNewPlanTag("");
                      notify("New Master Plan perspective added!");
                    },
                  });
                }}
              >
                <span>🖼️</span>
                <span>Choose Blueprint from Library</span>
              </button>

              <label className="btn-secondary" style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <span>📁</span>
                <span>{uploadingField === "new-plan" ? "Uploading Plan…" : "Upload Blueprint File"}</span>
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleAddMasterPlan}
                  disabled={uploadingField === "new-plan"}
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* 5. LOCATION MAP */}
      {activeSection === "location" && (
        <div
          className="admin-card-inner"
          style={{
            padding: "24px",
            background: "var(--admin-bg-card-subtle)",
            borderRadius: "10px",
            border: "1px solid var(--admin-border-subtle)",
          }}
        >
          <div style={{ marginBottom: "20px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--admin-text-main)", margin: "0 0 4px 0", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>📍</span>
              <span>Strategic Location &amp; Connectivity Map</span>
            </h3>
            <p style={{ fontSize: "12px", color: "var(--admin-text-muted)", margin: 0 }}>
              Highway, freight corridors, and multi-modal port connectivity map displayed in the location section.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px", alignItems: "start" }}>
            {/* Visual Preview */}
            <div>
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: "220px",
                  borderRadius: "8px",
                  overflow: "hidden",
                  border: "1px solid var(--admin-border-subtle)",
                  background: "#070a12",
                }}
              >
                <Image
                  src={media.locationImage.src || "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=1200&q=82"}
                  alt="Location Map"
                  fill
                  style={{ objectFit: "cover" }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: "8px",
                    left: "8px",
                    padding: "4px 8px",
                    background: "rgba(0, 0, 0, 0.75)",
                    borderRadius: "4px",
                    fontSize: "10.5px",
                    color: "#cbd5e1",
                  }}
                >
                  Connectivity Map · 1920×1080 Recommended
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "12px" }}>
                <button
                  type="button"
                  className="btn-gold"
                  style={{ justifyContent: "center", fontSize: "12.5px", padding: "8px" }}
                  onClick={() =>
                    setPickerModal({
                      isOpen: true,
                      title: "Select Connectivity Map Image",
                      currentUrl: media.locationImage.src,
                      onSelect: (url, alt) => handleDirectSectionUrlChange("locationImage", url, alt),
                    })
                  }
                >
                  🖼️ Library
                </button>

                <label
                  className="btn-secondary"
                  style={{ justifyContent: "center", fontSize: "12.5px", padding: "8px", cursor: "pointer", textAlign: "center" }}
                >
                  {uploadingField === "locationImage" ? "Uploading…" : "📁 Upload New"}
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => handleSectionImageUpload("locationImage", e)}
                    disabled={uploadingField === "locationImage"}
                  />
                </label>
              </div>
            </div>

            {/* Inputs */}
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "#e2e8f0", marginBottom: "4px", display: "block" }}>
                  Direct Map URL
                </label>
                <input
                  type="text"
                  className="admin-input"
                  value={media.locationImage.src}
                  onChange={(e) => handleDirectSectionUrlChange("locationImage", e.target.value)}
                  placeholder="https://... or uploaded image URL"
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "#e2e8f0", marginBottom: "4px", display: "block" }}>
                  Image Alt Text (SEO &amp; Accessibility)
                </label>
                <input
                  type="text"
                  className="admin-input"
                  value={media.locationImage.alt || ""}
                  placeholder="e.g. Strategic Highway and Rail Freight Connectivity Map"
                  onChange={async (e) => {
                    const nextMedia = {
                      ...media,
                      locationImage: { ...media.locationImage, alt: e.target.value },
                    };
                    setMedia(nextMedia);
                    await onUpdate(nextMedia);
                  }}
                />
              </div>

              <div style={{ padding: "12px", background: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--admin-border-subtle)", borderRadius: "6px" }}>
                <span style={{ fontSize: "11.5px", color: "var(--admin-text-muted)", display: "block" }}>
                  💡 <strong>Best Practice:</strong> Annotated aerial maps highlighting National Highway access, railway sidings, and air cargo distances convert highest.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. PROJECT GALLERY & CATEGORIES STUDIO */}
      {activeSection === "gallery" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Category Management Studio */}
          <div
            className="admin-card-inner"
            style={{
              padding: "22px",
              background: "var(--admin-bg-card-subtle)",
              borderRadius: "10px",
              border: "1px solid var(--admin-border-subtle)",
            }}
          >
            <div style={{ marginBottom: "16px" }}>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--admin-text-main)", margin: "0 0 4px 0", display: "flex", alignItems: "center", gap: "8px" }}>
                <span>📁</span>
                <span>Gallery Sector Categories</span>
              </h3>
              <p style={{ fontSize: "12px", color: "var(--admin-text-muted)", margin: 0 }}>
                Filter categories for project photos. On the live site, categories with zero images stay automatically hidden.
              </p>
            </div>

            {/* List of Categories with Delete Action */}
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center", marginBottom: "18px" }}>
              {activeCategories.map((cat) => {
                const count = media.gallery.filter((img) => img.category === cat.id).length;
                return (
                  <div
                    key={cat.id}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      background: "rgba(255, 255, 255, 0.04)",
                      border: "1px solid var(--admin-border-subtle)",
                      padding: "6px 14px",
                      borderRadius: "999px",
                      fontSize: "12px",
                    }}
                  >
                    <span style={{ color: "#fff", fontWeight: 600 }}>{cat.label}</span>
                    <span style={{ fontSize: "11px", color: count > 0 ? "var(--admin-gold)" : "#64748b" }}>
                      ({count})
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(cat.id)}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#f87171",
                        cursor: "pointer",
                        padding: "0 2px",
                        fontSize: "13px",
                      }}
                      title={`Delete ${cat.label} category`}
                      aria-label={`Delete ${cat.label} category`}
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Add New Category Input */}
            <div style={{ display: "flex", gap: "10px", alignItems: "center", maxWidth: "460px", flexWrap: "wrap" }}>
              <input
                type="text"
                className="admin-input"
                placeholder="New Category Name (e.g. Commercial, Pharma, Solar)"
                value={newCatLabel}
                onChange={(e) => setNewCatLabel(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleCreateCategory();
                  }
                }}
              />
              <button
                type="button"
                className="btn-gold"
                onClick={handleCreateCategory}
                style={{ whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: "6px" }}
              >
                <span>+</span>
                <span>Add Category</span>
              </button>
            </div>
          </div>

          {/* Photo Assets Grid */}
          <div
            className="admin-card-inner"
            style={{
              padding: "22px",
              background: "var(--admin-bg-card-subtle)",
              borderRadius: "10px",
              border: "1px solid var(--admin-border-subtle)",
            }}
          >
            <div style={{ marginBottom: "16px" }}>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--admin-text-main)", margin: "0 0 4px 0", display: "flex", alignItems: "center", gap: "8px" }}>
                <span>🖼️</span>
                <span>Project Gallery Photos ({media.gallery.length} Images)</span>
              </h3>
              <p style={{ fontSize: "12px", color: "var(--admin-text-muted)", margin: 0 }}>
                High-definition photos in the lightbox gallery.
              </p>
            </div>

            {/* Gallery Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px" }}>
              {media.gallery.map((item) => (
                <div
                  key={item.id}
                  style={{
                    background: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid var(--admin-border-subtle)",
                    borderRadius: "8px",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div style={{ position: "relative", width: "100%", height: "140px" }}>
                    <Image
                      src={item.src}
                      alt={item.alt}
                      fill
                      style={{ objectFit: "cover" }}
                    />
                    <span
                      style={{
                        position: "absolute",
                        top: "8px",
                        left: "8px",
                        padding: "3px 8px",
                        borderRadius: "4px",
                        background: "rgba(0, 0, 0, 0.75)",
                        fontSize: "10.5px",
                        color: "var(--admin-gold)",
                        fontWeight: 600,
                      }}
                    >
                      {item.category}
                    </span>
                  </div>

                  <div style={{ padding: "12px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontSize: "12.5px", fontWeight: 600, color: "#fff", marginBottom: "8px" }}>
                        {item.caption}
                      </div>

                      <div style={{ marginBottom: "10px" }}>
                        <label style={{ fontSize: "10.5px", color: "#94a3b8", display: "block", marginBottom: "3px" }}>
                          Sector Category:
                        </label>
                        <select
                          className="admin-input"
                          style={{ fontSize: "11.5px", padding: "5px 8px" }}
                          value={item.category}
                          onChange={async (e) => {
                            const nextCat = e.target.value;
                            const updatedGallery = media.gallery.map((g) =>
                              g.id === item.id ? { ...g, category: nextCat } : g
                            );
                            const nextMedia = { ...media, gallery: updatedGallery };
                            setMedia(nextMedia);
                            await onUpdate(nextMedia);
                            notify(`Category updated to "${nextCat}"!`);
                          }}
                        >
                          {activeCategories.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="btn-danger"
                      style={{ width: "100%", padding: "5px", fontSize: "11.5px" }}
                      onClick={() => handleDeleteGalleryPhoto(item.id)}
                    >
                      Remove Photo
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add New Gallery Item Card */}
            <div
              style={{
                marginTop: "24px",
                padding: "20px",
                background: "rgba(255, 255, 255, 0.02)",
                border: "1px dashed rgba(212, 175, 55, 0.35)",
                borderRadius: "8px",
              }}
            >
              <h4 style={{ margin: "0 0 12px", fontSize: "14px", color: "var(--admin-gold)", display: "flex", alignItems: "center", gap: "6px" }}>
                <span>+</span>
                <span>Add Photo to Project Gallery</span>
              </h4>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "12px", marginBottom: "12px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "#e2e8f0", marginBottom: "4px", display: "block" }}>
                    Category
                  </label>
                  <select
                    className="admin-input"
                    value={newGalCategory}
                    onChange={(e) => setNewGalCategory(e.target.value)}
                  >
                    {activeCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "#e2e8f0", marginBottom: "4px", display: "block" }}>
                    Photo Headline / Caption
                  </label>
                  <input
                    type="text"
                    className="admin-input"
                    value={newGalCaption}
                    onChange={(e) => setNewGalCaption(e.target.value)}
                    placeholder="e.g. Heavy Fabrication Bay"
                  />
                </div>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "#e2e8f0", marginBottom: "4px", display: "block" }}>
                  Alt Accessibility Description
                </label>
                <input
                  type="text"
                  className="admin-input"
                  value={newGalAlt}
                  onChange={(e) => setNewGalAlt(e.target.value)}
                  placeholder="e.g. Modern high bay overhead crane assembly line"
                />
              </div>

              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                <button
                  type="button"
                  className="btn-gold"
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                  onClick={() => {
                    setPickerModal({
                      isOpen: true,
                      title: "Select Photo for Project Gallery",
                      onSelect: async (url) => {
                        const newPhoto = {
                          id: `gal-${Date.now()}`,
                          src: url,
                          alt: newGalAlt || newGalCaption || "Gallery Photo",
                          caption: newGalCaption || "Project Gallery View",
                          category: newGalCategory,
                        };
                        const nextMedia = { ...media, gallery: [...media.gallery, newPhoto] };
                        setMedia(nextMedia);
                        await onUpdate(nextMedia);
                        setNewGalCaption("");
                        setNewGalAlt("");
                        notify("New photo added to gallery!");
                      },
                    });
                  }}
                >
                  <span>🖼️</span>
                  <span>Choose from Library</span>
                </button>

                <label className="btn-secondary" style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                  <span>📁</span>
                  <span>{uploadingField === "new-gal" ? "Uploading…" : "Upload & Add to Gallery"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleAddGalleryPhoto}
                    disabled={uploadingField === "new-gal"}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. BRAND LOGO */}
      {activeSection === "logo" && (
        <div
          className="admin-card-inner"
          style={{
            padding: "24px",
            background: "var(--admin-bg-card-subtle)",
            borderRadius: "10px",
            border: "1px solid var(--admin-border-subtle)",
          }}
        >
          <div style={{ marginBottom: "20px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--admin-text-main)", margin: "0 0 4px 0", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>✨</span>
              <span>Corporate Logo Assets</span>
            </h3>
            <p style={{ fontSize: "12px", color: "var(--admin-text-muted)", margin: 0 }}>
              Transparent vector SVG and high-resolution PNG variants of the MAAS Industrial Ventures brand logo.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px", marginBottom: "24px" }}>
            {/* White SVG */}
            <div
              style={{
                background: "#080c14",
                border: "1px solid " + (media.logo === "/images/maas-logo-white.svg" ? "var(--admin-gold)" : "var(--admin-border-subtle)"),
                borderRadius: "8px",
                padding: "20px",
                textAlign: "center",
                position: "relative",
              }}
            >
              {media.logo === "/images/maas-logo-white.svg" && (
                <span
                  style={{
                    position: "absolute",
                    top: "8px",
                    right: "8px",
                    fontSize: "10px",
                    fontWeight: 700,
                    color: "var(--admin-gold)",
                    padding: "2px 6px",
                    background: "rgba(212, 175, 55, 0.15)",
                    borderRadius: "4px",
                  }}
                >
                  ACTIVE
                </span>
              )}
              <span style={{ fontSize: "11px", color: "#94a3b8", display: "block", marginBottom: "12px", textTransform: "uppercase" }}>
                White Transparent SVG
              </span>
              <div style={{ height: "50px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Image
                  src="/images/maas-logo-white.svg"
                  alt="White Logo"
                  width={200}
                  height={50}
                  style={{ maxHeight: "38px", width: "auto" }}
                />
              </div>
              <button
                type="button"
                className={media.logo === "/images/maas-logo-white.svg" ? "btn-gold" : "btn-secondary"}
                style={{ marginTop: "14px", width: "100%", justifyContent: "center", fontSize: "12px" }}
                onClick={async () => {
                  const next = { ...media, logo: "/images/maas-logo-white.svg" };
                  setMedia(next);
                  await onUpdate(next);
                  notify("Active logo set to White SVG!");
                }}
              >
                {media.logo === "/images/maas-logo-white.svg" ? "Currently Active" : "Use as Active Logo"}
              </button>
            </div>

            {/* Gold SVG */}
            <div
              style={{
                background: "#080c14",
                border: "1px solid " + (media.logo === "/images/maas-logo-gold.svg" ? "var(--admin-gold)" : "var(--admin-border-subtle)"),
                borderRadius: "8px",
                padding: "20px",
                textAlign: "center",
                position: "relative",
              }}
            >
              {media.logo === "/images/maas-logo-gold.svg" && (
                <span
                  style={{
                    position: "absolute",
                    top: "8px",
                    right: "8px",
                    fontSize: "10px",
                    fontWeight: 700,
                    color: "var(--admin-gold)",
                    padding: "2px 6px",
                    background: "rgba(212, 175, 55, 0.15)",
                    borderRadius: "4px",
                  }}
                >
                  ACTIVE
                </span>
              )}
              <span style={{ fontSize: "11px", color: "#94a3b8", display: "block", marginBottom: "12px", textTransform: "uppercase" }}>
                Gold Transparent SVG
              </span>
              <div style={{ height: "50px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Image
                  src="/images/maas-logo-gold.svg"
                  alt="Gold Logo"
                  width={200}
                  height={50}
                  style={{ maxHeight: "38px", width: "auto" }}
                />
              </div>
              <button
                type="button"
                className={media.logo === "/images/maas-logo-gold.svg" ? "btn-gold" : "btn-secondary"}
                style={{ marginTop: "14px", width: "100%", justifyContent: "center", fontSize: "12px" }}
                onClick={async () => {
                  const next = { ...media, logo: "/images/maas-logo-gold.svg" };
                  setMedia(next);
                  await onUpdate(next);
                  notify("Active logo set to Gold SVG!");
                }}
              >
                {media.logo === "/images/maas-logo-gold.svg" ? "Currently Active" : "Use as Active Logo"}
              </button>
            </div>

            {/* Dark SVG */}
            <div
              style={{
                background: "#ffffff",
                border: "1px solid " + (media.logo === "/images/maas-logo-dark.svg" ? "var(--admin-gold)" : "#cbd5e1"),
                borderRadius: "8px",
                padding: "20px",
                textAlign: "center",
                position: "relative",
              }}
            >
              {media.logo === "/images/maas-logo-dark.svg" && (
                <span
                  style={{
                    position: "absolute",
                    top: "8px",
                    right: "8px",
                    fontSize: "10px",
                    fontWeight: 700,
                    color: "#000",
                    padding: "2px 6px",
                    background: "rgba(212, 175, 55, 0.4)",
                    borderRadius: "4px",
                  }}
                >
                  ACTIVE
                </span>
              )}
              <span style={{ fontSize: "11px", color: "#475569", display: "block", marginBottom: "12px", textTransform: "uppercase" }}>
                Dark Transparent SVG (Light BG)
              </span>
              <div style={{ height: "50px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Image
                  src="/images/maas-logo-dark.svg"
                  alt="Dark Logo"
                  width={200}
                  height={50}
                  style={{ maxHeight: "38px", width: "auto" }}
                />
              </div>
              <button
                type="button"
                className={media.logo === "/images/maas-logo-dark.svg" ? "btn-gold" : "btn-secondary"}
                style={{ marginTop: "14px", width: "100%", justifyContent: "center", fontSize: "12px" }}
                onClick={async () => {
                  const next = { ...media, logo: "/images/maas-logo-dark.svg" };
                  setMedia(next);
                  await onUpdate(next);
                  notify("Active logo set to Dark SVG!");
                }}
              >
                {media.logo === "/images/maas-logo-dark.svg" ? "Currently Active" : "Use as Active Logo"}
              </button>
            </div>
          </div>

          {/* Custom Logo Upload or Choose from Library */}
          <div
            style={{
              padding: "20px",
              background: "rgba(255, 255, 255, 0.02)",
              border: "1px dashed rgba(212, 175, 55, 0.35)",
              borderRadius: "8px",
            }}
          >
            <h4 style={{ margin: "0 0 10px", fontSize: "14px", color: "var(--admin-gold)", display: "flex", alignItems: "center", gap: "6px" }}>
              <span>📁</span>
              <span>Upload or Select Custom Brand Logo</span>
            </h4>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
              <button
                type="button"
                className="btn-gold"
                style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                onClick={() =>
                  setPickerModal({
                    isOpen: true,
                    title: "Select Brand Logo from Library",
                    currentUrl: media.logo,
                    onSelect: async (url) => {
                      const next = { ...media, logo: url };
                      setMedia(next);
                      await onUpdate(next);
                      notify("Brand logo updated from library!");
                    },
                  })
                }
              >
                <span>🖼️</span>
                <span>Choose from Library</span>
              </button>

              <label className="btn-secondary" style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <span>📁</span>
                <span>{uploadingField === "logo" ? "Uploading…" : "Upload Custom File"}</span>
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setUploadingField("logo");
                    try {
                      const url = await uploadImage(file);
                      const next = { ...media, logo: url };
                      setMedia(next);
                      await onUpdate(next);
                      notify("Custom logo updated!");
                    } catch (err: unknown) {
                      addToast("error", "Logo upload error", err instanceof Error ? err.message : "Failed to upload logo");
                    } finally {
                      setUploadingField(null);
                    }
                  }}
                  disabled={uploadingField === "logo"}
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Reusable Media Library Picker Modal */}
      <MediaPickerModal
        isOpen={pickerModal.isOpen}
        onClose={() => setPickerModal((p) => ({ ...p, isOpen: false }))}
        title={pickerModal.title || "Choose Image from Library"}
        currentUrl={pickerModal.currentUrl}
        onSelect={pickerModal.onSelect}
      />
    </div>
  );
}
