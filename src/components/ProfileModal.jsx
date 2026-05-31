// src/components/ProfileModal.jsx
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../supabase/client";
import "./ProfileModal.css";

const ProfileModal = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadUserProfile = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);

    try {
      // Убрал name из SELECT
      const { data, error } = await supabase
        .from("user_profiles")
        .select(
          "has_paid_access, subscription_status, subscription_created_at, paid_at, name",
        )
        .eq("id", user.id)
        .limit(1)
        .maybeSingle();

      console.log("📊 Данные из Supabase:", data);

      if (error) {
        console.error("Ошибка загрузки профиля:", error);
      }

      const newUserData = {
        name:
          data?.name ||
          user?.user_metadata?.name ||
          user?.email?.split("@")[0] ||
          "Пользователь",
        email: user?.email || "",
        has_paid_access: data?.has_paid_access || false,
        subscription_status: data?.subscription_status || "inactive",
        subscription_created_at: data?.subscription_created_at || null,
        paid_at: data?.paid_at || null,
      };

      console.log("📊 newUserData:", newUserData);
      setUserData(newUserData);
    } catch (err) {
      console.error("Ошибка:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isOpen && user?.id) {
      loadUserProfile();
    }
  }, [isOpen, user?.id, loadUserProfile]);

  const handleClose = useCallback(
    (e) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose],
  );

  const handleLogout = useCallback(async () => {
    try {
      localStorage.removeItem("app_access");
      localStorage.removeItem("app_access_timestamp");

      if (typeof logout === "function") {
        await logout();
      } else {
        localStorage.clear();
        sessionStorage.clear();
        window.location.replace("/");
      }
      onClose();
    } catch (error) {
      console.error("Logout error:", error);
      localStorage.clear();
      sessionStorage.clear();
      window.location.replace("/");
    }
  }, [logout, onClose]);

  const handleRenewSubscription = () => {
    onClose();
    const pricingSection = document.getElementById("pricing");
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const formatDate = useCallback((dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, []);

  if (!isOpen) return null;

  const isActive =
    userData?.has_paid_access === true &&
    userData?.subscription_status === "active";
  const showSkeleton = loading && !userData;

  return (
    <div className="profile-modal-overlay" onClick={handleClose}>
      <div className="profile-modal-container">
        <button className="profile-modal-close" onClick={onClose}>
          ×
        </button>

        <div className="profile-modal-header">
          <div className="profile-avatar">
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
              <circle cx="40" cy="40" r="40" fill="#89674f" />
              <path
                d="M40 20C32.8 20 27 25.8 27 33C27 40.2 32.8 46 40 46C47.2 46 53 40.2 53 33C53 25.8 47.2 20 40 20ZM40 56C32.8 56 20 59.8 20 67V73H60V67C60 59.8 47.2 56 40 56Z"
                fill="#fff8e9"
              />
            </svg>
          </div>
          <h2 className="profile-modal-title">Мой профиль</h2>
        </div>

        {showSkeleton ? (
          <div className="profile-skeleton">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="skeleton-item">
                <div className="skeleton-line"></div>
                <div className="skeleton-line short"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="profile-info">
              <div className="profile-info-item">
                <div className="profile-info-label">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M20 21V19C20 16.8 18.2 15 16 15H8C5.8 15 4 16.8 4 19V21"
                      stroke="#fff8e9"
                      strokeWidth="1.5"
                    />
                    <circle
                      cx="12"
                      cy="7"
                      r="4"
                      stroke="#fff8e9"
                      strokeWidth="1.5"
                    />
                  </svg>
                  <span>Имя</span>
                </div>
                <div className="profile-info-value">
                  {userData?.name || "—"}
                </div>
              </div>

              <div className="profile-info-item">
                <div className="profile-info-label">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z"
                      stroke="#fff8e9"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M22 6L12 13L2 6"
                      stroke="#fff8e9"
                      strokeWidth="1.5"
                    />
                  </svg>
                  <span>Email</span>
                </div>
                <div className="profile-info-value">
                  {userData?.email || "—"}
                </div>
              </div>

              {userData?.paid_at && (
                <div className="profile-info-item">
                  <div className="profile-info-label">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z"
                        stroke="#fff8e9"
                        strokeWidth="1.5"
                      />
                      <path
                        d="M12 6V12L16 14"
                        stroke="#fff8e9"
                        strokeWidth="1.5"
                      />
                    </svg>
                    <span>Дата покупки</span>
                  </div>
                  <div className="profile-info-value">
                    {formatDate(userData.paid_at)}
                  </div>
                </div>
              )}

              <div className="profile-info-item">
                <div className="profile-info-label">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M9 12H15M12 9V15M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                      stroke="#fff8e9"
                      strokeWidth="1.5"
                    />
                  </svg>
                  <span>Статус подписки</span>
                </div>
                <div className="profile-info-value">
                  <span
                    className={`subscription-badge ${isActive ? "active" : "inactive"}`}
                  >
                    {isActive ? "✓ Активна" : "✗ Неактивна"}
                  </span>
                </div>
              </div>

              {userData?.subscription_created_at && isActive && (
                <div className="profile-info-item">
                  <div className="profile-info-label">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 8V12L15 15M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                        stroke="#fff8e9"
                        strokeWidth="1.5"
                      />
                    </svg>
                    <span>Подписка оформлена</span>
                  </div>
                  <div className="profile-info-value">
                    {formatDate(userData.subscription_created_at)}
                  </div>
                </div>
              )}
            </div>

            <div className="profile-actions">
              {!isActive && (
                <button
                  className="profile-action-btn renew-btn"
                  onClick={handleRenewSubscription}
                >
                  Купить подписку
                </button>
              )}
              <button
                className="profile-action-btn logout-btn"
                onClick={handleLogout}
              >
                Выйти из аккаунта
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfileModal;
