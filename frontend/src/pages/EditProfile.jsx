import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Lock, User } from "lucide-react";
import { toast } from "sonner";

import { profileApi, uploadApi, formatApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import UserAvatar from "@/components/UserAvatar";

export default function EditProfile() {
  const navigate = useNavigate();
  const { updateUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [avatar, setAvatar] = useState("explorer");
  const [ownedAvatars, setOwnedAvatars] = useState(["explorer"]);
  const [avatarStore, setAvatarStore] = useState([]);
  const [avatarType, setAvatarType] = useState("preset");
  const [customAvatarKey, setCustomAvatarKey] = useState(null);
  const [customAvatarUrl, setCustomAvatarUrl] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState(null);

  async function load() {
    try {
      const { data } = await profileApi.getMe();
      setUsername(data?.username || "");
      setDisplayName(data?.display_name || "");
      setBio(data?.bio || "");
      setIsPublic(data?.is_public ?? true);
      setAvatar(data?.avatar || "explorer");
      setOwnedAvatars(data?.owned_avatars || ["explorer"]);
      setAvatarStore(data?.avatar_store || []);
      setAvatarType(data?.avatar_type || "preset");
      setCustomAvatarKey(data?.custom_avatar_key || null);
      setCustomAvatarUrl(data?.custom_avatar_url || null);
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => () => {
    if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
  }, [avatarPreviewUrl]);

  async function handleSave() {
    const cleanUsername = username.trim().toLowerCase();
    const cleanDisplayName = displayName.trim();

    if (cleanUsername && cleanUsername.length < 3) {
      toast.error("Username must be at least 3 characters.");
      return;
    }
    if (cleanUsername && !/^[a-z0-9_]+$/.test(cleanUsername)) {
      toast.error("Username can only contain letters, numbers, and underscores.");
      return;
    }
    if (!cleanDisplayName) {
      toast.error("Please enter a display name.");
      return;
    }
    if (avatarType === "preset" && !ownedAvatars.includes(avatar)) {
      toast.error("Choose an unlocked avatar before saving.");
      return;
    }

    setSaving(true);
    try {
      const { data } = await profileApi.updateMe({
        username: cleanUsername || null,
        display_name: cleanDisplayName,
        bio: bio.trim(),
        is_public: isPublic,
      });
      let avatarData;
      if (avatarType === "custom" && avatarFile) {
        const extension = avatarFile.name.split(".").pop()?.toLowerCase();
        const types = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", heic: "image/heic" };
        const contentType = avatarFile.type || types[extension];
        if (!contentType) throw new Error("Choose a JPEG, PNG, WebP, or HEIC image.");
        const { data: upload } = await uploadApi.createUploadUrl({ upload_type: "avatar", filename: avatarFile.name, content_type: contentType });
        const putResponse = await fetch(upload.upload_url, { method: "PUT", headers: upload.headers, body: avatarFile });
        if (!putResponse.ok) throw new Error("Avatar upload failed. Please try again.");
        ({ data: avatarData } = await profileApi.updateAvatar({ avatar_type: "custom", custom_avatar_key: upload.key }));
      } else if (avatarType === "preset") {
        ({ data: avatarData } = await profileApi.updateAvatar({ avatar_type: "preset", avatar }));
      } else if (!customAvatarKey) {
        throw new Error("Choose a custom avatar image before saving.");
      }
      updateUser?.({
        username: data?.username,
        display_name: data?.display_name,
        bio: data?.bio,
        is_public: data?.is_public,
        avatar: avatarData?.avatar || data?.avatar,
        avatar_type: avatarData?.avatar_type || data?.avatar_type,
        custom_avatar_url: avatarData?.custom_avatar_url || data?.custom_avatar_url,
      });
      toast.success("Profile updated");
      navigate("/profile");
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div style={styles.page}>
        <p style={styles.status}>Loading your profile...</p>
      </div>
    );
  }

  const avatars = avatarStore.length > 0 ? avatarStore : [{ id: "explorer", name: "Explorer" }];

  return (
    <div style={styles.page} data-testid="edit-profile-page">
      <header style={styles.header}>
        <p style={styles.eyebrow}>OurOrbit</p>
        <h1 style={styles.title}>Edit Profile</h1>
        <p style={styles.subtitle}>Customize your orbit identity.</p>
      </header>

      <div style={styles.card}>
        <div style={styles.field}>
          <label style={styles.label}>Display Name</label>
          <input
            style={styles.input}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name"
            data-testid="display-name-input"
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Username</label>
          <input
            style={styles.input}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="username"
            autoCapitalize="none"
            autoCorrect="off"
            data-testid="username-input"
          />
          <p style={styles.helper}>Letters, numbers, and underscores only.</p>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Bio</label>
          <textarea
            style={{ ...styles.input, minHeight: 90, resize: "vertical" }}
            value={bio}
            maxLength={160}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Building better days."
            data-testid="bio-input"
          />
          <p style={styles.helper}>{bio.length}/160 characters</p>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Avatar</label>
          <p style={styles.helper}>
            Unlock avatars through achievements, then choose one for your profile.
          </p>

          <div style={styles.customAvatarRow}>
            <UserAvatar user={{ avatar_type: avatarType, custom_avatar_url: avatarPreviewUrl || customAvatarUrl }} size={72} />
            <label style={styles.uploadButton}>
              Upload custom avatar
              <input type="file" accept="image/jpeg,image/png,image/webp,image/heic,.heic" hidden onChange={(event) => { const file = event.target.files?.[0] || null; setAvatarFile(file); setAvatarPreviewUrl(file ? URL.createObjectURL(file) : null); if (file) setAvatarType("custom"); }} />
            </label>
          </div>

          <div style={styles.avatarGrid}>
            {avatars.map((item) => {
              const unlocked = ownedAvatars.includes(item.id);
              const selected = avatarType === "preset" && avatar === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  disabled={!unlocked}
                  onClick={() => { setAvatar(item.id); setAvatarType("preset"); setAvatarFile(null); setAvatarPreviewUrl(null); }}
                  data-testid={`avatar-option-${item.id}`}
                  style={{
                    ...styles.avatarOption,
                    ...(selected ? styles.avatarOptionSelected : {}),
                    opacity: unlocked ? 1 : 0.45,
                    cursor: unlocked ? "pointer" : "not-allowed",
                  }}
                >
                  <div style={styles.avatarIcon}>
                    {unlocked ? <User size={26} /> : <Lock size={22} />}
                  </div>
                  <strong style={styles.avatarName}>{item.name}</strong>
                  <span style={styles.avatarStatus}>
                    {unlocked ? (selected ? "Selected" : "Unlocked") : "Locked"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div style={styles.visibilityRow}>
          <div>
            <strong style={styles.visTitle}>Public Profile</strong>
            <p style={styles.visText}>
              Let others view your profile and progress.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={isPublic}
            onClick={() => setIsPublic((v) => !v)}
            data-testid="public-toggle"
            style={{
              ...styles.toggle,
              background: isPublic ? "var(--primary)" : "var(--border)",
            }}
          >
            <span
              style={{
                ...styles.toggleKnob,
                transform: isPublic ? "translateX(22px)" : "translateX(0)",
              }}
            />
          </button>
        </div>

        <div style={styles.actions}>
          <button
            style={styles.saveButton}
            onClick={handleSave}
            disabled={saving}
            data-testid="save-profile-button"
          >
            <Check size={18} />
            {saving ? "Saving..." : "Save Profile"}
          </button>
          <button
            style={styles.cancelButton}
            onClick={() => navigate("/profile")}
            disabled={saving}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { width: "100%" },
  header: { marginBottom: 22, maxWidth: 720 },
  eyebrow: {
    margin: "0 0 10px",
    color: "var(--primary-dark)",
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    fontSize: 12,
  },
  title: { margin: 0, fontSize: 44, lineHeight: 1, letterSpacing: "-0.06em", color: "var(--text)" },
  subtitle: { margin: "12px 0 0", color: "var(--muted)", fontWeight: 600, fontSize: 16 },
  status: { color: "var(--muted)", fontWeight: 700 },
  card: {
    padding: 26,
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 28,
    boxShadow: "var(--shadow)",
    maxWidth: 640,
  },
  field: { marginBottom: 22 },
  label: { display: "block", marginBottom: 8, color: "var(--text)", fontWeight: 900 },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "13px 16px",
    border: "1px solid var(--border)",
    borderRadius: 16,
    background: "#fbfdfb",
    color: "var(--text)",
    fontWeight: 700,
    fontSize: 15,
    outline: "none",
  },
  helper: { margin: "8px 0 0", color: "var(--muted)", fontWeight: 700, fontSize: 13 },
  customAvatarRow: { display: "flex", alignItems: "center", gap: 14, marginTop: 14 },
  uploadButton: { padding: "11px 16px", borderRadius: 14, background: "var(--primary)", color: "white", fontWeight: 850, cursor: "pointer" },
  avatarGrid: {
    marginTop: 14,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
    gap: 12,
  },
  avatarOption: {
    padding: 16,
    borderRadius: 20,
    border: "1px solid var(--border)",
    background: "#fbfdfb",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
  },
  avatarOptionSelected: {
    border: "1px solid rgba(79, 143, 91, 0.5)",
    background: "rgba(79, 143, 91, 0.1)",
  },
  avatarIcon: {
    width: 50,
    height: 50,
    borderRadius: 999,
    display: "grid",
    placeItems: "center",
    background: "rgba(79, 143, 91, 0.12)",
    color: "var(--primary-dark)",
  },
  avatarName: { color: "var(--text)", fontSize: 14 },
  avatarStatus: { color: "var(--muted)", fontWeight: 800, fontSize: 12 },
  visibilityRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    padding: 18,
    borderRadius: 20,
    background: "#fbfdfb",
    border: "1px solid var(--border)",
    marginBottom: 22,
  },
  visTitle: { color: "var(--text)", fontSize: 16 },
  visText: { margin: "5px 0 0", color: "var(--muted)", fontWeight: 700, fontSize: 13 },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 999,
    border: "none",
    cursor: "pointer",
    padding: 3,
    flex: "0 0 auto",
    transition: "background-color 0.15s ease",
  },
  toggleKnob: {
    display: "block",
    width: 22,
    height: 22,
    borderRadius: 999,
    background: "white",
    transition: "transform 0.15s ease",
  },
  actions: { display: "flex", gap: 12, flexWrap: "wrap" },
  saveButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "13px 22px",
    border: "none",
    borderRadius: 999,
    background: "var(--primary)",
    color: "white",
    fontWeight: 900,
    cursor: "pointer",
    boxShadow: "0 8px 22px rgba(79, 143, 91, 0.24)",
  },
  cancelButton: {
    padding: "13px 22px",
    border: "1px solid var(--border)",
    borderRadius: 999,
    background: "var(--surface)",
    color: "var(--text)",
    fontWeight: 900,
    cursor: "pointer",
  },
};
