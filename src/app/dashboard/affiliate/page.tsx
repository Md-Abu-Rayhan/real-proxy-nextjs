"use client";

import { useState, useEffect } from "react";
import { Copy, Gift, DollarSign, Users, Award, TrendingUp, AlertCircle, ArrowRight } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";
import LoadingDashboard from "@/components/common/LoadingDashboard";

export default function AffiliateDashboard() {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [convertLoading, setConvertLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>({
    ReferralCode: "",
    TotalEarnings: 0,
    AffiliateBalance: 0,
    PendingCommission: 0,
    TotalReferrals: 0,
    ActiveBuyers: 0,
    History: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        const apiUrl = "http://localhost:8080";
        const response = await axios.get(`${apiUrl}/api/affiliate/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(response.data);
      } catch (err: any) {
        console.error("Error fetching affiliate data:", err);
        setError("Failed to load affiliate information. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const affiliateBalance = Number(data?.affiliateBalance ?? data?.AffiliateBalance ?? 0);
  const referralLink = `http://localhost:8080/signup?ref=${data?.referralCode || data?.ReferralCode || ""}`;

  const handleConvertToWallet = () => {
    if (affiliateBalance <= 0) return;
    // Store wallet balance for the Pricing component to pick up
    localStorage.setItem("wallet_balance", affiliateBalance.toFixed(2));
    // Navigate to pricing section
    router.push("/#pricing-section");
  };

  const copyToClipboard = async () => {
    try {
      // Use the computed referralLink directly
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(referralLink);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = referralLink;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy!", err);
      // Even if it fails, we can show a temporary alert if we want, but usually it's just blocked by browser
    }
  };

  // Do not block the entire page render while loading — render skeletons
  // so the first paint is fast and then hydrate data when available.

  if (error) {
    return (
      <div className="error-state">
        <AlertCircle color="#ef4444" size={32} />
        <div>
          <h3>Error Loading Dashboard</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="main-responsive-container">
      {/* Header Section */}
      <div className="header-card">
        <div className="header-content">
          <h1 className="header-title">
            <div className="title-icon-box">
              <Gift color="#0086FF" size={28} />
            </div>
            Affiliate Program
          </h1>
          <p className="header-desc">Invite your friends and earn 5% commission on their every purchase forever.</p>
        </div>
        <div className="referral-box">
          <div className="referral-info">
            <p className="referral-label">Your Referral Link</p>
            <p className="referral-link">{loading ? <span className="skeleton skeleton-link" /> : referralLink}</p>
          </div>
          <button
            type="button"
            onClick={copyToClipboard}
            className={`copy-btn ${copied ? "copied" : ""}`}
            title="Copy Referral Link"
          >
            {copied ? <span style={{ fontSize: '13px', fontWeight: 600 }}>Copied!</span> : <Copy size={16} strokeWidth={2.5} />}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {[
          { title: "Total Earnings", value: `$${Number(data?.totalEarnings ?? data?.TotalEarnings ?? 0).toFixed(2)}`, icon: DollarSign, color: "#0086FF", bg: "rgba(0, 134, 255, 0.1)" },
          { title: "Pending Commission", value: `$${Number(data?.pendingCommission ?? data?.PendingCommission ?? 0).toFixed(2)}`, icon: TrendingUp, color: "#F59E0B", bg: "rgba(245, 158, 11, 0.1)" },
          { title: "Total Referrals", value: data?.totalReferrals ?? data?.TotalReferrals ?? 0, icon: Users, color: "#8B5CF6", bg: "rgba(139, 92, 246, 0.1)" },
          { title: "Active Buyers", value: data?.activeBuyers ?? data?.ActiveBuyers ?? 0, icon: Award, color: "#10B981", bg: "rgba(16, 185, 129, 0.1)" },
        ].map((stat, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon-wrapper" style={{ backgroundColor: stat.bg }}>
              <stat.icon color={stat.color} size={22} strokeWidth={2.5} />
            </div>
            <div className="stat-info">
              <p className="stat-title">{stat.title}</p>
              <p className="stat-value">{loading ? <span className="skeleton skeleton-stat" /> : stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-main-grid">
        {/* Left Column: Key Actions */}
        <div className="actions-column">
          <div className="action-card">
            <div className="action-header">
              <h2 className="action-title">Convert to Wallet</h2>
              <div className="available-badge">Available Balance</div>
            </div>
            <div className="balance-display">
              <span className="currency">$</span>
              {loading ? <span className="skeleton skeleton-balance" /> : affiliateBalance.toFixed(2)}
            </div>
            <p className="action-desc">Convert your approved affiliate balance directly to your main wallet to purchase bandwidth instantly.</p>
            <button
              className="btn-primary custom-action-btn"
              disabled={loading || affiliateBalance <= 0 || convertLoading}
              onClick={handleConvertToWallet}
            >
              {convertLoading ? "Redirecting..." : "Convert Balance"} <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Right Column: History */}
        <div className="history-column">
          <div className="history-container">
            <div className="history-header">
              <h2 className="action-title">Referral History</h2>
            </div>
            {loading ? (
              <div className="history-loading">
                <div className="small-spinner" />
                <p>Loading history...</p>
              </div>
            ) : (!data?.history && !data?.History) || (data?.history || data?.History).length === 0 ? (
              <div className="history-empty">
                <div className="empty-icon-wrap">
                  <TrendingUp size={32} color="#94A3B8" />
                </div>
                <h4>No commissions yet</h4>
                <p>Share your link to start earning!</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Order Amount</th>
                      <th>Commission Earned</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data?.history || data?.History).map((item: any, idx: number) => (
                      <tr key={idx}>
                        <td>
                          <span className="table-date">{new Date(item.createdAt || item.CreatedAt).toLocaleDateString()}</span>
                        </td>
                        <td><span className="table-amount">${Number(item.purchaseAmount || item.PurchaseAmount || 0).toFixed(2)}</span></td>
                        <td>
                          <span className="table-commission">+${Number(item.commissionAmount || item.CommissionAmount || 0).toFixed(2)}</span>
                        </td>
                        <td>
                          <span className={`status-badge ${(item.status || item.Status)?.toLowerCase()}`}>
                            {item.status || item.Status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .main-responsive-container {
          padding: 24px;
          max-width: 1800px;
          width: 100%;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 24px;
          font-family: var(--font-poppins);
          background-color: transparent;
        }

        .loading-state, .error-state {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          flex-direction: column;
          gap: 16px;
        }

        /* Lightweight skeletons for faster first paint */
        .skeleton {
          display: inline-block;
          background: linear-gradient(90deg, #e6eefc 25%, #f8fbff 37%, #e6eefc 63%);
          background-size: 400% 100%;
          animation: shimmer 1.4s ease infinite;
          border-radius: 6px;
        }

        .skeleton-link { width: 220px; height: 18px; }
        .skeleton-stat { width: 90px; height: 20px; }
        .skeleton-balance { width: 120px; height: 30px; display: inline-block; }

        @keyframes shimmer {
          0% { background-position: 100% 0; }
          100% { background-position: -100% 0; }
        }

        .history-loading {
          padding: 48px 24px;
          display: flex;
          align-items: center;
          gap: 12px;
          justify-content: center;
          color: #64748B;
        }

        .small-spinner {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: 3px solid rgba(0,0,0,0.08);
          border-top-color: #0086ff;
          animation: rotate 1s linear infinite;
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .error-state {
          flex-direction: row;
          background: #FEF2F2;
          border: 1px solid #FCA5A5;
          padding: 24px;
          border-radius: 12px;
          max-width: 600px;
          margin: 40px auto;
          color: #DC2626;
        }
        
        .error-state h3 { font-size: 16px; font-weight: 600; margin-bottom: 4px; color: #B91C1C; }
        .error-state p { font-size: 14px; color: #DC2626; margin: 0; }

        /* Header Card */
        .header-card {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
          background-color: #FFFFFF;
          padding: 24px 32px;
          border-radius: 16px;
          border: 1px solid #E2E8F0;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
          gap: 24px;
        }

        .header-content {
          flex: 1;
        }

        .title-icon-box {
          background-color: rgba(0, 134, 255, 0.08);
          border-radius: 10px;
          padding: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .header-title {
          font-size: 24px;
          font-weight: 700;
          color: var(--navy);
          margin: 0 0 8px 0;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .header-desc {
          margin: 0;
          color: #64748B;
          font-size: 14px;
          line-height: 1.5;
        }

        .referral-box {
          background-color: #F8FAFC;
          padding: 12px 16px;
          border-radius: 12px;
          border: 1px solid #E2E8F0;
          display: flex;
          align-items: center;
          gap: 16px;
          min-width: 320px;
        }

        .referral-info {
          flex: 1;
        }

        .referral-label {
          font-size: 11px;
          color: #64748B;
          margin: 0 0 2px 0;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .referral-link {
          font-size: 14px;
          color: #0F172A;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 250px;
          margin: 0;
          font-weight: 500;
        }

        .copy-btn {
          background-color: #FFFFFF;
          color: #3B82F6;
          border: 1px solid #E2E8F0;
          padding: 10px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .copy-btn:hover {
          background-color: #F1F5F9;
          border-color: #CBD5E1;
        }

        .copy-btn.copied {
          background-color: #10B981;
          color: white;
          border-color: #10B981;
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }

        .stat-card {
          background-color: #FFFFFF;
          padding: 20px;
          border-radius: 16px;
          border: 1px solid #E2E8F0;
          display: flex;
          align-items: flex-start;
          gap: 16px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.01);
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(0,0,0,0.03);
          border-color: #CBD5E1;
        }

        .stat-icon-wrapper {
          padding: 12px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-info {
          display: flex;
          flex-direction: column;
        }

        .stat-title {
          font-size: 13px;
          color: #64748B;
          margin: 0 0 4px 0;
          font-weight: 500;
        }

        .stat-value {
          font-size: 22px;
          font-weight: 700;
          color: var(--navy);
          margin: 0;
          line-height: 1.2;
        }

        /* Dashboard Main Layout Grid */
        .dashboard-main-grid {
          display: grid;
          grid-template-columns: 450px 1fr;
          gap: 24px;
        }

        .action-card {
          background-color: #FFFFFF;
          padding: 24px;
          border-radius: 16px;
          border: 1px solid #E2E8F0;
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        
        .action-header {
           display: flex;
           justify-content: space-between;
           align-items: center;
           margin-bottom: 20px;
        }

        .action-title {
          font-size: 18px;
          font-weight: 600;
          color: var(--navy);
          margin: 0;
        }

        .available-badge {
          background-color: #F1F5F9;
          color: #64748B;
          font-size: 12px;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 20px;
        }

        .balance-display {
          font-size: 36px;
          font-weight: 700;
          color: var(--primary);
          margin-bottom: 16px;
          display: flex;
          align-items: flex-start;
          line-height: 1;
        }
        
        .balance-display .currency {
           font-size: 20px;
           margin-top: 4px;
           margin-right: 2px;
           color: #64748B;
        }

        .withdraw-info-box {
           background-color: #F8FAFC;
           border: 1px dashed #CBD5E1;
           border-radius: 12px;
           padding: 16px;
           margin-bottom: 16px;
           display: flex;
           flex-direction: column;
           align-items: center;
           justify-content: center;
        }

        .min-withdraw-amount {
           font-size: 24px;
           font-weight: 700;
           color: var(--navy);
           line-height: 1;
        }
        
        .min-withdraw-label {
           font-size: 12px;
           color: #64748B;
           margin-top: 4px;
        }

        .action-desc {
          font-size: 14px;
          color: #64748B;
          margin: 0 0 24px 0;
          line-height: 1.6;
          flex: 1;
        }

        .custom-action-btn {
          width: 100%;
          justify-content: center;
          padding: 14px;
          font-size: 15px;
        }
        
        .custom-action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          pointer-events: none;
        }

        /* History Table */
        .history-container {
          background-color: #FFFFFF;
          border-radius: 16px;
          border: 1px solid #E2E8F0;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0,0,0,0.01);
        }

        .history-header {
          padding: 20px 24px;
          border-bottom: 1px solid #F1F5F9;
          background-color: #FFFFFF;
        }

        .history-empty {
          padding: 60px 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .empty-icon-wrap {
          width: 64px;
          height: 64px;
          background-color: #F1F5F9;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
        }

        .history-empty h4 { margin: 0 0 8px 0; color: var(--navy); font-size: 16px; }
        .history-empty p { margin: 0; color: #64748B; font-size: 14px; }

        .table-responsive {
          overflow-x: auto;
        }

        .history-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .history-table th {
          padding: 16px 24px;
          background-color: #F8FAFC;
          color: #64748B;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 600;
          border-bottom: 1px solid #E2E8F0;
        }

        .history-table td {
          padding: 16px 24px;
          border-bottom: 1px solid #F1F5F9;
          vertical-align: middle;
        }

        .history-table tr:last-child td {
          border-bottom: none;
        }

        .history-table tr:hover {
          background-color: #F8FAFC;
        }

        .table-date { color: #475569; font-size: 14px; }
        .table-amount { color: var(--navy); font-weight: 500; font-size: 14px; }
        
        .table-commission {
          display: inline-block;
          background-color: rgba(16, 185, 129, 0.1);
          color: #10B981;
          padding: 4px 10px;
          border-radius: 6px;
          font-weight: 600;
          font-size: 13px;
        }

        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: capitalize;
        }

        .status-badge.pending { background-color: #FEF3C7; color: #D97706; }
        .status-badge.approved { background-color: #D1FAE5; color: #059669; }
        .status-badge.rejected { background-color: #FEE2E2; color: #DC2626; }

        @media (max-width: 1100px) {
          .dashboard-main-grid {
            grid-template-columns: 1fr;
          }
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .header-card { flex-direction: column; align-items: stretch; }
          .referral-box { width: 100%; min-width: unset; }
          .referral-link { max-width: unset; }
        }

        @media (max-width: 768px) {
          .main-responsive-container { padding: 16px; }
          .action-grid { grid-template-columns: 1fr; }
          .header-card { padding: 20px; }
          .action-card { padding: 20px; }
          .history-table th, .history-table td { padding: 12px 16px; }
        }

        @media (max-width: 480px) {
          .stats-grid { grid-template-columns: 1fr; }
          .referral-info { overflow: hidden; }
          .referral-link { font-size: 12px; }
        }
      `}</style>
    </div>
  );
}
