import React, { useState } from "react";
import {
  Bell,
  CheckCheck,
  ShieldAlert,
  ArrowUpDown,
  Receipt,
  Info,
  ExternalLink,
  Trash2,
  Filter,
} from "lucide-react";
import { useCustomerBanking } from "../customer-state";
import type { NotificationCategory } from "../customer-types";

export function NotificationsView() {
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    setActiveSection,
  } = useCustomerBanking();

  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [filterUnreadOnly, setFilterUnreadOnly] = useState(false);

  const categories: { label: string; value: string; count: number }[] = [
    { label: "All Alerts", value: "All", count: notifications.length },
    {
      label: "Transactions",
      value: "Transactions",
      count: notifications.filter((n) => n.category === "Transactions").length,
    },
    {
      label: "Security Alerts",
      value: "Security Alerts",
      count: notifications.filter((n) => n.category === "Security Alerts").length,
    },
    {
      label: "Utility Bills",
      value: "Bills",
      count: notifications.filter((n) => n.category === "Bills").length,
    },
    {
      label: "Announcements",
      value: "Announcements",
      count: notifications.filter((n) => n.category === "Announcements").length,
    },
  ];

  const unreadTotal = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications.filter((n) => {
    if (selectedCategory !== "All" && n.category !== selectedCategory) {
      return false;
    }
    if (filterUnreadOnly && n.read) {
      return false;
    }
    return true;
  });

  const getCategoryIcon = (cat: NotificationCategory) => {
    switch (cat) {
      case "Security Alerts":
        return <ShieldAlert className="w-5 h-5 text-amber-400" />;
      case "Transactions":
        return <ArrowUpDown className="w-5 h-5 text-[#C6A66B]" />;
      case "Bills":
        return <Receipt className="w-5 h-5 text-emerald-400" />;
      case "Announcements":
      default:
        return <Info className="w-5 h-5 text-sky-400" />;
    }
  };

  const getCategoryBadgeClass = (cat: NotificationCategory) => {
    switch (cat) {
      case "Security Alerts":
        return "bg-amber-500/10 text-amber-300 border-amber-500/30";
      case "Transactions":
        return "bg-[#C6A66B]/15 text-[#DBC599] border-[#C6A66B]/30";
      case "Bills":
        return "bg-emerald-500/10 text-emerald-300 border-emerald-500/30";
      case "Announcements":
      default:
        return "bg-sky-500/10 text-sky-300 border-sky-500/30";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-serif text-white tracking-wide">
              Notifications & Security Center
            </h1>
            {unreadTotal > 0 && (
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-[#C6A66B] text-[#101D32]">
                {unreadTotal} unread
              </span>
            )}
          </div>
          <p className="text-sm text-slate-300 mt-1">
            Stay updated with real-time transactional alerts, system notices, and security advisories.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={markAllNotificationsAsRead}
            disabled={unreadTotal === 0}
            className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-medium uppercase tracking-wider rounded-lg transition-all ${
              unreadTotal > 0
                ? "bg-[#172C49] text-white hover:bg-[#1f3b61] border border-white/15"
                : "bg-white/5 text-slate-400 border border-white/5 cursor-not-allowed"
            }`}
          >
            <CheckCheck className="w-4 h-4 text-[#C6A66B]" />
            Mark All as Read
          </button>
        </div>
      </div>

      {/* Filter Tabs & Options */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setSelectedCategory(c.value)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                selectedCategory === c.value
                  ? "bg-[#C6A66B] text-[#101D32] shadow-sm font-semibold"
                  : "bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5"
              }`}
            >
              <span>{c.label}</span>
              <span
                className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                  selectedCategory === c.value
                    ? "bg-[#101D32]/20 text-[#101D32]"
                    : "bg-white/10 text-slate-300"
                }`}
              >
                {c.count}
              </span>
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none self-end sm:self-center">
          <input
            type="checkbox"
            checked={filterUnreadOnly}
            onChange={(e) => setFilterUnreadOnly(e.target.checked)}
            className="rounded border-white/20 bg-[#172C49] text-[#C6A66B] focus:ring-[#C6A66B]/50"
          />
          <span>Show unread only</span>
        </label>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-white/10 bg-[#172C49]/40 backdrop-blur-md">
            <Bell className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-serif text-white">No notifications in this category</h3>
            <p className="text-xs text-slate-300 mt-1">
              You are completely up to date. You will receive real-time alerts when account activity occurs.
            </p>
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => markNotificationAsRead(notif.id)}
              className={`group relative p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
                notif.read
                  ? "bg-[#172C49]/35 border-white/10 hover:border-white/20 hover:bg-[#172C49]/50"
                  : "bg-[#172C49]/70 border-[#C6A66B]/40 hover:border-[#C6A66B]/70 shadow-lg shadow-[#101D32]/40"
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Category Icon */}
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                  {getCategoryIcon(notif.category)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white tracking-wide">
                        {notif.title}
                      </span>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-[#C6A66B] shrink-0" />
                      )}
                    </div>
                    <span className="text-xs text-slate-300 shrink-0">{notif.date}</span>
                  </div>

                  <p className="text-xs text-slate-200 leading-relaxed mt-1">
                    {notif.message}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 mt-3 pt-2 border-t border-white/5">
                    <span
                      className={`text-[11px] font-medium px-2 py-0.5 rounded border ${getCategoryBadgeClass(
                        notif.category,
                      )}`}
                    >
                      {notif.category}
                    </span>

                    {notif.reference && (
                      <span className="text-[11px] text-[#C6A66B] font-mono bg-[#101D32] px-2 py-0.5 rounded border border-white/10">
                        Ref: {notif.reference}
                      </span>
                    )}

                    {notif.category === "Transactions" && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveSection("transactions");
                        }}
                        className="text-[11px] text-slate-300 hover:text-white inline-flex items-center gap-1 ml-auto"
                      >
                        View in Transactions
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}

                    {notif.category === "Security Alerts" && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveSection("profile");
                        }}
                        className="text-[11px] text-slate-300 hover:text-white inline-flex items-center gap-1 ml-auto"
                      >
                        Security Settings
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
