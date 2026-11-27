import React, { useState, useRef } from "react";
import {
  User,
  Camera,
  Edit2,
  Trash2,
  Upload,
  CheckCircle2,
  ShieldCheck,
  Lock,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Globe,
  Landmark,
  KeyRound,
  X,
  AlertCircle,
  FileText,
  Sparkles,
} from "lucide-react";
import { useCustomerBanking } from "../customer-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ProfileView() {
  const { profile, activeAccount, updateProfile, updateProfileAvatar, removeProfileAvatar } =
    useCustomerBanking();

  // Modals
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [editDetailsModalOpen, setEditDetailsModalOpen] = useState(false);

  // Photo Upload State
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [photoError, setPhotoError] = useState("");

  // Edit Details Form State
  const [firstName, setFirstName] = useState(profile.firstName);
  const [middleName, setMiddleName] = useState(profile.middleName);
  const [lastName, setLastName] = useState(profile.lastName);
  const [mobilePhone, setMobilePhone] = useState(profile.mobilePhone);
  const [alternativePhone, setAlternativePhone] = useState(profile.alternativePhone);
  const [street, setStreet] = useState(profile.residentialAddress.street);
  const [city, setCity] = useState(profile.residentialAddress.city);
  const [state, setState] = useState(profile.residentialAddress.state);
  const [postalCode, setPostalCode] = useState(profile.residentialAddress.postalCode);
  const [country, setCountry] = useState(profile.residentialAddress.country);
  const [updateSuccessMsg, setUpdateSuccessMsg] = useState("");
  const [formError, setFormError] = useState("");

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setPhotoError("");
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setPhotoError("Please select a valid image file (JPG, PNG, or WebP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setPhotoError("Image size must be less than 5 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSavePhoto = () => {
    if (selectedImage) {
      updateProfileAvatar(selectedImage);
      setPhotoModalOpen(false);
      setSelectedImage(null);
    }
  };

  const handleRemovePhoto = () => {
    removeProfileAvatar();
    setPhotoModalOpen(false);
    setSelectedImage(null);
  };

  const handleSavePersonalDetails = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!firstName.trim()) return setFormError("First Name is required.");
    if (!lastName.trim()) return setFormError("Last Name is required.");
    if (!mobilePhone.trim()) return setFormError("Mobile Phone is required.");

    updateProfile({
      firstName,
      middleName,
      lastName,
      mobilePhone,
      alternativePhone,
      residentialAddress: {
        street,
        city,
        state,
        postalCode,
        country,
      },
    });

    setUpdateSuccessMsg("Your Profile Has Been Updated Successfully.");
    setTimeout(() => {
      setEditDetailsModalOpen(false);
      setUpdateSuccessMsg("");
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div>
          <span className="text-[11px] font-semibold tracking-widest text-[#C6A66B] uppercase flex items-center gap-1.5">
            <User className="h-3.5 w-3.5" /> Client Identification & Security Registry
          </span>
          <h1 className="text-2xl md:text-3xl font-serif font-medium text-foreground mt-1">
            Customer Profile Dashboard
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
            Manage your personal data, residential contact details, banking charter classification, and security credentials.
          </p>
        </div>

        <Button
          onClick={() => {
            setFirstName(profile.firstName);
            setMiddleName(profile.middleName);
            setLastName(profile.lastName);
            setMobilePhone(profile.mobilePhone);
            setAlternativePhone(profile.alternativePhone);
            setStreet(profile.residentialAddress.street);
            setCity(profile.residentialAddress.city);
            setState(profile.residentialAddress.state);
            setPostalCode(profile.residentialAddress.postalCode);
            setCountry(profile.residentialAddress.country);
            setFormError("");
            setUpdateSuccessMsg("");
            setEditDetailsModalOpen(true);
          }}
          className="bg-[#C6A66B] hover:bg-[#b5955a] text-[#101D32] font-semibold text-xs gap-1.5 self-start sm:self-auto"
        >
          <Edit2 className="h-3.5 w-3.5" />
          <span>Edit Personal Details</span>
        </Button>
      </div>

      {/* TWO COLUMN PROFILE LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN – PROFILE CARD (4 cols) */}
        <div className="lg:col-span-4 p-6 rounded-2xl border border-white/60 bg-white/75 dark:bg-slate-900/60 backdrop-blur-md shadow-sm space-y-6 text-center">
          {/* Avatar with Camera Overlay */}
          <div className="relative mx-auto w-32 h-32">
            <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-[#C6A66B] shadow-md bg-muted/60 flex items-center justify-center mx-auto">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={`${profile.firstName} ${profile.lastName}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl font-serif font-bold text-[#C6A66B]">
                  {profile.firstName[0]}
                  {profile.lastName[0]}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setSelectedImage(profile.avatarUrl);
                setPhotoError("");
                setPhotoModalOpen(true);
              }}
              className="absolute bottom-1 right-1 p-2 rounded-full bg-[#101D32] text-[#C6A66B] border border-[#C6A66B]/50 hover:bg-[#172C49] shadow-md transition-transform hover:scale-110 cursor-pointer"
              title="Edit Profile Picture"
            >
              <Camera className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-1">
            <h2 className="text-lg font-serif font-bold text-foreground">
              {profile.firstName} {profile.middleName} {profile.lastName}
            </h2>
            <span className="text-xs text-[#C6A66B] font-medium block">
              {profile.accountType}
            </span>
            <span className="text-xs font-mono text-muted-foreground block">
              Customer ID: {profile.customerId}
            </span>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedImage(profile.avatarUrl);
              setPhotoError("");
              setPhotoModalOpen(true);
            }}
            className="w-full text-xs gap-1.5 border-[#C6A66B]/40 hover:border-[#C6A66B]"
          >
            <Camera className="h-3.5 w-3.5 text-[#C6A66B]" />
            <span>Edit Profile Picture</span>
          </Button>

          <div className="p-4 rounded-xl bg-muted/40 text-left space-y-2.5 text-xs pt-3 border-t border-border/40">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Account Status:</span>
              <span className="font-semibold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> {profile.accountStatus}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">KYC Clearance:</span>
              <span className="font-semibold text-emerald-600 flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" /> {profile.kycStatus}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Member Since:</span>
              <span className="text-foreground font-medium">{profile.memberSince}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Primary Currency:</span>
              <span className="font-mono text-foreground font-semibold">GBP / Multi-Vault</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN – INFORMATION & SETTINGS CARDS (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* PERSONAL DETAILS */}
          <div className="p-6 rounded-2xl border border-white/60 bg-white/75 dark:bg-slate-900/60 backdrop-blur-md shadow-sm space-y-4">
            <h3 className="text-sm font-serif font-bold text-foreground flex items-center gap-2 border-b border-border/40 pb-2">
              <User className="h-4 w-4 text-[#C6A66B]" />
              <span>Personal Identification</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-muted-foreground block text-[11px]">First Name</span>
                <strong className="text-foreground text-sm font-medium">{profile.firstName}</strong>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Middle Name</span>
                <strong className="text-foreground text-sm font-medium">{profile.middleName}</strong>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Last Name</span>
                <strong className="text-foreground text-sm font-medium">{profile.lastName}</strong>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Date of Birth</span>
                <span className="text-foreground font-medium">{profile.dateOfBirth}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Nationality</span>
                <span className="text-foreground font-medium">{profile.nationality}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Country of Residence</span>
                <span className="text-foreground font-medium">{profile.countryOfResidence}</span>
              </div>
            </div>
          </div>

          {/* CONTACT INFORMATION */}
          <div className="p-6 rounded-2xl border border-white/60 bg-white/75 dark:bg-slate-900/60 backdrop-blur-md shadow-sm space-y-4">
            <h3 className="text-sm font-serif font-bold text-foreground flex items-center gap-2 border-b border-border/40 pb-2">
              <Mail className="h-4 w-4 text-[#C6A66B]" />
              <span>Contact & Residential Data</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-muted-foreground block text-[11px]">Registered Email Address</span>
                <strong className="text-foreground text-sm font-medium">{profile.email}</strong>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Mobile Phone Number</span>
                <strong className="text-foreground text-sm font-mono">{profile.mobilePhone}</strong>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Alternative Phone Number</span>
                <strong className="text-foreground text-sm font-mono">
                  {profile.alternativePhone || "None Registered"}
                </strong>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Jurisdiction</span>
                <span className="text-foreground font-medium">{profile.residentialAddress.country}</span>
              </div>
              <div className="sm:col-span-2 p-3 rounded-lg bg-muted/40 space-y-1">
                <span className="text-[11px] text-muted-foreground block">Residential Address</span>
                <strong className="text-foreground text-xs font-medium block">
                  {profile.residentialAddress.street}, {profile.residentialAddress.city},{" "}
                  {profile.residentialAddress.state} {profile.residentialAddress.postalCode},{" "}
                  {profile.residentialAddress.country}
                </strong>
              </div>
            </div>
          </div>

          {/* BANKING INFORMATION */}
          <div className="p-6 rounded-2xl border border-white/60 bg-white/75 dark:bg-slate-900/60 backdrop-blur-md shadow-sm space-y-4">
            <h3 className="text-sm font-serif font-bold text-foreground flex items-center gap-2 border-b border-border/40 pb-2">
              <Landmark className="h-4 w-4 text-[#C6A66B]" />
              <span>Private Banking Portfolio</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-muted-foreground block text-[11px]">Customer ID</span>
                <strong className="text-foreground font-mono">{profile.customerId}</strong>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Primary Account Number</span>
                <strong className="text-foreground font-mono">
                  {activeAccount.maskedAccountNumber}
                </strong>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Primary Account Type</span>
                <span className="text-foreground font-medium">{activeAccount.type}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Primary Currency</span>
                <span className="text-foreground font-mono font-semibold">{activeAccount.currency}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Account Opening Date</span>
                <span className="text-foreground font-medium">{activeAccount.openingDate}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Account Status</span>
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> {activeAccount.status}
                </span>
              </div>
            </div>
          </div>

          {/* SECURITY CREDENTIALS */}
          <div className="p-6 rounded-2xl border border-white/60 bg-white/75 dark:bg-slate-900/60 backdrop-blur-md shadow-sm space-y-4">
            <h3 className="text-sm font-serif font-bold text-foreground flex items-center gap-2 border-b border-border/40 pb-2">
              <ShieldCheck className="h-4 w-4 text-[#C6A66B]" />
              <span>Security Credentials & Authentication</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <span className="text-muted-foreground">Email Verification Status</span>
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Verified
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <span className="text-muted-foreground">Phone Verification Status</span>
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Verified
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <span className="text-muted-foreground">Security PIN Verification</span>
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" /> 6-Digit PIN Protected
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <span className="text-muted-foreground">Password Policy</span>
                <span className="text-emerald-600 font-semibold">Compliant</span>
              </div>

              <div className="sm:col-span-2 pt-2 border-t border-border/30 flex flex-col sm:flex-row justify-between text-[11px] text-muted-foreground gap-1">
                <span>Last Successful Login: {profile.lastLogin}</span>
                <span>Last Password Update: {profile.lastPasswordChange}</span>
              </div>
            </div>
          </div>

          {/* NOTIFICATION & DISPATCH PREFERENCES */}
          <div className="p-6 rounded-2xl border border-white/60 bg-white/75 dark:bg-slate-900/60 backdrop-blur-md shadow-sm space-y-4">
            <h3 className="text-sm font-serif font-bold text-foreground flex items-center gap-2 border-b border-border/40 pb-2">
              <Globe className="h-4 w-4 text-[#C6A66B]" />
              <span>Account Alert & Notification Preferences</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div>
                  <strong className="block text-foreground font-medium">Instant SMS Activity Alerts</strong>
                  <span className="text-[11px] text-muted-foreground">Immediate alerts sent for debits, wires, and withdrawals.</span>
                </div>
                <span className="px-2.5 py-1 rounded text-[11px] font-semibold bg-emerald-500/15 text-emerald-600">Enabled</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div>
                  <strong className="block text-foreground font-medium">Large Transaction Approvals</strong>
                  <span className="text-[11px] text-muted-foreground">Require security PIN confirmation for transfers over £50,000.</span>
                </div>
                <span className="px-2.5 py-1 rounded text-[11px] font-semibold bg-emerald-500/15 text-emerald-600">Enabled</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div>
                  <strong className="block text-foreground font-medium">Monthly Signed Statements</strong>
                  <span className="text-[11px] text-muted-foreground">Encrypted digital statement dispatched to your verified email.</span>
                </div>
                <span className="px-2.5 py-1 rounded text-[11px] font-semibold bg-emerald-500/15 text-emerald-600">Enabled</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* EDIT PROFILE PICTURE MODAL */}
      {photoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-50">
          <div className="bg-background border border-border/80 rounded-xl shadow-2xl max-w-md w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="text-base font-serif font-bold text-foreground">
                Edit Profile Photograph
              </h3>
              <button
                type="button"
                onClick={() => setPhotoModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Image Preview & Crop/Zoom Simulation */}
            <div className="space-y-4 text-center">
              <div className="w-40 h-40 rounded-full mx-auto overflow-hidden border-2 border-[#C6A66B] shadow-inner bg-muted/60 flex items-center justify-center relative">
                {selectedImage ? (
                  <img
                    src={selectedImage}
                    alt="Preview"
                    style={{ transform: `scale(${zoomLevel})` }}
                    className="w-full h-full object-cover transition-transform"
                  />
                ) : (
                  <User className="h-16 w-16 text-muted-foreground" />
                )}
              </div>

              {selectedImage && (
                <div className="space-y-1 max-w-xs mx-auto">
                  <span className="text-[11px] text-muted-foreground">Reposition & Zoom</span>
                  <input
                    type="range"
                    min="1"
                    max="2"
                    step="0.05"
                    value={zoomLevel}
                    onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageSelect}
                className="hidden"
              />

              <div className="flex justify-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs gap-1.5"
                >
                  <Upload className="h-3.5 w-3.5 text-[#C6A66B]" />
                  <span>{selectedImage ? "Replace Image" : "Upload Image"}</span>
                </Button>

                {profile.avatarUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemovePhoto}
                    className="text-xs text-rose-500 hover:text-rose-700"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Remove Picture</span>
                  </Button>
                )}
              </div>

              {photoError && <p className="text-xs text-rose-500">{photoError}</p>}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border/40">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPhotoModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleSavePhoto}
                disabled={!selectedImage}
                className="bg-[#C6A66B] hover:bg-[#b5955a] text-[#101D32] font-semibold"
              >
                Save Profile Picture
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT PERSONAL DETAILS MODAL */}
      {editDetailsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-50">
          <div className="bg-background border border-border/80 rounded-xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <div>
                <h3 className="text-base font-serif font-bold text-foreground">
                  Edit Personal Details
                </h3>
                <p className="text-xs text-muted-foreground">
                  Update your contact and residential parameters. Identity changes require compliance review.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditDetailsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {updateSuccessMsg ? (
              <div className="p-8 text-center space-y-3">
                <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
                <h4 className="text-sm font-serif font-bold text-foreground">{updateSuccessMsg}</h4>
                <p className="text-xs text-muted-foreground">Your changes have been saved to your profile.</p>
              </div>
            ) : (
              <form onSubmit={handleSavePersonalDetails} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="font-medium text-foreground">First Name</label>
                    <Input
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-medium text-foreground">Middle Name</label>
                    <Input
                      value={middleName}
                      onChange={(e) => setMiddleName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-medium text-foreground">Last Name</label>
                    <Input
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-medium text-foreground">Mobile Phone</label>
                    <Input
                      value={mobilePhone}
                      onChange={(e) => setMobilePhone(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-medium text-foreground">Alternative Phone</label>
                    <Input
                      value={alternativePhone}
                      onChange={(e) => setAlternativePhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-border/40 space-y-2">
                  <label className="font-semibold text-foreground block">Residential Address</label>
                  <Input
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="Street Address"
                    required
                  />
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" required />
                    <Input value={state} onChange={(e) => setState(e.target.value)} placeholder="State/County" />
                    <Input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} placeholder="Postal Code" required />
                    <Input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Country" required />
                  </div>
                </div>

                {formError && <p className="text-rose-500 text-xs">{formError}</p>}

                <div className="flex justify-end gap-2 pt-3 border-t border-border/40">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setEditDetailsModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    className="bg-[#C6A66B] hover:bg-[#b5955a] text-[#101D32] font-semibold"
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
