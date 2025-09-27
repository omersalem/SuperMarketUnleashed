import React, { useMemo } from "react";
import { format, subDays, isToday, isYesterday } from "date-fns";
import { formatCurrency } from "../utils/currency";

// A reusable card component for the dashboard
const StatCard = ({ icon, title, value, change, changeType, color }) => {
  const colorClasses = {
    blue: "from-blue-500 to-cyan-500",
    green: "from-green-500 to-teal-500",
    red: "from-red-500 to-orange-500",
    purple: "from-purple-500 to-violet-500",
    yellow: "from-yellow-500 to-amber-500",
  };

  const changeColor =
    changeType === "positive" ? "text-green-400" : "text-red-400";

  return (
    <div
      className={`bg-gray-800 p-5 rounded-xl border border-gray-700 shadow-lg transform transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl animate-fade-in-up`}
    >
      <div className="flex items-center">
        <div
          className={`w-12 h-12 rounded-lg bg-gradient-to-br ${
            colorClasses[color] || colorClasses.blue
          } flex items-center justify-center text-white text-2xl shadow-md`}
        >
          {icon}
        </div>
        <div className="ml-4">
          <p className="text-sm text-gray-400 font-medium">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
      </div>
      {change && <p className={`text-xs mt-2 ${changeColor}`}>{change}</p>}
    </div>
  );
};

const InteractiveDashboard = ({ sales = [], products = [], checks = [] }) => {
  const stats = useMemo(() => {
    const todaySales = sales.filter((s) => isToday(new Date(s.date)));
    const yesterdaySales = sales.filter((s) => isYesterday(new Date(s.date)));

    const todayRevenue = todaySales.reduce((sum, s) => sum + s.totalAmount, 0);
    const yesterdayRevenue = yesterdaySales.reduce(
      (sum, s) => sum + s.totalAmount,
      0
    );

    const revenueChange =
      yesterdayRevenue > 0
        ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100
        : todayRevenue > 0
        ? 100
        : 0;

    const lowStockItems = products.filter((p) => p.quantity <= 10).length;

    const pendingChecks = checks.filter((c) => c.status === "pending").length;

    const recentSales = sales
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    return {
      todayRevenue,
      revenueChange,
      todayOrders: todaySales.length,
      lowStockItems,
      pendingChecks,
      recentSales,
    };
  }, [sales, products, checks]);

  return (
    <div className="mb-8 animate-fade-in-up">
      <h2 className="text-2xl font-bold text-white mb-4">Dashboard Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon="💰"
          title="Today's Revenue"
          value={formatCurrency(stats.todayRevenue)}
          change={`${stats.revenueChange.toFixed(1)}% from yesterday`}
          changeType={stats.revenueChange >= 0 ? "positive" : "negative"}
          color="green"
        />
        <StatCard
          icon="🛒"
          title="Today's Orders"
          value={stats.todayOrders}
          color="blue"
        />
        <StatCard
          icon="📦"
          title="Low Stock Items"
          value={stats.lowStockItems}
          color="yellow"
        />
        <StatCard
          icon="🏦"
          title="Pending Checks"
          value={stats.pendingChecks}
          color="purple"
        />
      </div>

      {/* Recent Activity */}
      <div className="mt-8 bg-gray-800 p-5 rounded-xl border border-gray-700 shadow-lg animate-fade-in-up">
        <h3 className="text-lg font-semibold text-white mb-4">
          Recent Sales Activity
        </h3>
        <div className="space-y-3">
          {stats.recentSales.length > 0 ? (
            stats.recentSales.map((sale) => (
              <div
                key={sale.id}
                className="flex justify-between items-center bg-gray-700/50 p-3 rounded-lg"
              >
                <div>
                  <p className="text-sm font-medium text-gray-200">
                    {sale.customerName}
                  </p>
                  <p className="text-xs text-gray-400">
                    {format(new Date(sale.date), "MMM dd, yyyy, p")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-green-400">
                    {formatCurrency(sale.totalAmount)}
                  </p>
                  <p
                    className={`text-xs font-semibold capitalize ${
                      sale.paymentStatus === "paid"
                        ? "text-cyan-400"
                        : "text-orange-400"
                    }`}
                  >
                    {sale.paymentStatus}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No recent sales activity.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default InteractiveDashboard;
