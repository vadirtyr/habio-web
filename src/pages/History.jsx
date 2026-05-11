import React, { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { Coins, Gift, TrendingUp, TrendingDown, Calendar } from "lucide-react";

function formatDate(iso) {
  if (!iso) return "";

  const d = new Date(iso);
  const datePart = d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const timePart = d.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${datePart} · ${timePart}`;
}

function RedemptionRow({ item }) {
  return (
    <div style={styles.row} data-testid={`redemption-${item.id}`}>
      <div style={styles.rewardIcon}>
        <Gift size={20} strokeWidth={3} />
      </div>

      <div style={styles.rowContent}>
        <strong style={styles.rowTitle}>{item.reward_name}</strong>
        <div style={styles.rowMeta}>
          <Calendar size={13} strokeWidth={3} />
          {formatDate(item.redeemed_at)}
        </div>
      </div>

      <div style={styles.spendBadge}>
        <Coins size={14} strokeWidth={3} />-{item.cost}
      </div>
    </div>
  );
}

function TransactionRow({ tx }) {
  const isEarn = Number(tx.amount) > 0;
  const sign = isEarn ? "+" : "";

  return (
    <div style={styles.row} data-testid={`tx-${tx.id}`}>
      <div style={isEarn ? styles.earnIcon : styles.spendIcon}>
        {isEarn ? (
          <TrendingUp size={20} strokeWidth={3} />
        ) : (
          <TrendingDown size={20} strokeWidth={3} />
        )}
      </div>

      <div style={styles.rowContent}>
        <strong style={styles.rowTitle}>{tx.description}</strong>
        <div style={styles.rowMeta}>{formatDate(tx.created_at)}</div>
      </div>

      <div style={isEarn ? styles.earnBadge : styles.spendBadge}>
        <Coins size={14} strokeWidth={3} />
        {sign}
        {tx.amount}
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, title, subtitle }) {
  return (
    <div style={styles.emptyCard}>
      <div style={styles.emptyIcon}>
        <Icon size={34} strokeWidth={2.75} />
      </div>
      <h3 style={styles.emptyTitle}>{title}</h3>
      <p style={styles.emptyText}>{subtitle}</p>
    </div>
  );
}

export default function History() {
  const [tab, setTab] = useState("redemptions");
  const [redemptions, setRedemptions] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const [r, t] = await Promise.all([
        api.get("/redemptions"),
        api.get("/transactions"),
      ]);

      setRedemptions(Array.isArray(r.data) ? r.data : r.data.items || []);
      setTransactions(Array.isArray(t.data) ? t.data : t.data.items || []);
    } catch (e) {
      console.error("Failed to load history", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function renderRedemptions() {
    if (redemptions.length === 0) {
      return (
        <EmptyState
          icon={Gift}
          title="No redemptions yet"
          subtitle="Redeem a reward to see it here."
        />
      );
    }

    return (
      <div style={styles.list} data-testid="redemptions-list">
        {redemptions.map((r) => (
          <RedemptionRow key={r.id} item={r} />
        ))}
      </div>
    );
  }

  function renderTransactions() {
    if (transactions.length === 0) {
      return (
        <EmptyState
          icon={Coins}
          title="No transactions yet"
          subtitle="Earn or spend coins to see them here."
        />
      );
    }

    return (
      <div style={styles.list} data-testid="transactions-list">
        {transactions.map((tx) => (
          <TransactionRow key={tx.id} tx={tx} />
        ))}
      </div>
    );
  }

  function renderContent() {
    if (loading) {
      return <div style={styles.loading}>Loading history...</div>;
    }

    return tab === "redemptions" ? renderRedemptions() : renderTransactions();
  }

  return (
    <div style={styles.page} data-testid="history-page">
      <div style={styles.header}>
        <p style={styles.kicker}>Activity log</p>
        <h1 style={styles.title}>History</h1>
        <p style={styles.subtitle}>
          Track your rewards, redemptions, and coin activity.
        </p>
      </div>

      <div style={styles.tabs}>
        <button
          onClick={() => setTab("redemptions")}
          style={{
            ...styles.tabButton,
            ...(tab === "redemptions" ? styles.tabButtonActive : {}),
          }}
          data-testid="tab-redemptions"
        >
          <Gift size={16} strokeWidth={3} />
          Redemptions
        </button>

        <button
          onClick={() => setTab("transactions")}
          style={{
            ...styles.tabButton,
            ...(tab === "transactions" ? styles.tabButtonActive : {}),
          }}
          data-testid="tab-transactions"
        >
          <Coins size={16} strokeWidth={3} />
          Coin Ledger
        </button>
      </div>

      {renderContent()}
    </div>
  );
}

const styles = {
  page: {
    width: "100%",
  },

  header: {
    marginBottom: 26,
  },

  kicker: {
    margin: "0 0 8px",
    color: "var(--primary-dark)",
    fontSize: 13,
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: "0.14em",
  },

  title: {
    margin: 0,
    fontSize: 42,
    lineHeight: 1,
    letterSpacing: "-0.05em",
    color: "var(--text)",
  },

  subtitle: {
    margin: "10px 0 0",
    color: "var(--muted)",
    fontWeight: 600,
    fontSize: 16,
  },

  tabs: {
    display: "flex",
    gap: 10,
    marginBottom: 24,
    flexWrap: "wrap",
  },

  tabButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "12px 16px",
    border: "1px solid var(--border)",
    borderRadius: 999,
    background: "white",
    color: "var(--text)",
    fontWeight: 900,
    cursor: "pointer",
  },

  tabButtonActive: {
    background: "var(--primary)",
    color: "white",
    border: "1px solid var(--primary)",
    boxShadow: "0 8px 22px rgba(79, 143, 91, 0.24)",
  },

  list: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },

  row: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    padding: 16,
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 24,
    boxShadow: "var(--shadow)",
  },

  rewardIcon: {
    width: 46,
    height: 46,
    borderRadius: 16,
    background: "#fff7df",
    color: "var(--primary-dark)",
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
  },

  earnIcon: {
    width: 46,
    height: 46,
    borderRadius: 16,
    background: "#eef6ef",
    color: "var(--primary-dark)",
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
  },

  spendIcon: {
    width: 46,
    height: 46,
    borderRadius: 16,
    background: "#fff1ef",
    color: "var(--danger)",
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
  },

  rowContent: {
    flex: 1,
    minWidth: 0,
  },

  rowTitle: {
    display: "block",
    color: "var(--text)",
    fontSize: 16,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  rowMeta: {
    marginTop: 5,
    color: "var(--muted)",
    fontSize: 13,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    gap: 5,
  },

  earnBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    padding: "8px 11px",
    borderRadius: 999,
    background: "#eef6ef",
    color: "var(--primary-dark)",
    fontWeight: 900,
    whiteSpace: "nowrap",
  },

  spendBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    padding: "8px 11px",
    borderRadius: 999,
    background: "#fff1ef",
    color: "var(--danger)",
    fontWeight: 900,
    whiteSpace: "nowrap",
  },

  emptyCard: {
    padding: 38,
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 28,
    boxShadow: "var(--shadow)",
    textAlign: "center",
  },

  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 22,
    background: "#eef6ef",
    color: "var(--primary-dark)",
    display: "grid",
    placeItems: "center",
    margin: "0 auto 14px",
  },

  emptyTitle: {
    margin: 0,
    fontSize: 24,
    color: "var(--text)",
    letterSpacing: "-0.03em",
  },

  emptyText: {
    margin: "8px 0 0",
    color: "var(--muted)",
    fontWeight: 600,
  },

  loading: {
    padding: 34,
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 28,
    boxShadow: "var(--shadow)",
    textAlign: "center",
    color: "var(--muted)",
    fontWeight: 800,
  },
};