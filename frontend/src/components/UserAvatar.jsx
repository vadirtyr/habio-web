import React, { useEffect, useState } from "react";
import { User } from "lucide-react";

export default function UserAvatar({ user, size = 50, style }) {
  const [failed, setFailed] = useState(false);
  const customUrl = user?.avatar_type === "custom" ? user?.custom_avatar_url : null;
  useEffect(() => setFailed(false), [customUrl]);
  const shell = {
    width: size,
    height: size,
    borderRadius: 999,
    overflow: "hidden",
    display: "grid",
    placeItems: "center",
    flex: "0 0 auto",
    background: "rgba(79, 143, 91, 0.12)",
    color: "var(--primary-dark)",
    ...style,
  };
  return <div style={shell}>
    {customUrl && !failed
      ? <img src={customUrl} alt="" onError={() => setFailed(true)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      : <User size={Math.round(size * 0.52)} />}
  </div>;
}
