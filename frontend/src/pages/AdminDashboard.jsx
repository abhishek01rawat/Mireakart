import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useGetOrderStatsQuery, useGetOrdersQuery } from '../slices/ordersApiSlice';
import Loader from '../components/Loader';
import {
  FaBoxes,
  FaClipboardList,
  FaUsers,
  FaRupeeSign,
  FaTachometerAlt,
  FaChartBar,
  FaCommentAlt,
  FaBug,
  FaLink,
  FaCalendarAlt,
  FaLaptop,
  FaUserAlt,
  FaExclamationTriangle,
} from 'react-icons/fa';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('stats');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [feedbackData, setFeedbackData] = useState([]);
  const [feedbackTotal, setFeedbackTotal] = useState(0);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);

  const { data: orderStatsData, isLoading: isLoadingOrderStats } = useGetOrderStatsQuery();
  const { data: allOrdersData } = useGetOrdersQuery();
  const { token } = useSelector((state) => state.auth);

  const stats = orderStatsData?.stats;

  const pendingVerificationCount = allOrdersData?.orders?.filter(
    (o) => o.paymentMethod === 'Online QR Code' && o.paymentVerificationStatus === 'Pending'
  ).length || 0;

  // Fetch Analytics Summary
  const fetchAnalytics = async () => {
    setIsLoadingAnalytics(true);
    try {
      const response = await fetch('/api/analytics/summary?days=7', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const resData = await response.json();
      if (response.ok) {
        setAnalyticsData(resData.summary);
      }
    } catch (err) {
      console.error('Failed to fetch analytics summary:', err);
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  // Fetch Feedbacks
  const fetchFeedback = async () => {
    setIsLoadingFeedback(true);
    try {
      const response = await fetch('/api/feedback?limit=50', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const resData = await response.json();
      if (response.ok) {
        setFeedbackData(resData.feedbacks || []);
        setFeedbackTotal(resData.total || 0);
      }
    } catch (err) {
      console.error('Failed to fetch feedback:', err);
    } finally {
      setIsLoadingFeedback(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'analytics') {
      fetchAnalytics();
    } else if (activeTab === 'feedback') {
      fetchFeedback();
    }
  }, [activeTab]);

  if (isLoadingOrderStats) return <Loader text="Assembling dashboard statistics..." />;

  const statCards = [
    { label: 'Total Revenue', value: `₹${stats?.totalRevenue || 0}`, icon: FaRupeeSign, color: '#03A685', bg: '#E6F6F3' },
    { label: 'Total Orders', value: stats?.totalOrders || 0, icon: FaClipboardList, color: 'var(--primary-color)', bg: '#FFF0F5' },
    { label: 'Processing Orders', value: stats?.pendingOrders || 0, icon: FaBoxes, color: 'var(--warning-color)', bg: '#FFF7ED' },
    { label: 'Delivered Packages', value: stats?.deliveredOrders || 0, icon: FaUsers, color: '#3182CE', bg: '#EBF8FF' },
  ];

  // Render SVG Analytics PageView Chart
  const renderPageViewChart = () => {
    if (!analyticsData || !analyticsData.dailyPageViews || analyticsData.dailyPageViews.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
          No page view data recorded yet.
        </div>
      );
    }

    const views = analyticsData.dailyPageViews;
    const maxVal = Math.max(...views.map((v) => v.count), 5); // Fallback to 5 to avoid divide by zero
    
    // Chart dimensions
    const width = 600;
    const height = 240;
    const paddingX = 40;
    const paddingY = 30;
    
    const chartWidth = width - paddingX * 2;
    const chartHeight = height - paddingY * 2;
    
    // Map dates to coords
    const points = views.map((v, i) => {
      const x = paddingX + (i / Math.max(views.length - 1, 1)) * chartWidth;
      const y = paddingY + chartHeight - (v.count / maxVal) * chartHeight;
      return { x, y, label: v._id.slice(5), count: v.count }; // MM-DD format
    });

    const pathData = points.reduce((acc, p, i) => {
      return acc + (i === 0 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`);
    }, '');

    const areaData = points.reduce((acc, p, i) => {
      if (i === 0) return `M ${p.x} ${paddingY + chartHeight} L ${p.x} ${p.y}`;
      let str = acc + ` L ${p.x} ${p.y}`;
      if (i === points.length - 1) {
        str += ` L ${p.x} ${paddingY + chartHeight} Z`;
      }
      return str;
    }, '');

    return (
      <div style={{ width: '100%', overflowX: 'auto', background: '#F8FAFC', borderRadius: '12px', padding: '16px 20px 8px 20px' }}>
        <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary-color)" stopOpacity="0.25"/>
              <stop offset="100%" stopColor="var(--primary-color)" stopOpacity="0.00"/>
            </linearGradient>
          </defs>
          
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = paddingY + chartHeight * ratio;
            const value = Math.round(maxVal * (1 - ratio));
            return (
              <g key={ratio}>
                <line x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke="#E2E8F0" strokeDasharray="4 4" />
                <text x={paddingX - 10} y={y + 4} fill="var(--text-secondary)" fontSize="10" textAnchor="end" fontWeight="600">
                  {value}
                </text>
              </g>
            );
          })}

          {/* Area Path */}
          {points.length > 0 && (
            <path d={areaData} fill="url(#chartGrad)" />
          )}

          {/* Line Path */}
          {points.length > 0 && (
            <path d={pathData} fill="none" stroke="var(--primary-color)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          )}

          {/* Circles and Labels */}
          {points.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="5" fill="white" stroke="var(--primary-color)" strokeWidth="2.5" />
              {/* Tooltip Count */}
              <text x={p.x} y={p.y - 10} fill="var(--text-primary)" fontSize="10" fontWeight="700" textAnchor="middle">
                {p.count}
              </text>
              {/* X label */}
              <text x={p.x} y={paddingY + chartHeight + 16} fill="var(--text-secondary)" fontSize="10" fontWeight="600" textAnchor="middle">
                {p.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    );
  };

  return (
    <div className="container fade-in" style={{ paddingTop: '30px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Title Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <h2 style={{ fontSize: '1.8rem', color: 'var(--secondary-color)', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
          <FaTachometerAlt /> Store Management Console
        </h2>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, background: '#E2E8F0', padding: '6px 16px', borderRadius: '30px' }}>
          ADMIN ACCESS PRIVILEGES
        </span>
      </div>

      {/* Tabs Switcher */}
      <div className="admin-tabs-container">
        {[
          { key: 'stats', label: 'Dashboard & Sales', icon: <FaClipboardList /> },
          { key: 'analytics', label: 'Traffic & Telemetry', icon: <FaChartBar /> },
          { key: 'feedback', label: 'Customer Feedback & Bugs', icon: <FaCommentAlt /> },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === tab.key ? '3px solid var(--primary-color)' : '3px solid transparent',
              color: activeTab === tab.key ? 'var(--primary-color)' : 'var(--text-secondary)',
              padding: '12px 6px',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.92rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
              marginBottom: '-2px'
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT: STATS */}
      {activeTab === 'stats' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>

          {/* ⚠️ Pending Screenshot Verifications Alert */}
          {pendingVerificationCount > 0 && (
            <div style={{
              background: 'linear-gradient(135deg, #FFFBEB, #FEF3C7)',
              border: '1.5px solid #F59E0B',
              borderRadius: '14px',
              padding: '18px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '15px',
              flexWrap: 'wrap',
              boxShadow: '0 4px 15px rgba(245,158,11,0.12)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '12px',
                  background: '#F59E0B', color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <FaExclamationTriangle size={20} />
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: 800, fontSize: '1rem', color: '#92400E' }}>
                    {pendingVerificationCount} Payment Screenshot{pendingVerificationCount > 1 ? 's' : ''} Awaiting Verification
                  </p>
                  <p style={{ margin: '3px 0 0 0', fontSize: '0.82rem', color: '#B45309' }}>
                    Customers have submitted QR payment screenshots that need your approval to confirm their orders.
                  </p>
                </div>
              </div>
              <Link
                to="/admin/orders"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '10px 20px', background: '#F59E0B', color: 'white',
                  borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem',
                  textDecoration: 'none', whiteSpace: 'nowrap',
                  boxShadow: '0 4px 10px rgba(245,158,11,0.3)'
                }}
              >
                Review Now →
              </Link>
            </div>
          )}

          {/* Grid of sales cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '24px'
          }}>
            {statCards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.label} style={{
                  background: 'white', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '24px',
                  display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.01)'
                }}>
                  <div style={{
                    width: '54px', height: '54px', borderRadius: '12px', background: card.bg, color: card.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Icon size={24} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{card.label}</span>
                    <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>{card.value}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Nav Tools */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '30px',
          }}>
            {/* Products Tool */}
            <div style={{
              background: 'white', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '30px',
              display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.01)'
            }}>
              <h3 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 700 }}>Products Control Center</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
                Add new inventory lines, edit pricing tags, adjust stocking parameters, manage images and catalog metadata.
              </p>
              <Link to="/admin/products" className="btn btn-primary" style={{ alignSelf: 'flex-start', marginTop: '10px', padding: '10px 20px', fontSize: '0.88rem' }}>
                Manage Products
              </Link>
            </div>

            {/* Orders Tool */}
            <div style={{
              background: 'white', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '30px',
              display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.01)'
            }}>
              <h3 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 700 }}>Orders Control Panel</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
                Track sales pipelines, review receipts, update delivery stages (Confirmed, Shipped, Delivered) and input tracking information.
              </p>
              <Link to="/admin/orders" className="btn btn-primary" style={{ alignSelf: 'flex-start', marginTop: '10px', padding: '10px 20px', fontSize: '0.88rem' }}>
                Manage Orders
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: ANALYTICS */}
      {activeTab === 'analytics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          {isLoadingAnalytics && <Loader text="Gathering event analytics details..." />}
          
          {!isLoadingAnalytics && analyticsData && (
            <>
              {/* Analytics Mini Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px' }}>
                <div style={{ background: 'white', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Tracked Events</span>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--secondary-color)', marginTop: '6px' }}>
                    {analyticsData.totalEvents || 0}
                  </div>
                </div>
                <div style={{ background: 'white', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Unique Active Sessions</span>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#3182CE', marginTop: '6px' }}>
                    {analyticsData.uniqueSessions || 0}
                  </div>
                </div>
                <div style={{ background: 'white', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Page Views (7 Days)</span>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#03A685', marginTop: '6px' }}>
                    {analyticsData.dailyPageViews?.reduce((sum, item) => sum + item.count, 0) || 0}
                  </div>
                </div>
              </div>

              {/* Grid: Chart and Event Breakdown */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
                {/* Chart Box */}
                <div style={{ background: 'white', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h4 style={{ fontSize: '1.1rem', margin: 0, fontWeight: 700 }}>Daily Page Views</h4>
                  {renderPageViewChart()}
                </div>

                {/* Event types breakdown */}
                <div style={{ background: 'white', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h4 style={{ fontSize: '1.1rem', margin: 0, fontWeight: 700 }}>Event Counts by Type</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {analyticsData.eventCounts && analyticsData.eventCounts.length > 0 ? (
                      analyticsData.eventCounts.map((ev) => {
                        const total = analyticsData.totalEvents || 1;
                        const percentage = Math.round((ev.count / total) * 100);
                        return (
                          <div key={ev._id} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700 }}>
                              <span style={{ color: 'var(--text-primary)' }}>{ev._id}</span>
                              <span style={{ color: 'var(--text-secondary)' }}>{ev.count} ({percentage}%)</span>
                            </div>
                            <div style={{ height: '8px', background: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                              <div style={{ height: '100%', background: 'var(--primary-gradient)', width: `${percentage}%`, borderRadius: '4px' }}></div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center' }}>No events recorded yet.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Table of top visited pages */}
              <div style={{ background: 'white', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h4 style={{ fontSize: '1.1rem', margin: 0, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaLink /> Top 10 Visited Pages
                </h4>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '2.5px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: 700 }}>
                        <th style={{ padding: '12px 16px' }}>Path URL</th>
                        <th style={{ padding: '12px 16px', textAlign: 'right' }}>Page Views Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analyticsData.topPages && analyticsData.topPages.length > 0 ? (
                        analyticsData.topPages.map((page, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td style={{ padding: '12px 16px', color: 'var(--primary-color)', fontWeight: 600 }}>{page._id}</td>
                            <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: 'var(--text-primary)' }}>{page.count}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="2" style={{ padding: '16px', textAlign: 'center', color: 'var(--text-secondary)' }}>No page views recorded.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB CONTENT: FEEDBACK */}
      {activeTab === 'feedback' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FaCommentAlt /> Customer Feedbacks & Bug Reports ({feedbackTotal})
          </h3>

          {isLoadingFeedback && <Loader text="Retrieving customer feedbacks..." />}

          {!isLoadingFeedback && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {feedbackData.length > 0 ? (
                feedbackData.map((fb) => {
                  let badgeBg = '#E2E8F0';
                  let badgeColor = 'var(--text-secondary)';
                  let typeIcon = <FaCommentAlt size={12} />;

                  if (fb.type === 'BUG') {
                    badgeBg = '#FED7D7';
                    badgeColor = '#C53030';
                    typeIcon = <FaBug size={12} />;
                  } else if (fb.type === 'FEATURE_REQUEST') {
                    badgeBg = '#EBF8FF';
                    badgeColor = '#2B6CB0';
                    typeIcon = <FaUsers size={12} />;
                  }

                  return (
                    <div
                      key={fb._id}
                      style={{
                        background: 'white',
                        border: '1px solid var(--border-color)',
                        borderRadius: '12px',
                        padding: '20px',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.01)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                      }}
                    >
                      {/* Top row */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                        {/* Type Badge */}
                        <span
                          style={{
                            background: badgeBg,
                            color: badgeColor,
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            padding: '4px 10px',
                            borderRadius: '30px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            textTransform: 'uppercase',
                          }}
                        >
                          {typeIcon} {fb.type}
                        </span>

                        {/* Date */}
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <FaCalendarAlt /> {new Date(fb.createdAt).toLocaleString()}
                        </span>
                      </div>

                      {/* Message body */}
                      <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                        {fb.message}
                      </p>

                      {/* Bottom metadata */}
                      <div
                        style={{
                          borderTop: '1px dashed var(--border-color)',
                          paddingTop: '12px',
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '16px',
                          fontSize: '0.78rem',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <FaUserAlt /> <strong>{fb.name}</strong> {fb.email ? `(${fb.email})` : ''}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <FaLink /> Active Page: <span style={{ color: 'var(--primary-color)', fontWeight: 600 }}>{fb.page}</span>
                        </span>
                        {fb.userAgent && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '100%', marginTop: '4px' }} title={fb.userAgent}>
                            <FaLaptop /> User Agent: {fb.userAgent.slice(0, 100)}...
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ background: 'white', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No customer feedbacks or bug reports have been submitted yet.
                </div>
              )}
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
