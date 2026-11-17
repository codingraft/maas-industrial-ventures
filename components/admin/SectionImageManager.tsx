"use client";

import { useState } from "react";
import Image from "next/image";
import { SiteSettings, HeroSlide, GalleryItem, SectionImage, MasterPlanItem, GalleryCategory } from "@/lib/types";
import { ToastContainer, ConfirmModal, ToastMessage } from "@/components/admin/AdminDialogs";
import { AdminTabs } from "@/components/admin/ui/AdminTabs";

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
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/admin/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Upload failed");
    return data.url;
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

  async function handleAddHeroSlide(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingField("new-hero");
    try {
      const url = await uploadFile(file);
      const newSlide: HeroSlide = {
        id: `slide-${Date.now()}`,
        src: url,
        alt: "MAAS Industrial infrastructure perspective",
        eyebrow: "INDUSTRIAL INFRASTRUCTURE",
        title: "Engineered for scale. Built for reliability.",
        subtitle: "High-voltage power infrastructure, reinforced concrete freight corridors, and dedicated zoning.",
      };
      const nextSlides = [...media.heroSlides, newSlide];
      const nextMedia = { ...media, heroSlides: nextSlides };
      setMedia(nextMedia);
      await onUpdate(nextMedia);
      notify("New Hero Slide added successfully!");
    } catch (err: unknown) {
      addToast("error", "Upload error", err instanceof Error ? err.message : "Upload error");
    } finally {
      setUploadingField(null);
    }
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

      {/* Section Sub-Navigation Tabs */}
      <div style={{ marginBottom: "20px" }}>
        <AdminTabs
          tabs={[
            { id: "hero", label: "Hero Carousel", count: media.heroSlides.length },
            { id: "overview", label: "Overview Image" },
            { id: "infra", label: "Infrastructure Image" },
            { id: "masterplan", label: "Master Plan", count: (media.masterplanPlans || []).length },
            { id: "location", label: "Location Map" },
            { id: "gallery", label: "Gallery Photos", count: media.gallery.length },
            { id: "logo", label: "Brand Logo" },
          ]}
          activeTab={activeSection}
          onChange={(tabId) => setActiveSection(tabId as typeof activeSection)}
        />
      </div>

      {/* 1. HERO CAROUSEL STUDIO */}
      {activeSection === "hero" && (
        <div className="admin-card">
          <div className="admin-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h2 className="admin-card-title">Hero Carousel Slider Studio</h2>
              <p className="admin-card-desc">
                Configure the multi-slide carousel displayed at the top of the homepage.
              </p>
            </div>
            <label className="btn-gold" style={{ cursor: "pointer", display: "inline-flex" }}>
              {uploadingField === "new-hero" ? "Uploading…" : "+ Add New Slide"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                style={{ display: "none" }}
                onChange={handleAddHeroSlide}
                disabled={uploadingField === "new-hero"}
              />
            </label>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "16px" }}>
            {media.heroSlides.map((slide, idx) => (
              <div key={slide.id || idx} className="slide-editor-card">
                <div className="slide-editor-preview">
                  <div style={{ position: "relative", width: "100%", height: "140px" }}>
                    <Image
                      src={slide.src}
                      alt={slide.alt || `Slide ${idx + 1}`}
                      fill
                      style={{ objectFit: "cover", borderRadius: "6px" }}
                    />
                  </div>
                  <label
                    className="btn-secondary"
                    style={{ marginTop: "10px", width: "100%", textAlign: "center", cursor: "pointer", justifyContent: "center" }}
                  >
                    {uploadingField === `hero-${idx}` ? "Uploading…" : "Replace Photo"}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      style={{ display: "none" }}
                      onChange={(e) => handleHeroSlideImageUpload(idx, e)}
                      disabled={uploadingField === `hero-${idx}`}
                    />
                  </label>
                  <button
                    type="button"
                    className="btn-danger"
                    style={{ marginTop: "8px" }}
                    onClick={() => handleDeleteHeroSlide(idx)}
                  >
                    Delete Slide
                  </button>
                </div>

                <div className="slide-editor-fields">
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "#d4af37", marginBottom: "8px" }}>
                    SLIDE #{idx + 1} SPECIFICATIONS
                  </div>
                  <div className="form-row">
                    <label className="form-label">Category Eyebrow</label>
                    <input
                      type="text"
                      className="form-control"
                      value={slide.eyebrow || ""}
                      onChange={(e) => handleHeroSlideFieldChange(idx, "eyebrow", e.target.value)}
                      placeholder="e.g. HIGH-CAPACITY INFRASTRUCTURE"
                    />
                  </div>
                  <div className="form-row">
                    <label className="form-label">Main Headline</label>
                    <input
                      type="text"
                      className="form-control"
                      value={slide.title}
                      onChange={(e) => handleHeroSlideFieldChange(idx, "title", e.target.value)}
                      placeholder="e.g. Built for industry. Designed for what's next."
                    />
                  </div>
                  <div className="form-row">
                    <label className="form-label">Subheading Copy</label>
                    <textarea
                      className="form-control"
                      rows={2}
                      value={slide.subtitle}
                      onChange={(e) => handleHeroSlideFieldChange(idx, "subtitle", e.target.value)}
                      placeholder="Brief descriptive highlight..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. OVERVIEW VISUAL */}
      {activeSection === "overview" && (
        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">Overview Section Visual</h2>
            <p className="admin-card-desc">
              High-resolution photo displayed alongside the core project proposition.
            </p>
          </div>

          <div className="image-preview-box">
            <div className="image-preview-thumb">
              <Image
                src={media.overviewImage.src}
                alt="Overview"
                fill
                style={{ objectFit: "cover" }}
              />
            </div>

            <div style={{ flex: 1 }}>
              <label className="btn-gold" style={{ cursor: "pointer", display: "inline-flex", marginBottom: "14px" }}>
                {uploadingField === "overviewImage" ? "Uploading…" : "📁 Replace Overview Photo"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  style={{ display: "none" }}
                  onChange={(e) => handleSectionImageUpload("overviewImage", e)}
                  disabled={uploadingField === "overviewImage"}
                />
              </label>
              <div className="form-help">Recommended resolution: 1920x1080 or higher.</div>
            </div>
          </div>
        </div>
      )}

      {/* 3. INFRASTRUCTURE FRAMEWORK */}
      {activeSection === "infra" && (
        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">Infrastructure Framework Visual</h2>
            <p className="admin-card-desc">
              Displayed in the 3rd pillar card (Utilities &amp; Heavy Operations).
            </p>
          </div>

          <div className="image-preview-box">
            <div className="image-preview-thumb">
              <Image
                src={media.infraImage.src}
                alt="Infrastructure"
                fill
                style={{ objectFit: "cover" }}
              />
            </div>

            <div style={{ flex: 1 }}>
              <label className="btn-gold" style={{ cursor: "pointer", display: "inline-flex", marginBottom: "14px" }}>
                {uploadingField === "infraImage" ? "Uploading…" : "📁 Replace Infrastructure Visual"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  style={{ display: "none" }}
                  onChange={(e) => handleSectionImageUpload("infraImage", e)}
                  disabled={uploadingField === "infraImage"}
                />
              </label>
              <div className="form-help">Recommended: High-voltage sub-stations, water plants, or clean machinery.</div>
            </div>
          </div>
        </div>
      )}

      {/* 4. MASTER PLAN MULTI-PERSPECTIVE STUDIO */}
      {activeSection === "masterplan" && (
        <div>
          <div className="admin-card">
            <div className="admin-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h2 className="admin-card-title">
                  Master Plan Perspectives Studio ({(media.masterplanPlans || []).length} Plans)
                </h2>
                <p className="admin-card-desc">
                  Visitors on the homepage can switch between these perspectives (e.g. Overall Zoning, Phase 1 Demarcation, Utility Grid) and click to expand high-res blueprints.
                </p>
              </div>
            </div>

            {/* List of Configured Master Plans */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "16px" }}>
              {(media.masterplanPlans || []).map((plan, pIdx) => (
                <div key={plan.id || pIdx} className="slide-editor-card">
                  <div className="slide-editor-preview">
                    <div style={{ position: "relative", width: "100%", height: "160px", background: "#090d16", borderRadius: "6px", overflow: "hidden" }}>
                      <Image
                        src={plan.src}
                        alt={plan.title}
                        fill
                        style={{ objectFit: "contain", padding: "8px" }}
                      />
                    </div>
                    <label
                      className="btn-secondary"
                      style={{ marginTop: "10px", width: "100%", textAlign: "center", cursor: "pointer", justifyContent: "center" }}
                    >
                      {uploadingField === `plan-${pIdx}` ? "Uploading…" : "Replace Blueprint File"}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/svg+xml"
                        style={{ display: "none" }}
                        onChange={(e) => handleReplacePlanImage(pIdx, e)}
                        disabled={uploadingField === `plan-${pIdx}`}
                      />
                    </label>
                    <button
                      type="button"
                      className="btn-danger"
                      style={{ marginTop: "8px" }}
                      onClick={() => handleDeleteMasterPlan(plan.id)}
                    >
                      Delete Perspective
                    </button>
                  </div>

                  <div className="slide-editor-fields">
                    <div style={{ fontSize: "12px", fontWeight: 700, color: "#d4af37", marginBottom: "8px" }}>
                      PLAN PERSPECTIVE #{pIdx + 1}
                    </div>
                    <div className="form-grid-2">
                      <div className="form-row">
                        <label className="form-label">Perspective Title</label>
                        <input
                          type="text"
                          className="form-control"
                          value={plan.title}
                          onChange={(e) => handlePlanFieldChange(pIdx, "title", e.target.value)}
                          placeholder="e.g. Overall Zoning & Master Layout"
                        />
                      </div>
                      <div className="form-row">
                        <label className="form-label">Tag Badge</label>
                        <input
                          type="text"
                          className="form-control"
                          value={plan.tag || ""}
                          onChange={(e) => handlePlanFieldChange(pIdx, "tag", e.target.value)}
                          placeholder="e.g. Phase 1 & 2 Blueprint"
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <label className="form-label">Subtitle Summary</label>
                      <input
                        type="text"
                        className="form-control"
                        value={plan.subtitle || ""}
                        onChange={(e) => handlePlanFieldChange(pIdx, "subtitle", e.target.value)}
                        placeholder="e.g. Macro sectoral demarcation & green buffer perimeter"
                      />
                    </div>

                    <div className="form-row" style={{ marginBottom: 0 }}>
                      <label className="form-label">Technical Description</label>
                      <textarea
                        className="form-control"
                        rows={2}
                        value={plan.description || ""}
                        onChange={(e) => handlePlanFieldChange(pIdx, "description", e.target.value)}
                        placeholder="Details about zoning division, road widths, setbacks..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add New Master Plan Perspective Form */}
            <div style={{ background: "#11151f", border: "1px dashed #334155", borderRadius: "8px", padding: "20px", marginTop: "24px" }}>
              <h3 style={{ margin: "0 0 12px", fontSize: "14px", color: "#d4af37" }}>
                + Add New Master Plan Perspective
              </h3>
              <div className="form-grid-2" style={{ marginBottom: "14px" }}>
                <div>
                  <label className="form-label">Perspective Title *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newPlanTitle}
                    onChange={(e) => setNewPlanTitle(e.target.value)}
                    placeholder="e.g. Phase 2 Heavy Engineering Layout"
                  />
                </div>
                <div>
                  <label className="form-label">Tag Badge</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newPlanTag}
                    onChange={(e) => setNewPlanTag(e.target.value)}
                    placeholder="e.g. Phase 2 Demarcation"
                  />
                </div>
              </div>

              <div className="form-row">
                <label className="form-label">Subtitle</label>
                <input
                  type="text"
                  className="form-control"
                  value={newPlanSubtitle}
                  onChange={(e) => setNewPlanSubtitle(e.target.value)}
                  placeholder="e.g. 50-acre dedicated heavy engineering cluster"
                />
              </div>

              <div className="form-row" style={{ marginBottom: "16px" }}>
                <label className="form-label">Technical Description</label>
                <textarea
                  className="form-control"
                  rows={2}
                  value={newPlanDesc}
                  onChange={(e) => setNewPlanDesc(e.target.value)}
                  placeholder="Specify setbacks, road circulation, power connection details..."
                />
              </div>

              <label className="btn-gold" style={{ cursor: "pointer", display: "inline-flex" }}>
                {uploadingField === "new-plan" ? "Uploading Plan…" : "📁 Choose Blueprint File & Add Perspective"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/svg+xml"
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
        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">Strategic Location &amp; Connectivity Map</h2>
            <p className="admin-card-desc">
              Highway and freight connectivity map displayed in the location section.
            </p>
          </div>

          <div className="image-preview-box">
            <div className="image-preview-thumb">
              <Image
                src={media.locationImage.src || "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=1200&q=82"}
                alt="Location Map"
                fill
                style={{ objectFit: "cover" }}
              />
            </div>

            <div style={{ flex: 1 }}>
              <label className="btn-gold" style={{ cursor: "pointer", display: "inline-flex", marginBottom: "14px" }}>
                {uploadingField === "locationImage" ? "Uploading…" : "📁 Replace Connectivity Map"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/svg+xml"
                  style={{ display: "none" }}
                  onChange={(e) => handleSectionImageUpload("locationImage", e)}
                  disabled={uploadingField === "locationImage"}
                />
              </label>
              <div className="form-help">Annotated aerial highways, rail corridors, and ports work best.</div>
            </div>
          </div>
        </div>
      )}

      {/* 6. PROJECT GALLERY & CATEGORIES STUDIO */}
      {activeSection === "gallery" && (
        <div>
          {/* Category Management Studio */}
          <div className="admin-card" style={{ marginBottom: "20px" }}>
            <div className="admin-card-header">
              <h2 className="admin-card-title">Gallery Sector Categories</h2>
              <p className="admin-card-desc">
                Create and manage categories for your project photos. On the website, category tabs with zero images will automatically stay hidden.
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
                      background: "#161c2c",
                      border: "1px solid #283042",
                      padding: "6px 12px",
                      borderRadius: "20px",
                      fontSize: "12.5px",
                    }}
                  >
                    <span style={{ color: "#fff", fontWeight: 600 }}>{cat.label}</span>
                    <span style={{ fontSize: "11px", color: count > 0 ? "#4ade80" : "#64748b" }}>
                      ({count} {count === 1 ? "photo" : "photos"})
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
            <div style={{ display: "flex", gap: "10px", alignItems: "center", maxWidth: "420px", flexWrap: "wrap" }}>
              <input
                type="text"
                className="form-control"
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
                style={{ whiteSpace: "nowrap" }}
              >
                + Add Category
              </button>
            </div>
          </div>

          {/* Photo Assets Grid */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h2 className="admin-card-title">Project Gallery Photos ({media.gallery.length} Images)</h2>
              <p className="admin-card-desc">
                Photos rendered in the paginated gallery. Only sectors with at least 1 photo will appear on the frontend.
              </p>
            </div>

            {/* Gallery Grid */}
            <div className="admin-gallery-grid">
              {media.gallery.map((item) => (
                <div key={item.id} className="admin-gallery-card">
                  <div style={{ position: "relative", width: "100%", height: "140px" }}>
                    <Image
                      src={item.src}
                      alt={item.alt}
                      fill
                      style={{ objectFit: "cover" }}
                    />
                    <span className="gallery-card-badge">
                      {item.category}
                    </span>
                  </div>
                  <div style={{ padding: "12px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontSize: "12px", fontWeight: 600, color: "#fff" }}>{item.caption}</div>

                      <div style={{ marginTop: "10px" }}>
                        <label style={{ fontSize: "10px", color: "#94a3b8", display: "block", marginBottom: "3px" }}>
                          Sector Category:
                        </label>
                        <select
                          className="form-control"
                          style={{ fontSize: "11px", padding: "5px 8px" }}
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
                      style={{ marginTop: "12px", width: "100%", padding: "6px" }}
                      onClick={() => handleDeleteGalleryPhoto(item.id)}
                    >
                      Remove Photo
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add New Gallery Item Card */}
            <div style={{ background: "#11151f", border: "1px dashed #334155", borderRadius: "8px", padding: "20px", marginTop: "24px" }}>
              <h3 style={{ margin: "0 0 12px", fontSize: "14px", color: "#d4af37" }}>
                + Add Photo to Project Gallery
              </h3>
              <div className="form-grid-2" style={{ marginBottom: "14px" }}>
                <div>
                  <label className="form-label">Category</label>
                  <select
                    className="form-control"
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
                  <label className="form-label">Photo Headline / Caption</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newGalCaption}
                    onChange={(e) => setNewGalCaption(e.target.value)}
                    placeholder="e.g. Heavy Fabrication Bay"
                  />
                </div>
              </div>

              <div className="form-row" style={{ marginBottom: "16px" }}>
                <label className="form-label">Alt Accessibility Description</label>
                <input
                  type="text"
                  className="form-control"
                  value={newGalAlt}
                  onChange={(e) => setNewGalAlt(e.target.value)}
                  placeholder="e.g. Modern high bay overhead crane assembly line"
                />
              </div>

              <label className="btn-gold" style={{ cursor: "pointer", display: "inline-flex" }}>
                {uploadingField === "new-gal" ? "Uploading…" : "📁 Choose Image File & Add to Gallery"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  style={{ display: "none" }}
                  onChange={handleAddGalleryPhoto}
                  disabled={uploadingField === "new-gal"}
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* 7. BRAND LOGO */}
      {activeSection === "logo" && (
        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">Corporate Logo Assets</h2>
            <p className="admin-card-desc">
              Transparent vector SVG and high-resolution PNG variants of the MAAS Industrial Ventures logo.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))", gap: "16px", marginBottom: "24px" }}>
            <div style={{ background: "#0b0e14", border: "1px solid #232b3b", borderRadius: "8px", padding: "20px", textAlign: "center" }}>
              <span style={{ fontSize: "11px", color: "#94a3b8", display: "block", marginBottom: "12px" }}>
                WHITE TRANSPARENT SVG (ACTIVE)
              </span>
              <div style={{ height: "50px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Image
                  src="/images/maas-logo-white.svg"
                  alt="White Logo"
                  width={200}
                  height={50}
                  style={{ maxHeight: "40px", width: "auto" }}
                />
              </div>
              <button
                type="button"
                className="btn-secondary"
                style={{ marginTop: "14px", width: "100%", justifyContent: "center" }}
                onClick={async () => {
                  const next = { ...media, logo: "/images/maas-logo-white.svg" };
                  setMedia(next);
                  await onUpdate(next);
                  notify("Active logo set to White SVG!");
                }}
              >
                Use as Active Logo
              </button>
            </div>

            <div style={{ background: "#0b0e14", border: "1px solid #232b3b", borderRadius: "8px", padding: "20px", textAlign: "center" }}>
              <span style={{ fontSize: "11px", color: "#94a3b8", display: "block", marginBottom: "12px" }}>
                GOLD TRANSPARENT SVG
              </span>
              <div style={{ height: "50px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Image
                  src="/images/maas-logo-gold.svg"
                  alt="Gold Logo"
                  width={200}
                  height={50}
                  style={{ maxHeight: "40px", width: "auto" }}
                />
              </div>
              <button
                type="button"
                className="btn-secondary"
                style={{ marginTop: "14px", width: "100%", justifyContent: "center" }}
                onClick={async () => {
                  const next = { ...media, logo: "/images/maas-logo-gold.svg" };
                  setMedia(next);
                  await onUpdate(next);
                  notify("Active logo set to Gold SVG!");
                }}
              >
                Use as Active Logo
              </button>
            </div>

            <div style={{ background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "8px", padding: "20px", textAlign: "center" }}>
              <span style={{ fontSize: "11px", color: "#475569", display: "block", marginBottom: "12px" }}>
                DARK TRANSPARENT SVG
              </span>
              <div style={{ height: "50px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Image
                  src="/images/maas-logo-dark.svg"
                  alt="Dark Logo"
                  width={200}
                  height={50}
                  style={{ maxHeight: "40px", width: "auto" }}
                />
              </div>
              <button
                type="button"
                className="btn-secondary"
                style={{ marginTop: "14px", width: "100%", justifyContent: "center" }}
                onClick={async () => {
                  const next = { ...media, logo: "/images/maas-logo-dark.svg" };
                  setMedia(next);
                  await onUpdate(next);
                  notify("Active logo set to Dark SVG!");
                }}
              >
                Use as Active Logo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
